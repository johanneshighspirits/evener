<template>
  <transition name="fade-in-up" appear>
    <section v-if="project">
      <h3>{{ project.title }}</h3>
      <invite-collaborator-form/>
      <add-transfer-form/>
      <transfers :transfers="project.transfers"/>
    </section>
    <p v-else>Loading project...</p>
  </transition>
</template>

<script lang="ts">
import Vue from 'vue'
import Transfers from './Transfers.vue'
import AddTransferForm from './AddTransferForm.vue'
import InviteCollaboratorForm from './InviteCollaboratorForm.vue'
export default Vue.extend({
  name: 'project',
  props: ['project'],
  components: {
    Transfers,
    AddTransferForm,
    InviteCollaboratorForm
  }
})
</script>

<style lang="scss" scoped>

</style>
