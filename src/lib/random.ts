const peopleNames = [
  "Evelyn", "Ethan", "Avery", "Landon", "Sophia", "Mia", "Noah", "Oliver",
  "Isabella", "Emma", "Liam", "William", "James", "Benjamin", "Lucas", "Henry",
  "Alexander", "Michael", "Daniel", "Matthew", "Logan", "Elijah", "Aiden",
  "Emily", "Madison", "Abigail", "Chloe", "Mila", "Harper", "Lily", "Aria",
  "Sofia", "Ella", "Aaliyah", "Arianna", "Aurora", "Aubrey", "Bella", "Camila",
  "Charlotte", "Eva", "Gianna", "Hazel", "Isla", "Luna", "Maya", "Nora",
  "Penelope", "Riley", "Scarlett", "Victoria", "Zoe", "Adam", "Anthony",
  "Brandon", "Christopher", "David", "Dylan", "Evan", "Gabriel", "Jacob",
  "Jayden", "John", "Joseph", "Joshua", "Kevin", "Levi", "Mason", "Nathan",
  "Nicholas", "Noah", "Owen", "Ryan", "Samuel", "Tyler", "William", "Wyatt",
  "Xavier", "Zachary", "Avery", "Brooklyn", "Cameron", "Dakota", "Dylan",
  "Harper", "Jordan", "Mackenzie", "Madison", "Morgan", "Parker", "Reese",
  "Riley", "Ryan", "Taylor", "Tristan", "Tyler"
];

// Random number in range [min, max)
export function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min)) + min;
}

export function randomName() {
  return peopleNames[randomInt(0, peopleNames.length)];
}

export const alnum = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
export const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const lower = "abcdefghijklmnopqrstuvwxyz";
export const digits = "0123456789";
export const upperDigits = upper + digits;
export const lowerDigits = lower + digits;
export const upperLower = upper + lower;

export function randomAlnum(length: number, characters = alnum) {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters[randomInt(0, characters.length)];
  }
  return result;
}
