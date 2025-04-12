import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "xoxoriru67@gmail.com",
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});