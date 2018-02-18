<template>
  <div>
    <header>
      <h1>Evener</h1>
      <div v-if="user">
        <p>Logged in as <br><b>{{ user.name() }}</b><br>{{ user.email }}</p>
        <a class="button" @click="logout">Log out</a>
      </div>
    </header>
    <main>
      <Project :project="project"/>
    </main>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapGetters } from 'vuex'
import Project from './Project.vue'
import { Actions, Mutations } from '../constants'
import firebase from 'firebase'
export default Vue.extend({
  name: 'start',
  created() {
    console.log('[START]', this.$route)
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        user.getIdToken().then(token => {
          console.log('accessToken received:')
          let name = user.displayName
          let email = user.email
          let avatar = user.photoURL
          if (!email) {
            user.providerData.forEach(function(profile) {
              if (profile && profile.providerId.includes('google')) {
                if (!email) email = profile.email
                if (!avatar) avatar = profile.photoURL
                if (!name) name = profile.displayName
              }
            })
          }
          let userInfo = {
            uid: user.uid,
            name,
            avatar,
            email
          }
          this.$store.dispatch(Actions.GET_USER, userInfo)
          console.log('Logged in')
          this.$router.push('/')
        })
      } else {
        this.$store.commit(Mutations.LOGGED_OUT)
        console.log('Logged out')
        this.$router.push('/login')
      }
    })
  },
  methods: {
    logout() {
      firebase
        .auth()
        .signOut()
        .then(() => {
          this.$store.commit(Mutations.LOGGED_OUT)
        })
        .catch(error => console.error(error))
    }
  },
  components: {
    Project
  },
  computed: {
    ...mapGetters(['project', 'user'])
  }
})
</script>

<style lang="scss" scoped>

</style>
