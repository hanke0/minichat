
const ipRE = {
  ipv4: /^(?:(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.){3}(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])$/,
  ipv6: /^((?=.*::)(?!.*::.+::)(::)?([\dA-F]{1,4}:(:|\b)|){5}|([\dA-F]{1,4}:){6})((([\dA-F]{1,4}((?!\3)::|:\b|$))|(?!\2\3)){2}|(((2[0-4]|1\d|[1-9])?\d|25[0-5])\.?\b){4})$/i
}

export function isIP(ip: string) {
  return ipRE.ipv4.test(ip) || ipRE.ipv6.test(ip)
}

function getIPFromXForwardedFor(value: string) {
  if (!value) {
    return null;
  }
  const forwardedIps = value.split(',').map(function (e) {
    const ip = e.trim();
    if (ip.includes(':')) {
      const splitted = ip.split(':');

      if (splitted.length === 2) {
        return splitted[0];
      }
    }
    return ip;
  });

  for (const ip of forwardedIps) {
    if (isIP(ip)) {
      return ip;
    }
  }
  return null;
}


export function getIP(getHeader: (key: string) => string | null) {
  const real = getHeader('x-real-ip')
  if (typeof real === 'string' && isIP(real)) {
    return real
  }

  const forwarded = getHeader('x-forwarded-for')
  if (typeof forwarded === 'string') {
    const ip = getIPFromXForwardedFor(forwarded);
    if (ip) {
      return ip;
    }
  }
  return ""
}