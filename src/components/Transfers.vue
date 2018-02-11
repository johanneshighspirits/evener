<template>
  <section>
    <h4>Transfers</h4>
    <ul class="transfers">
      <Transfer v-for="(transfer, i) in transfers" :transfer="transfer" :is-last="i === transfers.length - 1" :key="transfer.id"/>
    </ul>
  </section>
</template>

<script lang="ts">
import Vue from 'vue'
import Transfer from './Transfer.vue'

export default Vue.extend({
  name: 'transfers',
  components: {
    Transfer
  },
  props: {
    transfers: {
      type: Array,
      default: function() {
        return []
      }
    }
  }
})
</script>

<style lang="scss" scoped>
.transfers {
  margin: auto;
  padding: 20px;
  list-style: none;
  border-top: 3px double #eee;
  border-bottom: 3px double #eee;
}
</style>
