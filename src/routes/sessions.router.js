import { Router } from "express";
import passport from "passport";
import { passportCall } from "../utils/authUtil.js";
import { gitHubCallBackJWT, logOutJwt, resetPassword, newPassword } from "../controllers/sessionController.js";
import userDTO from "../dto/userDTO.js";
import jwt from "jsonwebtoken";
import { userService } from "../services/index.js";
import nodemailer from "nodemailer";
import config from "../config/config.js";

const router = Router();

router.get("/github", passport.authenticate("github", { scope: ["user:email"] }), (req, res) => {
  res.send({
    status: "success",
    message: "Success",
  });
});

router.get("/githubcallback", passport.authenticate("github", { session: false }), gitHubCallBackJWT);

router.post("/register", async (req, res, next) => {
  passport.authenticate("register", { session: false }, async (err, user, info) => {
    if (err) {
      return res.status(500).send({ status: "error", message: err.message });
    }
    if (!user) {
      return res.status(400).send({ status: "error", message: info.message });
    }

    const transport = nodemailer.createTransport({
      service: "gmail",
      port: 587,
      auth: {
        user: config.EMAIL_USER,
        pass: config.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: `JIF Style Store <${config.EMAIL_USER}>`,
      to: user.email,
      subject: "Bienvenido a JIF Style Store",
      html: `
        <div>
          <p>Hola ${user.first_name},</p>
          <p>Gracias por registrarte en JIF Style Store. Estamos encantados de tenerte con nosotros.</p>
          <p>Si tienes alguna pregunta, no dudes en ponerte en contacto con nosotros.</p>
          <p>Saludos,<br>El equipo de JIF Style Store</p>
        </div>
      `,
    };
    try {
      await transport.sendMail(mailOptions);
      console.log(`Correo de bienvenida enviado al usuario ${user.email}`);
    } catch (error) {
      console.error(`Error enviando correo electrónico: ${error.message}`);
    }

    res.status(200).send({ status: "success", payload: user });
  })(req, res, next);
});

router.post("/login", (req, res, next) => {
  passport.authenticate("login", (err, user, info) => {
    if (err) {
      return res.status(500).send({ status: "error", message: err.message });
    }
    if (!user) {
      return res.status(400).send({ status: "error", message: info.message });
    }
    req.login(user, { session: false }, async (err) => {
      if (err) {
        return res.status(500).send({ status: "error", message: err.message });
      }
      const jwtPayload = {
        _id: req.user._id,
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        age: req.user.age,
        role: req.user.role,
        email: req.user.email,
        cart: req.user.cart,
      };
      req.user.last_connection = Date.now();
      await userService.updateUserByEmail(req.user.email, req.user);
      const token = jwt.sign(jwtPayload, process.env.JWT_SECRET, { expiresIn: "1h" });
      res.cookie("coderCookieToken", token, { maxAge: 3600000, httpOnly: true, secure: true });
      res.status(200).send({ status: "success", token });
    });
  })(req, res, next);
});

router.get("/current", passportCall("jwt"), (req, res) => {
  const user = new userDTO(req.user);
  res.send({ status: "success", payload: user });
});
router.post("/logout", passportCall("jwt"), logOutJwt);
router.post("/resetpassword", resetPassword);
router.put("/newpassword", newPassword);

export default router;
