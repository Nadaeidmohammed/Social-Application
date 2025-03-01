import connectDB from "./DB/connection.js";
import authRouter from "./Modules/Auth/auth.controller.js"
import userRouter from "./Modules/User/user.controller.js"
import postRouter from "./Modules/Post/post.controller.js"
import adminRouter from "./Modules/Admin/admin.controller.js"
import commentRouter from "./Modules/Comment/comment.controller.js"
import globalErrorHandler from "./utils/error handling/globalErrorHandler.js";
import notFoundHandler from "./utils/error handling/notFoundHandler.js";
//import morgan from "morgan";
export const bootstrab=async(app,express)=>{
    //    app.use(morgan("combined"))
    await connectDB();
    app.use(express.json());
    // const whitelist=["http://localhost:3000"];
    // app.use((req,res,next)=>{
    //     if(!whitelist.includes(req.header("origin")))
    //         return next(new Error("Bloked By Cors"));

    //     res.header("Access-Control-Allow-Origin",(req.header("origin")))
    //     res.header("Access-Control-Allow-Methods","*")
    //     res.header("Access-Control-Allow-Headers","*")
    //     res.header("Access-Control-Allow-Network",true)
    //     return next();
    // })
    app.use("/Uploads",express.static("Uploads"))
    app.use("/auth",authRouter);
    app.use("/user",userRouter);
    app.use("/post",postRouter);
    app.use("/comment",commentRouter)
    app.use("/admin",adminRouter)
    app.get("/",(req,res)=>{
        return res.json({success:true})
    })
    app.all("*",notFoundHandler)
    app.use(globalErrorHandler);
}