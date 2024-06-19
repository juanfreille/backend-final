import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const cartCollection = "carts";

const cartSchema = new mongoose.Schema({
  products: {
    type: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "products",
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],
    default: [],
  },
});
cartSchema.pre("find", function () {
  this.populate("products._id");
});
cartSchema.plugin(mongoosePaginate);

export const cartModel = mongoose.model(cartCollection, cartSchema);
