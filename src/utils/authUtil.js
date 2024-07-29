import passport from "passport";
import { calculateTotalQuantityInCart, getAvatarPath } from "../controllers/viewsController.js";

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

//A este lo usaba antes, ahora uso la version handlePoliciesViews
export const handlePolicies = (roles) => {
  return (req, res, next) => {
    if (roles[0].toUpperCase() === "PUBLIC") return next();
    if (!req.user) return res.status(401).send({ status: "error", error: "No autenticado" });
    if (!roles.includes(req.user.role.toUpperCase())) return res.status(403).send({ status: "error", error: "No autorizado" });
    next();
  };
};

export const handlePoliciesViews = (roles) => {
  return async (req, res, next) => {
    if (roles[0].toUpperCase() === "PUBLIC") return next();
    if (!req.user) {
      return res.status(401).render("error", {
        title: "Error",
        message: "No autenticado",
        style: "styles.css",
        user: req.user,
        redirect: "/login",
      });
    }

    // Verificar si el usuario tiene el rol adecuado
    if (!roles.includes(req.user.role.toUpperCase())) {
      let code;
      let message;

      if (req.user.role.toUpperCase() === "ADMIN") {
        code = "Información de Perfil No Disponible";
        message = `El administrador no tiene una página de perfil disponible.<br>Las configuraciones y la gestión de la cuenta se realizan a través del panel de administración.`;
      } else {
        code = "Acceso denegado";
        message = `No tienes permisos suficientes para acceder a esta página. Asegúrate de haber iniciado sesión con una cuenta con los permisos adecuados.<br><br>Si crees que esto es un error, por favor contacta con el administrador.`;
      }
      const totalQuantityInCart = req.user ? calculateTotalQuantityInCart(req.user) : 0;
      const avatar = await getAvatarPath(req.user ? req.user._id : null);

      return res.status(403).render("forbidden", {
        title: "Error de Autorización",
        code,
        message,
        style: "styles.css",
        user: req.user,
        avatar,
        totalQuantityInCart,
        redirect: "/",
      });
    }

    next();
  };
};
