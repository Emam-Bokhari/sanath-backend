import { emailQueue } from "../../../queues";
import { TContact } from "./contact.interface";
import { Contact } from "./contact.model";
import { ISendEmail } from "../../../types/email";
import config from "../../../config";

const BRAND = {
  NAME: "My Home",
  PRIMARY_COLOR: "#0B3C6D",
  BG_COLOR: "#FFFFFF",
  TEXT_COLOR: "#191919",
};

const contact = async (payload: TContact) => {
  const contactEntry = await Contact.create({
    ...payload,
    userId: payload?.userId || undefined,
  });

  const emailPayload: ISendEmail = {
    to: config.support_receiver_email || "support@yourdomain.com",
    subject: `${BRAND.NAME} Contact Request: ${payload.subject}`,
    html: `
<body style="margin:0;padding:0;background:${BRAND.BG_COLOR};font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;background:${BRAND.BG_COLOR};">
    <tr>
      <td align="center">

        <table width="100%" cellpadding="0" cellspacing="0"
          style="
            max-width:600px;
            background:${BRAND.BG_COLOR};
            border-radius:12px;
            box-shadow:0 8px 24px rgba(0,0,0,0.06);
            overflow:hidden;
          "
        >

          <!-- Header -->
          <tr>
            <td align="center"
              style="padding:30px 20px;background:${BRAND.PRIMARY_COLOR};color:#fff;"
            >
              <h1 style="margin:0;font-size:22px;font-weight:600;">
                ${BRAND.NAME}
              </h1>
              <p style="margin:5px 0 0 0;font-size:13px;opacity:0.9;">
                New Contact Message
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:35px 30px;color:${BRAND.TEXT_COLOR};font-size:15px;line-height:1.6;">

              <p style="margin-bottom:15px;">
                New contact message received from website.
              </p>

              <!-- Info -->
              <div style="background:#f7f9fc;padding:20px;border-radius:8px;">
                <table width="100%">

                  <tr>
                    <td style="font-weight:bold;width:150px;">Name:</td>
                    <td>${payload.name || "Unknown"}</td>
                  </tr>

                  <tr>
                    <td style="font-weight:bold;">Email:</td>
                    <td>${payload.email || "Not provided"}</td>
                  </tr>

                  <tr>
                    <td style="font-weight:bold;">Subject:</td>
                    <td>${payload.subject}</td>
                  </tr>

                </table>
              </div>

              <!-- Message -->
              <div style="margin-top:25px;">
                <p style="font-weight:bold;margin-bottom:8px;">Message:</p>

                <div style="
                  background:#f7f9fc;
                  padding:18px;
                  border-left:4px solid ${BRAND.PRIMARY_COLOR};
                  border-radius:4px;
                ">
                  ${payload.message}
                </div>
              </div>

              <!-- Reply -->
              <div style="text-align:center;margin-top:35px;">
                <a href="mailto:${payload.email}"
                  style="
                    background:${BRAND.PRIMARY_COLOR};
                    color:#fff;
                    padding:14px 24px;
                    border-radius:6px;
                    text-decoration:none;
                    font-weight:600;
                  "
                >
                  Reply to User
                </a>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center"
              style="padding:20px;font-size:12px;color:#888;background:#f7f7f7;">
              © ${new Date().getFullYear()} ${BRAND.NAME}. All rights reserved.
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
`,
  };

  await emailQueue.add("contact-message", emailPayload);

  return contactEntry;
};

export const contactServices = {
  contact,
};