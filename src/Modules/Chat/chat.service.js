import * as dbService from "../../DB/dbService.js"
import { ChatModel } from "../../DB/Models/chat.model.js";
import { UserModel } from "../../DB/Models/user.model.js";


export const getChat=async(req,res,next)=>{
    const {friendId}=req.params;

    const friend=dbService.findOne({model:UserModel,filter:{_id:friendId,
        isDeleted:false
    }});

    if(!friend)
        return next(new Error("friend not found",{cause:404}))

    const chat=dbService.findOne({model:ChatModel,
        filter:{users:{$all:[req.user._id,friendId]}}
    });
    return res.status(200).json({success:true,data:{chat}})
}

export const sendMessage=async(req,res,next)=>{
    const {friendId}=req.params;
    const {content}=req.body;

    const friend=dbService.findOne({model:UserModel,filter:{_id:friendId,
        isDeleted:false
    }});

    if(!friend)
        return next(new Error("friend not found",{cause:404}))

    let chat=dbService.findOne({model:ChatModel,
        filter:{users:{$all:[req.user._id,friendId]}}
    });
    if(!chat){
        chat=await dbService.create({model:ChatModel,
            data:{
                users:[req.user._id,friendId],
                messages:[{sender:req.user._id,content}]
            }
        })
    }else{
        chat.messages.push({sender:req.user._id,content});
        await chat.save()
    }
    return res.status(200).json({success:true,data:{chat}})
}