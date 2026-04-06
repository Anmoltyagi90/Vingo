import mongoose from "mongoose";

const connectedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.log("MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
};

export default connectedDB;
