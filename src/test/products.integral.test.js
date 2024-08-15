import { expect } from "chai";
import { productService } from "../services/index.js";
import { generateProduct } from "../utils/mockingGenerate.js";
import { connectDB, disconnectDB } from "./test-setup.js";

describe("Pruebas integrales del módulo de productos", () => {
  before(async () => {
    await connectDB();
  });

  after(async () => {
    await disconnectDB();
  });

  it("Prueba de operaciones CRUD de productos", async () => {
    // Crear producto

    let productMock = generateProduct();

    const createdProduct = await productService.createProduct(productMock);
    expect(createdProduct).to.have.property("_id").and.not.null;

    // Obtener producto por ID
    const fetchedProduct = await productService.getProductByID(createdProduct._id);
    expect(fetchedProduct).to.have.property("_id").and.not.null;
    expect(fetchedProduct.title).to.equal(productMock.title);

    // Actualizar producto
    const updatedProductMock = { ...productMock, price: 150 };
    const updatedProduct = await productService.updateProduct(createdProduct._id, updatedProductMock);
    expect(updatedProduct).to.have.property("_id").and.not.null;
    expect(updatedProduct.price).to.equal(150);

    // Eliminar producto
    const deletionResult = await productService.deleteProduct(createdProduct._id);
    const getProduct = await productService.getProductByID(createdProduct._id);
    expect(getProduct).to.be.null;
  });
});
