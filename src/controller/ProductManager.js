import fs from "fs";
import { generateNewId } from "../middleware/idGenerator.js";

export default class ProductManager {
  constructor(path) {
    this.path = path;
    this.products = [];
    this.init();
  }

  async init() {
    try {
      const data = await fs.promises.readFile(this.path, "utf-8");
      this.products = JSON.parse(data);
    } catch (error) {
      console.error("Error al cargar los productos:", error);
    }
  }

  async addProduct(product) {
    const prodExist = this.products.find((p) => p.code === product.code);
    if (prodExist) {
      console.error(`Ya existe un producto con el código "${product.code}".`);
      return false;
    }

    const newProduct = {
      id: this.generateNewId(),
      ...product,
      status: true,
    };
    this.products.push(newProduct);
    await this.saveProducts();
    console.log("Producto agregado:", newProduct);
    return true;
  }

  generateNewId() {
    return generateNewId(this.products);
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
    try {
      const data = JSON.stringify(this.products, null, 2);
      await fs.promises.writeFile(this.path, data);
    } catch (error) {
      console.error("Error al guardar los productos:", error);
    }
  }
}
