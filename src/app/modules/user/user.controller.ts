import { JwtPayload } from "jsonwebtoken";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { UserServices } from "./user.service";
import bcrypt from "bcrypt";
import config from "../../../config";

const createUser = catchAsync(
  async (req, res) => {
    const { ...userData } = req.body;

    const result = await UserServices.createUserToDB(userData);

    sendResponse(res, {
      success: true,
      statusCode:200,
      message:
        "Your account has been successfully created. Verify Your Email By OTP. Check your email",
      data: result,
    });
  },
);

const getUserProfile = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await UserServices.getUserProfileFromDB(user as JwtPayload);

  sendResponse(res, {
    success: true,
    statusCode:200,
    message: "Profile data retrieved successfully",
    data: result,
  });
});

//update profile
const updateProfile = catchAsync(async (req, res) => {
  const user: any = req.user;
  if ("role" in req.body) {
    delete req.body.role;
  }
  if ("phone" in req.body) {
    delete req.body.phone;
  }
  // If password is provided
  if (req.body.password) {
    req.body.password = await bcrypt.hash(
      req.body.password,
      Number(config.bcrypt_salt_rounds),
    );
  }

  const result = await UserServices.updateProfileToDB(user, req.body);

  sendResponse(res, {
    success: true,
    statusCode:200,
    message: "Profile updated successfully",
    data: result,
  });
});

export const UserControllers={
  createUser,
  getUserProfile,
  updateProfile,
}