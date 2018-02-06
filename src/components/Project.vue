<template>
  <h3>{{project.title}}</h3>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  name: 'project',
  props: ['project']
})
</script>

<style lang="scss" scoped>

</style>
