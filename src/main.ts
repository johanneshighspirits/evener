// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './Store'
import { Mutations, Actions } from './constants'
import firebase from 'firebase'
import firebaseui from 'firebaseui'
import 'firebase/firestore'
import { config } from '../config/firebaseConfig'

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>',
  created() {
    firebase.initializeApp(config)
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        user.getIdToken().then(token => {
          console.log('accessToken received...')
        })
        store.commit(Mutations.LOGGED_IN, {
          uid: user.uid,
          name: user.displayName,
          avatar: user.photoURL
        })
        console.log('Logged in')
        store.dispatch(Actions.GET_USER_PROJECTS)
        this.$router.push('/')
      } else {
        store.commit(Mutations.LOGGED_OUT)
        console.log('Logged out')
        this.$router.push('/login')
      }
    })
  }
})
