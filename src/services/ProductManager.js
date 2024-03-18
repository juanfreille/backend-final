import { generateNewId } from "../middlewares/idGenerator.js";
import { readFromFile, writeToFile } from "../middlewares/fileManager.js";

export default class ProductManager {
  constructor(path) {
    this.path = path;
    this.products = [];
    this.init();
  }

  async init() {
    this.products = await readFromFile(this.path);
  }

  async addProduct(product) {
    const prodExist = this.products.find((p) => p.code === product.code);
    if (prodExist) {
      console.error(`Ya existe un producto con el código "${product.code}".`);
      return false;
    }

    const newProduct = {
      id: generateNewId(this.products),
      ...product,
      status: true,
    };
    this.products.push(newProduct);
    await this.saveProducts();
    console.log("Producto agregado:", newProduct);
    return true;
  }

  async getProducts(limit) {
    const limitedProducts = limit
      ? this.products.slice(0, limit)
      : this.products;
    return limitedProducts;
  }

  getProductById(id) {
    return this.products.find((product) => product.id === id);
  }

  async updateProduct(id, product) {
    const productToUpdate = this.getProductById(id);
    if (!productToUpdate) return;
    for (const key in product) {
      if (key !== "id") productToUpdate[key] = product[key];
    }
    await this.saveProducts();
  }

  async deleteProduct(id) {
    const index = this.products.findIndex((product) => product.id === id);
    if (index === -1) return;
    const deletedProduct = this.products.splice(index, 1)[0];
    await this.saveProducts();
    return deletedProduct;
  }

  async saveProducts() {
    await writeToFile(this.path, this.products);
  }
}
