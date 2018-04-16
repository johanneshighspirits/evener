// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import firebase from 'firebase'
import 'firebase/firestore'
import firebaseui from 'firebaseui'
import Vue from 'vue'
import App from './App.vue'
import { Actions, Mutations } from './constants'
import { config } from './firebaseConfig'
import router from './router'
import store from './Store'

Vue.config.productionTip = false

// Check that service workers are registered
if ('serviceWorker' in navigator) {
  // Use the window load event to keep the page load performant
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js');
  });
}

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>',
  created() {
    firebase.initializeApp(config)
    // firebase
    //   .auth()
    //   .signOut()
    //   .then(
    //     function() {
    //       console.log('Signed Out')
    //     },
    //     function(error) {
    //       console.error('Sign Out Error', error)
    //     }
    //   )
    // firebase.auth().onAuthStateChanged(user => {
    //   if (user) {
    //     user.getIdToken().then(token => {
    //       console.log('accessToken received...')
    //     })
    //     let userInfo = {
    //       uid: user.uid,
    //       name: user.displayName,
    //       avatar: user.photoURL
    //     }
    //     store.dispatch(Actions.GET_USER, userInfo)
    //     console.log('Logged in')
    //     this.$router.push('/')
    //   } else {
    //     store.commit(Mutations.LOGGED_OUT)
    //     console.log('Logged out')
    //     this.$router.push('/login')
    //   }
    // })
  }
})
