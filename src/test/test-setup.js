import mongoose from "mongoose";
import config from "../config/config.js";

export const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(config.MONGO_TEST_URL);
  }
};

export const disconnectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
  }
};
