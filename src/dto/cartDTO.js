export default class cartDTO {
  constructor(cart) {
    this.id = cart.id;
    if (Array.isArray(cart)) {
      this.products = cart.map((product) => {
        return {
          id: product.product,
          quantity: product.quantity,
          title: product.title,
          price: product.price,
          thumbnail: product.thumbnail,
        };
      });
    } else {
      this.products = [];
    }
  }
}
