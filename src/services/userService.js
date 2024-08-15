export default class UsersRepository {
  constructor(dao) {
    this.dao = dao;
  }

  getAllUsers = async (filter) => {
    return await this.dao.getAllUsers(filter);
  };

  getUserById = async (id) => {
    return await this.dao.getUserById(id);
  };

  getUserByEmail = async (email) => {
    return await this.dao.getUserByEmail(email);
  };

  createUser = async (user) => {
    return await this.dao.createUser(user);
  };

  updateUser = async (uid, user) => {
    return await this.dao.updateUser(uid, user);
  };

  updateUserByEmail = async (userEmail, user) => {
    return await this.dao.updateUserByEmail(userEmail, user);
  };

  deleteUserByEmail = async (userEmail) => {
    return await this.dao.deleteUserByEmail(userEmail);
  };

  deleteUserById = async (uid) => {
    return await this.dao.deleteUserById(uid);
  };

  deleteUsers = async (filter) => {
    return await this.dao.deleteUsers(filter);
  };
}
