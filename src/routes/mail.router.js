import { Router } from "express";
import { mailController } from "../controllers/mailController.js";
import { passportCall } from "../utils/authUtil.js";

const router = Router();

router.get("/", passportCall("jwt"), mailController);

export default router;
