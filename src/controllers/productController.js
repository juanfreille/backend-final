import CustomError from "../services/errors/CustomError.js";
import { generateProductsErrorInfo, generateNotFoundErrorInfo, generateDefaultErrorInfo } from "../services/errors/info.js";
import { ErrorCodes } from "../services/errors/enums.js";
import productService from "../services/productService.js";
import ProductDTO from "../dto/ProductDTO.js";

export const getPaginateProducts = async (req, res) => {
  req.logger.info("Solicitud para obtener productos paginados recibida.");
  try {
    const { page = 1, limit = 10, sort, category, title, stock } = req.query;
    req.logger.info(`Parámetros de consulta: page=${page}, limit=${limit}, sort=${sort}, category=${category}, title=${title}, stock=${stock}`);
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

    req.logger.info(`Productos paginados obtenidos con éxito: ${payload.length} productos encontrados.`);
    res.status(200).json(response);
  } catch (error) {
    req.logger.error(`Error al obtener productos paginados: ${error.message}`);
    const errorInfo = generateDefaultErrorInfo(error.message);
    res.status(500).json(errorInfo);
  }
};

export const getProductByID = async (req, res) => {
  req.logger.info(`Solicitud para obtener el producto con ID: ${req.params.pid}`);
  try {
    const product = await productService.getProductByID(req.params.pid);
    req.logger.info(`Producto encontrado (ID: ${req.params.pid}, Nombre de producto: ${product.title})`);
    res.status(200).json({ status: "success", payload: product });
  } catch (error) {
    req.logger.error(`${error.message}`);
    if (error instanceof CustomError) {
      res.status(404).json({ code: error.code, message: error.message });
    } else {
      const errorInfo = generateNotFoundErrorInfo("El producto", req.params.pid);
      res.status(500).json(errorInfo);
    }
  }
};

export const createProduct = async (req, res) => {
  req.logger.info("Solicitud para crear un nuevo producto recibida.");
  if (req.files) {
    req.body.thumbnails = req.files.map((file) => file.filename);
    req.logger.info(`Archivos subidos: ${req.body.thumbnails.join(", ")}`);
  }
  try {
    const { title, price, stock } = req.body;
    if (!title || !price || !stock) {
      const missingFields = [];
      if (!title) missingFields.push("title");
      if (!price) missingFields.push("price");
      if (!stock) missingFields.push("stock");
      const errorInfo = generateProductsErrorInfo(missingFields);
      req.logger.warning(`Campos faltantes para crear producto: ${missingFields.join(", ")}`);
      throw new CustomError(errorInfo.code, errorInfo.message);
    }
    const productData = new ProductDTO(req.body);
    const product = await productService.createProduct(productData);
    req.logger.info(`Producto creado con éxito. ID del producto: ${product._id}`);
    res.status(201).json({ status: "success", payload: product });
  } catch (error) {
    req.logger.error(`Error al crear un nuevo producto: ${error.message}`);
    if (error instanceof CustomError) {
      res.status(400).json({ code: error.code, message: error.message });
    } else {
      const errorInfo = generateDefaultErrorInfo(error.message);
      res.status(500).json(errorInfo);
    }
  }
};

export const updateProduct = async (req, res) => {
  req.logger.info(`Solicitud para actualizar el producto con ID: ${req.params.pid}`);
  if (req.files) {
    req.body.thumbnails = req.files.map((file) => file.filename);
    req.logger.info(`Archivos subidos: ${req.body.thumbnails.join(", ")}`);
  }
  try {
    const product = await productService.updateProduct(req.params.pid, req.body);
    if (!product) {
      req.logger.warning(`Producto con ID: ${req.params.pid} no encontrado para actualizar.`);
      throw new CustomError(ErrorCodes.NOT_FOUND_ERROR, generateNotFoundErrorInfo("Product", req.params.pid).message);
    }
    req.logger.info(`Producto (ID: ${req.params.pid}) actualizado con éxito.`);
    res.status(200).json({ status: "success", payload: product });
  } catch (error) {
    req.logger.error(`Error al actualizar el producto con ID ${req.params.pid}: ${error.message}`);
    if (error instanceof CustomError) {
      res.status(404).json({ code: error.code, message: error.message });
    } else {
      const errorInfo = generateDefaultErrorInfo(error.message);
      res.status(500).json(errorInfo);
    }
  }
};

export const deleteProduct = async (req, res) => {
  req.logger.info(`Solicitud para eliminar el producto con ID: ${req.params.pid}`);
  try {
    const product = await productService.deleteProduct(req.params.pid);
    if (!product) {
      req.logger.warning(`Producto con ID: ${req.params.pid} no encontrado para eliminar.`);
      throw new CustomError(ErrorCodes.NOT_FOUND_ERROR, generateNotFoundErrorInfo("Product", req.params.pid).message);
    }
    req.logger.info(`Producto (ID: ${req.params.pid}) eliminado con éxito.`);
    res.status(200).json({ status: "success", message: "Product deleted successfully" });
  } catch (error) {
    req.logger.error(`Error al eliminar el producto con ID ${req.params.pid}: ${error.message}`);
    if (error instanceof CustomError) {
      res.status(404).json({ code: error.code, message: error.message });
    } else {
      const errorInfo = generateDefaultErrorInfo(error.message);
      res.status(500).json(errorInfo);
    }
  }
};
