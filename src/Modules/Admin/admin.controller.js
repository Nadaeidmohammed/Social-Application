import { Router } from "express";
import * as adminService from "./admin.service.js"
import * as adminValidation from "./admin.validation.js"
import asyncHandler from "../../utils/error handling/asyncHandler.js";
import { allowTo, authentication } from "../../middlewares/auth.middlewares.js";
import { validation } from "../../middlewares/validation.middleware.js";
import { uploadCloud } from "../../utils/file Uploading/multerCloud.js";
import { changeRole } from "./admin.middleware.js";

const router=Router();

router.get("/",
    authentication(),
    allowTo(["Admin"]),
    asyncHandler(adminService.getAllUsersAndPosts));

router.patch("/changeRole",
authentication(),
validation(adminValidation.changeRoleShema),
changeRole,
asyncHandler(adminService.changeRole));


export default router;