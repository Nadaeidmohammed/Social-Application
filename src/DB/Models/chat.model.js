import mongoose,{Schema,Types,model} from "mongoose";


const messageSchema=new Schema({
    sender:{type:Types.ObjectId,ref:"User",required:true},
    content:{type:String,required:true}
},{timestamps:true})

const chatSchema=new Schema({
    users:{
        type:[{type:Types.ObjectId,ref:"User"}],
        validate:{
            validator:(value)=> value.length===2,
            message:"Users Array must be 2 "
        }
    },
    messages:[messageSchema]
},{timestamps:true})

export const ChatModel= mongoose.models.Chat || model("Chat",chatSchema)