import * as dbService from "../DB/dbService.js"
import { UserModel } from "../DB/Models/user.model.js";
import asyncHandler from "../utils/error handling/asyncHandler.js"
import { verify } from "../utils/token/token.js";
export const tokenTypes={
    access:"access",
    refresh:"refresh"
}
export const decodedToken=async({
    authorization="",
    tokenType=tokenTypes.access,
    next={}
})=>{
    const [bearer,token]=authorization.split(" ") || [];
    if(!bearer || ! token)
        return next(new Error("In_Valid token" , {cause:400}))

    let ACCESS_SIGNATURE=undefined;
    let REFRESH_SIGNATURE=undefined;
   // let signature=undefined
    switch (bearer) {
        case "Admin":
            ACCESS_SIGNATURE = process.env.ADMIN_ACCESS_TOKEN;
            REFRESH_SIGNATURE = process.env.ADMIN_REFRESH_TOKEN;
            // signature=tokenType === tokenTypes.access?process.env.ADMIN_ACCESS_TOKEN:
            // process.env.ADMIN_REFRESH_TOKEN
            break;
        case "User":
            ACCESS_SIGNATURE = process.env.USER_ACCESS_TOKEN;
            REFRESH_SIGNATURE=process.env.USER_REFRESH_TOKEN;
            // signature=tokenType === tokenTypes.access?process.env.USER_ACCESS_TOKEN:
            // process.env.USER_REFRESH_TOKEN
            break;
        default:
           break;
    }
    
    const decoded = verify({ token , 
        signature : tokenType ? ACCESS_SIGNATURE:REFRESH_SIGNATURE
    });
        
    const user = await dbService.findOne({
        model:UserModel,
        filter:{ _id: decoded.id, isDeleted: false }});


    if (!user) {
        return next(new Error("User not found", { cause: 404 }));
    }
    if (user.changeCredentialsTime?.getTime() >= decoded.iat * 1000)
        return next(new Error("Invalid token ", { cause: 404 }));

    return user;
}
export const authentication =()=>{
    return asyncHandler(async(req,res,next) => {
        const {authorization}=req.headers;
        req.user =await decodedToken({authorization , next})
        return next();
    });
};
export const allowTo = (roles = []) => {
    return asyncHandler(async (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new Error("Unauthorized", { cause: 403 }));
        }
        return next();
    });
};
