import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { SavedSearchService } from "./savedSearch.service";

const toggleSavedSearch = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.user as { id: string };
  const params = req.body;

  const result = await SavedSearchService.toggleSavedSearchService({
    userId: userId as any,
    params,
  });

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: result.message,
    data: result,
  });
});

const getMySavedSearches = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.user as { id: string };
  const result = await SavedSearchService.getMySavedSearchesService(userId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Saved searches retrieved successfully",
    data: result,
  });
});

const deleteSavedSearch = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.user as { id: string };
  const { savedSearchId } = req.params;
  console.log(savedSearchId, userId);
  const result = await SavedSearchService.deleteSavedSearchService(
    savedSearchId,
    userId,
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Saved search deleted successfully",
    data: result,
  });
});

export const SavedSearchController = {
  toggleSavedSearch,
  getMySavedSearches,
  deleteSavedSearch,
};
