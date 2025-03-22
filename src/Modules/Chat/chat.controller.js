import { Router } from "express";
import * as chatService from "./chat.service.js"
import * as chatValidation from "./chat.validation.js"
import asyncHandler from "../../utils/error handling/asyncHandler.js";
import { authentication } from "../../middlewares/auth.middlewares.js";
import { validation } from "../../middlewares/validation.middleware.js";


const router=Router();


router.get("/:friendId",
    authentication(),
    validation(chatValidation.getChatSchema),
    asyncHandler(chatService.getChat));
router.post("/message/:friendId",
    authentication(),
    validation(chatValidation.sendMessageSchema),
    asyncHandler(chatService.sendMessage));

export default router;