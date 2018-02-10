import Transfer from '../models/Transfer'

export enum TransferType {
  income = 0,
  payment,
  repayment
}

export interface UserInfo {
  uid: string
  name: string
  avatar: string
}

export interface Project {
  id: string
  title: string
  transfers: Transfer[]
  users: object
}
