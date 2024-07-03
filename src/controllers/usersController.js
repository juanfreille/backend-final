import userService from "../services/userService.js";

export const getUsers = async (req, res) => {
  const users = await userService.getAllUsers();
  req.logger.info(`Usuarios obtenidos: ${users.length}`);
  res.status(200).send({ status: "success", users: users });
};

export const premiumController = async (req, res) => {
  const { uid } = req.params;
  req.logger.info(`Solicitud para cambiar el rol del usuario: ${uid}`);

  try {
    const user = await userService.getUserById(uid);

    switch (user.role) {
      case "user":
        user.role = "premium";
        break;
      case "premium":
        user.role = "user";
        break;
    }

    const updateUser = await userService.updateUser(uid, user);
    req.logger.info(`Usuario actualizado a rol: ${user.role}`);
    res.status(200).send({ status: "success", user: user });
  } catch (error) {
    req.logger.error(`Error al cambiar el rol del usuario ${uid}: ${error.message}`);
    res.status(500).send({ status: "error", message: "Error al cambiar el rol del usuario" });
  }
};
