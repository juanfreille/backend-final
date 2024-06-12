import CustomError from "../services/errors/CustomError.js";
import { generateProductsErrorInfo, generateNotFoundErrorInfo, generateDefaultErrorInfo } from "../services/errors/info.js";
import { ErrorCodes } from "../services/errors/enums.js";
import productService from "../services/productService.js";
import ProductDTO from "../dto/productDTO.js";

const getPaginateProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort, category, title, stock } = req.query;
    const options = { page: Number(page), limit: Number(limit), lean: true, sort: sort ? { price: sort === "asc" ? 1 : -1 } : {} };
    const searchQuery = {};
    if (category) searchQuery.category = category;
    if (title) searchQuery.title = { $regex: title, $options: "i" };
    if (stock) searchQuery.stock = parseInt(stock) || undefined;

    const products = await productService.getPaginateProducts(searchQuery, options);
    const { prevPage, nextPage, totalPages, docs: payload, hasPrevPage, hasNextPage } = products;

    const buildLink = (page) => (page ? `${req.originalUrl.split("?")[0]}?page=${page}&limit=${limit}${sort ? `&sort=${sort}` : ""}` : null);

    const response = {
      status: "success",
      payload,
      totalPages,
      page: Number(page),
      hasPrevPage,
      hasNextPage,
      prevPage,
      nextPage,
      prevLink: buildLink(prevPage),
      nextLink: buildLink(nextPage),
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    const errorInfo = generateDefaultErrorInfo(error.message);
    res.status(500).json(errorInfo);
  }
};

const getProductByID = async (req, res) => {
  try {
    const product = await productService.getProductByID(req.params.pid);
    if (!product) {
      throw new CustomError(ErrorCodes.NOT_FOUND_ERROR, generateNotFoundErrorInfo("Product", req.params.pid).message);
    }
    res.status(200).json({ status: "success", payload: product });
  } catch (error) {
    if (error instanceof CustomError) {
      res.status(404).json({ code: error.code, message: error.message });
    } else {
      const errorInfo = generateDefaultErrorInfo(error.message);
      res.status(500).json(errorInfo);
    }
  }
};

const createProduct = async (req, res) => {
  if (req.files) {
    req.body.thumbnails = req.files.map((file) => file.filename);
  }
  try {
    const { title, price, stock } = req.body;
    if (!title || !price || !stock) {
      const missingFields = [];
      if (!title) missingFields.push("title");
      if (!price) missingFields.push("price");
      if (!stock) missingFields.push("stock");
      const errorInfo = generateProductsErrorInfo(missingFields);
      throw new CustomError(errorInfo.code, errorInfo.message);
    }
    const productData = new ProductDTO(req.body);
    const product = await productService.createProduct(productData);
    res.status(201).json({ status: "success", payload: product });
  } catch (error) {
    if (error instanceof CustomError) {
      res.status(400).json({ code: error.code, message: error.message });
    } else {
      const errorInfo = generateDefaultErrorInfo(error.message);
      res.status(500).json(errorInfo);
    }
  }
};

const updateProduct = async (req, res) => {
  if (req.files) {
    req.body.thumbnails = req.files.map((file) => file.filename);
  }
  try {
    const product = await productService.updateProduct(req.params.pid, req.body);
    if (!product) {
      throw new CustomError(ErrorCodes.NOT_FOUND_ERROR, generateNotFoundErrorInfo("Product", req.params.pid).message);
    }
    res.status(200).json({ status: "success", payload: product });
  } catch (error) {
    if (error instanceof CustomError) {
      res.status(404).json({ code: error.code, message: error.message });
    } else {
      const errorInfo = generateDefaultErrorInfo(error.message);
      res.status(500).json(errorInfo);
    }
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await productService.deleteProduct(req.params.pid);
    if (!product) {
      throw new CustomError(ErrorCodes.NOT_FOUND_ERROR, generateNotFoundErrorInfo("Product", req.params.pid).message);
    }
    res.status(200).json({ status: "success", message: "Product deleted successfully" });
  } catch (error) {
    if (error instanceof CustomError) {
      res.status(404).json({ code: error.code, message: error.message });
    } else {
      const errorInfo = generateDefaultErrorInfo(error.message);
      res.status(500).json(errorInfo);
    }
  }
};

export { getPaginateProducts, getProductByID, createProduct, updateProduct, deleteProduct };
