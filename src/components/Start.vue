<template>
  <div>
    <header>
      <h1>Evener</h1>
      <div v-if="user">
        <p>Logged in as <br><b>{{ user.name() }}</b></p>
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
          console.log('accessToken received...')
        })
        let userInfo = {
          uid: user.uid,
          name: user.displayName,
          avatar: user.photoURL,
          email: user.email
        }
        this.$store.dispatch(Actions.GET_USER, userInfo)
        console.log('Logged in')
        this.$router.push('/')
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
