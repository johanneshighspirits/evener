import { TransferType } from '../types/common'
import User from './User'

export default class Transfer {
  date: Date
  constructor(
    public amount: number,
    date: string,
    public transferType: TransferType,
    public message: string,
    public paidBy: User,
    public receiver: User
  ) {
    this.date = new Date(date)
  }

  shortDate = () => {
    const options = {
      year: '2-digit',
      month: 'short',
      day: 'numeric'
    }
    return this.date.toLocaleDateString('sv-SE', options).replace('.', '')
  }

  transferTypeToString = () => {
    switch (this.transferType) {
      case TransferType.income:
        return '+'
      case TransferType.payment:
        return '-'
      case TransferType.repayment:
        return '='
      default:
        console.error('Found no TransferType for', this.transferType)
        break
    }
  }

  serialize = (uid: string) => {
    const { date, paidBy, receiver, amount, message, transferType } = this
    return {
      date: date.toISOString(),
      paidBy: paidBy ? paidBy.uid : '',
      receiver: receiver ? receiver.uid : '',
      amount,
      message,
      transferType,
      uid
    }
  }
}
