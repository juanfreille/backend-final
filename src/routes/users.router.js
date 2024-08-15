import { Router } from "express";
import { passportCall } from "../utils/authUtil.js";
import { getUsers, premiumController, uploadUserDocuments, deleteUsers, deleteUser } from "../controllers/usersController.js";
import upload from "../middlewares/multer.js";

const router = Router();

router.get("/", passportCall("jwt"), getUsers);
router.get("/premium/:uid", passportCall("jwt"), premiumController);
router.post("/:uid/documents", passportCall("jwt"), upload.array("file"), uploadUserDocuments);
router.delete("/", passportCall("jwt"), deleteUsers);
router.get("/:uid", passportCall("jwt"), deleteUser);

export default router;
