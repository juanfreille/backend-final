import { Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { passportCall } from "../utils/authUtil.js";
import { logOut } from "../controllers/views.controller.js";
const router = Router();

const loginJWT = async (req, res) => {
  const jwtPayload = {
    _id: req.user._id,
    first_name: req.user.first_name,
    last_name: req.user.last_name,
    age: req.user.age,
    role: req.user.role,
    email: req.user.email,
    cart: req.user.cart,
  };
  const token = jwt.sign(jwtPayload, "coderSecret", {
    expiresIn: "1h",
  });

  res.cookie("coderCookieToken", token, {
    maxAge: 3600000,
    httpOnly: true,
    secure: true,
  });

  if (req.user) return res.redirect("/home");
};

const gitHubCallBackJWT = async (req, res) => {
  const jwtPayload = {
    _id: req.user._id,
    first_name: req.user.first_name,
    last_name: req.user.last_name,
    email: req.user.email,
    cart: req.user.cart,
    role: req.user.role,
  };

  const token = jwt.sign(jwtPayload, "coderSecret", {
    expiresIn: "1h",
  });
  res.cookie("coderCookieToken", token, {
    maxAge: 3600000,
    httpOnly: true,
    secure: true,
  });
  req.session.user = req.user;
  res.redirect("/home");
};

router.get("/github", passport.authenticate("github", { scope: ["user:email"] }), (req, res) => {
  res.send({
    status: "success",
    message: "Success",
  });
});

router.get(
  "/githubcallback",
  passport.authenticate("github", {
    session: false,
    failureMessage: true,
    failureRedirect: "/login?failLogin=true",
  }),
  gitHubCallBackJWT
);

router.post(
  "/register",
  passport.authenticate("register", {
    failureMessage: true,
    failureRedirect: "/register?failRegister=true",
  }),
  (req, res) => {
    res.send({
      status: "success",
      message: "Usuario registrado",
    });
  }
);

router.post(
  "/login",
  passport.authenticate("login", {
    session: false,
    failureMessage: true,
    failureRedirect: "/login?failLogin=true",
  }),
  (req, res, next) => {
    req.session.user = {
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      email: req.user.email,
      age: req.user.age,
      role: req.user.role,
    };
    next();
  },
  loginJWT
);

router.get("/current", passportCall("jwt"), (req, res) => {
  console.log("req.user: ", req.user);
  const user = req.user;
  res.send({ status: "success", payload: user });
});

router.post("/logout", passportCall("jwt"), logOut, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error al destruir la sesión:", err);
      res.status(500).json({ error: "Error interno del servidor" });
    } else {
      res.redirect("/login");
    }
  });
});

export default router;
