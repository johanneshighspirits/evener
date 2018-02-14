<template>
  <section>
    <h2>Invitation</h2>
    <div v-if="!showLoginForm">
      <p>Opening invitation...</p>
    </div>
    <div v-else>
      <p>Invitation found.</p>
      <p>Please, log in to <b>accept the invitation</b>.</p>
      <Login :successUrl="`/validate/${this.$route.params.inviteId}`" />
    </div>
  </section>
</template>

<script lang="ts">
import Vue from 'vue'
import { Actions } from '../constants'
import Login from './Login.vue'
export default Vue.extend({
  name: 'Invitations',
  components: {
    Login
  },
  computed: {
    showLoginForm(): boolean {
      return this.$store.state.showLoginForm
    }
  },
  mounted() {
    const inviteId = this.$route.params.inviteId
    console.log('inviteId:', inviteId)
    this.$store.dispatch(Actions.OPEN_INVITE, inviteId)
  }
})
</script>
