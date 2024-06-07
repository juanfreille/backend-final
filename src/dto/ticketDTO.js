export default class ticketDTO {
  constructor(ticket) {
    this.code = ticket.code;
    this.purchaseDateTime = ticket.purchaseDateTime;
    this.amount = ticket.amount;
    this.purchaser = ticket.purchaser;
  }
}
