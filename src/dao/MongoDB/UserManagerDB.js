import { userModel } from "../../models/userModel.js";

export default class UserManager {
  async getAllUsers(filter) {
    try {
      const users = await userModel.find(filter).lean();
      return users;
    } catch (error) {
      throw new Error("Error al consultar los usuarios");
    }
  }

  async getUserById(id) {
    try {
      const user = await userModel.findById(id).populate("cart").lean();
      return user;
    } catch (error) {
      throw new Error("Usuario no encontrado");
    }
  }

  async getUserByEmail(email) {
    try {
      return await userModel.findOne({ email });
    } catch (error) {
      throw new Error("Usuario no encontrado");
    }
  }

  async createUser(user) {
    try {
      return await userModel.create(user);
    } catch (error) {
      throw error;
    }
  }

  async updateUser(uid, user) {
    try {
      return await userModel.updateOne({ _id: uid }, user);
    } catch (error) {
      throw new Error("Error al actualizar el usuario en la base de datos");
    }
  }

  async updateUserByEmail(userEmail, user) {
    try {
      return await userModel.updateOne({ email: userEmail }, user);
    } catch (error) {
      throw new Error("Error al actualizar el usuario en la base de datos");
    }
  }

  async deleteUserByEmail(userEmail) {
    try {
      return await userModel.deleteOne({ email: userEmail });
    } catch (error) {
      throw new Error("Error al eliminar usuario");
    }
  }
  async deleteUserById(uid) {
    try {
      return await userModel.deleteOne({ _id: uid });
    } catch (error) {
      throw new Error("Error al eliminar usuario");
    }
  }

  async deleteUsers(filter) {
    try {
      return await userModel.deleteMany(filter);
    } catch (error) {
      throw new Error("Error al eliminar usuarios");
    }
  }
}
