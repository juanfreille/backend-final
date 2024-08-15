import path from "path";
import __dirname from "../../utils/constantsUtil.js";
import { readFromFile, writeToFile } from "../../utils/fileManager.js";
import { ObjectId } from "mongodb";
import { productValidator } from "../../utils/productValidator.js";

export default class productManager {
  constructor() {
    this.file = path.join(__dirname, "../../data/products.json");
  }

  async getAllProducts(filter, options) {
    try {
      const products = await readFromFile(this.file);
      return JSON.parse(products);
    } catch (error) {
      console.error(error.message);
      return [];
    }
  }

  getPaginateProducts = async (filter, options) => {
    try {
      let products = await this.getAllProducts();

      if (Object.keys(filter).length > 0) {
        products = products.filter((product) => {
          for (let key in filter) {
            if (product[key] !== filter[key]) {
              return false;
            }
          }
          return true;
        });
      }
      if (options.sort) {
        products.sort((a, b) => options.sort * (a.price - b.price));
      }

      const totalPages = Math.ceil(products.length / options.limit);
      const start = (options.page - 1) * options.limit;
      const end = start + options.limit;
      products = products.slice(start, end);

      return {
        docs: products,
        totalDocs: products.length,
        limit: options.limit,
        totalPages: totalPages,
        page: options.page,
        pagingCounter: start + 1,
        hasPrevPage: options.page > 1,
        hasNextPage: options.page < totalPages,
        prevPage: options.page > 1 ? options.page - 1 : null,
        nextPage: options.page < totalPages ? options.page + 1 : null,
      };
    } catch (error) {
      console.log("Error al obtener productos con consulta:", error.message);
      return "Error al obtener productos con consulta: " + error.message;
    }
  };

  async getProductByID(pid) {
    const products = await this.getAllProducts();
    for (const item of products) {
      if (item._id === pid) {
        return item;
      }
    }
    return "Not found";
  }

  async createProduct(product) {
    productValidator(product);

    const { title, description, code, price, stock, category, thumbnails } = product;
    const parsedPrice = parseFloat(price);
    const parsedStock = parseFloat(stock);

    const products = await this.getAllProducts();
    const newProduct = {
      id: new ObjectId(),
      title,
      description,
      code,
      price: parsedPrice,
      status: true,
      stock: parsedStock,
      category,
      thumbnails: thumbnails ?? [],
    };
    products.push(newProduct);
    try {
      await writeToFile(this.file, products);
      return newProduct;
    } catch (error) {
      throw new Error("Error al crear el producto");
    }
  }

  async updateProduct(pid, productUpdate) {
    const products = await this.getAllProducts();
    const productIndex = products.findIndex((product) => product._id.toString() === pid.toString());
    if (productIndex !== -1) {
      const product = products[productIndex];

      // Actualiza solo los campos presentes en productUpdate
      if (productUpdate.title !== undefined) product.title = productUpdate.title;
      if (productUpdate.description !== undefined) product.description = productUpdate.description;
      if (productUpdate.code !== undefined) product.code = productUpdate.code;
      if (productUpdate.price !== undefined) product.price = parseFloat(productUpdate.price);
      if (productUpdate.status !== undefined) product.status = productUpdate.status;
      if (productUpdate.stock !== undefined) product.stock = parseFloat(productUpdate.stock);
      if (productUpdate.category !== undefined) product.category = productUpdate.category;
      if (productUpdate.thumbnails !== undefined) product.thumbnails = productUpdate.thumbnails;

      try {
        await writeToFile(this.file, products);
        return product;
      } catch (error) {
        throw new Error(`Error al actualizar el producto: ${error.message}`);
      }
    } else {
      throw new Error(`El producto ${pid} no existe`);
    }
  }

  async deleteProduct(pid) {
    const products = await this.getAllProducts();
    const updatedProducts = products.filter((product) => product._id != pid);

    if (updatedProducts.length === products.length) {
      throw new Error(`El producto ${pid} no existe!`);
    }

    try {
      await writeToFile(this.file, updatedProducts);
      return updatedProducts;
    } catch (error) {
      throw new Error(`Error al eliminar el producto ${pid}`);
    }
  }
  async getDistinctCategories() {
    try {
      const products = await this.getAllProducts();
      const categoriesSet = new Set();

      products.forEach((product) => {
        if (product.category) {
          categoriesSet.add(product.category);
        }
      });

      return Array.from(categoriesSet);
    } catch (error) {
      console.error("Error al obtener categorías únicas:", error);
      throw error;
    }
  }
}
