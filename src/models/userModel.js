import mongoose from "mongoose";

const userCollection = "users";

const userSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number },
  password: { type: String },
  cart: { type: mongoose.Schema.Types.ObjectId, ref: "carts" },
  role: { type: String, enum: ["user", "admin", "premium"], default: "user" },
  avatar: { name: String, reference: String },
  documents: { type: [{ name: String, reference: String, docType: { type: String, enum: ["dni", "domicilio", "cuenta"] } }] },
  last_connection: { type: Date, default: Date.now },
});
userSchema.pre("find", function (next) {
  this.populate("cart");
  next();
});

export const userModel = mongoose.model(userCollection, userSchema);
