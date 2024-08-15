import supertest from "supertest";
import { expect } from "chai";
import app from "../app.js";
import { generateUser } from "../utils/mockingGenerate.js";
import { userService, cartService } from "../services/index.js";
import { connectDB, disconnectDB } from "./test-setup.js";

const requester = supertest(app);

describe("Pruebas integrales del módulo de Sessions", function () {
  this.timeout(5000);

  before(async () => {
    await connectDB();
  });

  after(async () => {
    await disconnectDB();
  });

  let newUser;
  let userCartId;

  describe("Pruebas de endpoints de Sessions", () => {
    beforeEach(async () => {
      newUser = generateUser();
      userCartId = null;
    });

    afterEach(async () => {
      if (userCartId) {
        try {
          // console.log(`Intentando eliminar el carrito ${userCartId}`);
          await cartService.deleteCart(userCartId);
        } catch (err) {
          // console.error(`Error al eliminar el carrito ${userCartId}:`, err);
        }
      }
      if (newUser && newUser.email) {
        try {
          // console.log(`Intentando eliminar el usuario ${newUser.email}`);
          await userService.deleteUserByEmail(newUser.email);
        } catch (err) {
          // console.error(`Error al eliminar el usuario ${newUser.email}:`, err);
        }
      }
    });

    it("POST /api/sessions/register debe registrar un nuevo usuario", async () => {
      try {
        const res = await requester.post("/api/sessions/register").send(newUser);
        // console.log("Respuesta del registro:", res.body);
        expect(res.status).to.equal(200);

        const user = await userService.getUserByEmail(newUser.email);
        // console.log("Usuario después del registro:", user);
        expect(user).to.be.an("object");
        expect(user).to.have.property("_id").and.not.null;
        expect(user.email).to.equal(newUser.email);
        userCartId = user.cart;

        if (userCartId) {
          // console.log(`ID del Carrito asociado al usuario ${userCartId}`);
          await cartService.deleteCart(userCartId);
        }
      } catch (error) {
        // console.error("Error en la prueba de registro:", error);
        throw error;
      }
    });

    it("Debería obtener un usuario por ID correctamente", async () => {
      try {
        const createdUser = await userService.createUser(newUser);
        // console.log("Usuario creado:", createdUser);

        const fetchedUser = await userService.getUserById(createdUser._id);
        // console.log("Usuario obtenido por ID:", fetchedUser);
        userCartId = fetchedUser.cart;

        expect(fetchedUser).to.have.property("_id").and.not.null;
        expect(fetchedUser.email).to.equal(createdUser.email);

        if (userCartId) {
          // console.log(`ID del Carrito asociado al usuario ${userCartId}`);
          await cartService.deleteCart(userCartId);
        }
      } catch (error) {
        // console.error("Error en la prueba de obtención por ID:", error);
        throw error;
      }
    });

    it("POST /api/sessions/login debe iniciar sesión", async () => {
      try {
        await requester.post("/api/sessions/register").send(newUser);

        const loginRes = await requester.post("/api/sessions/login").send({
          email: newUser.email,
          password: newUser.password,
        });
        // console.log("Respuesta del login:", loginRes.body);
        expect(loginRes.status).to.equal(200);
        expect(loginRes.body).to.have.property("status", "success");
        expect(loginRes.body).to.have.property("token").and.not.null;

        const user = await userService.getUserByEmail(newUser.email);
        userCartId = user.cart;
        if (userCartId) {
          // console.log(`ID del Carrito asociado al usuario ${userCartId}`);
          await cartService.deleteCart(userCartId);
        }
      } catch (error) {
        // console.error("Error en la prueba de login:", error);
        throw error;
      }
    });

    it("Debería eliminar un usuario por email correctamente", async () => {
      try {
        await userService.createUser(newUser);
        const deletionResult = await userService.deleteUserByEmail(newUser.email);

        // console.log("Resultado de la eliminación del usuario:", deletionResult);

        const getUser = await userService.getUserByEmail(newUser.email);
        // console.log("Usuario después de la eliminación:", getUser);
        expect(getUser).to.be.null;
      } catch (error) {
        // console.error("Error en la prueba de eliminación del usuario:", error);
        throw error;
      }
    });

    it("No debería registrar un usuario con un email ya existente", async () => {
      try {
        await requester.post("/api/sessions/register").send(newUser);

        const user = await userService.getUserByEmail(newUser.email);
        userCartId = user.cart;
        if (userCartId) {
          // console.log(`ID del Carrito asociado al usuario ${userCartId}`);
          await cartService.deleteCart(userCartId);
        }

        const res = await requester.post("/api/sessions/register").send(newUser);
        // console.log("Respuesta del registro con email existente:", res.body);
        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("status", "error");
        expect(res.body).to.have.property("message").that.includes("El email ya está registrado");
      } catch (error) {
        // console.error("Error en la prueba de email existente:", error);
        throw error;
      }
    });

    it("No debería iniciar sesión con credenciales incorrectas", async () => {
      try {
        await requester.post("/api/sessions/register").send(newUser);

        const res = await requester.post("/api/sessions/login").send({
          email: newUser.email,
          password: "wrongpassword",
        });

        const user = await userService.getUserByEmail(newUser.email);
        userCartId = user.cart;
        if (userCartId) {
          // console.log(`ID del Carrito asociado al usuario: ${userCartId}`);
          await cartService.deleteCart(userCartId);
        }

        // console.log("Respuesta del login con credenciales incorrectas:", res.body);
        expect(res.status).to.equal(400);
        expect(res.body).to.have.property("status", "error");
        expect(res.body).to.have.property("message").that.includes("Inicio de sesión fallido");
      } catch (error) {
        // console.error("Error en la prueba de credenciales incorrectas:", error);
        throw error;
      }
    });
  });
});
