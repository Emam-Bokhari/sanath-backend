import { FOLDER_NAMES } from "./../../../enums/files";
import express from "express";
import fileUploadHandler from "../../middlewares/fileUploaderHandler";
import parseAllFilesData from "../../middlewares/parseAllFileData";
import { UserControllers } from "./user.controller";
import { isAdmin, isAuthenticated } from "../../../helpers/authHelper";

const router = express.Router();

router
  .route("/profile")
  .get(isAuthenticated, UserControllers.getUserProfile)
  .delete(isAuthenticated, UserControllers.deleteProfile);

router
  .route("/")
  .post(UserControllers.createUser)
  .get(isAdmin, UserControllers.getAllUsers)
  .patch(
    isAuthenticated,
    fileUploadHandler(),
    parseAllFilesData({
      fieldName: FOLDER_NAMES.PROFILE_IMAGE,
      forceSingle: true,
    }),
    UserControllers.updateProfile,
  );

router.patch("/status/:id", isAdmin, UserControllers.updateUserStatusById);

router
  .route("/:id")
  .get(isAdmin, UserControllers.getUserById)
  .delete(isAdmin, UserControllers.deleteUserById);

export const UserRoutes = router;
