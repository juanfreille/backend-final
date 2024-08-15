import { expect } from "chai";
import mongoose from "mongoose";
import { productService } from "../services/index.js";
import { generateProduct } from "../utils/mockingGenerate.js";
import { connectDB, disconnectDB } from "./test-setup.js";

describe("Pruebas de products", () => {
  let testProduct;
  let productMock = generateProduct();

  // Antes de cada prueba
  before(async () => {
    await connectDB();
  });

  // Después de ejecutar todas las pruebas
  after(async () => {
    await disconnectDB();
  });

  // Antes de cada prueba
  beforeEach(async () => {
    testProduct = await productService.createProduct(productMock);
  });

  // Después de cada prueba
  afterEach(async () => {
    await mongoose.connection.db.dropCollection("products");
  });

  it("Prueba de getAllProducts", async () => {
    const products = await productService.getAllProducts();
    expect(products).to.be.an("array");
  });

  it("Prueba de createProduct", async () => {
    const newProduct = await productService.createProduct(testProduct);
    expect(newProduct).to.have.property("_id").and.not.null;
  });

  it("Prueba de getProductByID", async () => {
    const getProduct = await productService.getProductByID(testProduct._id);
    expect(getProduct).to.have.property("_id").and.not.null;
    expect(getProduct._id.toString()).to.equal(testProduct._id.toString());
    expect(getProduct.code).to.equal(testProduct.code);
  });

  it("Prueba de deleteProduct", async () => {
    const response = await productService.deleteProduct(testProduct._id);
    const productsNull = await productService.getAllProducts();
    expect(productsNull).to.be.an("array").that.is.empty;
  });
});
