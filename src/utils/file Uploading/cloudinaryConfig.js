import { v2 as cloudinary } from 'cloudinary';
import path from "path"
import dotenv from "dotenv"

dotenv.config({path:path.resolve("./src/config/.env")});

cloudinary.config({ 
    cloud_name:process.env.CLOUD_NAME, 
    api_key:process.env.API_KEY, 
    api_secret: process.env.API_SECRET 
});

export default cloudinary;