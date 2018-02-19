<template>
  <transition name="fade-in-up" appear>
    <section v-if="project">
      <h2>{{ project.title }}</h2>
      <invite-collaborator-form/>
      <add-transfer-form/>
      <calculator :transfers="project.transfers" :users="project.users"/>
      <transfers :transfers="project.transfers"/>
    </section>
    <section v-else>
      <div v-if="noUserProjects">
        <p>No projects found. [Create new form here...]</p>
      </div>
      <div v-else>
        <p>Loading project...</p>
      </div>
    </section>
  </transition>
</template>

<script lang="ts">
import Vue from 'vue'
import Transfers from './Transfers.vue'
import Calculator from './Calculator.vue'
import AddTransferForm from './AddTransferForm.vue'
import InviteCollaboratorForm from './InviteCollaboratorForm.vue'
export default Vue.extend({
  name: 'project',
  props: ['project'],
  components: {
    Transfers,
    Calculator,
    AddTransferForm,
    InviteCollaboratorForm
  },
  computed: {
    noUserProjects(): boolean {
      return this.$store.state.noUserProjects
    }
  }
})
</script>

<style lang="scss" scoped>

</style>
