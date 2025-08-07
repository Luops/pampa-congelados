// key-generator.js - Execute com: node key-generator.js
const crypto = require('crypto');

console.log('=== GERADOR DE CHAVES SEGURAS ===\n');

// JWT Secret (256 bits)
const jwtSecret = crypto.randomBytes(32).toString('hex');
console.log('JWT_SECRET=' + jwtSecret);

// Encryption Key (256 bits)
const encryptionKey = crypto.randomBytes(32).toString('hex');
console.log('ENCRYPTION_KEY=' + encryptionKey);

// Chave alternativa (32 caracteres base64)
const altKey = crypto.randomBytes(24).toString('base64');
console.log('ENCRYPTION_KEY_ALT=' + altKey);

console.log('\n=== INSTRUÇÕES ===');
console.log('1. Copie essas chaves para o seu .env.local');
console.log('2. NUNCA commite o arquivo .env.local');
console.log('3. Use essas chaves apenas em ambiente seguro');
console.log('4. Em produção, use as variáveis de ambiente do seu provedor');

console.log('\n=== EXEMPLO .env.local ===');
console.log(`JWT_SECRET=${jwtSecret}`);
console.log(`ENCRYPTION_KEY=${encryptionKey}`);
console.log('NEXT_PUBLIC_SUPABASE_URL=https://hoafrrzdzpquohxqaomv.supabase.co');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_NOVA_CHAVE_REGENERADA');
console.log('# ... outras variáveis');