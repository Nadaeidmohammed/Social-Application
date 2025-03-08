import * as dbService from "../../../DB/dbService.js"
import {PostModel} from "../../../DB/Models/post.model.js"
import { roleType } from "../../../DB/Models/user.model.js";
import { validation } from "../../Post/graph/graph.validation.middleware.js";
import { likePostGraph } from "../post.validation.js";
import { authentication } from "./graph.auth.middleware.js";

export const likePost=async(parent,args)=>{
    const{postId,authorization}=args;
    await validation(likePostGraph,args)
    const user = await authentication({authorization,accessRoles:roleType.User})
    
    const posts = await dbService.findByIdAndUpdate({model:PostModel,
        id:{_id:postId},
        data:{$addToSet:{likes:user._id}},
        options:{new:true}
    });    
    
    return {message:"Done",statusCode:200,data:posts}
}