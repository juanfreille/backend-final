import { expect } from "chai";
import mongoose from "mongoose";
import config from "../config/config.js";
import ProductService from "../services/productService.js";

describe("Pruebas integrales del módulo de productos", () => {
  before(async () => {
    await mongoose.connect(config.MONGO_TEST_URL);
  });

  after(async () => {
    await mongoose.connection.close();
  });

  it("Prueba de operaciones CRUD de productos", async () => {
    // Crear producto
    const productMock = {
      title: "Camiseta de Futbol",
      description: "Ultima camiseta de futbol de Argentina",
      price: 90000,
      thumbnail: [""],
      code: "PPP123",
      stock: 25,
      category: "remeras",
    };
    const createdProduct = await ProductService.createProduct(productMock);
    expect(createdProduct).to.have.property("_id").and.not.null;

    // Obtener producto por ID
    const fetchedProduct = await ProductService.getProductByID(createdProduct._id);
    expect(fetchedProduct).to.have.property("_id").and.not.null;
    expect(fetchedProduct.title).to.equal(productMock.title);

    // Actualizar producto
    const updatedProductMock = { ...productMock, price: 150 };
    const updatedProduct = await ProductService.updateProduct(createdProduct._id, updatedProductMock);
    expect(updatedProduct).to.have.property("_id").and.not.null;
    expect(updatedProduct.price).to.equal(150);

    // Eliminar producto
    const deletionResult = await ProductService.deleteProduct(createdProduct._id);
    const getProduct = await ProductService.getProductByID(createdProduct._id);
    expect(getProduct).to.be.null;
  });
});
