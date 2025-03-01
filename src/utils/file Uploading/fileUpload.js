import multer,{diskStorage} from "multer";
import { nanoid } from "nanoid";
import path from "path";
import fs, { mkdirSync } from "fs";


export const fileValidation = {
    images: ["image/png", "image/jpg", "image/jpeg"],
    files: ["application/pdf"],
};

export const upload=(fileType,folder)=>{
    const storage=diskStorage({destination:(req,file,cb)=>{
        const folderPath=path.resolve(".",`${folder}/${req.user._id}`)//upload/user/9283923237
        if(fs.existsSync(folderPath))
            return cb(null,folderPath);

        fs.mkdirSync(folderPath,{recursive:true})
        const filename=`${folder}/${req.user._id}`;
        cb(null,filename); 
    },filename:(req,file,cb)=>{
     cb(null,nanoid()+"____"+file.originalname)
    }})

    function fileFilter (req, file, cb) {
       if(!fileType.includes(file.mimetype))
        return cb(new Error("In_valid file type"),false)

        return cb(null,true) 
      }
    const multerUpload=multer({storage,fileFilter});

    return multerUpload; //object
}




