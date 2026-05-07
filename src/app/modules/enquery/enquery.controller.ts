import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { EnqueryServices } from "./enquery.service";

const createEnquery = catchAsync(async (req, res) => {
  const {id:userId} = req.user as {id:string};

  const result = await EnqueryServices.createEnquery(
    userId,
    req.body,
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: "Enquiry created successfully",
    data: result,
  });
});


export const EnqueryControllers = {
    createEnquery,
}