import mongoose,{Schema,Types,model} from "mongoose";
import { hash } from "../../utils/hashing/hash.js";

export const roleType={
User:"Admin",
Admin:"User"
}
export const genderType={
 male:"male",
 female:"female",
}
export const providersTypes={
   System:"System",
   Google:"Google"
}

export const defaultImage="upload\\default-profile-picture.jpg"
export const defaultImageOnCloud="https://res.cloudinary.com/dtw3kmfaa/image/upload/v1740234443/default-profile-picture-avatar-user-icon-vector-46389216_hxfouj.jpg"
export const defaultPublicIdOnCloud="default-profile-picture-avatar-user-icon-vector-46389216_hxfouj"
const userSchema=new Schema({
    userName:{
        type:String,
        minlength:[3,"userName must be at least 3 characters long"],
        maxlength:[20,"userName must be at most 20 characters long"],
        required:true,
        trim:true,
    },
    email:{
        type:String,
        required:true,
        trim:true, 
        lowercase:true,
        unique:true,
    },
    password:{
        type:String,
    },
    gender:{
        type:String,
        enum:Object.values(genderType),
        default:genderType.male,
    },
    role:{
        type:String,
        enum:Object.values(roleType),
        default:roleType.User,
    },
    providers:{
        type:String,
        enum:Object.values(providersTypes),
        default:providersTypes.System,
    },
    confirmEmail:{
        type:Boolean,
        default:false,
    },
    isDeleted:{
        type:Boolean,
        default:false,
    },
    viewers:[{
        userId:{type:Types.ObjectId,ref:"User"},
        time:Date,
    }],
    confirmEmailOTP:String,
    changeCredentialsTime:Date,
    DOB:Date,
    address:String,
    phone:String,
    image:{
        secure_url:{
            type:String,
            default:defaultImageOnCloud,
        },
        public_id:{
            type:String,
            default:defaultImageOnCloud,
        },
    },
    // image:{
    //     type:String,
    //     default:defaultImage,
    // },
    // coverImages:[String],
    forgetPasswordOTP:String,
    tempEmail:String,
    tempEmailOTP:String,
},{timestamps:true})

userSchema.pre("save",function(next){
    if(this.isModified("password"))
        this.password=hash({plainText:this.password});
    return next();
})

export const UserModel= mongoose.models.User || model("User",userSchema)