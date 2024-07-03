import { resetPasswordCodeModel } from "../../models/resetPasswordCode.model.js";

class resetPasswordManager {
  constructor() {}
  getCode = async (code) => {
    const resetCode = await resetPasswordCodeModel.findOne({ code }).lean();
    return resetCode;
  };

  saveCode = async (email, code) => {
    const newCode = await resetPasswordCodeModel.create({ email, code });
    return newCode;
  };
}

export default resetPasswordManager;
