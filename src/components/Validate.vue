<template>
  <div v-if="!inviteIsValid">
    <p>Authenticating invitation, please wait...</p>
  </div>
  <div v-else>
    <p>Invitation authenticated, opening project...</p>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Actions } from '../constants'
import Login from './Login.vue'
export default Vue.extend({
  name: 'Validate',
  components: {
    Login
  },
  computed: {
    inviteIsValid(): boolean {
      return this.$store.state.inviteIsValid
    }
  },
  watch: {
    inviteIsValid() {
      this.$router.push('/')
    }
  },
  created() {
    const inviteId = this.$route.params.inviteId
    console.log('[VALIDATE.created]: inviteId:', inviteId)
    this.$store.dispatch(Actions.VALIDATE_PROJECT_INVITE, inviteId)
  }
})
</script>
