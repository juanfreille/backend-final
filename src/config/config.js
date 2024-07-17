import dotenv from "dotenv";

dotenv.config();

const environment = process.env.NODE_ENV || "DEVELOPMENT";

const MONGO_URL = environment === "test" ? process.env.MONGO_TEST_URL : process.env.MONGO_URL;

export default {
  PORT: process.env.PORT,
  MONGO_URL,
  MONGO_TEST_URL: process.env.MONGO_TEST_URL,
  SESSION_SECRET: process.env.SESSION_SECRET,
  CLIENT_ID: process.env.CLIENT_ID,
  SECRET_ID: process.env.SECRET_ID,
  GITHUB_CALLBACK_URL: process.env.GITHUB_CALLBACK_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  NODE_ENV: environment,
};
