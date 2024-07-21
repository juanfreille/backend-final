import { expect } from "chai";
import mongoose from "mongoose";
import config from "../config/config.js";
import ProductService from "../services/productService.js";
import { generateProduct } from "../utils/mockingGenerate.js";

describe("Pruebas de products", () => {
  let testProduct;
  let productMock = generateProduct();

  // Antes de cada prueba
  beforeEach(async () => {
    try {
      await mongoose.connect(config.MONGO_TEST_URL);
      testProduct = await ProductService.createProduct(productMock);
    } catch (error) {
      console.error(error);
    }
  });

  // Después de cada prueba
  afterEach(async () => {
    try {
      await mongoose.connection.db.dropCollection("products");
    } catch (error) {
      console.error(error);
    }
  });

  it("Prueba de getAllProducts", async () => {
    const products = await ProductService.getAllProducts();
    expect(products).to.be.an("array");
  });

  it("Prueba de createProduct", async () => {
    const newProduct = await ProductService.createProduct(testProduct);
    expect(newProduct).to.have.property("_id").and.not.null;
  });

  it("Prueba de getProductByID", async () => {
    const getProduct = await ProductService.getProductByID(testProduct._id);
    expect(getProduct).to.have.property("_id").and.not.null;
    expect(getProduct._id.toString()).to.equal(testProduct._id.toString());
    expect(getProduct.code).to.equal(testProduct.code);
  });

  it("Prueba de deleteProduct", async () => {
    const response = await ProductService.deleteProduct(testProduct._id);
    const productsNull = await ProductService.getAllProducts();
    expect(productsNull).to.be.an("array").that.is.empty;
  });
});
