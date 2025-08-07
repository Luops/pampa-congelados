// scripts/generate-role-hash.js
const crypto = require("crypto");

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "12345678901234567890123456789012";
const IV_LENGTH = 16;

function encryptRole(roleNumber) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(roleNumber.toString());
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

const role = 202507;
const encrypted = encryptRole(role);

console.log("Encrypted role for 202507:", encrypted);
