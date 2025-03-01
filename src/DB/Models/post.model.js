import mongoose,{Schema,Types,model} from "mongoose";
const postSchema=new Schema({
    content:{
        type:String,
        minLength:2,
        maxLength:5000,
        trim:true,
        required:function () {
            return this.images?.length ? false:true;
        },
    },
    images:[{
        public_id:String,
        secure_url:String,
    }],
    createdBy:{
        type:Types.ObjectId,
        ref:"User",
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
    reactions: { 
        type: Map, 
        of: String,
        default: {} 
    },
    isDeleted:{
        type:Boolean,
        default:false,
    },
    customId:{
        type:String,
        unique:true,
    },
},{timestamps:true,toJSON:{virtuals:true},toObject:{virtuals:true}})

postSchema.virtual("comments",{
    ref:"Comment",
    foreignField:"postId",
    localField:"_id",
});

export const PostModel = mongoose.models.Post || model("Post",postSchema)