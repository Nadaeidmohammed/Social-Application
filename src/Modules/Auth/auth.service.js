import {compareHash, hash} from "../../utils/hashing/hash.js"
import {providersTypes, roleType, UserModel} from "../../DB/Models/user.model.js"
import {emailEmitter} from "../../utils/email/emailEvent.js"
import { generateToken } from "../../utils/token/token.js";
import {OAuth2Client}  from 'google-auth-library';
import * as dbService from "../../DB/dbService.js"
import { decodedToken, tokenTypes } from "../../middlewares/auth.middlewares.js";

export const register=async(req,res,next)=>{
    const{userName,email,password}=req.body;
    const user =await dbService.findOne({model:UserModel,filter:{email}})
    if(user)
        return next (new Error("User Already Exist",{cause:409}))

    const newUser=await dbService.create({
      model:UserModel,
      data:{ 
        userName,
        email,
        password
    }})
    //sendEmail
    emailEmitter.emit("sendEmail",email,userName,newUser._id)
    return res.status(201).json({success:true,message:"User Created Successfully",newUser})
}
export const confirmEmail=async(req,res,next)=>{
    const{code,email}=req.body;

    const user = await dbService.findOne({model:UserModel,filter:{email}})
    if(!user)
        return next (new Error("User Not Found",{cause:404}))

    if(user.confirmEmail===true)
        return next (new Error("Email Already Verified",{cause:409}))


    if (!user.confirmEmailOTP)
        return next(new Error("No OTP found. Please request a new one.", { cause: 400 }));


    if(!compareHash({plainText:code,hash:user.confirmEmailOTP}))
        return next (new Error("Invalid Code",{cause:400}))

    await dbService.updateOne({model:UserModel,
        filter:{email},
        data:{confirmEmail:true,$unset:{confirmEmailOTP:""}}
    });
    return res.status(200).json({success:true,message:"Email Verified Successfully"})
}
export const login=async(req,res,next)=>{
    const{email,password}=req.body;

    const user = await dbService.findOne({model:UserModel,filter:{email}});
    if(!user)
        return next (new Error("User Not Found",{cause:404}))

    if(!user.confirmEmail)
        return next (new Error("Email Not Verified",{cause:401}))

    if(!compareHash({plainText:password,hash:user.password}))
        return next (new Error("In_Valid Password",{cause:400}))

    const access_token=generateToken({payload:{id:user._id},
        signature:user.role===roleType.User?
        process.env.USER_ACCESS_TOKEN:
        process.env.ADMIN_ACCESS_TOKEN,
        options:{expiresIn :process.env.ACCESS_TOKEN_EXPIRES}}
        )

        const refresh_token=generateToken({payload:{id:user._id},
            signature:user.role===roleType.User?
            process.env.USER_REFRESH_TOKEN:
            process.env.ADMIN_REFRESH_TOKEN,
            options:{expiresIn :process.env.REFRESH_TOKEN_EXPIRES}});


    return res.status(200).json({success:true,tokens:{
        access_token,
        refresh_token
    }});
}
/////////
export const refresh_token=async(req,res,next)=>{
    const {authorization}=req.headers;
    const user =await decodedToken({
        authorization,
        tokenType:tokenTypes.refresh,
        next})

    const access_token = generateToken({
        payload: { id: user._id },
        signature: user.role === roleType.User
            ? process.env.USER_ACCESS_TOKEN
            : process.env.ADMIN_ACCESS_TOKEN,
        options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRES }
    });
    
    const refresh_token = generateToken({
        payload: { id: user._id },
        signature: user.role === roleType.User
            ? process.env.USER_REFRESH_TOKEN
            : process.env.ADMIN_REFRESH_TOKEN,
        options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRES }
    });

    return res.status(200).json({
        success: true,
        tokens: {
            access_token,
            refresh_token
        }
    });
}
export const forgetPassword=async(req,res,next)=>{
    const{email}=req.body;
    const user = await dbService.findOne({model:UserModel,filter:{email,isDeleted:false}});
    if(!user)
        return next (new Error("User Not Found",{cause:404}))
  
    emailEmitter.emit("forgetPassword",email,user.userName,user._id)

    return res.status(200).json({success:true,message:"OTP send successfully"})
}
export const resetPassword=async(req,res,next)=>{
    const{email,code,password}=req.body;
    const user = await dbService.findOne({model:UserModel,filter:{email,isDeleted:false}})
    if(!user)
        return next (new Error("User Not Found",{cause:404}))
  
   if(!compareHash({plainText:code,hash:user.forgetPasswordOTP}))
    return next (new Error("In_valid code",{cause:404}))

   const hashPassword=hash({plainText:password})
    await dbService.updateOne({model:UserModel,filter:{email},data:{password:hashPassword,forgetPasswordOTP:" "}})

    return res.status(200).json({success:true,
        message:"Password Reseted Successfully"
    })
}
export const loginWithGmail=async(req,res,next)=>{
    const {idToken}=req.body;
    console.log(idToken);
    
const client = new OAuth2Client();
async function verify() {
  const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.CLIENT_ID,
  });
  const payload = ticket.getPayload();
  return payload;
}
const {name,email,picture,email_verified} =await verify();
if(!email_verified)
    return next (new Error("Email Not Verified",{cause:409}))
let user =await dbService.findOne({model:UserModel,filter:{email,isDeleted:false}});
if(user?.providers===providersTypes.System)
    return next (new Error("in_valid login method ",{cause:409}))
    if(!user)
     user=await dbService.create({
    model:UserModel,
    data:{
    userName:name,
    email,
    Image:picture,
    confirmEmail:email_verified,
    providers:providersTypes.Google
     }})
        const access_token=generateToken({payload:{id:user._id},
            signature:user.role===roleType.User?
            process.env.USER_ACCESS_TOKEN:
            process.env.ADMIN_ACCESS_TOKEN,
            options:{expiresIn :process.env.ACCESS_TOKEN_EXPIRES}}
            )
    
            const refresh_token=generateToken({payload:{id:user._id},
                signature:user.role===roleType.User?
                process.env.USER_REFRESH_TOKEN:
                process.env.ADMIN_REFRESH_TOKEN,
                options:{expiresIn :process.env.REFRESH_TOKEN_EXPIRES}});
    
       
                return res.status(200).json({success:true,tokens:{
                    access_token,
                    refresh_token
                },
            message:"success"});
}