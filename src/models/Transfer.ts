import { TransferType } from '../types/common'
import User from './User'

class Transfer {
  date: Date
  transferType: TransferType
  paidBy: User
  receiver: User
  constructor(
    public amount: number,
    date: string,
    transferType: TransferType,
    public message: string,
    paidBy: string,
    receiver: string
  ) {
    switch (transferType) {
      case 0:
        this.transferType = TransferType.income
        break
      case 1:
        this.transferType = TransferType.payment
        break
      case 2:
        this.transferType = TransferType.repayment
        break
      default:
        break
    }
    this.paidBy = User.userFrom(paidBy)
    this.receiver = User.userFrom(receiver)
    this.date = new Date(date)
  }
}

export default Transfer
