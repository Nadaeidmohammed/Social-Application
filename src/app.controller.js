import connectDB from "./DB/connection.js";
import authRouter from "./Modules/Auth/auth.controller.js"
import userRouter from "./Modules/User/user.controller.js"
import postRouter from "./Modules/Post/post.controller.js"
import adminRouter from "./Modules/Admin/admin.controller.js"
import commentRouter from "./Modules/Comment/comment.controller.js"
import globalErrorHandler from "./utils/error handling/globalErrorHandler.js";
import notFoundHandler from "./utils/error handling/notFoundHandler.js";
import { createHandler } from "graphql-http/lib/use/express";
import { schema } from "./Modules/app.graph.js";
import {rateLimit} from "express-rate-limit"
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
    const limiter=rateLimit({windowMs:5*60*1000,
        limit:2,
        handler:(req,res,next,options)=>{
            return next(new Error(options.message,{cause:options.statusCode}))
        }
    });
    app.use(limiter);
    app.use("/Uploads",express.static("Uploads"))
    app.use("/auth",authRouter);
    app.use("/user",userRouter);
    app.use("/post",postRouter);
    app.use("/comment",commentRouter)
    app.use("/admin",adminRouter)
    app.use("/graphql",createHandler({schema:schema}))
    app.get("/",(req,res)=>{
        return res.json({success:true})
    })
    app.all("*",notFoundHandler)
    app.use(globalErrorHandler);
}