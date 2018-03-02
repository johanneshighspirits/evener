<template>
  <form @submit.prevent="addTransfer" class="add-transfer-form form">
    <h3>Register a payment</h3>
    <h4>{{ title }}</h4>
    <div class="form-group select-transfer-type">
      <input id="payment" type="radio" value="1" v-model.number="transferType" >
      <label for="payment" class="button bordered">Payment</label>
      <input id="income" type="radio" value="0" v-model.number="transferType" >
      <label for="income" class="button bordered">Income</label>
      <input id="repayment" type="radio" value="2" v-model.number="transferType" >
      <label for="repayment" class="button bordered">Repayment</label>
    </div>
    <transition name="fade-in-up">
      <div v-if="transferType !== -1" class="form-group">
        <input type="number" class="bordered" min="0" step=".01" v-model.number="amount" ref="amount" placeholder="Amount">
      </div>
    </transition>
    <transition name="fade-in-up">
      <div v-if="transferType !== -1 && amount > 0" class="form-group">
        <input type="text" class="bordered" v-model="message" placeholder="Description">
      </div>
    </transition>
    <transition name="fade-in-up">
      <div v-if="transferType !== -1 && amount > 0" class="form-group">
        <input type="date" class="bordered" :value="inputDate" @change="setInputDate" placeholder="Transfer date">
      </div>
    </transition>
    <transition name="fade-in-up">
      <div v-if="transferType === 2 && amount > 0 && message !== ''" class="form-group">
        <select class="bordered" v-model="receiver">
          <option disabled value="">Who received the money</option>
          <option v-for="(user, i) in users" v-if="user.uid !== currentUser.uid" :key="i" :value="user.uid">{{ user.name() }} {{ user.email }}</option>
        </select>
      </div>
    </transition>
    <transition name="fade-in-up">
      <div v-if="amount > 0 && message !== '' && (transferType === 0 || transferType === 1 || (transferType === 2 && receiver !== ''))" class="form-group">
        <input type="submit" class="bordered" value="SAVE"/>
      </div>
    </transition>
  </form>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Actions, Mutations } from '../constants'
import Transfer from '../models/Transfer'
import { TransferType, JSONTransfer } from '../types/common'
import User from '../models/User'

interface HTMLInputEvent extends Event {
  target: HTMLInputElement & EventTarget
}

@Component
export default class AddTransferForm extends Vue {
  /* data */
  transferType = -1
  amount: number | string = ''
  message: string = ''
  date: Date = new Date()
  receiver: string = ''

  /* Computed values (getters) */
  get inputDate() {
    const month = `${this.$data.date.getMonth() + 1}`.padStart(2, '0')
    const date = `${this.$data.date.getDate()}`.padStart(2, '0')
    return `${this.$data.date.getFullYear()}-${month}-${date}`
  }
  get title() {
    switch (this.transferType) {
      case TransferType.income:
        return 'You earned some money'
      case TransferType.payment:
        return 'You paid a bill'
      case TransferType.repayment:
        return 'You made a repayment to someone'
      default:
        return 'Please, select an option below'
    }
  }
  get currentUser() {
    return this.$store.getters.user
  }
  get users() {
    return this.$store.getters.users
  }
  /* Watchers */
  @Watch('transferType')
  onTransferTypeChange(newType: TransferType, oldType: TransferType) {
    this.$nextTick(function() {
      let element = <HTMLInputElement>this.$refs.amount
      if (element) element.focus()
    })
  }
  @Watch('amount')
  onAmountChange(newAmount: number | string, oldAmount: number | string) {
    if (newAmount === 0 || newAmount === '0') {
      this.$nextTick(function() {
        this.amount = ''
      })
    }
  }
  /* Methods */
  setInputDate(e: any) {
    this.$data.date = new Date(e.target.value)
  }
  resetForm() {
    this.$data.transferType = -1
    this.$data.amount = 0
    this.$data.message = ''
    this.$data.receiver = ''
    this.$data.date = new Date()
  }
  validateForm() {
    if (this.$data.amount === 0) {
      console.error('Amount must be filled in')
      return false
    }
    if (this.$data.message === '') {
      console.error("Message can't be blank")
      return false
    }
    if (this.$data.transferType === 2 && this.$data.receiver === '') {
      console.error('You have to select a recipient for your repayment')
      return false
    }
    return true
  }
  addTransfer() {
    if (!this.validateForm()) return null
    const date = this.$data.date.toISOString()
    let paidBy: User | undefined = undefined
    let receiver: User | undefined = undefined
    switch (this.$data.transferType) {
      case TransferType.income:
        receiver = this.$store.getters.user
        break
      case TransferType.payment:
        paidBy = this.$store.getters.user
        break
      case TransferType.repayment:
        paidBy = this.$store.getters.user
        receiver = this.$store.getters.users[this.$data.receiver]
    }
    const transfer = new Transfer(
      '#',
      this.$data.amount,
      date,
      this.$data.transferType,
      this.$data.message,
      paidBy,
      receiver
    )
    this.$store.dispatch(Actions.ADD_TRANSFER, transfer)
    this.resetForm()
  }
  handleFileSelect(e: HTMLInputEvent) {
    let files = e.target.files
    const projectId = this.$store.getters.project.id
    if (files) {
      let file = files[0]
      let fileReader = new FileReader()
      fileReader.onload = event => {
        let json = fileReader.result
        let importedProject = JSON.parse(json)
        console.log(`comparing ${importedProject.projectId} with ${projectId}`)
        if (importedProject.projectId === projectId) {
          this.importTransfers(importedProject.transfers)
        } else {
          this.$store.commit(Mutations.DISPLAY_NOTIFICATION, 'This is not the same project.')
        }
      }
      fileReader.readAsText(file, 'utf8')
    }
  }
  exportTransfers() {
    let project = this.$store.getters.project
    let serializedTransfers = project.transfers.map((transfer: Transfer) =>
      transfer.serialize(this.$store.getters.user.uid)
    )
    let dataStr = `data:text/json;charset=utf-8,{"projectId":"${project.projectId}","projectId":"${
      project.id
    }","transfers":${JSON.stringify(serializedTransfers)}}`
    let downloadAnchorNode = document.createElement('a')
    downloadAnchorNode.setAttribute('href', dataStr)
    downloadAnchorNode.setAttribute('download', `Evener - ${project.title}.json`)
    downloadAnchorNode.click()
    downloadAnchorNode.remove()
  }
  importTransfers(importedTransfers: JSONTransfer[]) {
    const users = this.$store.getters.users
    const transfers: Transfer[] = []
    importedTransfers.forEach(importedTransfer => {
      let transferType = importedTransfer.transferType
      let paidBy = users[importedTransfer.paidBy]
      if (paidBy === undefined && importedTransfer.transferType !== TransferType.income) {
        console.warn("Couldn't find User for transfer", importedTransfer)
        return false
      }
      let receiver = users[importedTransfer.receiver]
      if (importedTransfer.transferType === TransferType.repayment && receiver === undefined) {
        console.warn('No receiver found for repayment transfer', importedTransfer)
        return false
      }
      const transfer = new Transfer(
        '#',
        importedTransfer.amount,
        new Date(importedTransfer.date).toISOString(),
        transferType,
        importedTransfer.message,
        paidBy,
        receiver
      )
      transfers.push(transfer)
    })
    this.$store.dispatch(Actions.ADD_TRANSFERS, transfers)
  }
}
</script>

<style lang="scss">
@import '../styles/_colors.scss';
.add-transfer-form {
  padding-bottom: 6em;
  .form-group {
    margin: 4px auto;
  }
  input[type='radio'],
  input[type='file'] {
    display: block;
    position: absolute;
    visibility: hidden;
    width: 0;
  }
  select {
    width: 50%;
    height: 60px;
  }
  select,
  input[type='text'],
  input[type='number'],
  input[type='date'],
  input[type='submit'] {
    font-size: 1em;
    padding: 1em 2em;
    color: $gold;
    text-align: center;
    &:hover,
    &:active,
    &:focus {
      outline: none;
      color: darken($gold, 25%);
      background: lighten($gold, 35%);
    }
  }
  input[type='date'] {
    font-size: 1.1em;
  }
  .bordered {
    border: 3px solid $gold;
  }
  .button {
    display: block;
    margin: auto;
    padding: 1em 2em;
    font-weight: bold;
    color: $gold;
    transition: all 300ms ease-in-out;
    &:hover {
      color: darken($gold, 25%);
      background: lighten($gold, 35%);
    }
  }
  .button:active,
  input:checked + .button,
  input:checked + .button:hover,
  input[type='submit']:hover {
    background: $gold;
    color: #fff;
  }
  input[type='radio'] + label {
    flex: 0.34 60px;
    padding: 1em;
  }
  .import-transfers {
    display: flex;
    flex-direction: column;
    margin-bottom: 4px;
  }
  .select-transfer-type {
    display: block;
    label {
      margin: 2px auto;
    }
    @media screen and (min-width: 400px) {
      display: flex;
      flex-direction: row;
      justify-content: center;
      label {
        margin: auto 2px;
      }
    }
  }
}
</style>
