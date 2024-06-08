import { productModel } from "../models/productModel.js";

export class ProductRepository {
  async getAllProducts() {
    return await productModel.find();
  }

  async getPaginateProducts(filter, options) {
    return await productModel.paginate(filter, options);
  }

  async getProductByID(pid) {
    return await productModel.findById(pid).lean();
  }

  async createProduct(product) {
    const newProduct = new productModel(product);
    return await newProduct.save();
  }

  async updateProduct(pid, productData) {
    return await productModel.findByIdAndUpdate(pid, productData, { new: true });
  }

  async deleteProduct(pid) {
    return await productModel.findByIdAndDelete(pid);
  }

  async getDistinctCategories() {
    return await productModel.distinct("category");
  }
}
