<template>
  <section>
    <h4>Balance</h4>
    <ul class="debt-boxes-container">
      <div v-for="(balance, i) in balances" :key="i">
        <h5>{{ balance.name }}</h5>
        <div class="debt-result" :class="{ green: balance.balance >= 0, red: balance.balance < 0 }">
          <p><b>Balance: </b>{{ balance.balance.toFixed(2) }}</p>
        </div>
      </div>
    </ul>
  </section>
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
  @Prop({ default: [] })
  transfers: Array<Transfer> | undefined
  @Prop({ default: [] })
  users: Array<User> | undefined

  get balances() {
    // [TODO]: Move this logic to its own module

    /**
     * Map transfers to users
     */
    let balances: { [key: string]: { balance: number; name: string } } = {}
    if (this.$props.transfers) {
      let transfers = Object.values(this.$props.transfers) as Transfer[]
      // var to hold all users while we calculate their balances
      // Actual count of users (2 == 2 users)
      let users = Object.values(this.$store.getters.users) as User[]
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
  margin: 4px;
  padding: 0;
  .debt-result {
    padding: 1em;
  }
  .green {
    background: $green;
    box-shadow: 0 0 0 2px #fff inset, 0 0 0 2px $green;
  }
  .red {
    background: $red;
    box-shadow: 0 0 0 2px #fff inset, 0 0 0 2px $red;
  }
}
</style>
