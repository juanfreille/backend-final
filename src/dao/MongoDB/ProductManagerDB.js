import { ProductRepository } from "../../repositories/products.repository.js";

class ProductManager {
  constructor() {
    this.productRepository = new ProductRepository();
  }

  getAllProducts() {
    return this.productRepository.getAllProducts();
  }

  getPaginateProducts(filter, options) {
    return this.productRepository.getPaginateProducts(filter, options);
  }

  getProductByID(pid) {
    return this.productRepository.getProductByID(pid);
  }

  createProduct(product) {
    return this.productRepository.createProduct(product);
  }

  updateProduct(pid, productUpdate) {
    return this.productRepository.updateProduct(pid, productUpdate);
  }

  deleteProduct(pid) {
    return this.productRepository.deleteProduct(pid);
  }

  getDistinctCategories() {
    return this.productRepository.getDistinctCategories();
  }
}

export default ProductManager;
