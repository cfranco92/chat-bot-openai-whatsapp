import dotenv from "dotenv";

dotenv.config();

export default {
  WEBHOOK_VERIFY_TOKEN: process.env.WEBHOOK_VERIFY_TOKEN,
  API_TOKEN: process.env.API_TOKEN,
  BUSINESS_PHONE: process.env.BUSINESS_PHONE,
  API_VERSION: process.env.API_VERSION,
  PORT: process.env.PORT || 3000,
  BASE_URL: process.env.BASE_URL,
  BUSINESS_NAME: process.env.BUSINESS_NAME,
  LANGUAGE: process.env.LANGUAGE || "en",
  SPREAD_SHEET_ID: process.env.SPREAD_SHEET_ID,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
};
