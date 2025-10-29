import dotenvFlow from 'dotenv-flow';
dotenvFlow.config();

export function loadEnv() {
  const required = ['MONGO_URI', 'JWT_SECRET', 'QR_HMAC_SECRET'];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) {
    // eslint-disable-next-line no-console
    console.warn(`Missing env vars: ${missing.join(', ')}`);
  }
}

export function getEnv() {
  return {
    mongoUri: process.env.MONGO_URI,
    jwtSecret: process.env.JWT_SECRET,
    qrHmacSecret: process.env.QR_HMAC_SECRET,
  };
}


