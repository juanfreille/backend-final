export default class ResetPasswordRepository {
  constructor(dao) {
    this.dao = dao;
  }

  getCode = async (code) => {
    const resetCode = await this.dao.getCode(code);
    return resetCode;
  };

  saveCode = async (email, code) => {
    const newCode = await this.dao.saveCode(email, code);
    return newCode;
  };
}
