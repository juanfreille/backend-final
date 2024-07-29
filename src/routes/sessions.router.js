import { Router } from "express";
import passport from "passport";
import { passportCall } from "../utils/authUtil.js";
import { gitHubCallBackJWT, failRegister, logOutJwt, resetPassword, newPassword } from "../controllers/sessionController.js";
import { addLogger } from "../utils/logger.js";
import userDTO from "../dto/userDTO.js";
import jwt from "jsonwebtoken";
import userService from "../services/userService.js";

const router = Router();
router.use(addLogger);

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
    failureRedirect: "/login?failLogin=true",
  }),
  gitHubCallBackJWT
);

router.post("/register", (req, res, next) => {
  passport.authenticate("register", (err, user, info) => {
    if (err) {
      return res.status(500).send({ status: "error", message: err.message });
    }
    if (!user) {
      return res.status(400).send({ status: "error", message: info.message });
    }
    res.status(200).send({ status: "success", payload: user });
  })(req, res, next);
});

router.get("/failregister", failRegister);

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
