import express from "express";
import { getPaginateProducts, getProductByID, createProduct, updateProduct, deleteProduct } from "../controllers/productController.js";
import { passportCall } from "../utils/authUtil.js";
import upload from "../middlewares/multer.js";

const router = express.Router();
import { addLogger } from "../utils/logger.js";

router.use(addLogger);
router.get("/", getPaginateProducts);
router.get("/:pid", getProductByID);
router.post("/", passportCall("jwt"), upload.array("thumbnails"), createProduct);
router.put("/:pid", passportCall("jwt"), upload.array("thumbnails"), updateProduct);
router.delete("/:pid", passportCall("jwt"), deleteProduct);

export default router;
