// scripts/test-encrypt-role.ts
import { encryptRole, decryptRole } from "../utils/crypto";

const role = 202507;
const encrypted = encryptRole(role);
console.log("Role criptografada:", encrypted);

const decrypted = decryptRole(encrypted);
console.log("Role descriptografada:", decrypted);
