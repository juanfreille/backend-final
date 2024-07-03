import { userModel } from "../models/userModel.js";

class UserRepository {
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
      throw new Error("Error al registrar usuario");
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
}

export { UserRepository };
