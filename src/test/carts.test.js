import { expect } from "chai";
import { cartService } from "../services/index.js";
import { productService } from "../services/index.js";
import { generateProduct } from "../utils/mockingGenerate.js";
import { connectDB, disconnectDB } from "./test-setup.js";

before(async () => {
  await connectDB();
});

after(async () => {
  await disconnectDB();
});

describe("Pruebas de carts", () => {
  let testProduct;
  const productMock = generateProduct();
  let cartId;

  // Antes de ejecutar cada prueba
  beforeEach(async () => {
    testProduct = await productService.createProduct(productMock);
    const cart = await cartService.createCart([]);
    cartId = cart._id;
  });

  // Después de ejecutar cada prueba
  afterEach(async () => {
    if (cartId) {
      await cartService.deleteCart(cartId);
    }
    if (testProduct) {
      await productService.deleteProduct(testProduct._id);
    }
  });

  it("Prueba de createCart", async () => {
    const cart = await cartService.createCart([]);
    expect(cart).to.have.property("_id");
    cartId = cart._id;
  });

  it("Prueba de getCartById", async () => {
    const cart = await cartService.getCartById(cartId);
    expect(cart).to.be.a("object").and.have.property("_id");
  });

  it("Prueba de addProductByID", async () => {
    const cart = await cartService.addProductByID(cartId, testProduct._id);
    expect(cart.products).to.be.a("array").and.not.have.length(0);
    expect(cart).to.have.property("_id");
    expect(cart._id.toString()).to.be.equal(cartId.toString());
    expect(cart).to.have.property("products").that.is.an("array").that.is.not.empty;
    const addedProduct = cart.products[0];
    expect(addedProduct).to.have.property("_id");
    expect(addedProduct._id.toString()).to.be.equal(testProduct._id.toString());
  });

  it("Prueba de updateProductQuantity", async () => {
    await cartService.addProductByID(cartId, testProduct._id);
    const newQuantity = 3;
    const updatedCart = await cartService.updateProductQuantity(cartId, testProduct._id, newQuantity);
    expect(updatedCart.products[0]).to.have.property("quantity", newQuantity);
  });

  it("Prueba de deleteProductInCart", async () => {
    await cartService.addProductByID(cartId, testProduct._id);
    await cartService.deleteProductInCart(cartId, testProduct._id);
    const cart = await cartService.getCartById(cartId);
    expect(cart.products).to.be.a("array").and.have.length(0);
  });

  it("Prueba de insertArray", async () => {
    const productsArray = [{ _id: testProduct._id, quantity: 5 }];
    const updatedCart = await cartService.insertArray(cartId, productsArray);
    expect(updatedCart.products).to.be.an("array").that.is.not.empty;
    expect(updatedCart.products[0]).to.have.property("quantity", 5);
  });

  it("Prueba de clearCart", async () => {
    await cartService.addProductByID(cartId, testProduct._id);
    const clearedCart = await cartService.clearCart(cartId);
    expect(clearedCart.products).to.be.an("array").that.is.empty;
  });

  it("Prueba de getTotalQuantityInCart", async () => {
    await cartService.addProductByID(cartId, testProduct._id);
    await cartService.updateProductQuantity(cartId, testProduct._id, 5);
    const totalQuantity = await cartService.getTotalQuantityInCart(cartId);
    expect(totalQuantity).to.equal(5);
  });
});
