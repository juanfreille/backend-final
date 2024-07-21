import sessionService from "../services/sessionService.js";
import userDTO from "../dto/userDTO.js";
import nodemailer from "nodemailer";
import userService from "../services/userService.js";
import ResetPasswordService from "../services/resetPasswordService.js";
import crypto from "crypto";
import { createHash } from "../utils/functionsUtil.js";
import config from "../config/config.js";

const resetPasswordService = new ResetPasswordService();

export const gitHubCallBackJWT = (req, res) => {
  req.logger.info(`Callback de GitHub para el usuario: ${req.user.email}`);
  const token = sessionService.generateJWT(req.user);
  sessionService.setTokenCookie(res, token);
  req.logger.info(`Usuario ${req.user.email} ha iniciado sesión exitosamente a través de GitHub.`);
  res.redirect("/home");
};

export const failRegister = async (req, res) => {
  req.logger.error("Failed Strategy");
  res.status(400).json({ error: "Failed" });
};

export const logOutSession = (req, res) => {
  req.logger.info(`Cierre de sesión solicitado por el usuario: ${req.user.email}`);
};

export const logOutJwt = async (req, res) => {
  try {
    res.clearCookie("coderCookieToken");
    req.logger.info("Session controller - JWT logout exitoso");
    res.redirect("/");
  } catch (error) {
    req.logger.error("Session controller - Error al cerrar la sesión JWT:", error);
    return res.status(500).json({ status: "error", error: "Internal Server Error" });
  }
};

export const resetPassword = async (req, res, next) => {
  const { email } = req.body;
  req.logger.info(`Restableciendo contraseña para el usuario: ${email}`);

  try {
    const user = await userService.getUserByEmail(email);
    if (!user) {
      req.logger.warn("El correo electrónico no está registrado");
      return res.status(400).json({ message: "El correo electrónico no está registrado" });
    }

    const generateRandomCode = () => {
      return crypto.randomBytes(4).toString("hex");
    };

    const code = generateRandomCode();
    req.logger.info(`Código generado: ${code}`);
    const newCode = await resetPasswordService.saveCode(email, code);
    req.logger.info(`Código guardado: ${newCode}`);

    const transport = nodemailer.createTransport({
      service: "gmail",
      port: 587,
      auth: {
        user: config.EMAIL_USER,
        pass: config.EMAIL_PASSWORD,
      },
    });

    try {
      let result = await transport.sendMail({
        from: "JIF Style Store - Recuperación de contraseña <" + config.EMAIL_USER + ">",
        to: email,
        subject: "Código de recuperación de tu contraseña",
        html: `
              <div>
                <p>Por favor, haz clic en el siguiente enlace para restablecer tu contraseña:<br><a href="http://localhost:8080/newpassword/${code}">http://localhost:8080/newpassword/${code}</a></p>
                <p>El código para recuperar tu contraseña es: ${code}<br>Si no fuiste tú quién lo solicitó, ignora este mensaje.</p>
              </div>
              `,
        attachments: [],
      });
      req.logger.info(`Correo de inicio de sesión enviado al usuario ${email}`);
    } catch (error) {
      req.logger.error(`Error enviando correo electrónico: ${error.message}`);
      return res.status(500).json({ message: "Error enviando correo electrónico" });
    }

    res.status(200).json({ status: "success", message: "Código de recuperación enviado exitosamente" });
  } catch (error) {
    req.logger.error(error.message);
    next(error);
  }
};

export const newPassword = async (req, res) => {
  req.logger.info("Reiniciando la contraseña");
  try {
    const { code, password } = req.body;
    const resetCode = await resetPasswordService.getCode(code);
    if (!resetCode) {
      req.logger.warn("Código de recuperación inválido");
      return res.status(400).json({ status: "error", message: "Código de recuperación inválido" });
    }

    const passwordHash = createHash(password);
    const updates = { password: passwordHash };
    const updatedUser = await userService.updateUserByEmail(resetCode.email, updates);
    if (!updatedUser) {
      req.logger.error("Error al actualizar la contraseña del usuario");
      return res.status(500).json({ status: "error", message: "Error al actualizar la contraseña del usuario" });
    }
    req.logger.info("Contraseña actualizada con éxito");
    res.json({ status: "success", message: "Contraseña actualizada con éxito" });
  } catch (error) {
    req.logger.error(`Error al reiniciar la contraseña: ${error}`);
    res.status(500).json({ status: "error", message: "Error del servidor" });
  }
};
