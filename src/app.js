import express from "express";
import session from "express-session";
import mongoStore from "connect-mongo";
import productsRouter from "./routes/products.router.js";
import cartsRouter from "./routes/carts.router.js";
import sessionsRouter from "./routes/sessions.router.js";
import viewsRouter from "./routes/views.router.js";
import mockingRouter from "./routes/mocking.router.js";
import loggerRouter from "./routes/logger.router.js";
import mailRouter from "./routes/mail.router.js";
import usersRouter from "./routes/users.router.js";
import handlebars from "express-handlebars";
import __dirname from "./utils/constantsUtil.js";
import { Server } from "socket.io";
import Sockets from "./sockets.js";
import mongoose from "mongoose";
import passport from "passport";
import initializePassport from "./config/passport.config.js";
import cookieParser from "cookie-parser";
import config from "./config/config.js";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUiExpress from "swagger-ui-express";

const app = express();
const port = config.PORT;
// const uri = config.MONGO_URL;
const uri = config.NODE_ENV === "test" ? config.MONGO_TEST_URL : config.MONGO_URL;

const swaggerOptions = {
  definition: {
    openapi: "3.0.1",
    info: {
      title: "Documentacion JIF Style Ecommerce",
      description: "API pensada para aplicacion de un Marketplace",
    },
  },
  apis: [`${__dirname}/../docs/**/*.yaml`],
};

const specs = swaggerJsdoc(swaggerOptions);
app.use("/api/docs", swaggerUiExpress.serve, swaggerUiExpress.setup(specs));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(
  session({
    store: mongoStore.create({
      mongoUrl: uri,
      ttl: 60, // 60 minutos
    }),
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

initializePassport();
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());

// Routes
app.use("/", viewsRouter);
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/api/mocking", mockingRouter);
app.use("/loggerTest", loggerRouter);
app.use("/mail", mailRouter);
app.use("/api/users", usersRouter);

// Handlebars
app.engine("handlebars", handlebars.engine());
app.set("view engine", "handlebars");
app.set("views", __dirname + "/../views");

// Mongoose
mongoose
  .connect(uri, { dbName: config.NODE_ENV === "test" ? "test" : "ecommerce" })
  .then(() => {
    console.log("Conexión exitosa a la base de datos");
    const server = app.listen(port, () => console.log(`Servidor corriendo en http://localhost:${port}`));

    // WebSocket
    const io = new Server(server);
    Sockets(io);
  })
  .catch((error) => {
    console.log("No se puede conectar con la DB: " + error);
    process.exit(1);
  });

export default app;
