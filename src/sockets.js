import ProductManager from "./services/ProductManager.js";

export default (io) => {
  const productManager = new ProductManager("./data/products.json");

  io.on("connection", handleConnection);

  async function handleConnection(socket) {
    console.log(`Nuevo cliente conectado ${socket.id}`);
    emitProducts(socket);

    socket.on("add", async (product) => {
      await addProductAndEmit(product);
    });

    socket.on("delete", async (id) => {
      console.log("ID del producto a eliminar:", id);
      await deleteProductAndEmit(id);
    });
  }

  async function emitProducts(socket) {
    const productsList = await productManager.getProducts();
    //agrego un pequeño mod para utilizar img por defecto en caso de no tener thumbnail, despues ver si se puede mejorar
    productsList.forEach((product) => {
      if (!product.thumbnails || product.thumbnails.length === 0) {
        product.thumbnails = ["img/noThumbnails.webp"];
      }
    });

    socket.emit("products", productsList);
  }

  async function addProductAndEmit(product) {
    await productManager.addProduct(product);
    emitProducts(io);
  }

  async function deleteProductAndEmit(id) {
    await productManager.deleteProduct(id);
    emitProducts(io);
  }
};
