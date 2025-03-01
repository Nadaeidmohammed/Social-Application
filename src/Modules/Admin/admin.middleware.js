import { roleType, UserModel } from "../../DB/Models/user.model.js"
import * as dbService from "../../DB/dbService.js"

export const changeRole=async(req,res,next)=>{

    const allRoles=Object.values(roleType); //["Admin","User"]
    //user who login
    const userReq=req.user;
    //targrt
    const targrtUser=await dbService.findById({model:UserModel,
        id:req.body.userId
    });
    userReqRole=userReq.role;
    const targrtUserRole=targrtUser.role;
    
    const userReqIndex=allRoles.indexOf(userReqRole)
    const targrtUserIndex=allRoles.indexOf(targrtUserRole)

    const canModify=userReqIndex<targrtUserIndex;
    if(!canModify)
        return next(new Error("Unauthorized",{cause:401}));

    return next()
}