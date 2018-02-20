<template>
  <li class="transfer-container" :class="{ last: isLast }" @contextmenu.prevent="handleContextMenu">
    <div class="transfer transfer-paid-by" :style="'background-image: url(' + avatar + ')'">
      <span>{{ initials }}</span>
    </div>
    <div class="transfer transfer-date">{{ transfer.shortDate() }}</div>
    <div class="transfer transfer-transfer-type">
      <span>{{ transfer.transferTypeToString() }}</span>
    </div>
    <div class="transfer transfer-message">{{ transfer.message }}</div>
    <div class="transfer transfer-amount">{{ transfer.amount }}</div>
  </li>
</template>

<script lang="ts">
import Vue from 'vue'
import Transfer from '../models/Transfer'
import User from '../models/User'
import { TransferType } from '../types/common'

export default Vue.extend({
  name: 'transfer',
  props: {
    transfer: {
      type: Transfer,
      required: true
    },
    isLast: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    initials: function(): string {
      const { transferType, paidBy, receiver } = this.transfer
      let receiverOrPayer: User | undefined = paidBy
      if (transferType === TransferType.income) receiverOrPayer = receiver
      return receiverOrPayer !== undefined ? receiverOrPayer.initials() : '--'
    },
    avatar: function(): string {
      const { transferType, paidBy, receiver } = this.transfer
      let receiverOrPayer: User | undefined = paidBy
      if (transferType === TransferType.income) receiverOrPayer = receiver
      return receiverOrPayer !== undefined ? receiverOrPayer.avatar : ''
    }
  },
  methods: {
    handleContextMenu(e: any) {
      console.log(e)
      console.log('delete?', this.transfer.id)
    }
  }
})
</script>

<style lang="scss" scoped>
@import '../styles/_colors.scss';
.transfer-container {
  display: grid;
  grid-template-columns: [paid-by] 30px [date] 0.6fr [type] 2em [message] 1fr [amount] 50px;
  margin: 0;
  padding: 0.25em 0;
  border-bottom: 1px dotted #eee;
  &.last {
    border-bottom: none;
  }
  .transfer {
    line-height: 30px;
    &-paid-by {
      display: block;
      position: relative;
      top: -3px;
      background-color: #ddd;
      background-size: cover;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      text-align: center;
      span {
        display: block;
        position: absolute;
        border-radius: 3px;
        font-size: 0.6em;
        padding: 0.1em;
        height: 1em;
        width: 30px;
        line-height: 1em;
        background: $bright-gold;
        top: 80%;
        left: 0px;
      }
    }
    &-date {
      text-transform: uppercase;
      font-size: 0.75em;
    }
    &-transfer-type {
      display: flex;
      width: 2em;
      height: 100%;
      span {
        display: block;
        margin: auto;
        width: 18px;
        height: 18px;
        line-height: 18px;
        font-size: 20px;
        background: $bright-gold;
        border-radius: 50%;
        color: #fff;
      }
    }
    &-message {
      text-align: left;
      padding-left: 0.8em;
      font-weight: bold;
    }
    &-amount {
      text-align: right;
    }
  }
}
</style>
