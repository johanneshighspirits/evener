import Transfer from '../models/Transfer'

export enum TransferType {
  payment = 0,
  repayment,
  income
}

export interface Project {
  title: string
  transfers: Transfer[]
  users: object
}
