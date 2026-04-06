import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

const uploadOnCloudinary = async (filePath) => {
  cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.SECRET_API,
  });
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath);
  try {
    const res = await cloudinary.uploader.upload(absolutePath);
    if (fs.existsSync(absolutePath)) fs.unlinkSync(absolutePath);
    return res.secure_url;
  } catch (error) {
    if (fs.existsSync(absolutePath)) fs.unlinkSync(absolutePath);
    console.error("Cloudinary upload error:", error?.message || error);
    return null;
  }
};

export default uploadOnCloudinary; 
