<template>
  <section class="center-box">
    <h1>Log in</h1>
    <p>{{ status }}</p>
    <div id="firebaseui-auth-container" @mousedown="startLogIn"/>
  </section>
</template>

<script lang="ts">
import * as firebase from 'firebase'
import * as firebaseui from 'firebaseui'
import '../../node_modules/firebaseui/dist/firebaseui.css'
import Vue from 'vue'

export default Vue.extend({
  name: 'login',
  props: ['successUrl'],
  data() {
    return {
      status: 'Connecting to Google...'
    }
  },
  methods: {
    startLogIn() {
      this.status = 'Logging in. Please wait...'
      document.addEventListener('visibilitychange', this.handleVisibilityChange)
    },
    handleVisibilityChange() {
      if (document.hidden) {
        this.status = ''
        console.log('document was hidden')
      }
      document.removeEventListener('visibilitychange', this.handleVisibilityChange)
    }
  },
  mounted() {
    const ui = new firebaseui.auth.AuthUI(firebase.auth())
    firebase.auth().useDeviceLanguage()
    ui.start('#firebaseui-auth-container', {
      signInSuccessUrl: this.successUrl || '/',
      signInOptions: [
        // List of OAuth providers supported.
        firebase.auth.GoogleAuthProvider.PROVIDER_ID
      ],
      callbacks: {
        uiShown: () => {
          this.status = 'Log in with your Google account to start using the app'
        }
      },
      tosUrl: '/tos'
      // Other config options...
    })
  }
})
</script>

<style lang="scss">
#firebaseui-auth-container {
  .firebaseui-info-bar {
    margin-top: 20px;
  }

  .mdl-shadow--2dp {
    box-shadow: none;
  }

  .mdl-progress {
    height: 5px;
  }

  div.mdl-progress::after {
    font-size: 1.1em;
    content: 'Authenticating. Please wait...';
    display: block;
    margin: 20px auto;
    text-align: center;
  }
}
</style>
