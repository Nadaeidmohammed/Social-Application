import joi from "joi";
import { generalField } from "../../middlewares/validation.middleware.js";
import { roleType } from "../../DB/Models/user.model.js";

export const changeRoleShema=joi.object({
userId:generalField.id.required(),
role:joi.string().valid(...Object.values(roleType)).required(),
}).required();