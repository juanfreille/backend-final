import supertest from "supertest";
import { expect } from "chai";
import app from "../app.js";
import { generateUser } from "../utils/mockingGenerate.js";
import userService from "../services/userService.js";
import mongoose from "mongoose";
import config from "../config/config.js";

const requester = supertest(app);

describe("Pruebas integrales del módulo de Sessions", function () {
  this.timeout(5000); // Aumentamos el timeout

  // Conectar a la base de datos antes de todas las pruebas
  before(async () => {
    console.log("Conectando a la base de datos de pruebas...");
    await mongoose.connect(config.MONGO_TEST_URL);
  });

  // Cerrar la conexión a la base de datos después de todas las pruebas
  after(async () => {
    console.log("Cerrando la conexión a la base de datos...");
    await mongoose.connection.close();
    console.log("Conexión cerrada.");
  });

  // Generar un nuevo usuario para las pruebas
  let newUser = generateUser();
  // console.log("Usuario para registro:", newUser);

  describe("Pruebas de endpoints de Sessions", () => {
    // Limpiar el usuario creado después de cada prueba
    afterEach(async () => {
      await userService.deleteUserByEmail(newUser.email);
    });

    it("POST /api/sessions/register debe registrar un nuevo usuario", async () => {
      try {
        const res = await requester.post("/api/sessions/register").send(newUser);
        expect(res.status).to.equal(200); // Verifica el código de estado

        // Comprueba que el usuario fue creado correctamente
        const user = await userService.getUserByEmail(newUser.email);
        expect(user).to.be.an("object");
        expect(user).to.have.property("_id").and.not.null;
        expect(user.email).to.equal(newUser.email);
      } catch (error) {
        console.error("Error en la prueba de registro:", error);
        throw error;
      }
    });

    it("Debería obtener un usuario por ID correctamente", async () => {
      const createdUser = await userService.createUser(newUser);
      const fetchedUser = await userService.getUserById(createdUser._id);
      console.log("Usuario obtenido por ID:", fetchedUser.email);
      expect(fetchedUser).to.have.property("_id").and.not.null;
      expect(fetchedUser.email).to.equal(createdUser.email);
    });

    it("POST /api/sessions/login debe iniciar sesión", async () => {
      try {
        // Registrar el usuario antes de intentar iniciar sesión
        await requester.post("/api/sessions/register").send(newUser);

        // Intentar iniciar sesión con el usuario registrado
        const loginRes = await requester.post("/api/sessions/login").send({
          email: newUser.email,
          password: newUser.password,
        });
        console.log("respuesta de login:", loginRes.status);
        expect(loginRes.status).to.equal(200);
        expect(loginRes.body).to.have.property("status", "success");
        expect(loginRes.body).to.have.property("token").and.not.null;
      } catch (error) {
        console.error("Error en la prueba de login:", error);
        throw error;
      }
    });

    it("Debería eliminar un usuario por email correctamente", async () => {
      await userService.createUser(newUser); // Crear el usuario primero
      const deletionResult = await userService.deleteUserByEmail(newUser.email);
      console.log("Resultado de la eliminación:", deletionResult);

      const getUser = await userService.getUserByEmail(newUser.email);
      expect(getUser).to.be.null;
    });

    // Pruebas adicionales para casos límite y errores
    it("No debería registrar un usuario con un email ya existente", async () => {
      await requester.post("/api/sessions/register").send(newUser);
      try {
        const res = await requester.post("/api/sessions/register").send(newUser);
        expect(res.status).to.equal(400); // Verifica el código de estado
        expect(res.body).to.have.property("status", "error");
        expect(res.body).to.have.property("message").that.includes("El email ya está registrado");
      } catch (error) {
        console.error("Error en la prueba de email existente:", error);
        throw error;
      }
    });

    it("No debería iniciar sesión con credenciales incorrectas", async () => {
      await requester.post("/api/sessions/register").send(newUser);
      try {
        const res = await requester.post("/api/sessions/login").send({
          email: newUser.email,
          password: "wrongpassword",
        });
        console.log("respuesta de login con credenciales incorrectas:", res.body);
        expect(res.status).to.equal(400); // Verifica el código de estado
        expect(res.body).to.have.property("status", "error");
        expect(res.body).to.have.property("message").that.includes("Inicio de sesión fallido");
      } catch (error) {
        console.error("Error en la prueba de credenciales incorrectas:", error);
        throw error;
      }
    });
  });
});
