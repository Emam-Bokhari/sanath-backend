import { Listing } from "../listing/listing.model";
import { FavoriteProperty } from "../favoriteProperty/favoriteProperty.model";
import { LISTING_STATUS } from "../listing/listing.constant";
import { Types } from "mongoose";
import { User } from "../user/user.model";
import { STATUS, USER_ROLES } from "../../../enums/user";
import { Enquery } from "../enquery/enquery.model";
import { Subscription } from "../subscription/subscription.model";
import { Plan } from "../plan/plan.model";
import { PLAN_STATUS, PLAN_TIER } from "../plan/plan.constant";

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
  });

  console.log(totalSaved, "totalSaved");

  return {
    totalListings,
    activeListings,
    totalSaved,
  };
};

const getAdminStatsFromDB = async () => {
  const [
    totalAdmins,
    totalSuperAdmins,
    totalActiveAdmins,
    totalInactiveAdmins,
  ] = await Promise.all([
    User.countDocuments({ role: USER_ROLES.ADMIN, verified: true }),

    /*
    
    */

    User.countDocuments({ role: USER_ROLES.SUPER_ADMIN, verified: true }),
    User.countDocuments({
      role: USER_ROLES.ADMIN,
      status: STATUS.ACTIVE,
      verified: true,
    }),
    User.countDocuments({
      role: USER_ROLES.ADMIN,
      status: STATUS.INACTIVE,
      verified: true,
    }),
  ]);

  return {
    totalAdmins,
    totalSuperAdmins,
    totalActiveAdmins,
    totalInactiveAdmins,
  };
};

const getAgentEnquiryStatsFromDB = async (agentId: string, year?: string) => {
  const agentObjectId = new Types.ObjectId(agentId);
  const targetYear = year ? parseInt(year) : new Date().getFullYear();

  // First, get all listing IDs of this agent
  const agentListings = await Listing.find({
    agentId: agentObjectId,
    isDeleted: false,
  }).select("_id");

  const listingIds = agentListings.map((listing) => listing._id);

  const startOfYear = new Date(targetYear, 0, 1);
  const endOfYear = new Date(targetYear, 11, 31, 23, 59, 59, 999);

  const enqueryStats = await Enquery.aggregate([
    {
      $match: {
        listingId: { $in: listingIds },
        createdAt: { $gte: startOfYear, $lte: endOfYear },
      },
    },
    {
      $group: {
        _id: { $month: "$createdAt" },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const formattedStats = monthNames.map((month, index) => {
    const monthData = enqueryStats.find((stat) => stat._id === index + 1);
    return {
      month,
      totalEnquiries: monthData ? monthData.count : 0,
    };
  });

  return formattedStats;
};

const getUserManagementStatsFromDB = async (role: string) => {
  if (role === USER_ROLES.USER) {
    const [totalUsers, activeUsers, totalEnquiries, totalSavedProperty] =
      await Promise.all([
        User.countDocuments({
          role: USER_ROLES.USER,
          isDeleted: { $ne: true },
          verified: true,
        }),
        User.countDocuments({
          role: USER_ROLES.USER,
          status: STATUS.ACTIVE,
          isDeleted: { $ne: true },
          verified: true,
        }),
        Enquery.countDocuments({}),
        FavoriteProperty.countDocuments({}),
      ]);

    return {
      totalUsers,
      activeUsers,
      totalEnquiries,
      totalSavedProperty,
    };
  } else if (role === USER_ROLES.AGENT) {
    const [totalAgents, activeAgents, inactiveAgents, revenueData] =
      await Promise.all([
        User.countDocuments({
          role: USER_ROLES.AGENT,
          isDeleted: { $ne: true },
          verified: true,
        }),
        User.countDocuments({
          role: USER_ROLES.AGENT,
          status: STATUS.ACTIVE,
          isDeleted: { $ne: true },
          verified: true,
        }),
        User.countDocuments({
          role: USER_ROLES.AGENT,
          status: STATUS.INACTIVE,
          isDeleted: { $ne: true },
          verified: true,
        }),
        Subscription.aggregate([
          { $group: { _id: null, total: { $sum: "$amountPaid" } } },
        ]),
      ]);

    return {
      totalAgents,
      activeAgents,
      inactiveAgents,
      totalRevenue: revenueData.length > 0 ? revenueData[0].total : 0,
    };
  }
};

const getRevenueStatsFromDB = async () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  );

  const [totalRevenueData, monthlyRevenueData, totalTransactions] =
    await Promise.all([
      // Total Revenue
      Subscription.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: "$amountPaid" },
          },
        },
      ]),
      // Total Revenue This Month
      Subscription.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startOfMonth,
              $lte: endOfMonth,
            },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amountPaid" },
          },
        },
      ]),
      // Total Transactions
      Subscription.countDocuments({}),
    ]);

  return {
    totalRevenue: totalRevenueData.length > 0 ? totalRevenueData[0].total : 0,
    totalRevenueThisMonth:
      monthlyRevenueData.length > 0 ? monthlyRevenueData[0].total : 0,
    totalTransactions,
  };
};

const getMonthlyRevenueStatsFromDB = async (year?: string) => {
  const targetYear = year ? parseInt(year) : new Date().getFullYear();
  const startOfYear = new Date(targetYear, 0, 1);
  const endOfYear = new Date(targetYear, 11, 31, 23, 59, 59, 999);

  const revenueStats = await Subscription.aggregate([
    {
      $match: {
        createdAt: { $gte: startOfYear, $lte: endOfYear },
      },
    },
    {
      $group: {
        _id: { $month: "$createdAt" },
        totalRevenue: { $sum: "$amountPaid" },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const formattedStats = monthNames.map((month, index) => {
    const monthData = revenueStats.find((stat) => stat._id === index + 1);
    return {
      month,
      totalRevenue: monthData ? monthData.totalRevenue : 0,
    };
  });

  return formattedStats;
};

const getMonthlyUserStatsFromDB = async (year?: string) => {
  const targetYear = year ? parseInt(year) : new Date().getFullYear();
  const startOfYear = new Date(targetYear, 0, 1);
  const endOfYear = new Date(targetYear, 11, 31, 23, 59, 59, 999);

  const userStats = await User.aggregate([
    {
      $match: {
        role: USER_ROLES.USER,
        isDeleted: { $ne: true },
        verified: true,
        createdAt: { $gte: startOfYear, $lte: endOfYear },
      },
    },
    {
      $group: {
        _id: { $month: "$createdAt" },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return monthNames.map((month, index) => {
    const monthData = userStats.find((stat) => stat._id === index + 1);
    return {
      month,
      totalUsers: monthData ? monthData.count : 0,
    };
  });
};

const getMonthlyAgentStatsFromDB = async (year?: string) => {
  const targetYear = year ? parseInt(year) : new Date().getFullYear();
  const startOfYear = new Date(targetYear, 0, 1);
  const endOfYear = new Date(targetYear, 11, 31, 23, 59, 59, 999);

  const agentStats = await User.aggregate([
    {
      $match: {
        role: USER_ROLES.AGENT,
        isDeleted: { $ne: true },
        verified: true,
        createdAt: { $gte: startOfYear, $lte: endOfYear },
      },
    },
    {
      $group: {
        _id: { $month: "$createdAt" },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return monthNames.map((month, index) => {
    const monthData = agentStats.find((stat) => stat._id === index + 1);
    return {
      month,
      totalAgents: monthData ? monthData.count : 0,
    };
  });
};

const getOverviewStatsFromDB = async () => {
  const [totalUsers, totalAgents, totalRevenueData] = await Promise.all([
    User.countDocuments({
      role: USER_ROLES.USER,
      isDeleted: { $ne: true },
      verified: true,
    }),
    User.countDocuments({
      role: USER_ROLES.AGENT,
      isDeleted: { $ne: true },
      verified: true,
    }),
    Subscription.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$amountPaid" },
        },
      },
    ]),
  ]);

  return {
    totalUsers,
    totalAgents,
    totalRevenue: totalRevenueData.length > 0 ? totalRevenueData[0].total : 0,
  };
};

const getPlanStatsFromDB = async () => {
  const [totalPlans, activePlans, trialPlans, premiumAndProfessionalPlans] =
    await Promise.all([
      Plan.countDocuments({ isDeleted: false }),
      Plan.countDocuments({ status: PLAN_STATUS.ACTIVE, isDeleted: false }),
      Plan.countDocuments({ tier: PLAN_TIER.TRIAL, isDeleted: false }),
      Plan.countDocuments({
        tier: { $in: [PLAN_TIER.PREMIUM, PLAN_TIER.PROFESSIONAL] },
        isDeleted: false,
      }),
    ]);

  return {
    totalPlans,
    activePlans,
    trialPlans,
    premiumAndProfessionalPlans,
  };
};

export const AnalyticsServices = {
  getAgentDashboardStats,
  getAdminStatsFromDB,
  getAgentEnquiryStatsFromDB,
  getUserManagementStatsFromDB,
  getRevenueStatsFromDB,
  getMonthlyRevenueStatsFromDB,
  getMonthlyUserStatsFromDB,
  getMonthlyAgentStatsFromDB,
  getOverviewStatsFromDB,
  getPlanStatsFromDB,
};