<template>
  <form @submit.prevent="addTransfer" class="add-transfer-form">
    <h2>Add transfers</h2>
    <div class="form-group import-transfers">
      <label for="file" class="button bordered">
        Import JSON from file
        <input id="file" type="file" @change="handleFileSelect">
      </label>
    </div>
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
        <input type="number" class="bordered" v-model.number="amount" ref="amount" placeholder="Amount">
      </div>
    </transition>
    <transition name="fade-in-up">
      <div v-if="transferType !== -1 && amount > 0" class="form-group">
        <input type="text" class="bordered" v-model="message" placeholder="Description">
      </div>
    </transition>
    <transition name="fade-in-up">
      <div v-if="transferType === 2 && amount > 0 && message !== ''" class="form-group">
        <select class="bordered" v-model="receiver">
          <option disabled value="">Who received the money</option>
          <option v-for="(user, i) in users" :key="i" :value="user.uid">{{ user.name() }}</option>
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
import { Actions } from '../constants'
import Transfer from '../models/Transfer'
import { TransferType, LegacyTransfer } from '../types/common'
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
  receiver: string = ''

  /* Computed values (getters) */
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
  get users() {
    return this.$store.getters.users
  }
  /* Watchers */
  @Watch('transferType')
  onTransferTypeChange(newType: TransferType, oldType: TransferType) {
    this.$nextTick(function() {
      let element = this.$refs.amount as HTMLInputElement
      element.focus()
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
  resetForm() {
    this.$data.transferType = -1
    this.$data.amount = 0
    this.$data.message = ''
    this.$data.receiver = ''
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

    const date = new Date().toISOString()
    const paidBy = this.$store.getters.user
    let receiver =
      this.$data.transferType === 2
        ? this.$store.getters.users[this.$data.receiver]
        : ''
    const transfer = new Transfer(
      this.$data.amount,
      date,
      this.$data.transferType,
      this.$data.message,
      paidBy,
      receiver
    )
    this.$store.dispatch(Actions.ADD_TRANSFER, transfer)

    this.resetForm()
    this.$data.transferType = 1
    this.$data.amount = 0
    this.$data.message = ''
    this.$data.receiver = ''
  }
  handleFileSelect(e: HTMLInputEvent) {
    let files = e.target.files
    if (files) {
      let file = files[0]
      let fileReader = new FileReader()
      fileReader.onload = event => {
        let json = fileReader.result
        let importedTransfers = JSON.parse(json)
        this.importTransfers(importedTransfers)
      }
      fileReader.readAsText(file, 'utf8')
    }
  }
  importTransfers(legacyTransfers: LegacyTransfer[]) {
    // let importedTransfers = [
    //   {
    //     message: 'Bärsele',
    //     amount: 200,
    //     date: '2017-02-19',
    //     paidBy: 'ee5d03ed927d683ff79fa00bd2a937bd',
    //     receiver: '',
    //     eventType: 1,
    //     userID: 'ee5d03ed927d683ff79fa00bd2a937bd',
    //     project: '7b05f090cfd49b3c1d1270eeb6ad0407'
    //   }
    // ]

    const users = this.$store.getters.users
    // MOCKUP:
    const oldUserIds: { [key: string]: User } = {
      ee5d03ed927d683ff79fa00bd2a937bd: new User({
        name: 'Johannes Borgström',
        uid: '9nDrJ2WuYyVB7HEuP9MsLkhIBz23',
        avatar: '',
        email: 'johannes@highspirits.se'
      }),
      '98644168a2d37ec3cb76f29d36ac15a2': new User({
        name: 'Sofie Forsman',
        uid: '',
        avatar: '',
        email: 'sofie.forsman@gmail.com'
      })
    }

    legacyTransfers.forEach(importedTransfer => {
      if (importedTransfer.project !== '7b05f090cfd49b3c1d1270eeb6ad0407') {
        console.warn('Ignore other project:', importedTransfer.project)
        return false
      }
      let paidBy = oldUserIds[importedTransfer.paidBy]
      if (paidBy === undefined) {
        console.warn("Couldn't find User with id", importedTransfer.paidBy)
        return false
      }
      let receiver = oldUserIds[importedTransfer.receiver]
      if (
        importedTransfer.eventType === TransferType.repayment &&
        receiver === undefined
      ) {
        console.warn(
          'No receiver found for repayment transfer',
          importedTransfer
        )
        return false
      }

      const transfer = new Transfer(
        importedTransfer.amount,
        new Date(importedTransfer.date).toISOString(),
        importedTransfer.eventType,
        importedTransfer.message,
        paidBy,
        receiver
      )
      this.$store.dispatch(Actions.ADD_TRANSFER, transfer)
    })
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
    position: absolute;
    visibility: hidden;
  }
  select {
    width: 50%;
    height: 60px;
  }
  select,
  input[type='text'],
  input[type='number'],
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
    flex: 0.25 60px;
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
      margin: 2px 4px;
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
  ::-webkit-input-placeholder {
    /* Chrome/Opera/Safari */
    color: $gold;
  }
  ::-moz-placeholder {
    /* Firefox 19+ */
    color: $gold;
  }
  :-ms-input-placeholder {
    /* IE 10+ */
    color: $gold;
  }
  :-moz-placeholder {
    /* Firefox 18- */
    color: $gold;
  }
}
.fade-in-up {
  &-enter {
    opacity: 0;
    transform: translateY(2em);
  }
  &-enter-to {
    opacity: 1;
    transform: translateY(0px);
  }
  &-enter-active,
  &-leave-active {
    transition: all 0.5s ease-in-out;
  }
  &-leave {
    opacity: 1;
  }
  &-leave-to {
    opacity: 0;
  }
}
</style>
