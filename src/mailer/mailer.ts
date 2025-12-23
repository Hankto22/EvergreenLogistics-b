import nodemailer from "nodemailer";
import { env } from "../config/env.js";

// Create a single reusable transporter instance
const transporter = nodemailer.createTransport({
  host: env.EMAIL_HOST,
  port: env.EMAIL_PORT,
  secure: env.EMAIL_SECURE,
  auth: {
    user: env.EMAIL_USERNAME,
    pass: env.EMAIL_PASSWORD,
  },
  timeout: 10000, // 10 seconds timeout
} as any);

export const sendNotificationEmail = async (
  email: string,
  full_name: string,
  subject: string,
  message: string,
): Promise<string> => {
  const mailOptions = {
    from: env.EMAIL_SENDER,
    to: email,
    subject: subject,
    text: `Hello ${full_name},\n\n${message}\n\nIf you didn't request this, please ignore this email.`,
    html: `
      <html>
        <head>
          <style>
            .email-container {
              font-family: Arial, sans-serif;
              background-color: #f9f9f9;
              padding: 20px;
              border-radius: 8px;
              color: #333;
            }
            h2 {
              color: #007bff;
            }
            p {
              font-size: 16px;
              line-height: 1.6;
            }
            .footer {
              margin-top: 20px;
              font-size: 14px;
              color: #888;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <h2>${subject}</h2>
            <p>Hello <strong>${full_name}</strong>,</p>
            <p>${message}</p>
            <p class="footer">If you didn’t request this, please ignore this email.</p>
          </div>
        </body>
      </html>
    `,
  };

  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const mailRes = await transporter.sendMail(mailOptions);

      if (mailRes.accepted.length > 0) {
        return "Notification email sent successfully";
      } else if (mailRes.rejected.length > 0) {
        if (attempt === maxRetries) {
          return "Notification email not sent, please try again";
        }
        continue;
      } else {
        if (attempt === maxRetries) {
          return "Email server error";
        }
        continue;
      }
    } catch (error) {
      console.error(`Email send attempt ${attempt} failed:`, error);
      if (attempt === maxRetries) {
        return "Email server error";
      }
    }
  }
  return "Email server error";
};