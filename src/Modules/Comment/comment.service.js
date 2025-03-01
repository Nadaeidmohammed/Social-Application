import cloudinary from "../../utils/file Uploading/cloudinaryConfig.js"
import * as dbService from "../../DB/dbService.js"
import {CommentModel} from "../../DB/Models/comment.model.js"
import {PostModel} from "../../DB/Models/post.model.js"
import { roleType } from "../../DB/Models/user.model.js"

export const createComment=async(req,res,next)=>{
    const{postId}=req.params;
    const{text}=req.body;

    const post = await dbService.findById({
        model:PostModel,
        id:postId,
    });
    if(!post)
        return next(new Error("Post Not Found",{cause:400}));

    let image;
    //check if send image
    if(req.file){
        //upload cloudinary
       const {secure_url,public_id}=await cloudinary.uploader.upload(req.file.path,
        {folder:`Posts/${post.createdBy}/post/${post.customId}/comment`}
       )
       image={secure_url,public_id}
    }
    const comment=await dbService.create({
        model:CommentModel,
        data:{
            text,
            postId:post._id,
            createdBy:req.user._id,
            image,
        }

    })
    return res.status(201).json({success:true,data:{comment}})
}
export const updateComment=async(req,res,next)=>{
    const{commentId}=req.params;
    const{text}=req.body;

    const comment = await dbService.findById({
        model:CommentModel,
        id:commentId,
    });
    if(!comment)
        return next(new Error("Comment Not Found",{cause:404}));

    const post = await dbService.findOne({
        model:PostModel,
        filter:{_id:comment.postId,isDeleted:false},
    });
    if(!post)
        return next(new Error("Post Not Found",{cause:404}));

    //owner of comment
    if(comment.createdBy.toString()!== req.user._id.toString())
        return next(new Error("Unauthorized",{cause:401}));

    let image;
    //check if send image
    if(req.file){
        //upload cloudinary
       const {secure_url,public_id}=await cloudinary.uploader.upload(req.file.path,
        {folder:`Posts/${post.createdBy}/post/${post.customId}/comment`}
       )
       image={secure_url,public_id}

       if(comment.image)
         await cloudinary.uploader.destroy(comment.image.public_id)

    comment.image=image
    }

     comment.text = text ? text : comment.text;
     await comment.save();
   
    return res.status(200).json({success:true,data:{comment}})
}
export const softDeleteComment=async(req,res,next)=>{
    const{commentId}=req.params;

    const comment = await dbService.findById({
        model:CommentModel,
        id:commentId,
    });
    if(!comment) return next(new Error("Comment Not Found",{cause:404}));

    const post = await dbService.findOne({
        model:PostModel,
        filter:{_id:comment.postId,isDeleted:false},
    });
    if(!post) return next(new Error("Post Not Found",{cause:404}));

    //user who created comment
    const commentOwner=comment.createdBy.toString() === req.user._id.toString();
    //user who created post
    const postOwner=post.createdBy.toString() === req.user._id.toString();
    //admin
    const admin = req.user.role === roleType.Admin;

    if(!(commentOwner || postOwner || admin))
        return next(new Error("Unautharized",{cause:401}))

    comment.isDeleted=true;
    comment.deletedBy=req.user._id;
    await comment.save();
   
    return res.status(200).json({success:true,data:{comment}})
}
export const getAllComments=async(req,res,next)=>{
    const{postId}=req.params;

    const post = await dbService.findOne({
        model:PostModel,
        filter:{_id:postId,isDeleted:false},
    });
    if(!post) return next(new Error("Post Not Found",{cause:404}));

    const comment = await dbService.find({
        model:CommentModel,
        filter:{postId,isDeleted:false,parentComment:null},
        populate:[{path:"replies"}]
    });
    if(!comment) return next(new Error("Comment Not Found",{cause:404}));

   
    return res.status(200).json({success:true,data:{comment}})
}
export const likeAndUnlikeComment=async(req,res,next)=>{
    const {commentId}=req.params;
    let userId=req.user._id;
    const comment = await dbService.findOne({model:CommentModel,
        filter:{_id:commentId,isDeleted:false}
    });
    if(!comment)
        return next(new Error("comment not found",{cause:404}));

    //check if user has already liked the comment 
   const isUserLiked=await comment.likes.find((user)=> user.toString()===userId.toString());

    if(!isUserLiked){
        comment.likes.push(userId); //like
    }else{
        comment.likes=comment.likes.filter((user)=> user.toString()!==userId.toString())
    }  //unlike
    await comment.save();

    const populatedUser = await dbService.findOne({model:CommentModel,
        filter:{_id:commentId,isDeleted:false},
        populate:{path:"likes",select:"userName image -_id"}
    });
    return res.status(200).json({success:true,data:{populatedUser}})
}

export const addReply=async(req,res,next)=>{
    const {commentId,postId}=req.params;

    const comment = await dbService.findOne({
        model:CommentModel,
        filter:{_id:commentId,isDeleted:false},
    })
    if(!comment)
        return next(new Error("Comment Not Found",{cause:404}));

    const post = await dbService.findOne({
        model:PostModel,
        filter:{_id: postId,isDeleted:false},
    });
    if(!post)
        return next(new Error("Post Not Found",{cause:404}));

    let image;
    //check if send image
    if(req.file){
        //upload cloudinary
       const {secure_url,public_id}=await cloudinary.uploader.upload(req.file.path,
        {folder:`Posts/${post.createdBy}/post/${post.customId}/comment/${comment._id}`}
       )
       image={secure_url,public_id}
    }
    const reply=await dbService.create({
        model:CommentModel,
        data:{
            ...req.body,
            postId,
            createdBy:req.user._id,
            image,
            parentComment:comment._id
        }

    })
    return res.status(201).json({success:true,data:{reply}})
}

export const hardDeleteComment=async(req,res,next)=>{
    const{commentId}=req.params;

    const comment = await dbService.findById({
        model:CommentModel,
        id:commentId,
    });
    if(!comment) return next(new Error("Comment Not Found",{cause:404}));

    const post = await dbService.findOne({
        model:PostModel,
        filter:{_id:comment.postId,isDeleted:false},
    });
    if(!post) return next(new Error("Post Not Found",{cause:404}));

    //user who created comment
    const commentOwner=comment.createdBy.toString() === req.user._id.toString();
    //user who created post
    const postOwner=post.createdBy.toString() === req.user._id.toString();
    //admin
    const admin = req.user.role === roleType.Admin;

    if(!(commentOwner || postOwner || admin))
        return next(new Error("Unautharized",{cause:401}))

    await comment.deleteOne();
   
    return res.status(200).json({success:true,message:"Comment Deleted Successfully"})
}




