import { resetPasswordModel } from "../../models/resetPasswordModel.js";

export default class resetPasswordManager {
  async getCode(code) {
    const resetCode = await resetPasswordModel.findOne({ code }).lean();
    return resetCode;
  }

  async saveCode(email, code) {
    const newCode = await resetPasswordModel.create({ email, code });
    return newCode;
  }
}
