export default class ResetTokensRepository {
  constructor(dao) {
    this.dao = dao;
  }

  getCode = async (email, token) => {
    const resetToken = await this.dao.getCode(email, token);
    return resetToken;
  };

  saveCode = async (email, token) => {
    const newToken = await this.dao.saveCode(email, token);
    return newToken;
  };
}
