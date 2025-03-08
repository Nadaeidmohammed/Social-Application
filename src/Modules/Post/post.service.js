import cloudinary from "../../utils/file Uploading/cloudinaryConfig.js"
import * as dbService from "../../DB/dbService.js"
import { defaultImageOnCloud, defaultPublicIdOnCloud, roleType, UserModel } from "../../DB/Models/user.model.js";
import {PostModel} from "../../DB/Models/post.model.js"
import { nanoid } from "nanoid";
import { CommentModel } from "../../DB/Models/comment.model.js";
import {paginate} from "../../utils/pagination/paginate.js"

export const createPost=async(req,res,next)=>{
   const {content}=req.body;
   let customId;
   let allImages=[];
   if(req.files.length){
    customId=nanoid(5);//for each post
    for (const file of req.files) {
        const{secure_url,public_id}= await cloudinary.uploader.upload(
            file.path,
            {folder:`Posts/${req.user._id}/post/${customId}`}
        )
        allImages.push({secure_url,public_id})
    }
  }
   const post = await dbService.create({
    model:PostModel,
    data:{
        content,
        images:allImages,
        createdBy:req.user._id,
        customId
    }
   });
   return res.status(200).json({success:true,data:{post}})
}
export const updatePost=async(req,res,next)=>{
    const {content}=req.body;
    const {postId}=req.params;

    const post=await dbService.findOne({model:PostModel,
        filter:{createdBy:req.user._id,isDeleted:false,_id:postId}
    })
    if(!post)
        return next(new Error("Post not found",{cause:404}));
    let allImages=[];
    if(req.files.length){
        for (const file of post.images) {
            await cloudinary.uploader.destroy(file.public_id)
        }
        for (const file of req.files) {
            const{secure_url,public_id}= await cloudinary.uploader.upload(
                file.path,
                {folder:`Posts/${req.user._id}/post/${post.customId}`}
            )
            allImages.push({secure_url,public_id})
        }
        post.images=allImages;
    }
    post.content = content? content : post.content;
    await post.save();
    return res.status(200).json({success:true,data:{post}})
}
export const softDelete=async(req,res,next)=>{
   
    const {postId}=req.params;
    const post=await dbService.findById({
        model:PostModel,
        id:postId,
    });
    if(!post)
        return next(new Error("Post not found",{cause:404}));

    if(req.user._id.toString()===post.createdBy.toString()||
    req.user._id.toString()===roleType.Admin.toString() ){
        post.isDeleted=true;
        post.deletedBy=req.user._id;
        await post.save();
    }else{
        return next(new Error("Unauthorized",{cause:404}));  
    }
    return res.status(200).json({success:true,data:{post}})
}
// if admin delete post another admin can restore post
export const restorePost = async (req, res, next) => {
    const { postId } = req.params;
    const post = await dbService.findOne({ model: PostModel, filter: { _id: postId } });
    if (!post) {
        return next(new Error("Post not found", { cause: 404 }));
    }
    if (!post.isDeleted) {
        return next(new Error("Post is not deleted", { cause: 400 }));
    }
    if (req.user.role === roleType.Admin) {
        const restoredPost = await dbService.findOneAndUpdate({
            model: PostModel,
            filter: { _id: postId, isDeleted: true },
            data: { isDeleted: false, $unset: { deletedBy: "" } },
            options: { new: true }
        });
        return res.status(200).json({ success: true, data: { post: restoredPost } });
    }
    if (post.createdBy.toString() === req.user._id.toString() && post.deletedBy.toString() === req.user._id.toString()) {
        const restoredPost = await dbService.findOneAndUpdate({
            model: PostModel,
            filter: { _id: postId, isDeleted: true },
            data: { isDeleted: false, $unset: { deletedBy: "" } },
            options: { new: true }
        });
        return res.status(200).json({ success: true, message: "Post restored successfully", data: { post: restoredPost } });
    }
    return next(new Error("Unauthorized: You can't restore this post", { cause: 403 }));
};
export const getSinglePost=async(req,res,next)=>{
    const {postId}=req.params;
    const post=await dbService.findOne({
        model:PostModel,
        filter:{_id:postId,isDeleted:false},
        populate:[
            {path: "createdBy" , select: " userName image -_id "},
            {path: "comments" , //virtual 
              match:{parentComment:{$exists:false}},
              select: " text image -_id ",
              populate:[{path: "createdBy" , select: " userName image -_id "},
                {path:"replies"}
               ]
            },
        ]
    });
    if(!post)
        return next(new Error("Post not found",{cause:404}));
    // //request comments
    // const comment=await dbService.find({
    //     model:CommentModel,
    //     filter:{postId , isDeleted:false}
    // });
    return res.status(200).json({success:true,data:{post}})
}
// export const activePosts=async(req,res,next)=>{
//     //1
//     // let posts;
//     // if(req.user.role===roleType.Admin)
//     // {
//     //     posts=await dbService.find({
//     //         model:PostModel,
//     //         filter:{isDeleted:false},
//     //         populate:{path:"createdBy",select:"userName image -_id"}
//     //     });
//     // }
//     // posts=await dbService.find({
//     //     model:PostModel,
//     //     filter:{isDeleted:false,createdBy:req.user._id},
//     //     populate:{path:"createdBy",select:"userName image -_id"}
//     // });
//     //2
//     // let posts;
//     // posts=await dbService.find({
//     //             model:PostModel,
//     //             filter:{isDeleted:false},
//     //             populate:{path:"createdBy",select:"userName image -_id"}
//     //         });
//     // let results=[];
//     // for (const post of posts) {
//     //     const comments=await dbService.find({
//     //         model:CommentModel,
//     //         filter:{postId:post._id,isDeleted:false},
//     //         select:"image text -_id"
//     //     });
//     //     results.push({post,comments})
//     // }
//     //3
//     const cursor = PostModel.find({isDeleted:false}).cursor();
//     let results=[];
//     for (let post = await cursor.next(); post != null; post = await cursor.next()) {
//         const comments=await dbService.find({
//                     model:CommentModel,
//                     filter:{postId:post._id,isDeleted:false},
//                     select:"image text -_id"
//                 });
//                 results.push({post,comments})
//     }
//     return res.status(200).json({success:true,data:{results}})
// }
export const activePosts=async(req,res,next)=>{
    let { page = 1 } = req.query; // Default to page 1 if not provided

    const results = await paginate(PostModel, { isDeleted: false }, page);

    return res.status(200).json({ success: true, data: results });
}
export const freezedPosts=async(req,res,next)=>{
    let posts;
    if(req.user.role===roleType.Admin)
    {
        posts=await dbService.find({
            model:PostModel,
            filter:{isDeleted:true},
            populate:{path:"createdBy",select:"userName image -_id"}
        });
    }
    posts=await dbService.find({
        model:PostModel,
        filter:{isDeleted:true,createdBy:req.user._id},
        populate:{path:"createdBy",select:"userName image -_id"}
    });
    return res.status(200).json({success:true,data:{posts}})
}
//multiple reaction -slice
export const likeAndUnlike=async(req,res,next)=>{
    const {postId}=req.params;
    let userId=req.user._id;
    const post = await dbService.findOne({model:PostModel,
        filter:{_id:postId,isDeleted:false}
    });
    if(!post)
        return next(new Error("Post not found",{cause:404}));
   const isUserLiked=await post.likes.find((user)=> user.toString()===userId.toString());

    if(!isUserLiked){
        post.likes.push(userId)
    }else{
        post.likes=post.likes.filter((user)=> user.toString()!==userId.toString())
    }
    await post.save();

    const populatedUser = await dbService.findOne({model:PostModel,
        filter:{_id:postId,isDeleted:false},
        populate:{path:"likes",select:"userName image -_id"}
    });
    return res.status(200).json({success:true,data:{populatedUser}})
}
export const reactToPost = async (req, res, next) => {
    const { postId } = req.params;
    const { reactionType } = req.body;
    const userId = req.user._id;

    if (!reactionType) {
        return next(new Error("Reaction type is required", { cause: 400 }));
    }

    const validReactions = ["like", "love", "haha", "wow", "sad", "angry"];
    if (!validReactions.includes(reactionType)) {
        return next(new Error("Invalid reaction type", { cause: 400 }));
    }

    const post = await dbService.findOne({
        model: PostModel,
        filter: { _id: postId, isDeleted: false }
    });

    if (!post) {
        return next(new Error("Post not found", { cause: 404 }));
    }

    // التحقق مما إذا كان المستخدم قد وضع ردة فعل مسبقاً
    if (post.reactions.has(userId.toString())) {
        if (post.reactions.get(userId.toString()) === reactionType) {
            // إذا كانت نفس الرياكشن، نحذفها
            post.reactions.delete(userId.toString());
        } else {
            // تحديث الرياكشن إذا كان مختلفاً
            post.reactions.set(userId.toString(), reactionType);
        }
    } else {
        // إضافة الرياكشن إذا لم يكن موجوداً مسبقًا
        post.reactions.set(userId.toString(), reactionType);
    }

    await post.save();
    const updatedPost = await dbService.findOne({
        model: PostModel,
        filter: { _id: postId, isDeleted: false },
        populate: { path: "createdBy", select: "userName image -_id" }
    });
    return res.status(200).json({ success: true, data: { updatedPost } });
};



