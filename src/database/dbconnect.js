import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const dburl = process.env.MONGODB_URL;

const connectDb = async () => {
  try {
    await mongoose.connect(dburl, {});
    console.log("Database connected successfully!");
  } catch (error) {
    console.error({ error: error.message });
  }
};

export { connectDb };
