import CryptoJS from "crypto-js";

export function encryptRoomId(roomId: string): string {
  const hash = CryptoJS.SHA256(roomId);
  let str = hash.toString(CryptoJS.enc.Hex);
  str = str.split('').map(char => char === '/' ? '-' : char).join('');
  return str;
}
