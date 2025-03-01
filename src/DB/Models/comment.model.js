import mongoose,{Schema,Types,model} from "mongoose";
import cloudinary from "../../utils/file Uploading/cloudinaryConfig.js";
const commentSchema=new Schema({
    text:{
        type:String,
        minLength:2,
        maxLength:5000,
        trim:true,
        required:function () {
            return this.image?.length ? false:true;
        },
    },
    image:[{
        public_id:String,
        secure_url:String,
    }],
    createdBy:{
        type:Types.ObjectId,
        ref:"User",
        required:true,
    },
    postId:{
        type:Types.ObjectId,
        ref:"Post",
        required:true,
    },
    deletedBy:{
        type:Types.ObjectId,
        ref:"User",
    },
    likes:[{
        type:Types.ObjectId,
        ref:"User",
    }],
    isDeleted:{
        type:Boolean,
        default:false,
    },
    parentComment:{
        type:Types.ObjectId,
        ref:"Comment",
    },
},{timestamps:true,toObject:{virtuals:true},toJSON:{virtuals:true}})

commentSchema.virtual("replies",{
    ref:"Comment",
    localField:"_id",
    foreignField:"parentComment"
});

commentSchema.post("deleteOne",
    {document:true,query:false},
    async function(doc,next){
        let replies=await this.constructor.find({parentComment:doc._id})
        if(replies.length>0){
            for (const reply of replies) {
                if(doc.image.secure_url)
                    await cloudinary.uploader.destroy(doc.image.public_id)
        
                await reply.deleteOne();
            }
        }
        return next();
})

export const CommentModel = mongoose.models.Comment || model("Comment",commentSchema)