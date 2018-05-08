<template>
  <transition-group
  name="notification-fade"
  :appear="true"
  tag="ul"
  class="notifications-container">
    <li
      v-for="notification in notifications"
      :key="notification.id"
      class="notification">
      <div class="closer" @click="closeNotification(notification.id)">X</div>
      <h5>{{ notification.title }}</h5>
      <p>{{ notification.message }}</p>
    </li>
  </transition-group>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Actions, Mutations } from '../constants'
import Transfer from '../models/Transfer'
import { Notification } from '../types/common'
import User from '../models/User'

@Component
export default class Notifications extends Vue {
  /* Computed values (getters) */
  get notifications() {
    return this.$store.state.notifications
  }
  /* Methods */
  public closeNotification(id: string) {
    this.$store.commit(Mutations.CLOSE_NOTIFICATION, id)
  }
}
</script>

<style lang="scss" scoped>
@import '../styles/_colors.scss';

.notifications-container {
  display: flex;
  flex-direction: column;
  position: fixed;
  width: 280px;
  max-width: 100%;
  margin: 1em;
  z-index: 9999;
  .notification {
    display: block;
    margin-bottom: 2px;
    padding: 1em 0.5em 0.5em;
    width: 100%;
    text-align: left;
    color: #fff;
    background-color: darken($gold, 10%);
    .closer {
      position: absolute;
      right: 0.5em;
    }
    h5,
    p {
      margin: 0 0.5em 0.25em;
      font-size: 1em;
    }
  }
}
</style>
