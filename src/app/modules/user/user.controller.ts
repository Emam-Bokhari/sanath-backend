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

const getAllUsers = catchAsync(async (req, res) => {
  const result = await UserServices.getAllUsersFromDB(req.query);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Successfully retrieved are users data",
    data: result.data,
    meta: result.meta,
  });
});

const getUserById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await UserServices.getUserByIdFromDB(id);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Successfully retrieve user by ID",
    data: result,
  });
});

const updateUserStatusById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const { status } = req.body;

  const result = await UserServices.updateUserStatusByIdToDB(id, status);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Status updated successfully",
    data: result,
  });
});



const deleteUserById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await UserServices.deleteUserByIdFromD(id);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "User is deleted successfully",
    data: result,
  });
});

const deleteProfile = catchAsync(async (req, res) => {
  const { id }: any = req.user;
  // console.log(id, "ID");
  const { password } = req.body;

  const result = await UserServices.deleteProfileFromDB(id, password);

  sendResponse(res, {
    success: true,
    statusCode:200,
    message: "Profile deleted successfully",
    data: result,
  });
});

export const UserControllers={
  createUser,
  getUserProfile,
  updateProfile,
  getAllUsers,
  getUserById,
  updateUserStatusById,
  deleteUserById,
  deleteProfile,
}