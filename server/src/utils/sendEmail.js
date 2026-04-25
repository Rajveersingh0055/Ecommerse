import nodemailer from "nodemailer";

export const sendEmail = async (options) => {
  // Determine active keys or fallbacks.
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(
      `[MOCK EMAIL SENT to ${options.email}]: \nSubject: ${options.subject} \nMessage: ${options.message}`,
    );
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `Assessment App <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
};
