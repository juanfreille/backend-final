import { ProductRepository } from "../../repositories/products.repository.js";

class ProductManagerDB {
  constructor() {
    this.productRepository = new ProductRepository();
  }

  async getAllProducts() {
    return await this.productRepository.getAllProducts();
  }

  async getPaginateProducts(filter, options) {
    return await this.productRepository.getPaginateProducts(filter, options);
  }

  async getProductByID(pid) {
    return await this.productRepository.getProductByID(pid);
  }

  async createProduct(product) {
    return await this.productRepository.createProduct(product);
  }

  async updateProduct(pid, productUpdate) {
    return await this.productRepository.updateProduct(pid, productUpdate);
  }

  async deleteProduct(pid) {
    return await this.productRepository.deleteProduct(pid);
  }
}

export default ProductManagerDB;
