import { Router } from "express";
import passport from "passport";
import { passportCall } from "../utils/authUtil.js";
import {
  loginJWT,
  gitHubCallBackJWT,
  handleRegister,
  handleLogin,
  getCurrentUser,
  logOutSession,
  resetPassword,
  newPassword,
} from "../controllers/sessionController.js";
import { logOut } from "../controllers/viewsController.js";
import { addLogger } from "../utils/logger.js";

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
  handleRegister
);

router.post(
  "/login",
  passport.authenticate("login", {
    session: false,
    failureMessage: true,
    failureRedirect: "/login?failLogin=true",
  }),
  handleLogin,
  loginJWT
);

router.get("/current", passportCall("jwt"), getCurrentUser);
router.post("/logout", passportCall("jwt"), logOut, logOutSession);
router.post("/resetpassword", resetPassword);
router.put("/newpassword", newPassword);

export default router;
