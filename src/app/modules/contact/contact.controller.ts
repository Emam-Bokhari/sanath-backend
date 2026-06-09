import ApiError from "../../../errors/ApiErrors";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { contactServices } from "./contact.service";

const submitContactRequest = catchAsync(async (req, res) => {
  const contactData = req.body;

  const result = await contactServices.contact(contactData);

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