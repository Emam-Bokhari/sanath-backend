import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { UserServices } from "./user.service";

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

export const UserControllers={
  createUser,
}