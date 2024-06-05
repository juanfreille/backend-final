import { CartRepository } from "../../repositories/carts.repository.js";

class cartManager {
  constructor() {
    this.cartRepository = new CartRepository();
  }

  async getAllCarts() {
    return await this.cartRepository.getAllCarts();
  }

  async getCartById(cid) {
    return await this.cartRepository.getCartById(cid);
  }

  async createCart(products) {
    return await this.cartRepository.createCart(products);
  }

  async addProductByID(cid, pid) {
    return await this.cartRepository.addProductByID(cid, pid);
  }

  async deleteProductInCart(cid, pid) {
    return await this.cartRepository.deleteProductInCart(cid, pid);
  }

  async updateCart(cid, products) {
    return await this.cartRepository.updateCart(cid, products);
  }

  async updateProductQuantity(cid, productId, quantity) {
    return await this.cartRepository.updateProductQuantity(cid, productId, quantity);
  }

  async clearCart(cid) {
    return await this.cartRepository.clearCart(cid);
  }

  async getTotalQuantityInCart(cid) {
    return await this.cartRepository.getTotalQuantityInCart(cid);
  }
}

export { cartManager };
