import { Listing } from "../listing/listing.model";
import { FavoriteProperty } from "../favoriteProperty/favoriteProperty.model";
import { LISTING_STATUS } from "../listing/listing.constant";
import { Types } from "mongoose";
import { User } from "../user/user.model";
import { STATUS, USER_ROLES } from "../../../enums/user";

const getAgentDashboardStats = async (agentId: string) => {
  const agentObjectId = new Types.ObjectId(agentId);

  // total listings for this agent
  const totalListings = await Listing.countDocuments({
    agentId: agentObjectId,
    isDeleted: false,
  });

  // active (Published) listings for this agent
  const activeListings = await Listing.countDocuments({
    agentId: agentObjectId,
    status: LISTING_STATUS.PUBLISHED,
    isDeleted: false,
  });

  // total saved count for this agent's listings
  // First, get all listing IDs of this agent
  const agentListings = await Listing.find({
    agentId: agentObjectId,
    isDeleted: false,
  }).select("_id");

  const listingIds = agentListings.map((listing) => listing._id);

  const totalSaved = await FavoriteProperty.countDocuments({
    listingId: { $in: listingIds },
    userId: agentObjectId,
  });

  return {
    totalListings,
    activeListings,
    totalSaved,
  };
};

const getAdminStatsFromDB=async()=>{
  const [totalAdmins,totalSuperAdmins,totalActiveAdmins]=await Promise.all([
    User.countDocuments({ role: USER_ROLES.ADMIN,verified:true }),
    User.countDocuments({ role: USER_ROLES.SUPER_ADMIN,verified:true }),
    User.countDocuments({ role: USER_ROLES.ADMIN, status: STATUS.ACTIVE,verified:true }),
  ])

  return {
    totalAdmins,
    totalSuperAdmins,
    totalActiveAdmins,
  }
}

export const AnalyticsServices = {
  getAgentDashboardStats,
  getAdminStatsFromDB,
};
