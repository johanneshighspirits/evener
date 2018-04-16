import { TransferType } from '../types/common'
import User from './User'
import firebase from 'firebase'

interface ITransferData {
  amount: number
  date: string
  transferType: number
  message: string
  paidBy: string
  receiver: string
}

export default class Transfer {
  /**
   * Return Transfer from firestore doc
   */
  public static fromSnapshot = (
    transferDoc: firebase.firestore.DocumentSnapshot,
    users: { [key: string]: User }
  ) => {
    const transferData = transferDoc.data() as ITransferData
    const { amount, date, transferType, message, paidBy, receiver } = transferData
    const paidByUser = users[paidBy]
    const receiverUser = users[receiver]
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

  public static sortByDate = (transfers: Transfer[]): Transfer[] => {
    return transfers.sort((t1, t2) => {
      return t1.date.getTime() <= t2.date.getTime() ? 1 : -1
    })
  }

  public date: Date
  public paidBy: User | undefined
  public receiver: User | undefined
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
    if (paidBy) {
      this.paidBy = paidBy
    }
    if (receiver) {
      this.receiver = receiver
    }
  }

  public shortDate = () => {
    const options = {
      year: '2-digit',
      month: 'short',
      day: 'numeric'
    }
    return this.date.toLocaleDateString('sv-SE', options).replace('.', '')
  }

  public transferTypeToString = () => {
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

  public isEqual = (compareTransfer: Transfer): boolean => {
    return (
      compareTransfer.message === this.message &&
      compareTransfer.amount === this.amount &&
      compareTransfer.paidBy === this.paidBy &&
      compareTransfer.receiver === this.receiver &&
      compareTransfer.date.getTime() === this.date.getTime()
    )
  }

  /**
   * Convert Transfer to prepare for firestore
   */
  public serialize = (uid: string) => {
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
