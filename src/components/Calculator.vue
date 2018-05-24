<template>
  <transition name="fade-in-up">
    <section v-if="transfers.length > 0">
      <ul class="debt-boxes-container">
        <li v-for="(balance, i) in balances" class="debt-box" :key="i">
            <h5>{{ balance.title }}</h5>
            <div class="avatars">
              <div class="avatar" v-for="user in balance.users" :key="user.uid">
                <div class="image" :style="'background-image: url(' + user.avatar + ')'"></div>
                <div class="name">{{ user.firstName }}</div>
              </div>
            </div>
            <div class="debt-result" :class="{ green: balance.balance >= 0, red: balance.balance < 0 }">
              <p>{{ balance.balance.toFixed(2) }}</p>
              <div class="debts" v-for="(debt, i) in balance.debts" :key="i">
                <p class="debt">{{debt.amount.toFixed(2)}}<span class="arrow">&rArr;</span>{{debt.receiverName}}</p>
              </div>
            </div>
        </li>
      </ul>
    </section>
    <section v-else-if="usersArray.length > 0">
      <h4>Members</h4>
      <ul>
        <li v-for="user in usersArray" :key="user.uid">{{ user.name() }}</li>
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
import { TransferType, Debt, Project, UserGroup } from '../types/common'

@Component
export default class Calculator extends Vue {
  get project() {
    const project = this.$store.getters.project as Project
    return project
  }
  get users() {
    return this.$store.getters.users as User[]
  }
  get usersArray() {
    const users: any[] = []
    Object.values(this.$store.getters.users).forEach(user => {
      if (user.hasOwnProperty('name')) {
        users.push(user)
      }
    })
    return users
  }
  get transfers() {
    return this.$store.getters.transfers
  }

  // [TODO]: Move this logic to its own module
  /**
   * Every user should be displayed as a UserGroup
   * A UserGroup has one or more members
   * A user can only belong to one UserGroup
   * All transactions made by a user in a group are
   * shared within that group
   *
   */
  get balances() {
    // Init balances array
    const balances: Array<{
      uid: string
      title: string
      balance: number
      debts: Debt[]
      users: User[]
    }> = []

    if (this.transfers && this.transfers.length > 0) {
      // Get array of transfers
      const transfers = Object.values(this.transfers) as Transfer[]
      // Get array of users
      const users = Object.values(this.users) as User[]
      // Actual count of users (2 == 2 users)
      const userCount = users.length
      // Loop users
      users.forEach((user: User) => {
        const userId = user.uid
        let balance:
          | {
              uid: string
              title: string
              balance: number
              debts: Debt[]
              users: User[]
            }
          | undefined
        // Check if user belong to a userGroup
        const userGroup = this.project.userGroups
          ? this.project.userGroups.find((group: UserGroup) => group.userIds.includes(userId))
          : null
        if (userGroup) {
          // User belongs to a userGroup
          // Init/find balance
          balance = balances.find(b => b.uid === userGroup.uid)
          if (!balance) {
            balance = {
              uid: userGroup.uid,
              title: userGroup.name,
              balance: 0,
              debts: [],
              users: [user]
            }
            balances.push(balance)
          } else {
            // Add user to balances
            balance.users.push(user)
          }
        } else {
          // User does not belong to a userGroup,
          // create one with one member only
          balance = {
            uid: userId,
            title: user.name(),
            balance: 0,
            debts: [],
            users: [user]
          }
          balances.push(balance)
        }
      })

      const userGroupCount = balances.length

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
            const incomeUid = transfer.receiver!.uid
            balances.forEach(b => {
              // Find balance where user belongs
              const receiver = b.users.find(u => u.uid === incomeUid)
              if (receiver) {
                // User from this group got income, decrease balance
                b.balance -= transfer.amount / userGroupCount * (userGroupCount - 1)
              } else {
                // Someone from another group got income, increase balance
                b.balance += transfer.amount / userGroupCount
              }
            })
            break
          case TransferType.payment:
            // Who made the payment?
            const paymentUid = transfer.paidBy!.uid
            balances.forEach(b => {
              // Find balance where user belongs
              const payer = b.users.find(u => u.uid === paymentUid)
              if (payer) {
                // User in this group made the payment, increase balance
                b.balance += transfer.amount / userGroupCount * (userGroupCount - 1)
              } else {
                // Someone from another group made the payment, decrease balance
                b.balance -= transfer.amount / userGroupCount
              }
            })
            break
          case TransferType.repayment:
            // Who made the repayment?
            const repaymentPayerUid = transfer.paidBy!.uid
            const repaymentReceiverUid = transfer.receiver!.uid
            balances.forEach(b => {
              // Find balance where user belongs
              const repaymentPayer = b.users.find(u => u.uid === repaymentPayerUid)
              const repaymentReceiver = b.users.find(u => u.uid === repaymentReceiverUid)
              if (repaymentPayer) {
                // User in this group made repayment
                b.balance += transfer.amount
              }
              if (repaymentReceiver) {
                // User in this group received repayment
                b.balance -= transfer.amount
              }
            })
        }
      })
      // Calculate debts
      balances.forEach((balance, index, balancesArray) => {
        if (balance.balance < 0) {
          let leftToPay = balance.balance
          let i = balancesArray.length - 1
          while (leftToPay < 0 && i >= 0) {
            const receiver = balancesArray[i]
            if (receiver.balance > 0) {
              // Receiver should get money
              const amount = leftToPay * -1 >= receiver.balance ? receiver.balance : leftToPay * -1
              leftToPay += amount
              const debt = {
                amount,
                receiverName: receiver.title
              }
              balance.debts.push(debt)
            } else {
              // Ignore receiver who shall pay
            }
            i -= 1
          }
        }
      })
    }
    return balances
  }
}
</script>

<style lang="scss" scoped>
$green: rgb(122, 206, 122);
$red: rgb(223, 121, 121);
@import '../styles/_colors.scss';
.debt-boxes-container {
  display: block;
  @media screen and (min-width: 400px) {
    display: flex;
    flex-wrap: wrap;
  }
  margin: 2px;
  padding: 0;
  ul,
  li {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .debt-box {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    margin: 1px;
    h5 {
      font-size: 1.1em;
    }
    .debt-result {
      color: #fff;
      font-size: 1.5em;
      padding: 0;
      flex-grow: 1;
      @media screen and (min-width: 400px) {
        font-size: 2em;
        padding: 0.2em;
      }
      .debts {
        font-size: 0.5em;
        .debt {
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
          line-height: 1em;
          span.arrow {
            line-height: 1em;
            padding-left: 1em;
            padding-right: 1em;
          }
        }
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
    .avatars {
      display: flex;
      flex-direction: row;
      justify-content: center;
      .avatar {
        display: block;
        position: relative;
        margin: 0 10px 10px;
        .image {
          margin: auto;
          background-color: #ddd;
          background-size: cover;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          text-align: center;
        }
        .name {
          display: inline-block;
          position: relative;
          border-radius: 3px;
          font-size: 0.8em;
          padding: 0.3em 0.6em;
          text-align: center;
          background: $bright-gold;
          top: -10px;
        }
      }
    }
  }
}
</style>
