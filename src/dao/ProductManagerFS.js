import { readFromFile, writeToFile } from "../utils/fileManager.js";
import { generateNewId } from "../utils/idGenerator.js";
import { productValidator } from "../utils/productValidator.js";

class productManagerFS {
  constructor(file) {
    this.file = file;
  }

  async getAllProducts() {
    try {
      const products = await readFromFile(this.file);
      return JSON.parse(products);
    } catch (error) {
      console.error(error.message);
      return [];
    }
  }

  async getProductByID(pid) {
    const products = await this.getAllProducts();
    const productFilter = products.filter((product) => product.id == pid);
    if (productFilter.length > 0) {
      return productFilter[0];
    }
    throw new Error(`El producto ${pid} no existe!`);
  }

  async createProduct(product) {
    productValidator(product);

    const { title, description, code, price, stock, category, thumbnails } =
      product;
    const parsedPrice = parseFloat(price);
    const parsedStock = parseFloat(stock);

    const products = await this.getAllProducts();
    const newProduct = {
      id: generateNewId(products),
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
    const {
      title,
      description,
      code,
      price,
      status,
      stock,
      category,
      thumbnails,
    } = productUpdate;

    const updatedPrice = parseFloat(price);
    const updatedStock = parseFloat(stock);

    const products = await this.getAllProducts();
    let i = 0;
    const productIndex = products.findIndex((product, index) => {
      i = index;
      return product.id === parseInt(pid);
    });
    if (productIndex !== -1) {
      products[productIndex].title = title || products[productIndex].title;
      products[productIndex].description =
        description || products[productIndex].description;
      products[productIndex].code = code || products[productIndex].code;
      products[productIndex].price =
        updatedPrice || products[productIndex].price;
      products[productIndex].status = status || products[productIndex].status;
      products[productIndex].stock =
        updatedStock || products[productIndex].stock;
      products[productIndex].category =
        category || products[productIndex].category;
      products[productIndex].thumbnails =
        thumbnails || products[productIndex].thumbnails;
      try {
        await writeToFile(this.file, products);
        return products[productIndex];
      } catch (error) {
        throw new Error(`Error al actualizar el producto`);
      }
    } else {
      throw new Error(`El producto ${pid} no existe`);
    }
  }

  async deleteProduct(pid) {
    const products = await this.getAllProducts();
    const updatedProducts = products.filter((product) => product.id != pid);

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
}
export { productManagerFS };
