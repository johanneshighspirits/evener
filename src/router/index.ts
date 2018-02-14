import Vue from 'vue'
import Router from 'vue-router'
import Start from '@/components/Start'
import Invitations from '@/components/Invitations'
import Validate from '@/components/Validate'
import Login from '@/components/Login'

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
