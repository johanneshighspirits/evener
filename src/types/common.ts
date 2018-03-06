import Transfer from '../models/Transfer'
import User from '../models/User'

export enum TransferType {
  income = 0,
  payment,
  repayment
}

export interface JSONTransfer {
  date: string
  paidBy: string
  receiver: string
  amount: number
  message: string
  transferType: number
  uid: string
}

export interface UserInfo {
  uid: string
  name: string
  avatar: string
  email: string
  currentProject: string
}

export interface Project {
  id: string
  title: string
  transfers: Transfer[]
  users: { [key: string]: User }
}

export interface Invitation {
  invited: string
  inviter: string
  projectId: string
  projectName: string
}

export interface Debt {
  amount: number
  receiver: User
}

export interface Notification {
  id: string
  title: string
  message: string
}
