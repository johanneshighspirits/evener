<template>
  <section>
    <h4>Transfers</h4>
    <ul>
      <li v-for="transfer in transfers" :key="transfer.id">
        <p>{{transfer.message}}</p>
      </li>
    </ul>
  </section>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  name: 'transfers',
  props: ['transfers']
})
</script>

<style lang="scss" scoped>

</style>
