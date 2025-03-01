import mongoose from "mongoose";

const connectDB=async ()=>{
try {
   await mongoose.connect(process.env.DB_URI,{
        serverSelectionTimeoutMS:5000,
    })
     console.log("Connected To DB");
} catch (error) {
    console.log(`Error connecting to DB: ${error.message}`);
}
}
export default connectDB;