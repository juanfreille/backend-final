export default class ProductsRepository {
  constructor(dao) {
    this.dao = dao;
  }

  async getAllProducts() {
    return await this.dao.getAllProducts();
  }
  async getPaginateProducts(searchQuery, options) {
    return await this.dao.getPaginateProducts(searchQuery, options);
  }

  async getProductByID(pid) {
    return await this.dao.getProductByID(pid);
  }

  async createProduct(productData) {
    return await this.dao.createProduct(productData);
  }

  async updateProduct(pid, productData) {
    return await this.dao.updateProduct(pid, productData);
  }

  async deleteProduct(pid) {
    return await this.dao.deleteProduct(pid);
  }

  async getDistinctCategories() {
    return await this.dao.getDistinctCategories();
  }
}
