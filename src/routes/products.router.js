import express from "express";
import { getProducts, getProductByID, createProduct, updateProduct, deleteProduct } from "../controllers/productController.js";
import { passportCall } from "../utils/authUtil.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/:pid", getProductByID);
router.post("/", passportCall("jwt"), upload.array("thumbnails"), createProduct);
router.put("/:pid", passportCall("jwt"), upload.array("thumbnails"), updateProduct);
router.delete("/:pid", passportCall("jwt"), deleteProduct);

export default router;
