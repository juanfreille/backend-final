import express from "express";
import session from "express-session";
import mongoStore from "connect-mongo";
import productsRouter from "./routes/products.router.js";
import cartsRouter from "./routes/carts.router.js";
import sessionsRouter from "./routes/sessions.router.js";
import viewsRouter from "./routes/views.router.js";
import mockingRouter from "./routes/mocking.router.js";
import handlebars from "express-handlebars";
import __dirname from "./utils/constantsUtil.js";
import { Server } from "socket.io";
import Sockets from "./sockets.js";
import mongoose from "mongoose";
import passport from "passport";
import initializatePassport from "./config/passport.config.js";
import cookieParser from "cookie-parser";
import config from "./config/config.js";

const app = express();
const port = config.PORT;
const uri = config.MONGO_URL;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

app.use(
  session({
    store: mongoStore.create({
      mongoUrl: uri,
      ttl: 60, // 60 minutos
    }),
    secret: config.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 3600000 }, // 60 minutos en milisegundos
  })
);

initializatePassport();
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/", viewsRouter);
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/api/mocking", mockingRouter);

// Handlebars
app.engine("handlebars", handlebars.engine());
app.set("view engine", "handlebars");
app.set("views", __dirname + "/../views");

// Mongoose
mongoose
  .connect(uri, { dbName: "ecommerce" })
  .then(() => {
    console.log("Conexión exitosa a la base de datos");
    const server = app.listen(port, () => console.log(`Servidor corriendo en http://localhost:${port}`));

    // Set up WebSocket server
    const io = new Server(server);
    Sockets(io);
  })
  .catch((error) => {
    console.log("No se puede conectar con la DB: " + error);
    process.exit(1);
  });
