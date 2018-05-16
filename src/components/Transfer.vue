<template>
<v-touch @press="handlePress">
  <li class="transfer-container" :class="{ last: isLast }"
  @contextmenu="handleContextMenu">
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
</v-touch>
</template>

<script lang="ts">
import Vue from 'vue'
// import { mapGetters } from 'vuex'
import Transfer from '../models/Transfer'
import User from '../models/User'
import { Mutations, Actions } from '../constants'
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
    initials(): string {
      const { transferType, paidBy, receiver } = this.transfer
      let receiverOrPayer: User | undefined = paidBy
      if (transferType === TransferType.income) {
        receiverOrPayer = receiver
      }
      return receiverOrPayer !== undefined ? receiverOrPayer.initials() : '--'
    },
    avatar(): string {
      const { transferType, paidBy, receiver } = this.transfer
      let receiverOrPayer: User | undefined = paidBy
      if (transferType === TransferType.income) {
        receiverOrPayer = receiver
      }
      return receiverOrPayer !== undefined ? receiverOrPayer.avatar : ''
    }
    // ...mapGetters(['showContextMenu'])
  },
  methods: {
    handlePress(e: PointerEvent) {
      e.preventDefault()
      this.showEditMenu(e.clientX, e.clientY)
    },
    handleContextMenu(e: MouseEvent) {
      e.preventDefault()
      this.showEditMenu(e.clientX, e.clientY)
    },
    showEditMenu(x: number, y: number) {
      const transferOwner =
        this.transfer.transferType === TransferType.income
          ? this.transfer.receiver!.uid
          : this.transfer.paidBy!.uid
      if (this.$store.state.user.uid !== transferOwner) {
        // Only allow edit/delete on user's own transfers
        return false
      }
      const menu = {
        title: this.transfer.message,
        x,
        y,
        items: [
          {
            text: 'Edit transfer',
            action: () => {
              const id = this.transfer.id
              alert('Sorry, editing has not been implemented yet')
              this.$store.dispatch(Actions.EDIT_TRANSFER, this.transfer)
              this.$store.commit(Mutations.HIDE_CONTEXT_MENU)
            }
          },
          {
            text: 'Delete',
            action: () => {
              const id = this.transfer.id
              const doDelete = confirm(
                `Are you sure you want to delete '${this.transfer.message}'?`
              )
              if (doDelete) {
                this.$store.dispatch(Actions.DELETE_TRANSFER, id)
              }
              this.$store.commit(Mutations.HIDE_CONTEXT_MENU)
            }
          }
        ]
      }
      this.$store.commit(Mutations.SHOW_CONTEXT_MENU, menu)
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
