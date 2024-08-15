import mongoose from "mongoose";

const password_reset_codes_collection = "resetPasswordCodes";
const reset_code_expiration_time = 360;

const resetPasswordSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    match: [/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/, "Por favor, introduce un correo electrónico válido."],
  },
  code: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: reset_code_expiration_time },
});

export const resetPasswordModel = mongoose.model(password_reset_codes_collection, resetPasswordSchema);
