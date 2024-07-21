import passport from "passport";
import config from "../config/config.js";

export const passportCall = (strategy) => {
  return (req, res, next) => {
    passport.authenticate(strategy, (error, user, info) => {
      if (error) return next(error);
      if (!user) {
        return res.status(401).send({ error: info?.message || info.toString() });
      }
      req.user = user;
      next();
    })(req, res, next);
  };
};

export const passportCallRedirect = (strategy) => {
  return (req, res, next) => {
    passport.authenticate(strategy, (error, user, info) => {
      if (error) return next(error);
      if (!user) {
        console.log("No auth token");
        return res.redirect("/login");
      }
      req.user = user;
      next();
    })(req, res, next);
  };
};

export const passportCallHome = (strategy) => {
  return (req, res, next) => {
    passport.authenticate(strategy, (error, user, info) => {
      if (error) return next(error);
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })(req, res, next);
  };
};

export const authorization = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.render("error", { title: "Error", message: "Unauthorized" });
    }
    if (req.user.role !== role) {
      return res.render("error", {
        message: "No posee los permisos requeridos para ver ésta página",
        title: "Backend / Error",
        style: "styles.css",
        redirect: "/",
      });
    }
    next();
  };
};

export const authToken = (req, res, next) => {
  if (!req.session.user) {
    try {
      const token = req.header("Authorization").replace("Bearer ", "");
      const decoded = jwt.verify(token, JWT_SECRET);
      req.session.user = decoded;
      next();
    } catch (error) {
      req.logger.warning("Unauthorized");
      return res.status(401).send({ status: "error", message: "Unauthorized" });
    }
  } else {
    next();
  }
};

export const handlePolicies = (roles) => {
  return (req, res, next) => {
    if (roles[0].toUpperCase() === "PUBLIC") return next();
    if (!req.user) return res.status(401).send({ status: "error", error: "No autenticado" });
    if (!roles.includes(req.user.role.toUpperCase())) return res.status(403).send({ status: "error", error: "No autorizado" });
    next();
  };
};
