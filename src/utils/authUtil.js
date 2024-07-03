import passport from "passport";

export const passportCall = (strategy) => {
  return async (req, res, next) => {
    passport.authenticate(strategy, function (error, user, info) {
      if (error) return next(error);
      if (!user) {
        req.session.errorMessage = info.messages ? info.messages : info.toString();
      }
      req.user = user;
      next();
    })(req, res, next);
  };
};

export const authorization = (role) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.render("error", { title: "Error", message: "Unauthorized" });
    }
    if (req.user.role !== "admin") {
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

//este lo vimos con el profe, quizas lo utilizo mas adelante
export const handlePolicies = (roles) => {
  return (req, res, next) => {
    if (roles[0].toUpperCase() === "PUBLIC") return next();
    if (!req.user) return res.status(401).send({ status: "error", error: "No autenticado" });
    if (!roles.includes(req.user.role.toUpperCase())) return res.status(403).send({ status: "error", error: "No autorizado" });
    next();
  };
};
