import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import { User } from "../user/user.model";
import { Listing } from "../listing/listing.model";
import { Types } from "mongoose";
import { Enquery } from "./enquery.model";
import { ISendEmail } from "../../../types/email";
import config from "../../../config";
import { emailHelper } from "../../../helpers/emailHelper";
import QueryBuilder from "../../builder/queryBuilder";
import { ENQUERY_STATUS } from "./enquery.constant";
import { sendNotifications } from "../../../helpers/notificationsHelper";
import {
  NOTIFICATION_REFERENCE_MODEL,
  NOTIFICATION_TYPE,
} from "../notification/notification.constant";

const PRIMARY_COLOR = "#22143b";
const TEXT_COLOR = "#ffffff";

const createEnquery = async (userId: string, payload: any) => {
  const user = await User.findById(userId).select("name email");

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }

  let agentEmail: string | null = null;
  let agentName: string | null = null;
  let listingTitle: string | null = null;
  let agentId: string | null = null;

  if (payload.listingId) {
    const listing = await Listing.findById(payload.listingId)
      .select("agentId title")
      .lean();

    if (!listing) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Listing not found");
    }

    listingTitle = listing.title;
    agentId = listing.agentId.toString();

    const agent = await User.findById(listing.agentId).select("name email");

    if (agent) {
      agentEmail = agent.email;
      agentName = agent.name;
    }
  }

  const enquery = await Enquery.create({
    ...payload,
    userId: new Types.ObjectId(userId),
    name: user.name,
    email: user.email,
  });

  // Update listing leads and leadsCount
  if (payload.listingId) {
    await Listing.findByIdAndUpdate(payload.listingId, {
      $push: { leads: enquery._id },
      $inc: { leadsCount: 1 },
    });
  }

  // Send Push & Email Notification to Agent
  if (agentId) {
    await sendNotifications({
      receiver: agentId,
      title: "New Property Enquiry",
      text: `You have received a new enquiry for "${listingTitle || "your property"}".`,
      type: NOTIFICATION_TYPE.AGENT,
      referenceId: enquery._id.toString(),
      referenceModel: NOTIFICATION_REFERENCE_MODEL.ENQUERY,
      event: "enquiryCreated",
      subject: `New Property Enquiry - ${listingTitle || "General"}`,
      html: `
<body style="margin:0;padding:0;background:#ffffff;font-family:Arial;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
      <td align="center">

        <table width="100%" cellpadding="0" cellspacing="0"
          style="max-width:600px;background:#ffffff;border-radius:12px;
          box-shadow:0 8px 24px rgba(0,0,0,0.06);overflow:hidden;">

          <!-- HEADER -->
          <tr>
            <td align="center"
              style="padding:30px 20px;background:${PRIMARY_COLOR};color:${TEXT_COLOR};">
              <h1 style="margin:0;font-size:22px;">
                Property Enquiry
              </h1>
              <p style="margin:5px 0 0;font-size:13px;opacity:0.9;">
                New enquiry received
              </p>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:35px 30px;font-size:15px;color:#333;line-height:1.6;">
              <p style="font-size:18px;font-weight:bold;margin-top:0;">
                Hello ${agentName || "Agent"},
              </p>
              <p>You have received a new property enquiry. Here are the details:</p>

              <p><b>Listing:</b> ${listingTitle || "N/A"}</p>

              <p><b>User:</b> ${user.name}</p>
              <p><b>Email:</b> ${user.email}</p>

              ${agentName
        ? `<p><b>Agent:</b> ${agentName} (${agentEmail})</p>`
        : ""
      }

              <p><b>Phone:</b> ${payload.phone}</p>
              <p><b>Country:</b> ${payload.country}</p>
              <p><b>Postal Code:</b> ${payload.postalCode}</p>

              <div style="margin-top:25px;">
                <p style="font-weight:bold;">Message:</p>
                <div style="
                  background:#f8f8f8;
                  padding:15px;
                  border-left:4px solid ${PRIMARY_COLOR};
                  border-radius:5px;">
                  ${payload.message}
                </div>
              </div>

              <div style="margin-top:30px;text-align:center;">
                <a href="mailto:${user.email}"
                  style="
                    background:${PRIMARY_COLOR};
                    color:${TEXT_COLOR};
                    padding:12px 20px;
                    border-radius:6px;
                    text-decoration:none;
                    font-weight:bold;">
                  Reply User
                </a>
              </div>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td align="center"
              style="padding:20px;font-size:12px;color:#888;background:#f7f7f7;">
              © ${new Date().getFullYear()} Your Platform
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
`,
    });
  }

  return enquery;
};

const getAllEnqueriesFromDB = async (
  agentId: string,
  query: Record<string, unknown>,
) => {
  const user = await User.findById(agentId).populate("plan");
  const plan = user?.plan as any;

  if (!plan?.features?.leadAccess) {
    return {
      data: [],
      meta: {
        page: Number(query.page) || 1,
        limit: Number(query.limit) || 10,
        total: 0,
        totalPage: 0,
      },
      stats: {
        total: 0,
        enquired: 0,
        contacted: 0,
      },
    };
  }

  const listings = await Listing.find({
    agentId: new Types.ObjectId(agentId),
    isDeleted: { $ne: true },
  }).select("_id");

  const listingIds = listings.map((l) => l._id);

  const filter: Record<string, any> = {
    listingId: { $in: listingIds },
  };

  if (query.status) {
    filter.status = query.status;
  }

  const baseQuery = Enquery.find(filter)
    .populate({
      path: "listingId",
      populate: {
        path: "agentId",
      },
    })
    .populate("userId");

  const enqueryQuery = new QueryBuilder(baseQuery, query)
    .search(["name", "email", "phone", "message", "postalCode", "country"])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await enqueryQuery.modelQuery;
  const meta = await enqueryQuery.countTotal();

  const [total, enquired, contacted] = await Promise.all([
    Enquery.countDocuments({ listingId: { $in: listingIds } }),
    Enquery.countDocuments({
      listingId: { $in: listingIds },
      status: ENQUERY_STATUS.ENQUIRED,
    }),
    Enquery.countDocuments({
      listingId: { $in: listingIds },
      status: ENQUERY_STATUS.CONTACTED,
    }),
  ]);

  return {
    data: result,
    meta,
    stats: {
      total,
      enquired,
      contacted,
    },
  };
};

const getEnqueryByIdFromDB = async (agentId: string, enqueryId: string) => {
  const user = await User.findById(agentId).populate("plan");
  const plan = user?.plan as any;

  if (!plan?.features?.leadAccess) {
    return {} as any;
  }

  const enquery = await Enquery.findById(enqueryId)
    .populate({
      path: "listingId",
      populate: {
        path: "agentId",
      },
    })
    .populate("userId")
    .lean();

  if (!enquery) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Enquiry not found");
  }

  const listing = await Listing.findOne({
    _id: enquery.listingId,
    agentId: new Types.ObjectId(agentId),
    isDeleted: { $ne: true },
  })
    .select("_id")
    .lean();

  if (!listing) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "You are not allowed to access this enquiry",
    );
  }

  return enquery;
};

const getMyEnqueriesFromDB = async (
  userId: string,
  query: Record<string, unknown>,
) => {
  const baseQuery = Enquery.find({
    userId: new Types.ObjectId(userId),
  }).populate({ path: "listingId", populate: "agentId" });

  const enqueryQuery = new QueryBuilder(baseQuery, query)
    .search(["name", "email", "phone", "message", "postalCode", "country"])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await enqueryQuery.modelQuery;
  const meta = await enqueryQuery.countTotal();

  const [total, enquired, contacted] = await Promise.all([
    Enquery.countDocuments({ userId: new Types.ObjectId(userId) }),
    Enquery.countDocuments({
      userId: new Types.ObjectId(userId),
      status: ENQUERY_STATUS.ENQUIRED,
    }),
    Enquery.countDocuments({
      userId: new Types.ObjectId(userId),
      status: ENQUERY_STATUS.CONTACTED,
    }),
  ]);

  return {
    data: result,
    meta,
    stats: {
      total,
      enquired,
      contacted,
    },
  };
};

const getMyEnqueryByIdFromDB = async (userId: string, enqueryId: string) => {
  const enquery = await Enquery.findOne({
    _id: new Types.ObjectId(enqueryId),
    userId: new Types.ObjectId(userId),
  })
    .populate({ path: "listingId", populate: "agentId" })
    .lean();

  if (!enquery) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Enquiry not found");
  }

  return enquery;
};

const updateEnqueryStatus = async (
  enqueryId: string,
  agentId: string,
  status: ENQUERY_STATUS,
) => {
  const user = await User.findById(agentId).populate("plan");
  const plan = user?.plan as any;

  if (!plan?.features?.leadAccess) {
    return {} as any;
  }

  const enquery = await Enquery.findById(enqueryId)
    .populate("listingId userId")
    .lean();

  if (!enquery) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Enquiry not found");
  }

  const listing = await Listing.findOne({
    _id: enquery.listingId,
    agentId: new Types.ObjectId(agentId),
    isDeleted: { $ne: true },
  })
    .select("_id")
    .lean();

  if (!listing) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "You are not allowed to update this enquiry",
    );
  }

  const updatedEnqueryStatus = await Enquery.findByIdAndUpdate(
    enqueryId,
    { status },
    { new: true },
  );

  // Send notification to User when status changes to CONTACTED
  if (status === ENQUERY_STATUS.CONTACTED && enquery.userId) {
    await sendNotifications({
      receiver:
        (enquery.userId as any)._id?.toString() || enquery.userId.toString(),
      title: "Enquiry Update",
      text: `The agent has contacted you regarding your enquiry for "${(enquery.listingId as any).title || "the property"
        }".`,
      type: NOTIFICATION_TYPE.USER,
      referenceId: enquery._id.toString(),
      referenceModel: NOTIFICATION_REFERENCE_MODEL.ENQUERY,
      event: "enquiryReplied",
    });
  }

  return updatedEnqueryStatus;
};

const getAllEnqueriesForAdminFromDB = async (
  query: Record<string, unknown>,
) => {
  const baseQuery = Enquery.find().populate([
    {
      path: "listingId",
      populate: {
        path: "agentId",
        select: "name email phone profileImage agencyName agencyLogo",
      },
    },
    {
      path: "userId",
      select: "name email phone profileImage",
    },
  ]);

  const enqueryQuery = new QueryBuilder(baseQuery, query)
    .search(["name", "email", "phone", "message", "postalCode", "country"])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await enqueryQuery.modelQuery;
  const meta = await enqueryQuery.countTotal();

  return {
    data: result,
    meta,
  };
};

const getEnqueryByIdForAdminFromDB = async (enqueryId: string) => {
  const enquery = await Enquery.findById(enqueryId)
    .populate([
      {
        path: "listingId",
        populate: {
          path: "agentId",
          select: "name email phone profileImage agencyName agencyLogo",
        },
      },
      {
        path: "userId",
        select: "name email phone profileImage",
      },
    ])
    .lean();

  if (!enquery) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Enquiry not found");
  }

  return enquery;
};

const getEnqueryStatsForAdminFromDB = async () => {
  const now = new Date();

  // Start of this month
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Start of this week (Sunday as start of week)
  const startOfWeek = new Date(now);
  const day = now.getDay();
  const diff = now.getDate() - day;
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);

  const [totalEnqueries, thisWeekEnqueries, thisMonthEnqueries] =
    await Promise.all([
      Enquery.countDocuments(),
      Enquery.countDocuments({ createdAt: { $gte: startOfWeek } }),
      Enquery.countDocuments({ createdAt: { $gte: startOfMonth } }),
    ]);

  return {
    totalEnqueries,
    thisWeekEnqueries,
    thisMonthEnqueries,
  };
};

export const EnqueryServices = {
  createEnquery,
  getAllEnqueriesFromDB,
  getEnqueryByIdFromDB,
  getMyEnqueriesFromDB,
  getMyEnqueryByIdFromDB,
  updateEnqueryStatus,
  getAllEnqueriesForAdminFromDB,
  getEnqueryByIdForAdminFromDB,
  getEnqueryStatsForAdminFromDB,
};
