import * as dbService from "../../DB/dbService.js"
import {PostModel} from "../../DB/Models/post.model.js"
import { UserModel } from "../../DB/Models/user.model.js"

export const getAllUsersAndPosts=async(req,res,next)=>{
    // const post = await dbService.find({model:PostModel,filter:{}})//5s
    // const user = await dbService.find({model:UserModel,filter:{}})//3s

    const results=await Promise.all([dbService.find({model:PostModel,filter:{}}),
        dbService.find({model:UserModel,filter:{}})
    ]);

    return res.status(200).json({success:true,data:{results}})
}
export const changeRole=async(req,res,next)=>{
    const{userId,role}=req.body;

    const user =await dbService.findOneAndDelete({
        model:UserModel,
        filter:{_id:userId},
        data:{role},
        options:{new:true}
    });
   
    return res.status(200).json({success:true,data:{user}})
}