import { Router } from "express";
import { addLogger } from "../utils/logger.js";
import { passportCall } from "../utils/authUtil.js";
import { getUsers, premiumController, uploadUserDocuments } from "../controllers/usersController.js";
import upload from "../middlewares/multer.js";

const router = Router();
router.use(addLogger);

router.get("/", getUsers);
router.get("/premium/:uid", passportCall("jwt"), premiumController);
router.post("/:uid/documents", passportCall("jwt"), upload.array("file"), uploadUserDocuments);

export default router;
