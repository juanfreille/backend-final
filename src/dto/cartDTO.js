export default class CartDTO {
  constructor(cart) {
    this.id = cart._id;
    this.products = cart.products.map((productInCart) => {
      const productData = productInCart.product;
      return {
        id: productData._id,
        quantity: productInCart.quantity,
        title: productData.title,
        price: productData.price,
        thumbnails: productData.thumbnails,
      };
    });
  }
}
