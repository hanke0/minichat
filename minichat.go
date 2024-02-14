package main

import (
	_ "embed"
	"flag"
	"log"
	"os"
	"strings"

	"context"
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"regexp"
	"sync"
	"sync/atomic"
	"time"
)

//go:embed index.html
var indexHTML []byte

// secret of ses 256, size 32byte
var secret = make([]byte, 32)

func init() {
	if _, err := io.ReadFull(rand.Reader, secret); err != nil {
		panic(err)
	}
}

const (
	MaxRooms             = 32
	MaxConnections       = 32
	MaxMemoryMessageSize = 1024
)

const (
	KeepaliveDuration = time.Second * 30
)

const (
	userSystem = "system"
)

type Controller struct {
	roomSize atomic.Int32
	rooms    sync.Map // map[string]*Room
}

func NewController() *Controller {
	c := &Controller{}
	go c.keepalive()
	return c
}

func (c *Controller) keepalive() {
	t := time.NewTicker(KeepaliveDuration)
	for range t.C {
		c.rooms.Range(func(key, value any) bool {
			k := key.(string)
			v := value.(*Room)
			if !v.keepalive() {
				if _, ok := c.rooms.LoadAndDelete(k); ok {
					log.Printf("room closed by keepalive: %s", k)
					c.roomSize.Add(-1)
				}
			}
			return true
		})
	}
}

func (c *Controller) ServeIndex(w http.ResponseWriter, r *http.Request) {
	room := r.URL.RawQuery
	if room != "" {
		if !checkRoomID(room) {
			http.Redirect(w, r, "/", http.StatusFound)
		}
	}

	w.Header().Set("Content-Type", "text/html")
	w.WriteHeader(http.StatusOK)
	w.Write(indexHTML)
}

func (c *Controller) ServeUsername(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		log.Printf("%s %s 400", r.Method, r.URL.String())
		http.Error(w, "Bad Method: "+r.Method, http.StatusBadRequest)
		return
	}

	username := r.URL.RawQuery
	id, err := encodeUsername(username)
	if err != nil {
		log.Printf("%s %s 500 %s", r.Method, r.URL.String(), err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "text/plain")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(id))
	log.Printf("%s %s 200", r.Method, r.URL.String())
}

func (c *Controller) ServeSendMessage(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		log.Printf("%s %s 400 Bad Method", r.Method, r.URL.String())
		http.Error(w, "Bad Method: "+r.Method, http.StatusBadRequest)
		return
	}
	rid, err := getRoomID(r)
	if err != nil {
		log.Printf("%s %s 400 %s", r.Method, r.URL.String(), err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	room, err := c.EnterRoom(w, r, rid)
	if err != nil {
		log.Printf("%s %s 400 %s", r.Method, r.URL.String(), err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	room.ServeSendMessage(w, r)
}

func (c *Controller) ServeReceiveMessage(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		log.Printf("%s %s 400 Bad Method", r.Method, r.URL.String())
		http.Error(w, "Bad Method: "+r.Method, http.StatusBadRequest)
		return
	}
	rid, err := getRoomID(r)
	if err != nil {
		log.Printf("%s %s 400 %s", r.Method, r.URL.String(), err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	room, err := c.EnterRoom(w, r, rid)
	if err != nil {
		log.Printf("%s %s 400 %s", r.Method, r.URL.String(), err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	room.ServeReceiveMessage(w, r)
}

func (c *Controller) EnterRoom(w http.ResponseWriter, r *http.Request, id string) (*Room, error) {
	room, ok := c.rooms.Load(id)
	if !ok {
		if c.roomSize.Load() >= MaxRooms {
			return nil, errors.New("too many rooms")
		}
		room, ok = c.rooms.LoadOrStore(id, NewRoom(id))
		if !ok {
			log.Printf("room created: %s", id)
			c.roomSize.Add(1)
		}
	}
	return room.(*Room), nil
}

type Room struct {
	name           string
	connectionSize atomic.Int32
	lastActive     atomic.Int64
	connections    sync.Map // map[string]*Connection]struct
}

func NewRoom(name string) *Room {
	r := &Room{name: name}
	return r
}

func (r *Room) keepalive() bool {
	if time.Now().Unix()-r.lastActive.Load() > int64(KeepaliveDuration.Seconds()) {
		return true
	}
	return r.Broadcast(NewKeepaliveMessage())
}

func getUsername(r *http.Request) (string, error) {
	var uid string
	if err := r.ParseForm(); err != nil {
		return "", err
	}
	uid = r.Form.Get("user")
	if uid == "" {
		return "", errors.New("user id absent")
	}
	username, err := decodeUsername(uid)
	if err != nil {
		return "", errors.New("invalid user id")
	}
	return username, nil
}

var roomRE = regexp.MustCompile(`^[a-zA-Z0-9_-]{1,32}$`)

func checkRoomID(rid string) bool {
	return roomRE.MatchString(rid)
}

func getRoomID(r *http.Request) (string, error) {
	var rid string
	if err := r.ParseForm(); err != nil {
		return "", err
	}
	rid = r.Form.Get("room")
	if rid == "" {
		return "", errors.New("room id absent")
	}
	if !checkRoomID(rid) {
		return "", errors.New("invalid room id")
	}
	return rid, nil
}

func (room *Room) ServeSendMessage(w http.ResponseWriter, r *http.Request) {
	username, err := getUsername(r)
	if err != nil {
		log.Printf("%s %s 400 %s", r.Method, r.URL.String(), err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if !room.Has(username) {
		log.Printf("%s %s 400 Bad Request: user not in the room: %s not in %s",
			r.Method, r.URL.String(), username, room.name)
		http.Error(w, "Bad Request: user not in the room", http.StatusBadRequest)
		return
	}
	// TODO: limit message size
	var m message
	if err := m.Read(r.Body); err != nil {
		log.Printf("%s %s 400 Bad Request: read message fail %s", r.Method, r.URL.String(), err)
		http.Error(w, "Bad Request: read message fail", http.StatusBadRequest)
		return
	}
	m.Username = username
	room.Broadcast(&m)
	w.WriteHeader(http.StatusOK)
	log.Printf("%s %s 200", r.Method, r.URL.String())
}

func (room *Room) Has(username string) bool {
	_, ok := room.connections.Load(username)
	return ok
}

func (room *Room) ServeReceiveMessage(w http.ResponseWriter, r *http.Request) {
	flush, ok := w.(http.Flusher)
	if !ok {
		log.Printf("%s %s 400 Bad Request: bad response type", r.Method, r.URL.String())
		http.Error(w, "Bad Request: bad response type", http.StatusBadRequest)
		return
	}
	if r.Header.Get("Accept") != "text/event-stream" {
		log.Printf("%s %s 400 Bad Request: bad header accept", r.Method, r.URL.String())
		http.Error(w, "Bad Request: bad header accept", http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("retry: 3000\n\n")) // wait for 3 seconds to reconnect

	username, err := getUsername(r)
	if err != nil {
		log.Printf("%s %s 400 %s", r.Method, r.URL.String(), err)
		fmt.Fprintf(w, "event: error\ndata: %s\n\n", err.Error())
		return
	}
	c := NewConnection(w, r, flush)
	if err := room.add(c, username); err != nil {
		log.Printf("%s %s 400 %s", r.Method, r.URL.String(), err)
		fmt.Fprintf(w, "event: error\ndata: %s\n\n", err.Error())
		return
	}

	log.Printf("enter room: %s enter %s", username, room.name)
	c.PushMessage(NewTextMessage(userSystem, "Users in the room: "+room.users()))
	room.Broadcast(NewTextMessage(userSystem, username+" enter the room"))
	c.ServerReceiveMessage()
	room.Broadcast(NewTextMessage(userSystem, username+" left the room"))
	room.closeConnection(username)
	log.Printf("left room: %s left %s", username, room.name)
}

func (r *Room) closeConnection(uid string) {
	if v, ok := r.connections.LoadAndDelete(uid); ok {
		log.Printf("connection closed: %s left %s", uid, r.name)
		r.connectionSize.Add(-1)
		v.(*Connection).Close()
	}
}

func (r *Room) users() string {
	var users strings.Builder
	r.connections.Range(func(key, value any) bool {
		if users.Len() > 0 {
			users.WriteByte(' ')
		}
		users.WriteString(key.(string))
		return true
	})
	return users.String()
}

func (r *Room) Broadcast(msg Message) bool {
	r.connections.Range(func(key, value any) bool {
		uid := key.(string)
		conn := value.(*Connection)
		if !conn.PushMessage(msg) {
			r.closeConnection(uid)
		}
		return true
	})
	r.lastActive.Store(time.Now().Unix())
	return r.connectionSize.Load() > 0
}

func (r *Room) add(c *Connection, uid string) error {
	if cc, ok := r.connections.Load(uid); ok {
		oc := cc.(*Connection)
		if c == oc {
			return nil
		}
		return errors.New("username is already in the room")
	}
	if r.connectionSize.Load() >= MaxConnections {
		return errors.New("too many people in the room")
	}
	_, ok := r.connections.LoadOrStore(uid, c)
	if ok {
		c.Close()
		return errors.New("user already in the room")
	}
	r.connectionSize.Add(1)
	return nil
}

type Connection struct {
	ctx     context.Context
	req     *http.Request
	rsp     http.ResponseWriter
	flush   http.Flusher
	close   atomic.Bool
	done    chan struct{}
	msgChan chan Message
}

func NewConnection(w http.ResponseWriter, req *http.Request, flush http.Flusher) *Connection {
	return &Connection{
		ctx:     req.Context(),
		req:     req,
		rsp:     w,
		flush:   flush,
		done:    make(chan struct{}, 1),
		msgChan: make(chan Message, 32),
	}
}

func (c *Connection) ServerReceiveMessage() {
	t := time.NewTicker(KeepaliveDuration)
	defer t.Stop()
	for {
		select {
		case <-c.req.Context().Done():
			return
		case msg := <-c.msgChan:
			if err := c.sendMessage(msg); err != nil {
				c.Close()
				return
			}
		case <-t.C:
			if c.close.Load() {
				return
			}
		}
	}
}

func (c *Connection) PushMessage(msg Message) bool {
	if c.close.Load() {
		return false
	}
	select {
	case c.msgChan <- msg:
		return true
	default:
		return false
	}
}

func (c *Connection) sendMessage(msg Message) (err error) {
	defer func() {
		if p := recover(); p != nil {
			err = fmt.Errorf("panic: %v", p)
		}
	}()
	if c.close.Load() {
		return errors.New("connection closed")
	}
	if err = c.req.Context().Err(); err != nil {
		return
	}
	if err = msg.Write(c.rsp); err != nil {
		return
	}
	c.flush.Flush()
	return
}

func (c *Connection) Close() bool {
	if c.close.Load() {
		return false
	}
	return c.close.CompareAndSwap(false, true)
}

type Message interface {
	Read(r io.Reader) error
	Write(w io.Writer) error
}

func NewTextMessage(username, data string) Message {
	return &message{
		Type:     "text",
		Username: username,
		Data:     data,
	}
}

type message struct {
	Type     string `json:"type,omitempty"`
	Username string `json:"username,omitempty"`
	Filename string `json:"filename,omitempty"`
	Data     string `json:"data,omitempty"`
}

func (c *message) Read(r io.Reader) error {
	d := json.NewDecoder(r)
	return d.Decode(c)
}

func (c *message) Write(w io.Writer) error {
	if _, err := w.Write([]byte("data: ")); err != nil {
		return err
	}
	e := json.NewEncoder(w)
	if err := e.Encode(c); err != nil {
		return err
	}
	// need \n\n, but json encoder has already wrote a \n
	if _, err := w.Write([]byte("\n")); err != nil {
		return err
	}
	return nil
}

type ping struct{}

func (p ping) Read(r io.Reader) error {
	return nil
}
func (p ping) Write(w io.Writer) error {
	if _, err := w.Write([]byte(": ping\n\n")); err != nil {
		return err
	}
	return nil
}

func NewKeepaliveMessage() Message {
	return ping{}
}

var usernameRE = regexp.MustCompile(`^[a-zA-Z0-9_-]{1,32}$`)

func encodeUsername(username string) (string, error) {
	if !usernameRE.MatchString(username) {
		return "", fmt.Errorf("invalid username: %s, allow ^[a-zA-Z0-9_-]{1,32}$ ", username)
	}
	if username == userSystem {
		return "", errors.New("username cannot by system")
	}
	b, err := encrypt([]byte(username), secret)
	if err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

func decodeUsername(s string) (string, error) {
	b, err := hex.DecodeString(s)
	if err != nil {
		return "", err
	}
	b, err = decrypt(b, secret)
	if err != nil {
		return "", err
	}
	return string(b), nil
}

func encrypt(plaintext []byte, key []byte) ([]byte, error) {
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}

	aesgcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}

	nonce := make([]byte, aesgcm.NonceSize())
	if _, err = io.ReadFull(rand.Reader, nonce); err != nil {
		return nil, err
	}

	ciphertext := aesgcm.Seal(nonce, nonce, plaintext, nil)
	return ciphertext, nil
}

func decrypt(ciphertext []byte, key []byte) ([]byte, error) {
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}

	aesgcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}

	nonceSize := aesgcm.NonceSize()
	if len(ciphertext) < nonceSize {
		return nil, fmt.Errorf("ciphertext too short")
	}

	nonce, ciphertext := ciphertext[:nonceSize], ciphertext[nonceSize:]
	plaintext, err := aesgcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return nil, err
	}

	return plaintext, nil
}

func main() {
	addr := flag.String("addr", "", "http service address")
	version := flag.Bool("version", false, "show version")
	flag.Parse()
	if *version {
		fmt.Println("minichat v0.1.5")
		return
	}
	if v := os.Getenv("ADDR"); v != "" && *addr == "" {
		*addr = v
	}
	if *addr == "" {
		*addr = ":8080"
	}
	c := NewController()
	http.HandleFunc("/", c.ServeIndex)
	http.HandleFunc("/username", c.ServeUsername)
	http.HandleFunc("/send-message", c.ServeSendMessage)
	http.HandleFunc("/receive-message", c.ServeReceiveMessage)
	log.Printf("http server listen on %s", *addr)
	if err := http.ListenAndServe(*addr, nil); err != nil {
		log.Fatal(err)
	}
}
