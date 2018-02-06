import Vue from 'vue'
import Router from 'vue-router'
import Start from '@/components/Start'
import Login from '@/components/Login'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/',
      name: 'Start',
      component: Start
    }
  ]
})
