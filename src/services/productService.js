import ProductManager from "../dao/MongoDB/ProductManagerDB.js";

class ProductService {
  constructor() {
    this.productManager = new ProductManager();
  }

  async getAllProducts() {
    return await this.productManager.getAllProducts();
  }

  async getPaginateProducts(searchQuery, options) {
    return await this.productManager.getPaginateProducts(searchQuery, options);
  }

  async getProductByID(pid) {
    return await this.productManager.getProductByID(pid);
  }

  async createProduct(productData) {
    return await this.productManager.createProduct(productData);
  }

  async updateProduct(pid, productData) {
    return await this.productManager.updateProduct(pid, productData);
  }

  async deleteProduct(pid) {
    return await this.productManager.deleteProduct(pid);
  }

  async getDistinctCategories() {
    return await this.productManager.getDistinctCategories();
  }
}

export default new ProductService();
