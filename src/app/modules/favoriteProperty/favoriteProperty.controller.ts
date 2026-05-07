import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { FavoritePropertyServices } from "./favoriteProperty.service";


const toggleFavoriteProperty = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;

    const result =
      await FavoritePropertyServices.toggleFavoriteProperty({
        userId: user.id,
        listingId: req.body.listingId,
      });

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: result.message,
      data: result,
    });
  },
);


const checkFavoritePropertyStatus = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;

    const result =
      await FavoritePropertyServices.checkFavoritePropertyStatus(
        user.id,
        req.params.listingId,
      );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Favorite status retrieved successfully",
      data: result,
    });
  },
);


const getFavoriteProperties = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;

    const result =
      await FavoritePropertyServices.getFavoriteProperties(
        user.id,
      );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Favorite properties retrieved successfully",
      data: result,
    });
  },
);

const getFavoritePropertyById = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;

    const result =
      await FavoritePropertyServices.getFavoritePropertyByIdFromDB(
        user.id,
        req.params.favoriteId,
      );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Favorite property retrieved successfully",
      data: result,
    });
  },
);

const deleteFavoriteProperty = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;

    const result =
      await FavoritePropertyServices.deleteFavoriteProperty(
        user.id,
        req.params.listingId,
      );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: result.message,
      data: result,
    });
  },
);

export const FavoritePropertyControllers = {
  toggleFavoriteProperty,
  checkFavoritePropertyStatus,
  getFavoriteProperties,
  getFavoritePropertyById,
  deleteFavoriteProperty,
};