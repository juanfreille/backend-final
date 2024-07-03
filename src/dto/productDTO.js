export default class ProductDTO {
  constructor(product) {
    this.title = product.title;
    this.description = product.description;
    this.code = product.code;
    this.price = product.price;
    this.stock = product.stock;
    this.category = product.category;
    this.thumbnails = product.thumbnails || [];
    this.owner = product.owner;
  }
}
