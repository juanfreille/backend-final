import sessionService from "../services/sessionService.js";
import userDTO from "../dto/userDTO.js";

export const loginJWT = (req, res) => {
  req.logger.info(`Intento de inicio de sesión para el usuario: ${req.user.email}`);
  const token = sessionService.generateJWT(req.user);
  sessionService.setTokenCookie(res, token);

  if (req.user) {
    req.logger.info(`Usuario ${req.user.email} se ha logueado con JWT exitosamente.`);
    return res.redirect("/home");
  } else {
    req.logger.warn("Intento de logueo con JWT fallido, usuario no encontrado.");
    res.status(401).json({ error: "Usuario no encontrado" });
  }
};

export const gitHubCallBackJWT = (req, res) => {
  req.logger.info(`Callback de GitHub para el usuario: ${req.user.email}`);
  const token = sessionService.generateJWT(req.user);
  sessionService.setTokenCookie(res, token);
  req.session.user = req.user;
  req.logger.info(`Usuario ${req.user.email} ha iniciado sesión exitosamente a través de GitHub.`);
  res.redirect("/home");
};

export const handleRegister = (req, res) => {
  req.logger.info(`Nuevo registro de usuario: ${req.body.email}`);
  res.send({
    status: "success",
    message: "Usuario registrado",
  });
};

export const handleLogin = (req, res, next) => {
  req.session.user = {
    first_name: req.user.first_name,
    last_name: req.user.last_name,
    email: req.user.email,
    age: req.user.age,
    role: req.user.role,
  };
  next();
};

export const getCurrentUser = (req, res) => {
  req.logger.info(`Solicitud para obtener el usuario actual: ${req.user.email}`);
  const user = new userDTO(req.user);
  res.send({ status: "success", payload: user });
};

export const logOutSession = (req, res) => {
  req.logger.info(`Cierre de sesión solicitado por el usuario: ${req.user.email}`);
  req.session.destroy((err) => {
    if (err) {
      req.logger.error(`Error al destruir la sesión para el usuario ${req.user.email}: ${err.message}`);
      res.status(500).json({ error: "Error interno del servidor" });
    } else {
      req.logger.info(`Sesión destruida exitosamente para el usuario ${req.user.email}`);
      res.redirect("/login");
    }
  });
};
