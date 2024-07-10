import express from "express";
import { uploader } from "../utils/multer.js";
import { getPaginateProducts, getProductByID, createProduct, updateProduct, deleteProduct } from "../controllers/productController.js";
import { passportCall, handlePolicies } from "../utils/authUtil.js";

const router = express.Router();
import { addLogger } from "../utils/logger.js";

router.use(addLogger);
router.get("/", getPaginateProducts);
router.get("/:pid", getProductByID);
router.post("/", uploader.array("thumbnails"), passportCall("jwt"), createProduct);
router.put("/:pid", uploader.array("thumbnails"), passportCall("jwt"), updateProduct);
router.delete("/:pid", passportCall("jwt"), deleteProduct);

export default router;
