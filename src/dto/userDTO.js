export default class userDTO {
  constructor(user) {
    this._id = user._id ? user._id : user.id;
    this.first_name = user.first_name;
    this.last_name = user.last_name;
    this.age = user.age;
    this.email = user.email;
    this.role = user.role || "user";
    // this.carts = user.cart || [];
  }
}
