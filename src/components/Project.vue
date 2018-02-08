<template>
  <section v-if="project">
    <h3>{{project.title}}</h3>
    <Transfers :transfers="project.transfers"></Transfers>
  </section>
</template>

<script lang="ts">
import Vue from 'vue'
import Transfers from './Transfers.vue'
export default Vue.extend({
  name: 'project',
  props: ['project'],
  components: {
    Transfers
  }
})
</script>

<style lang="scss" scoped>

</style>
