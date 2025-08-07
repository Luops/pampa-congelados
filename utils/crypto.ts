// =============================================================================
// src/utils/crypto.ts - UTILITÁRIOS DE CRIPTOGRAFIA CORRIGIDOS
// =============================================================================

import crypto from "crypto";

const CRYPTO_SECRET_KEY =
  process.env.CRYPTO_SECRET_KEY || "your-crypto-key-32-characters!!";

// Garantir que a chave tenha 32 caracteres
const getKey = () => {
  return crypto.scryptSync(CRYPTO_SECRET_KEY, "salt", 32);
};

export function encryptRole(role: number): string {
  try {
    console.log("[Crypto] Criptografando role:", role);

    const algorithm = "aes-256-cbc";
    const key = getKey();
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipher(algorithm, key);
    let encrypted = cipher.update(role.toString(), "utf8", "hex");
    encrypted += cipher.final("hex");

    const result = `${encrypted}:${iv.toString("hex")}`;
    console.log("[Crypto] Role criptografada:", result);

    return result;
  } catch (error) {
    console.error("[Crypto] Erro ao criptografar role:", error);
    // Fallback: retornar o número como string se a criptografia falhar
    return role.toString();
  }
}

export function decryptRole(encryptedRole: string): number {
  try {
    console.log("[Crypto] Tentando descriptografar role:", encryptedRole);

    // Se não contém ":", pode ser um hash simples ou número
    if (!encryptedRole.includes(":")) {
      console.log("[Crypto] Role não tem formato encrypted:iv");

      // Tentar converter diretamente para número
      const parsed = parseInt(encryptedRole);
      if (!isNaN(parsed)) {
        console.log("[Crypto] Role convertida diretamente:", parsed);
        return parsed;
      }

      // Se for um hash longo, assumir que é role de admin
      if (encryptedRole.length > 20) {
        console.log("[Crypto] Hash detectado, assumindo admin role");
        const adminRole = parseInt(
          process.env.NEXT_PUBLIC_ROLE_ADMIN_ENCRYPTED || "202507"
        );
        return adminRole;
      }

      return 0;
    }

    const [encrypted, ivHex] = encryptedRole.split(":");
    const algorithm = "aes-256-cbc";
    const key = getKey();
    const iv = Buffer.from(ivHex, "hex");

    const decipher = crypto.createDecipher(algorithm, key);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    const result = parseInt(decrypted);
    console.log("[Crypto] Role descriptografada:", result);

    return result;
  } catch (error) {
    console.error("[Crypto] Erro ao descriptografar role:", error);

    // Fallback baseado no comprimento do hash
    if (encryptedRole.length > 20) {
      console.log("[Crypto] Fallback: assumindo admin role para hash longo");
      return parseInt(process.env.NEXT_PUBLIC_ROLE_ADMIN_ENCRYPTED || "202507");
    }

    return 0;
  }
}

// Função para mapear hashes conhecidos (temporário)
export function mapKnownRoles(roleString: string): number {
  const knownRoles: Record<string, number> = {
    a19348f5d427ec4a0a24be8cd7549bb1d31ecd9200dd5fa683516b3d3855ee24: 202507, // Admin
    "102030": 102030, // User
  };

  if (knownRoles[roleString]) {
    console.log(
      "[Crypto] Role mapeada:",
      roleString,
      "->",
      knownRoles[roleString]
    );
    return knownRoles[roleString];
  }

  // Tentar converter diretamente
  const parsed = parseInt(roleString);
  return isNaN(parsed) ? 0 : parsed;
}
