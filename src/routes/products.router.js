import express from "express";
// import { productManagerFS } from "../dao/ProductManagerFS.js";
import { productManagerDB } from "../dao/ProductManagerDB.js";
import { uploader } from "../utils/multer.js";

const router = express.Router();
// const ProductService = new productManagerFS("data/products.json");
const ProductService = new productManagerDB();

router.get("/", async (req, res) => {
  const result = await ProductService.getAllProducts();
  res.send({
    status: "success",
    payload: result,
  });
});

router.get("/:pid", async (req, res) => {
  try {
    const result = await ProductService.getProductByID(req.params.pid);
    res.send({
      status: "success",
      payload: result,
    });
  } catch (error) {
    res.status(400).send({
      status: "error",
      message: error.message,
    });
  }
});

router.post("/", uploader.array("thumbnails"), async (req, res) => {
  if (req.files) {
    req.body.thumbnails = [];
    req.files.forEach((file) => {
      req.body.thumbnails.push(file.filename);
    });
  }
  try {
    const result = await ProductService.createProduct(req.body);
    res.send({
      status: "success",
      payload: result,
    });
  } catch (error) {
    res.status(400).send({
      status: "error",
      message: error.message,
    });
  }
});

router.put("/:pid", uploader.array("thumbnails"), async (req, res) => {
  if (req.files) {
    req.body.thumbnails = [];
    req.files.forEach((file) => {
      req.body.thumbnails.push(file.filename);
    });
  }
  try {
    const result = await ProductService.updateProduct(req.params.pid, req.body);
    res.send({
      status: "success",
      payload: result,
    });
  } catch (error) {
    res.status(400).send({
      status: "error",
      message: error.message,
    });
  }
});

router.delete("/:pid", async (req, res) => {
  try {
    const result = await ProductService.deleteProduct(req.params.pid);
    res.send({
      status: "success",
      payload: result,
    });
  } catch (error) {
    res.status(400).send({
      status: "error",
      message: error.message,
    });
  }
});

export default router;
