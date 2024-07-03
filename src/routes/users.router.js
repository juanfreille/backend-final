import { Router } from "express";
import { addLogger } from "../utils/logger.js";
import { passportCall } from "../utils/authUtil.js";
import { getUsers, premiumController } from "../controllers/usersController.js";

const router = Router();
router.use(addLogger);

router.get("/", getUsers);
router.get("/premium/:uid", premiumController);

export default router;
