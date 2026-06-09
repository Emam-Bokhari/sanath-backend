import ApiError from "../../../errors/ApiErrors";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { contactServices } from "./contact.service";

const submitContactRequest = catchAsync(async (req, res) => {
  const supportData = req.body;

  if (!req.user) {
    throw new ApiError(401, "User not authenticated");
  }

  const { id } = req.user as any;

  const result = await contactServices.contact(id, supportData);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Contact request submitted successfully and email sent to admin.",
    data: result,
  });
});

export const contactControllers = {
  submitContactRequest,
};