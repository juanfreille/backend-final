import sessionService from "../services/sessionService.js";
import userDTO from "../dto/userDTO.js";
import nodemailer from "nodemailer";
import { userService } from "../services/index.js";
import { resetPasswordService } from "../services/index.js";
import crypto from "crypto";
import { createHash } from "../utils/functionsUtil.js";
import config from "../config/config.js";

export const gitHubCallBackJWT = async (req, res) => {
  req.logger.info(`Callback de GitHub para el usuario: ${req.user.email}`);
  req.user.last_connection = Date.now();
  await userService.updateUserByEmail(req.user.email, req.user);
  const token = sessionService.generateJWT(req.user);
  sessionService.setTokenCookie(res, token);
  req.logger.info(`Usuario ${req.user.email} ha iniciado sesión exitosamente a través de GitHub.`);
  res.redirect("/home");
};

export const logOutJwt = async (req, res) => {
  try {
    req.user.last_connection = Date.now();
    await userService.updateUserByEmail(req.user.email, req.user);
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
      req.logger.warning("El correo electrónico no está registrado");
      return res.status(400).json({ message: "El correo electrónico no está registrado" });
    }

    const code = crypto.randomBytes(4).toString("hex");
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
        from: `JIF Style Store - Recuperación de Contraseña <${config.EMAIL_USER}>`,
        to: email,
        subject: "Recupera tu Contraseña",
        html: `
        <div>
          <p>Hola!<br>Para restablecer tu contraseña, por favor haz clic en el siguiente enlace:<br><a href="${config.BASE_URL}/newpassword/${code}">Restablecer mi Contraseña</a></p>
          <p>Tu código de recuperación es: <strong>${code}</strong><br>Si no solicitaste este cambio, por favor ignora este mensaje.</p>
        </div>
      `,
        attachments: [],
      });
      req.logger.info(`Correo de recuperación enviado al usuario ${email}`);
      res.status(200).json({ status: "success", message: "Código de recuperación enviado exitosamente" });
    } catch (error) {
      req.logger.error(`Error enviando correo electrónico: ${error.message}`);
      return res.status(500).json({ message: "Error enviando correo electrónico" });
    }
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
      req.logger.warning("Código de recuperación inválido");
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
