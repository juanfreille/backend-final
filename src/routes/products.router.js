import express from "express";
// import { productManagerFS } from "../dao/ProductManagerFS.js";
import { productManagerDB } from "../dao/ProductManagerDB.js";
import { uploader } from "../utils/multer.js";
import { productModel } from "../dao/models/productModel.js";

const router = express.Router();
// const ProductService = new productManagerFS("data/products.json");
const ProductService = new productManagerDB();

router.get("/", async (req, res) => {
  try {
    let { page, limit, sort, query } = req.query;
    if (!page) page = 1;
    if (!limit) limit = 10;

    let sortOptions = {};
    if (sort) {
      if (sort === "asc") {
        sortOptions = { price: 1 };
      } else if (sort === "desc") {
        sortOptions = { price: -1 };
      }
    }

    let filter = {};
    if (query) {
      filter = { category: query };
    }

    const result = await productModel.paginate(filter, {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: sortOptions,
      lean: true,
    });

    const count = await productModel.countDocuments(filter);
    const totalPages = Math.ceil(count / limit);
    const hasNextPage = result.hasNextPage;
    const hasPrevPage = result.hasPrevPage;
    const nextPage = hasNextPage ? parseInt(page) + 1 : null;
    const prevPage = hasPrevPage ? parseInt(page) - 1 : null;

    const baseURL = req.baseUrl;
    const prevLink = hasPrevPage ? `${baseURL}?page=${prevPage}` : null;
    const nextLink = hasNextPage ? `${baseURL}?page=${nextPage}` : null;

    const response = {
      status: "success",
      payload: result.docs,
      totalPages,
      prevPage,
      nextPage,
      page: parseInt(page),
      hasPrevPage,
      hasNextPage,
      prevLink,
      nextLink,
    };

    res.send({
      status: "success",
      payload: response,
    });
  } catch (error) {
    res.status(400).send({
      status: "error",
      message: error.message,
    });
  }
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
