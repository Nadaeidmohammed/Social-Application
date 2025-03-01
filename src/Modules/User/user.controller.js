import { Router } from "express";
import * as userService from "./user.service.js"
import * as userValidation from "./user.validation.js"
import asyncHandler from "../../utils/error handling/asyncHandler.js";
import { authentication } from "../../middlewares/auth.middlewares.js";
import { validation } from "../../middlewares/validation.middleware.js";
import { fileValidation, upload } from "../../utils/file Uploading/fileUpload.js";
import { uploadCloud } from "../../utils/file Uploading/multerCloud.js";

const router=Router();


router.get("/getProfile",
    authentication(),
    asyncHandler(userService.getProfile));

router.get("/profile/:profileId",
validation(userValidation.shareProfileSchema),
authentication(),
asyncHandler(userService.shareProfile));

router.patch("/profile/updateEmail",
    validation(userValidation.updateEmailSchema),
    authentication(),
    asyncHandler(userService.updateEmail));

router.patch("/profile/reset_email",
    validation(userValidation.resetEmailSchema),
    authentication(),
    asyncHandler(userService.resetEmail));

router.patch("/update_password",
    validation(userValidation.updatePasswordSchema),
    authentication(),
    asyncHandler(userService.updatePassword));

router.patch("/update_profile",
     validation(userValidation.updateProfileSchema),
     authentication(),
     asyncHandler(userService.updateProfile));

router.post("/profilePicture",
    authentication(),
    upload(fileValidation.images,"upload/user").single("image"),
    asyncHandler(userService.uploadImageDisk)
)
router.post("/uploadOnCloud",
    authentication(),
    uploadCloud().single("image"),
    asyncHandler(userService.uploadImageOnCloud)
)

router.post("/multiplePicture",
    authentication(),
    upload(fileValidation.images,"upload/user").array("images",3),
    asyncHandler(userService.uploadMultipleImageDisk)
)
router.delete("/deleteProfilePicture",
    authentication(),
    asyncHandler(userService.deleteProfilePicture)
)

router.delete("/deleteImageOnCloud",
    authentication(),
    asyncHandler(userService.deleteImageOnCloud)
)
export default router;