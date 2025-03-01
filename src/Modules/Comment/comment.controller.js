import { Router } from "express";
import * as commentService from "./comment.service.js"
import * as commentValidation from "./comment.validation.js"
import asyncHandler from "../../utils/error handling/asyncHandler.js";
import { allowTo, authentication } from "../../middlewares/auth.middlewares.js";
import { validation } from "../../middlewares/validation.middleware.js";
import { uploadCloud } from "../../utils/file Uploading/multerCloud.js";

const router=Router({mergeParams:true});

// post/postId/comment
router.post("/",
    authentication(),
    allowTo(["User"]),
    uploadCloud().single("image"),
    validation(commentValidation.createCommentSchema),
    asyncHandler(commentService.createComment));

router.patch("/softDelet/:commentId",
    authentication(),
    allowTo(["User","Admin"]),
    validation(commentValidation.softDeleteCommentSchema),
    asyncHandler(commentService.softDeleteComment));

router.get("/",
    authentication(),
    allowTo(["User","Admin"]),
    validation(commentValidation.getAllCommentsSchema),
    asyncHandler(commentService.getAllComments));

router.patch("/likeAndUnlike/:commentId",
        authentication(),
        allowTo(["User"]),
        validation(commentValidation.likeAndUnlikeCommentSchema),
        asyncHandler(commentService.likeAndUnlikeComment));

router.route("/:commentId")
    .patch(
    authentication(),
    allowTo(["User"]),
    uploadCloud().single("image"),
    validation(commentValidation.updateCommentSchema),
    asyncHandler(commentService.updateComment)
    )
    .post(
    authentication(),
    allowTo(["User"]),
    uploadCloud().single("image"),
    validation(commentValidation.addReplySchema),
    asyncHandler(commentService.addReply)
    )
    .delete(
    authentication(),
    allowTo(["User","Admin"]),
    validation(commentValidation.hardDeleteCommentSchema),
     asyncHandler(commentService.hardDeleteComment)
);
        
    


export default router;