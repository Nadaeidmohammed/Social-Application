import joi from "joi";
import { generalField } from "../../middlewares/validation.middleware.js";


export const createCommentSchema=joi.object({
    postId:generalField.id.required(),
    text:joi.string().min(2).max(5000),
    file:joi.object(generalField.fileObject)
}).or("text","file")

export const updateCommentSchema=joi.object({
    commentId:generalField.id.required(),
    text:joi.string().min(2).max(5000),
    file:joi.object(generalField.fileObject)
}).or("text","file")

export const softDeleteCommentSchema=joi.object({
    commentId:generalField.id.required(),
}).required()

export const getAllCommentsSchema=joi.object({
    postId:generalField.id.required(),
}).required()

export const likeAndUnlikeCommentSchema=joi.object({
    commentId:generalField.id.required(),
}).required()

export const addReplySchema=joi.object({
    postId:generalField.id.required(),
    commentId:generalField.id.required(),
    text:joi.string().min(2).max(5000),
    file:joi.object(generalField.fileObject)
}).or("text","file")

export const hardDeleteCommentSchema=joi.object({
    commentId:generalField.id.required(),
}).required()
