import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import { User } from "../user/user.model";
import { Listing } from "../listing/listing.model";
import { Types } from "mongoose";
import { Enquery } from "./enquery.model";
import { ISendEmail } from "../../../types/email";
import config from "../../../config";
import { emailHelper } from "../../../helpers/emailHelper";

const PRIMARY_COLOR = "#22143b";
const TEXT_COLOR = "#ffffff";

const createEnquery = async (userId: string, payload: any) => {

    const user = await User.findById(userId).select(
        "name email",
    );

    if (!user) {
        throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
    }


    let agentEmail: string | null = null;
    let agentName: string | null = null;
    let listingTitle: string | null = null;

    if (payload.listingId) {
        const listing = await Listing.findById(
            payload.listingId,
        )
            .select("agentId title")
            .lean();

        if (!listing) {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                "Listing not found",
            );
        }

        listingTitle = listing.title;

        const agent = await User.findById(listing.agentId).select(
            "name email",
        );

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

    const emailPayload: ISendEmail = {
        to:
            agentEmail ||
            config.support_receiver_email ||
            "support@yourplatform.com",
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

              <div style="margin-top:20px;">
                <p><b>Subject:</b> ${payload.subject || "-"}</p>
              </div>

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
    };

    await emailHelper.sendEmail(emailPayload);

    return enquery;
};

const getAllEnqueriesFromDB = async (agentId: string) => {

  const listings = await Listing.find({
    agentId: new Types.ObjectId(agentId),
    isDeleted: { $ne: true },
  }).select("_id");

  const listingIds = listings.map((l) => l._id);

  const enqueries = await Enquery.find({
    listingId: { $in: listingIds },
  })
    .sort({ createdAt: -1 })
    .lean();

  return enqueries;
};

const getSingleEnqueryFromDB = async (
  agentId: string,
  enqueryId: string,
) => {
  const enquery = await Enquery.findById(enqueryId).lean();

  if (!enquery) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      "Enquiry not found",
    );
  }

  const listing = await Listing.findOne({
    _id: enquery.listingId,
    agentId: new Types.ObjectId(agentId),
    isDeleted: { $ne: true },
  })
    .select("_id title agentId")
    .lean();

  if (!listing) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "You are not allowed to access this enquiry",
    );
  }

  const user = await User.findById(enquery.userId)
    .select("name email phone")
    .lean();

  return {
    ...enquery,
    listing,
    user,
  };
};

export const EnqueryServices = {
    createEnquery,
    getAllEnqueriesFromDB,
    getSingleEnqueryFromDB,
}