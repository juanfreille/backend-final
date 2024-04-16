import express from "express";
import { productManagerDB } from "../dao/ProductManagerDB.js";
import { uploader } from "../utils/multer.js";

const router = express.Router();
const ProductService = new productManagerDB();

router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, sort } = req.query;

    const options = {
      page: Number(page),
      limit: Number(limit),
      lean: true,
    };

    const searchQuery = {};

    if (req.query.category) {
      searchQuery.category = req.query.category;
    }

    if (req.query.title) {
      searchQuery.title = { $regex: req.query.title, $options: "i" };
    }

    if (req.query.stock) {
      const stockNumber = parseInt(req.query.stock);
      if (!isNaN(stockNumber)) {
        searchQuery.stock = stockNumber;
      }
    }

    if (sort === "asc" || sort === "desc") {
      options.sort = { price: sort === "asc" ? 1 : -1 };
    }

    const buildLinks = (products) => {
      const { prevPage, nextPage } = products;
      const baseUrl = req.originalUrl.split("?")[0];
      const sortParam = sort ? `&sort=${sort}` : "";

      const prevLink = prevPage
        ? `${baseUrl}?page=${prevPage}${sortParam}`
        : null;
      const nextLink = nextPage
        ? `${baseUrl}?page=${nextPage}${sortParam}`
        : null;

      return {
        prevPage: prevPage ? parseInt(prevPage) : null,
        nextPage: nextPage ? parseInt(nextPage) : null,
        prevLink,
        nextLink,
      };
    };

    const products = await ProductService.getPaginateProducts(
      searchQuery,
      options
    );
    const { prevPage, nextPage, prevLink, nextLink } = buildLinks(products);

    let requestedPage = parseInt(page);
    if (isNaN(requestedPage) || requestedPage < 1) {
      requestedPage = 1;
    }

    if (requestedPage > products.totalPages) {
      return res
        .status(404)
        .json({ error: "La página solicitada está fuera de rango" });
    }

    const response = {
      status: "success",
      payload: products.docs,
      totalPages: products.totalPages,
      page: parseInt(page),
      hasPrevPage: products.hasPrevPage,
      hasNextPage: products.hasNextPage,
      prevPage,
      nextPage,
      prevLink,
      nextLink,
    };

    return res.status(200).send(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error interno del servidor" });
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
