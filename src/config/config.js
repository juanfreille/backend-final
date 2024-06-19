import dotenv from "dotenv";

const environment = "DEVELOPMENT";

dotenv.config();

export default {
  PORT: process.env.PORT,
  MONGO_URL: process.env.MONGO_URL,
  SESSION_SECRET: process.env.SESSION_SECRET,
  CLIENT_ID: process.env.CLIENT_ID,
  SECRET_ID: process.env.SECRET_ID,
  GITHUB_CALLBACK_URL: process.env.GITHUB_CALLBACK_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  PERSISTENCE: process.env.PERSISTENCE,
  NODE_ENV: process.env.ENVIRONMENT,
};
