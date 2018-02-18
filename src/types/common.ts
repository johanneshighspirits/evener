import Transfer from '../models/Transfer'
import User from '../models/User'

export enum TransferType {
  income = 0,
  payment,
  repayment
}

export interface LegacyTransfer {
  message: string
  amount: number
  date: string
  paidBy: string
  receiver: string
  eventType: number
  userID: string
  project: string
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
