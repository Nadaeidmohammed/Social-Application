import { v2 as cloudinary } from 'cloudinary';

// import dotenv from "dotenv"

// dotenv.config({path:"../../config/.env"});
// // console.log('Cloud Name:', process.env.CLOUD_NAME);
// // console.log('API Key:', process.env.API_KEY);
// // console.log('API Secret:', process.env.API_SECRET);
cloudinary.config({ 
    cloud_name: 'dtw3kmfaa', 
    api_key:'444867911316748', 
    api_secret: 'Vx1_yfjTGZ-Yw1dsgoHdduLwOf0' 
});

export default cloudinary;