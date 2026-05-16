import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { EnqueryServices } from "./enquery.service";

const createEnquery = catchAsync(async (req, res) => {
  const { id: userId } = req.user as { id: string };

  const result = await EnqueryServices.createEnquery(userId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: "Enquiry created successfully",
    data: result,
  });
});

const getAllEnqueries = catchAsync(async (req, res) => {
  const { id: agentId } = req.user as { id: string };
  const query = req.query;

  const result = await EnqueryServices.getAllEnqueriesFromDB(agentId, query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Enquiries retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getEnqueryById = catchAsync(async (req, res) => {
  const { id: agentId } = req.user as { id: string };
  const { enqueryId } = req.params;

  const result = await EnqueryServices.getEnqueryByIdFromDB(agentId, enqueryId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Enquiry retrieved successfully",
    data: result,
  });
});

const getMyEnqueries = catchAsync(async (req, res) => {
  const { id: userId } = req.user as { id: string };
  const query = req.query;

  const result = await EnqueryServices.getMyEnqueriesFromDB(userId, query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "My enquiries retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getMyEnqueryById = catchAsync(async (req, res) => {
  const { id: userId } = req.user as { id: string };
  const { enqueryId } = req.params;

  const result = await EnqueryServices.getMyEnqueryByIdFromDB(userId, enqueryId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Enquiry retrieved successfully",
    data: result,
  });
});

const updateEnqueryStatus = catchAsync(async (req, res) => {
  const { id: agentId } = req.user as { id: string };
  const { enqueryId } = req.params;
  const { status } = req.body;

  const result = await EnqueryServices.updateEnqueryStatus(
    enqueryId,
    agentId,
    status,
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Enquiry status updated successfully",
    data: result,
  });
});



export const EnqueryControllers = {
  createEnquery,
  getAllEnqueries,
  getEnqueryById,
  getMyEnqueries,
  getMyEnqueryById,
  updateEnqueryStatus,
};
