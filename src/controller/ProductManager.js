import fs from "fs";
import { generateNewId } from "../middleware/idGenerator.js";
import { readFromFile, writeToFile } from "../middleware/fileManager.js";

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

  async getProducts() {
    return this.products;
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
    this.products.splice(index, 1);
    await this.saveProducts();
  }

  async saveProducts() {
    await writeToFile(this.path, this.products);
  }
}
