import { UserRepository } from "../../repositories/users.repository.js";

class UserManager {
  constructor() {
    this.userRepository = new UserRepository();
  }

  async getAllUsers(filter) {
    return await this.userRepository.getAllUsers(filter);
  }

  async getUserById(id) {
    return await this.userRepository.getUserById(id);
  }

  async getUserByEmail(email) {
    return await this.userRepository.getUserByEmail(email);
  }

  async createUser(user) {
    return await this.userRepository.createUser(user);
  }

  async updateUser(user) {
    return await this.userRepository.updateUser(user);
  }
}

export default UserManager;
