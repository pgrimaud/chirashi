export function isIPod() {
  return /ipod/i.test(navigator.userAgent.toLowerCase());
}