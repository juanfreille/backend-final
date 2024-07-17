import UserManager from "../dao/MongoDB/UserManagerDB.js";

const userManager = new UserManager();

const getAllUsers = async (filter) => {
  return await userManager.getAllUsers(filter);
};

const getUserById = async (id) => {
  return await userManager.getUserById(id);
};

const getUserByEmail = async (email) => {
  return await userManager.getUserByEmail(email);
};

const createUser = async (user) => {
  return await userManager.createUser(user);
};

const updateUser = async (uid, user) => {
  return await userManager.updateUser(uid, user);
};

const updateUserByEmail = async (userEmail, user) => {
  return await userManager.updateUserByEmail(userEmail, user);
};

const deleteUserByEmail = async (userEmail) => {
  return await userManager.deleteUserByEmail(userEmail);
};

export default {
  getAllUsers,
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  updateUserByEmail,
  deleteUserByEmail,
};
