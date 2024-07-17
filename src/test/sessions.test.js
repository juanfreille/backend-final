import supertest from "supertest";
import { expect } from "chai";
import mongoose from "mongoose";
import config from "../config/config.js";
import userService from "../services/userService.js";
import app from "../app.js";
import CartService from "../services/cartService.js";

const requester = supertest(app);

describe("Pruebas integrales del módulo de sesiones", () => {
  let newUser;
  let cookie;

  before(async () => {
    await mongoose.connect(config.MONGO_TEST_URL);

    // Crear un usuario de prueba
    newUser = {
      first_name: "John",
      last_name: "Doe",
      email: "john.doe@example.com",
      age: 30,
      cart: await CartService.createCart(),
      password: "123456",
    };
    await userService.createUser(newUser);
  });

  after(async () => {
    await userService.deleteUserByEmail(newUser.email);
    await mongoose.connection.close();
  });

  it("El usuario se crea correctamente en la base de datos", async function () {
    const userFromDB = await userService.getUserByEmail(newUser.email);
    expect(userFromDB).to.exist;
    expect(userFromDB.email).to.equal(newUser.email);
    expect(userFromDB.first_name).to.equal(newUser.first_name);
  });

  // it("POST /api/sessions/login debe loguear correctamente al usuario", async function () {
  //   const result = await requester.post("/api/sessions/login").send(newUser);
  //   const cookieData = result.headers["set-cookie"][0];
  //   cookie = { name: cookieData.split("=")[0], value: cookieData.split("=")[1] };

  //   expect(cookieData).to.be.ok;
  //   expect(cookie.name).to.be.equals("coderCookieToken");
  //   expect(cookie.value).to.be.ok;
  // });

  // it("El endpoint GET /api/sessions/current debe traer al usuario que contiene la cookie", async function () {
  //   const response = await requester.get("/api/sessions/current").set("Cookie", [`${cookie.name}=${cookie.value}`]);
  //   expect(response.body.payload.email).to.be.eql(newUser.email);
  // }).timeout(5000);

  // it("Prueba de cierre de sesión", async () => {
  //   const response = await requester.post("/api/sessions/logout").send();
  //   expect(response.status).to.equal(200);
  //   expect(response.body).to.have.property("status").and.equal("success");
  // });

  it("Prueba de eliminación de usuario", async () => {
    const response = await userService.deleteUserByEmail(newUser.email);
    expect(response).to.have.property("deletedCount").and.equal(1);
  });
});
