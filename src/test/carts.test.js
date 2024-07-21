import { expect } from "chai";
import mongoose from "mongoose";
import config from "../config/config.js";
import CartService from "../services/cartService.js";
import ProductService from "../services/productService.js";
import { generateProduct } from "../utils/mockingGenerate.js";

describe("Pruebas de carts", () => {
  let testProduct;
  const productMock = generateProduct();
  let cartId;

  // Antes de ejecutar
  before(async () => {
    await mongoose.connect(config.MONGO_TEST_URL);
    testProduct = await ProductService.createProduct(productMock);
  });

  // Después de ejecutar
  after(async () => {
    await ProductService.deleteProduct(testProduct._id);
  });

  it("Prueba de createCart", async () => {
    const cart = await CartService.createCart();
    expect(cart).to.have.property("_id");
    cartId = cart._id;
  });

  it("Prueba de getCartById", async () => {
    const cart = await CartService.getCartById(cartId);
    expect(cart).to.be.a("object").and.have.property("_id");
  });

  it("Prueba de addProductByID", async () => {
    const cart = await CartService.addProductByID(cartId, testProduct._id);
    expect(cart.products).to.be.a("array").and.not.have.length(0);
    expect(cart).to.have.property("_id");
    expect(cart._id.toString()).to.be.equal(cartId.toString());
    expect(cart).to.have.property("products").that.is.an("array").that.is.not.empty;
    const addedProduct = cart.products[0];
    expect(addedProduct).to.have.property("_id");
    expect(addedProduct._id.toString()).to.be.equal(testProduct._id.toString());
  });

  it("Prueba de deleteProductInCart", async () => {
    await CartService.deleteProductInCart(cartId, testProduct._id);
    const cart = await CartService.getCartById(cartId);
    expect(cart.products).to.be.a("array").and.have.length(0);
  });
});
