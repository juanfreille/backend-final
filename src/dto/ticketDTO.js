export default class ticketDTO {
  constructor(ticket) {
    this._id = ticket._id;
    this.code = ticket.code;
    this.purchaseDateTime = ticket.purchaseDateTime;
    this.amount = ticket.amount;
    this.purchaser = ticket.purchaser;
    this.products = ticket.products;
  }
}
