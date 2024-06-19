import CartManager from "../dao/MongoDB/CartManagerDB.js";

class CartService {
  constructor() {
    this.cartManager = new CartManager();
  }

  async getAllCarts() {
    return await this.cartManager.getAllCarts();
  }

  async getCartById(cid) {
    return await this.cartManager.getCartById(cid);
  }

  async createCart(products) {
    return await this.cartManager.createCart(products);
  }

  async addProductByID(cid, pid) {
    return await this.cartManager.addProductByID(cid, pid);
  }

  async deleteProductInCart(cid, pid) {
    return await this.cartManager.deleteProductInCart(cid, pid);
  }

  async updateCart(cid, products) {
    return await this.cartManager.updateCart(cid, products);
  }

  async updateProductQuantity(cid, pid, quantity) {
    return await this.cartManager.updateProductQuantity(cid, pid, quantity);
  }

  async clearCart(cid) {
    return await this.cartManager.clearCart(cid);
  }

  async getTotalQuantityInCart(cid) {
    return await this.cartManager.getTotalQuantityInCart(cid);
  }

  async insertArray(cartId, purchaseError) {
    return await this.cartManager.insertArray(cartId, purchaseError);
  }
}

export default new CartService();
