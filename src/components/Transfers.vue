<template>
  <section class="transfers-section">
    <h4>Transfers</h4>
    <p v-if="isOpening">Loading transactions...</p>
    <ul v-else-if="transfers.length > 0" class="transfers">
      <transition-group name="fade-in-left">
        <Transfer v-for="(transfer, i) in transfers" :transfer="transfer" :is-last="i === transfers.length - 1" :key="transfer.id"/>
      </transition-group>
    </ul>
    <p v-else>No transfers yet.<br>Choose <b>Add Transfer</b> in the menu to get started.</p>
  </section>
</template>

<script lang="ts">
import Vue from 'vue'
import Transfer from './Transfer.vue'
import TransferModel from '../models/Transfer'
import { Component, Prop } from 'vue-property-decorator'

@Component({
  components: {
    Transfer
  }
})
export default class Transfers extends Vue {
  get transfers() {
    return this.$store.getters.transfers
  }
  get isOpening() {
    return this.$store.getters.isOpening
  }
}
</script>

<style lang="scss" scoped>
.transfers-section {
  padding-bottom: 100px;
}
.transfers {
  margin: auto;
  padding: 20px;
  list-style: none;
  border-top: 3px double #eee;
  border-bottom: 3px double #eee;
}
</style>
