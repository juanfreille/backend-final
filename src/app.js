import express from "express";
import productsRouter from "./routes/products.router.js";
import cartsRouter from "./routes/carts.router.js";

const app = express();
const port = 8080;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// app.use("/api/products", productsRouter);
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Gestión de productos</title>
      </head>
      <body>
        <h1>BackEnd: Gestión de productos para Entrega 3</h1>
        <p>Ingresar en <a href="/api/products">PRODUCTOS</a> para ver el listado completo de productos</p>
        <p>Ingresar en <a href="/api/carts">CARTS</a> para ver el listado de carritos</p>
      </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
