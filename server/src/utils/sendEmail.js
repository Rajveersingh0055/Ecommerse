import nodemailer from "nodemailer";

export const sendEmail = async (options) => {
  const emailUser = process.env.EMAIL_USER || process.env.SMTP_USER;
  const emailPass = process.env.EMAIL_PASS || process.env.SMTP_PASS;

  if (!emailUser || !emailPass) {
    console.log(
      `[MOCK EMAIL SENT to ${options.email}]: \nSubject: ${options.subject} \nMessage: ${options.message}`,
    );
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  const mailOptions = {
    from: `Assessment App <${emailUser}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
};
