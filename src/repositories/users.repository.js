import { userModel } from "../models/userModel.js";

class UserRepository {
  async getAllUsers(filter) {
    try {
      const users = await userModel.find(filter).lean();
      return users;
    } catch (error) {
      console.log(error.message);
      throw new Error("Error al consultar los usuarios");
    }
  }

  async getUserById(id) {
    try {
      return await userModel.findById({ _id: id });
    } catch (error) {
      console.log(error.message);
      throw new Error("Usuario no encontrado");
    }
  }

  async getUserByEmail(email) {
    try {
      return await userModel.findOne({ email });
    } catch (error) {
      console.log(error.message);
      throw new Error("Usuario no encontrado");
    }
  }

  async createUser(user) {
    try {
      return await userModel.create(user);
    } catch (error) {
      console.log(error.message);
      throw new Error("Error al registrar usuario");
    }
  }

  async updateUser(user) {
    try {
      await userModel.findByIdAndUpdate(user._id, user);
      return user;
    } catch (error) {
      throw new Error("Error al actualizar el usuario en la base de datos");
    }
  }
}

export { UserRepository };
