<template>
  <div>
    <header>
      <h1>Evener</h1>
      <transition name="fade-in-up">
        <div v-if="user && showUserInfo" class="user-info open">
          <p @click="showUserInfo = !showUserInfo" class="closer">x</p>
          <p>Logged in as <br><b>{{ user.name() }}</b><br>{{ user.email }}</p>
          <a class="button" @click="logout">Log out</a>
        </div>
        <div v-else-if="user" class="user-info closed" @click="showUserInfo = !showUserInfo">
          <img :src="user.avatar" />
        </div>
      </transition>
    </header>
    <main :class="{blurred: showContextMenu}" class="blurrable">
      <project :project="project"/>
    </main>
    <transition name="fade-in-scale">
      <context-menu v-if="showContextMenu" />
    </transition>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapGetters } from 'vuex'
import Project from './Project.vue'
import ContextMenu from './ContextMenu.vue'
import { Actions, Mutations } from '../constants'
import firebase from 'firebase'
export default Vue.extend({
  name: 'start',
  data() {
    return {
      showUserInfo: false
    }
  },
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
    Project,
    ContextMenu
  },
  computed: {
    ...mapGetters(['project', 'user', 'showContextMenu'])
  }
})
</script>

<style lang="scss" scoped>
.user-info {
  position: absolute;
  top: 0;
  right: 0;
  padding: 0 1em 1em;
  &.open {
    background-color: #fff;
  }
  &.closed {
    img {
      cursor: pointer;
      margin: 28px;
      display: block;
      width: 28px;
      border-radius: 50%;
    }
  }
}
</style>
