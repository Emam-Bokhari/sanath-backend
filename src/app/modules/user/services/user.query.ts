import { JwtPayload } from "jsonwebtoken";
import { User } from "../user.model";
import { StatusCodes } from "http-status-codes";
import ApiError from "../../../../errors/ApiErrors";
import { STATUS, USER_ROLES } from "../../../../enums/user";
import QueryBuilder from "../../../builder/queryBuilder";
import { IUser } from "../user.interface";
import { FavoriteProperty } from "../../favoriteProperty/favoriteProperty.model";
import { SavedSearch } from "../../savedSearch/savedSearch.model";
import { Enquery } from "../../enquery/enquery.model";
import { Listing } from "../../listing/listing.model";
import { Subscription } from "../../subscription/subscription.model";
import { Types } from "mongoose";
import { Plan } from "../../plan/plan.model";
import { PLAN_TIER } from "../../plan/plan.constant";

const getUserProfileFromDB = async (user: JwtPayload): Promise<any> => {
  const { id } = user;

  const result: any = await User.findById(id).populate("plan");
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  return result;
};

const getAllUsersFromDB = async (query: any) => {
  const { role = USER_ROLES.USER, plan, status, ...remainingQuery } = query;

  // Base user filter
  const filter: Record<string, any> = {
    role,
    verified: true,
  };

  // Add status filter if provided
  if (status) {
    filter.status = status;
  }

  // Add plan tier filter if provided
  if (plan && Object.values(PLAN_TIER).includes(plan as any)) {
    const planDoc = await Plan.findOne({ tier: plan, isDeleted: false });
    if (planDoc) {
      filter.plan = planDoc._id;
    } else {
      // If plan tier requested but not found, ensure no users are returned
      filter.plan = new Types.ObjectId();
    }
  }

  const baseQuery = User.find(filter);

  const searchableFields =
    role === USER_ROLES.AGENT
      ? ["name", "email", "location.address", "agencyName"]
      : ["name", "email"];

  const queryBuilder = new QueryBuilder<IUser>(baseQuery, remainingQuery)
    .search(searchableFields)
    .sort()
    .fields()
    .filter()
    .paginate();

  // Fetch paginated users
  let users: any[] = await queryBuilder.modelQuery.populate("plan").lean();
  const meta = await queryBuilder.countTotal();

  if (!users || users.length === 0) {
    throw new ApiError(404, "No users are found in the database");
  }

  const userIds = users.map((user) => user._id);

  if (role === USER_ROLES.USER) {
    // Fetch counts for USER
    const [savedPropertyCounts, savedSearchCounts, enqueryCounts] =
      await Promise.all([
        FavoriteProperty.aggregate([
          { $match: { userId: { $in: userIds } } },
          { $group: { _id: "$userId", count: { $sum: 1 } } },
        ]),
        SavedSearch.aggregate([
          { $match: { userId: { $in: userIds } } },
          { $group: { _id: "$userId", count: { $sum: 1 } } },
        ]),
        Enquery.aggregate([
          { $match: { userId: { $in: userIds } } },
          { $group: { _id: "$userId", count: { $sum: 1 } } },
        ]),
      ]);

    // Map counts back to users
    users = users.map((user) => {
      const savedProperty = savedPropertyCounts.find(
        (c) => c._id.toString() === user._id.toString(),
      );
      const savedSearch = savedSearchCounts.find(
        (c) => c._id.toString() === user._id.toString(),
      );
      const enquery = enqueryCounts.find(
        (c) => c._id.toString() === user._id.toString(),
      );

      return {
        ...user,
        savedPropertyCount: savedProperty ? savedProperty.count : 0,
        savedSearchCount: savedSearch ? savedSearch.count : 0,
        enqueryCount: enquery ? enquery.count : 0,
      };
    });
  } else if (role === USER_ROLES.AGENT) {
    // Fetch data for AGENT
    const [listingCounts, revenues] = await Promise.all([
      Listing.aggregate([
        { $match: { agentId: { $in: userIds } } },
        { $group: { _id: "$agentId", count: { $sum: 1 } } },
      ]),
      Subscription.aggregate([
        { $match: { userId: { $in: userIds } } },
        { $group: { _id: "$userId", totalRevenue: { $sum: "$amountPaid" } } },
      ]),
    ]);

    // Map data back to users
    users = users.map((user) => {
      const listing = listingCounts.find(
        (c) => c._id.toString() === user._id.toString(),
      );
      const revenue = revenues.find(
        (c) => c._id.toString() === user._id.toString(),
      );

      return {
        ...user,
        totalListings: listing ? listing.count : 0,
        revenue: revenue ? revenue.totalRevenue : 0,
        currentPlan: (user.plan as any)?.title || "N/A",
      };
    });
  }

  return {
    data: users,
    meta,
  };
};

const getUserByIdFromDB = async (id: string) => {
  const result = await User.findOne({
    _id: id,
    role: USER_ROLES.USER,
  });

  if (!result)
    throw new ApiError(404, "No user is found in the database by this ID");

  return result;
};

const getAdminFromDB = async (query: any) => {
  const baseQuery = User.find({
    role: { $in: [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN] },
    // status: STATUS.ACTIVE,
    verified: true,
  }).select(
    "name email role profileImage createdAt updatedAt status lastLoginAt",
  );

  const queryBuilder = new QueryBuilder<IUser>(baseQuery, query)
    .search(["name", "email"])
    .sort()
    .fields()
    .paginate();

  const admins = await queryBuilder.modelQuery;

  const meta = await queryBuilder.countTotal();

  return {
    data: admins,
    meta,
  };
};

export const UserQueries = {
  getUserProfileFromDB,
  getAllUsersFromDB,
  getUserByIdFromDB,
  getAdminFromDB,
};
