import { TransferType } from '../types/common'
import User from './User'

export default class Transfer {
  date: Date
  paidBy: User | undefined
  receiver: User | undefined
  constructor(
    public id: string,
    public amount: number,
    date: string,
    public transferType: TransferType,
    public message: string,
    paidBy: User | undefined,
    receiver: User | undefined
  ) {
    this.date = new Date(date)
    if (paidBy) this.paidBy = paidBy
    if (receiver) this.receiver = receiver
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

  /**
   * Convert Transfer to prepare for firestore
   */
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

  /**
   * Return Transfer from firestore doc
   */
  static fromSnapshot = (
    transferDoc: firebase.firestore.DocumentSnapshot,
    users: { [key: string]: User }
  ) => {
    let transferData = transferDoc.data()
    let { amount, date, transferType, message, paidBy, receiver } = transferData
    let paidByUser = users[paidBy]
    let receiverUser = users[receiver]
    return new Transfer(
      transferDoc.id,
      amount,
      date,
      transferType,
      message,
      paidByUser,
      receiverUser
    )
  }
}
