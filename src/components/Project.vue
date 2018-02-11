<template>
  <section v-if="project">
    <h3>{{ project.title }}</h3>
    <add-transfer-form/>
    <transfers :transfers="project.transfers"/>
  </section>
</template>

<script lang="ts">
import Vue from 'vue'
import Transfers from './Transfers.vue'
import AddTransferForm from './AddTransferForm.vue'
export default Vue.extend({
  name: 'project',
  props: ['project'],
  components: {
    Transfers,
    AddTransferForm
  }
})
</script>

<style lang="scss" scoped>

</style>
