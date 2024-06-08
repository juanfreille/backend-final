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
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

const getProductByID = async (req, res) => {
  try {
    const product = await productService.getProductByID(req.params.pid);
    res.status(200).json({ status: "success", payload: product });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

const createProduct = async (req, res) => {
  if (req.files) {
    req.body.thumbnails = req.files.map((file) => file.filename);
  }
  try {
    const productData = new ProductDTO(req.body);
    const product = await productService.createProduct(productData);
    res.status(201).json({ status: "success", payload: product });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

const updateProduct = async (req, res) => {
  if (req.files) {
    req.body.thumbnails = req.files.map((file) => file.filename);
  }
  try {
    const product = await productService.updateProduct(req.params.pid, req.body);
    res.status(200).json({ status: "success", payload: product });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    await productService.deleteProduct(req.params.pid);
    res.status(200).json({ status: "success", message: "Product deleted successfully" });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

export { getPaginateProducts, getProductByID, createProduct, updateProduct, deleteProduct };
