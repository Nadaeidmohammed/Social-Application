import { Router } from "express";
import * as postService from "./post.service.js"
import * as postValidation from "./post.validation.js"
import asyncHandler from "../../utils/error handling/asyncHandler.js";
import { allowTo, authentication } from "../../middlewares/auth.middlewares.js";
import { validation } from "../../middlewares/validation.middleware.js";
import { uploadCloud } from "../../utils/file Uploading/multerCloud.js";
import commentRouter from "../Comment/comment.controller.js"

const router=Router();

router.use("/:postId/comment",commentRouter)
router.post("/create",
    authentication(),
    allowTo(["User"]),
    uploadCloud().array("images",5),
    validation(postValidation.createPostSchema),
    asyncHandler(postService.createPost));

router.patch("/update/:postId",
    authentication(),
    allowTo(["User"]),
    uploadCloud().array("images",5),
    validation(postValidation.updatePostSchema),
    asyncHandler(postService.updatePost));

router.patch("/softDelete/:postId",
    authentication(),
    allowTo(["User","Admin"]),
    validation(postValidation.softDeleteSchema),
    asyncHandler(postService.softDelete));

router.patch("/restorePost/:postId",
    authentication(),
    allowTo(["User","Admin"]),
    validation(postValidation.restorePostSchema),
    asyncHandler(postService.restorePost));

router.get("/getSinglePost/:postId",
    authentication(),
    allowTo(["User","Admin"]),
    validation(postValidation.getSinglePostSchema),
    asyncHandler(postService.getSinglePost));

router.get("/activePosts",
    authentication(),
    allowTo(["User","Admin"]),
    asyncHandler(postService.activePosts));

router.get("/freezedPosts",
    authentication(),
    allowTo(["User","Admin"]),
    asyncHandler(postService.freezedPosts));

router.patch("/likeAndUnlike/:postId",
        authentication(),
        allowTo(["User"]),
        validation(postValidation.likeAndUnlikeSchema),
        asyncHandler(postService.likeAndUnlike));

router.post("/react/:postId",
       authentication(),
       allowTo(["User"]),
       validation(postValidation.reactToPostSchema),
       asyncHandler(postService.reactToPost));

export default router;