import { resetPasswordModel } from "../models/resetPasswordModel.js";

class resetPasswordService {
  constructor() {}
  getCode = async (code) => {
    const resetCode = await resetPasswordModel.findOne({ code }).lean();
    return resetCode;
  };

  saveCode = async (email, code) => {
    const newCode = await resetPasswordModel.create({ email, code });
    return newCode;
  };
}

export default resetPasswordService;
