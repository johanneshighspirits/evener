<template>
  <li class="transfer-container" :class="{ last: isLast }">
    <div class="transfer transfer-paid-by">{{initials}}</div>
    <div class="transfer transfer-date">{{transfer.shortDate()}}</div>
    <div class="transfer transfer-message">{{transfer.message}}</div>
    <div class="transfer transfer-transfer-type">{{transfer.transferTypeToString()}}</div>
    <div class="transfer transfer-amount">{{transfer.amount}}</div>
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
    initials: function() {
      const { transferType, paidBy, receiver } = this.transfer
      let receiverOrPayer: User
      switch (transferType) {
        case TransferType.payment:
          receiverOrPayer = paidBy
          break
        case TransferType.repayment:
          receiverOrPayer = paidBy
          break
        case TransferType.income:
          receiverOrPayer = receiver
          break
      }
      return receiverOrPayer.initials()
    }
  }
})
</script>

<style lang="scss" scoped>
.transfer-container {
  display: grid;
  grid-template-columns: [paid-by] 30px [date] 0.75fr [message] 3fr [type] 3em [amount] 50px;
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
      background: #ddd;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      text-align: center;
    }
    &-date {
      text-transform: uppercase;
      font-size: 0.75em;
    }
    &-message {
      text-align: left;
      font-weight: bold;
    }
    &-amount {
      text-align: right;
    }
  }
}
</style>
