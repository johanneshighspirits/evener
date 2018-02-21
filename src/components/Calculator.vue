<template>
  <transition name="fade-in-up">
    <section v-if="transfers.length > 0">
      <h4>Balance</h4>
      <ul class="debt-boxes-container">
        <div v-for="(balance, i) in balances" class="debt-box" :key="i">
          <h5>{{ balance.name }}</h5>
          <div class="debt-result" :class="{ green: balance.balance >= 0, red: balance.balance < 0 }">
            <p>{{ balance.balance.toFixed(2) }}</p>
          </div>
        </div>
      </ul>
    </section>
    </transition>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'
// import { Actions } from '../constants'
import Transfer from '../models/Transfer'
import User from '../models/User'
import { TransferType } from '../types/common'
// import { TransferType, LegacyTransfer } from '../types/common'

@Component
export default class Calculator extends Vue {
  get project() {
    return this.$store.getters.project
  }
  get users() {
    return this.$store.getters.users
  }
  get transfers() {
    return this.$store.getters.transfers
  }
  get balances() {
    // [TODO]: Move this logic to its own module

    /**
     * Map transfers to users
     */
    let balances: { [key: string]: { balance: number; name: string } } = {}
    if (this.transfers && this.transfers.length > 0) {
      let transfers = <Transfer[]>Object.values(this.transfers)
      // var to hold all users while we calculate their balances
      // Actual count of users (2 == 2 users)
      let users = Object.values(this.users) as User[]
      let userCount = users.length
      users.forEach((user: User) => {
        const userId = user.uid
        // Init user balance
        balances[userId] = {
          name: user.name(),
          balance: 0
        }
        // Loop transfers
        transfers.forEach(transfer => {
          /**
           * When user is supposed to get money, balance is positive
           * + income:    balance -= income / usersCount
           * - payment:   balance += payment / usersCount
           * = repayment: balance += repayment
           */
          switch (transfer.transferType) {
            case TransferType.income:
              // Who got the income?
              if (transfer.receiver && transfer.receiver.uid === userId) {
                // User got income, decrease user (receiver) balance
                balances[userId].balance -= transfer.amount / userCount
              } else {
                // Someone else got income, increase user balance
                balances[userId].balance += transfer.amount / userCount
              }
              break
            case TransferType.payment:
              // Who made the payment?
              if (transfer.paidBy && transfer.paidBy.uid === userId) {
                // User made the payment, increase user balance
                balances[userId].balance += transfer.amount / userCount
              } else {
                // Someone else made the payment, decrease user balance
                balances[userId].balance -= transfer.amount / userCount
              }
              break
            case TransferType.repayment:
              // Who made the repayment?
              if (transfer.paidBy && transfer.paidBy.uid === userId) {
                // User made repayment
                balances[userId].balance += transfer.amount
              } else if (transfer.receiver && transfer.receiver.uid === userId) {
                // User received repayment
                balances[userId].balance -= transfer.amount
              } else {
                // Someone else made a repayment to someone else, do nothing
              }
              break
          }
        })
      })
    }
    return balances
  }
}
</script>

<style lang="scss" scoped>
$green: rgb(122, 206, 122);
$red: rgb(223, 121, 121);

.debt-boxes-container {
  display: block;
  @media screen and (min-width: 400px) {
    display: flex;
    flex-wrap: wrap;
  }
  margin: 2px;
  padding: 0;
  .debt-box {
    flex-grow: 1;
    margin: 1px;
    .debt-result {
      color: #fff;
      font-size: 1.5em;
      padding: 0;
      @media screen and (min-width: 400px) {
        font-size: 2em;
        padding: 0.2em;
      }
    }
    .green {
      background: $green;
      border: solid 3px $green;
      box-shadow: 0 0 0 2px #fff inset;
    }
    .red {
      background: $red;
      border: solid 3px $red;
      box-shadow: 0 0 0 2px #fff inset;
    }
  }
}
</style>
