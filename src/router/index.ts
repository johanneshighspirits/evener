import Invitations from '../components/Invitations.vue'
import Login from '../components/Login.vue'
import Start from '../components/Start.vue'
import Validate from '../components/Validate.vue'
import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/invitations/:inviteId',
      name: 'Invitations',
      component: Invitations
    },
    {
      path: '/validate/:inviteId',
      name: 'Validate',
      component: Validate
    },
    {
      path: '/',
      name: 'Start',
      component: Start
    }
  ]
})
