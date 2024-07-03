import nodemailer from "nodemailer";
import config from "../config/config.js";

const transport = nodemailer.createTransport({
  service: "gmail",
  port: 587,
  auth: {
    user: config.EMAIL_USER,
    pass: config.EMAIL_PASSWORD,
  },
});

export const mailController = async (req, res) => {
  let result = await transport.sendMail({
    from: "coder test <config.EMAIL_USER>",
    to: req.user.email,
    subject: "Correo de prueba",
    html: `
        <div>
            <h1>Este es un testeo del mailer</h1>
        </div>
        `,
    attachments: [],
  });
};
