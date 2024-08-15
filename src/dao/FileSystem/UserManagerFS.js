import path from "path";
import __dirname from "../../utils/constantsUtil.js";
import { readFromFile, writeToFile } from "../../utils/fileManager.js";
import { ObjectId } from "mongodb";

export default class UserManager {
  constructor() {
    this.file = path.join(__dirname, "../../data/users.json");
  }

  getAllUsers = async () => {
    try {
      const users = await readFromFile(this.file);
      return JSON.parse(users);
    } catch (error) {
      if (error.code === "ENOENT") {
        console.log("Archivo no encontrado, devolviendo array vacío.");
        return [];
      } else {
        console.error(error);
        throw new Error("Error al obtener usuarios");
      }
    }
  };

  getUserById = async (userId) => {
    try {
      const users = await this.getAllUsers();
      const user = users.find((user) => user._id === userId);
      return user;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  getUserByEmail = async (userEmail) => {
    try {
      const users = await this.getAllUsers();
      const user = users.find((user) => user.email === userEmail);
      return user;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  createUser = async (user) => {
    try {
      const { first_name, last_name, email, age, password, cart, role, documents, last_connection } = user;
      if (!first_name || !last_name || !email || !password) {
        throw new Error("Datos del usuario incompletos");
      }
      // Añadir validaciones adicionales aquí
      const userList = await this.getAllUsers();
      if (userList.find((u) => u.email === email)) {
        throw new Error("Email ya en uso");
      }
      user.age = age || null;
      user.cart = [cart] || [];
      user.documents = documents || [];
      user.role = role || "user";
      user.last_connection = last_connection || Date.now();
      user._id = new ObjectId();
      userList.push(user);
      await writeToFile(this.file, userList);
      return user;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  updateUser = async (idUser, user) => {
    try {
      const users = await this.getAllUsers();
      const updatedUsers = users.map((u) => (u._id === idUser ? { ...u, ...user } : u));
      await writeToFile(this.file, updatedUsers);
      return updatedUsers.find((u) => u._id === idUser);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  updateUserByEmail = async (userEmail, user) => {
    try {
      const users = await this.getAllUsers();
      const updatedUsers = users.map((u) => (u.email === userEmail ? { ...u, ...user } : u));
      await writeToFile(this.file, updatedUsers);
      return updatedUsers.find((u) => u.email === userEmail);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  deleteUserById = async (idUser) => {
    try {
      const users = await this.getAllUsers();
      const updatedUsers = users.filter((u) => u._id !== idUser);
      await writeToFile(this.file, updatedUsers);
      return updatedUsers;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };
}
