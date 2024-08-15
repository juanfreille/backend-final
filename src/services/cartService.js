export default class CartsRepository {
  constructor(dao) {
    this.dao = dao;
  }

  async getAllCarts() {
    return await this.dao.getAllCarts();
  }

  async getCartById(cid) {
    return await this.dao.getCartById(cid);
  }

  async createCart(products) {
    return await this.dao.createCart(products);
  }

  async addProductByID(cid, pid) {
    return await this.dao.addProductByID(cid, pid);
  }

  async deleteProductInCart(cid, pid) {
    return await this.dao.deleteProductInCart(cid, pid);
  }

  async updateCart(cid, products) {
    return await this.dao.updateCart(cid, products);
  }

  async updateProductQuantity(cid, pid, quantity) {
    return await this.dao.updateProductQuantity(cid, pid, quantity);
  }

  async clearCart(cid) {
    return await this.dao.clearCart(cid);
  }

  async getTotalQuantityInCart(cid) {
    return await this.dao.getTotalQuantityInCart(cid);
  }

  async insertArray(cid, purchaseError) {
    return await this.dao.insertArray(cid, purchaseError);
  }

  async deleteCart(cid) {
    return await this.dao.deleteCart(cid);
  }
}
