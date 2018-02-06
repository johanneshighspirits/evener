<template>
  <section>
    <h1>Evener</h1>
    <Project :project="project"></Project>
  </section>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapGetters } from 'vuex'
import Project from './Project.vue'
export default Vue.extend({
  name: 'start',
  components: {
    Project
  },
  computed: {
    ...mapGetters(['project'])
  }
})
</script>

<style lang="scss" scoped>

</style>
