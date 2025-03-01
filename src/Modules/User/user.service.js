import * as dbService from "../../DB/dbService.js"
import { defaultImage, defaultImageOnCloud, defaultPublicIdOnCloud, UserModel } from "../../DB/Models/user.model.js";
import { emailEmitter } from "../../utils/email/emailEvent.js";
import { encrypt } from "../../utils/encryption/encryption.js";
import { compareHash, hash } from "../../utils/hashing/hash.js";
import cloudinary from "../../utils/file Uploading/cloudinaryConfig.js"
import path from "path";
import fs from "fs";

export const getProfile=async(req,res,next)=>{
    const user =await dbService.findOne({model:UserModel,filter:{_id:req.user._id},
    populate:[{path:"viewers.userId",select:"userName email Image"}]
})
return user? res.status(200).json({success:true,user}):
    next(new Error("Not found",{cause:404}))
}
// export const shareProfile = async (req, res, next) => {
//     const { profileId } = req.params;
//     let user;
//     if (profileId === req.user._id.toString()) {
//         user = req.user;
//     } else {
//         const alreadyViewed = await dbService.findOne({
//             model: UserModel,
//             filter: {
//                 _id: profileId,
//                 "viewers.userId": req.user._id,
//                 isDeleted: false,
//             }
//         });
//         if (!alreadyViewed) {
//             user = await dbService.findOneAndUpdate({
//                 model: UserModel,
//                 filter: { _id: profileId, isDeleted: false },
//                 data: {
//                     $push: {
//                         viewers: {
//                             $each: [{ userId: req.user._id, time: Date.now() }],
//                             $slice: -5 
//                         }
//                     }
//                 },
//                 select: "userName email Image viewers"
//             });
//         } else {
//             user = alreadyViewed;
//         }
//     }
//     return user ? res.status(200).json({ success: true, user }) :
//         next(new Error("Not found", { cause: 404 }));
// };
export const shareProfile = async (req, res, next) => {
    const { profileId } = req.params;
    let user;

    if (profileId === req.user._id.toString()) {
        user = req.user.toObject();  
    } else {
        user = await UserModel.findOne(
            { _id: profileId, isDeleted: false },
            "userName email image viewers"
        ).lean();

        if (!user) return next(new Error("Not found", { cause: 404 }));

        const hasVisited = user.viewers.some(v => v.userId.toString() === req.user._id.toString());

        if (!hasVisited) {
            await UserModel.updateOne(
                { _id: profileId },
                {
                    $push: {
                        viewers: {
                            $each: [{ userId: req.user._id, time: new Date() }],
                            $slice: -5 
                        }
                    }
                }
            );
            user = await UserModel.findOne(
                { _id: profileId },
                "userName email image viewers"
            ).lean();
        }
    }

    return res.status(200).json({ success: true, user });
};
export const updateEmail=async(req,res,next)=>{
   const {email}=req.body;
   if(await dbService.findOne({model:UserModel,filter:{email}}))
    return next(new Error("Email already exist "))

    await dbService.updateOne({model:UserModel,filter:{_id:req.user._id},data:{tempEmail:email}})

    emailEmitter.emit("sendEmail", 
         req.user.email, 
         req.user.userName, 
         req.user._id 
      );
    
      emailEmitter.emit("updateEmail", 
        email, 
         req.user.userName, 
         req.user._id 
      );

return  res.status(200).json({success:true,data:{}})
}
export const resetEmail=async(req,res,next)=>{
    const {oldCode,newCode}=req.body;
console.log("📩 Checking values before comparing hash:");
console.log("➡️ OTP from request:", oldCode,newCode);
console.log("➡️ Stored Hash from DB:", req.user.tempEmailOTP,
    req.user.confirmEmailOTO
); // تأكد من أن tempEmailOTP موجودة

if (!req.user.tempEmailOTP) {
    return next(new Error("OTP is missing or expired", { cause: 400 }));
}

if (typeof req.user.tempEmailOTP !== "string") {
    console.error("🚨 tempEmailOTP is not a string!", user.tempEmailOTP);
    return next(new Error("Invalid OTP format", { cause: 400 }));
}

   if(!compareHash({plainText:oldCode,hash:req.user.confirmEmailOTP||
    !compareHash({plainText:newCode,hash:req.user.tempEmailOTP})
   }))
   next(new Error("In_valid code",{cause:404}))

   const user =await dbService.updateOne({model:UserModel,
    filter:{_id:req.user._id},
    data:{email:req.user.tempEmail,changeCredentialsTime:Date.now(),$unset:{tempEmail:"",tempEmailOTP:"",confirmEmailOTO:""}}
   })
 
  return  res.status(200).json({success:true,user})
}
export const updatePassword=async(req,res,next)=>{
    const{oldPassword,Password}=req.body;
     
    if(!compareHash({plainText:oldPassword,hash:req.user.password}))
      return next(new Error("In_valid password",{cause:404}))
    
       const user =await dbService.updateOne({model:UserModel,
        filter:{_id:req.user._id},
        data:{password:hash({plainText:Password}),changeCredentialsTime:Date.now()},
        options: { new: true, runValidators: true }
       })
       
    
    return res.status(200).json({ success: true, message: "Password updated successfully", user });
}
export const updateProfile=async(req,res,next)=>{
    if(req.body.phone)
        req.body.phone=encrypt({plainText:req.user.phone,signature:process.env.ENCRYPTION_SECRET})
    const user =await dbService.findOneAndUpdate({
        model:UserModel,
        filter:{_id:req.user._id},
        data:{...req.body},
        options:{new:true,runValidators:true}
     })
    return res.status(200).json({ success: true, message: "Profile updated successfully", user });
}
export const uploadImageDisk=async(req,res,next)=>{
    const user=await dbService.findByIdAndUpdate({
        model:UserModel,
        id:req.user._id,
        data:{image:req.file.path},
        options:{new:true}
    });
    return res.status(200).json({success:true,data:{user}})
}
export const uploadMultipleImageDisk=async(req,res,next)=>{
    const user=await dbService.findByIdAndUpdate({
        model:UserModel,
        id:req.user._id,
        data:{coverImages:req.files.map((obj)=>obj.path)},
        options:{new:true}
    });
    return res.status(200).json({success:true,data:{user}})
}
export const deleteProfilePicture=async(req,res,next)=>{
    const user=await dbService.findById({
        model:UserModel,
        id:req.user._id,
    });
    const imagePath=path.resolve(".",user.image)
    fs.unlinkSync(imagePath);
    user.image=defaultImage;
    await user.save(); 
    return res.status(200).json({success:true,data:{user}})
}
export const uploadImageOnCloud=async(req,res,next)=>{
    const user=await dbService.findById({
        model:UserModel,
        id:req.user._id,
    });
    const{public_id,secure_url}=await cloudinary.uploader.upload(req.file.path,{
        folder:`User/${req.user._id}/profilePicture`,
    });
    user.image={public_id,secure_url};
    await user.save();
    return res.status(200).json({success:true,data:{user}})
}
export const deleteImageOnCloud=async(req,res,next)=>{
    const user=await dbService.findById({
        model:UserModel,
        id:req.user._id,
    });
    const results=await cloudinary.uploader.destroy(user.image.public_id);
   if(results.result==="ok"){
    user.image={
        public_id:defaultPublicIdOnCloud,
        secure_url:defaultImageOnCloud,
    }
   }
   await user.save();
    return res.status(200).json({success:true,data:{user}})
}