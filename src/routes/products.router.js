import express from "express";
import { uploader } from "../utils/multer.js";
import { getPaginateProducts, getProductByID, createProduct, updateProduct, deleteProduct } from "../controllers/productController.js";

const router = express.Router();
import { addLogger } from "../utils/logger.js";

router.use(addLogger);
router.get("/", getPaginateProducts);
router.get("/:pid", getProductByID);
router.post("/", uploader.array("thumbnails"), createProduct);
router.put("/:pid", uploader.array("thumbnails"), updateProduct);
router.delete("/:pid", deleteProduct);

export default router;
