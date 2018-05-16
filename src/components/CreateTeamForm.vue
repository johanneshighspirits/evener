<template>
  <form class="create-user-groups-form form">
    <h3>Add users to a team</h3>
    <h4>{{ title }}</h4>
    <transition name="fade-in-up">
      <div class="form-group">
        <input type="text" class="bordered" autofocus="true" v-model="name" placeholder="Team name">
      </div>
    </transition>
    <transition name="fade-in-up">
      <div v-if="name !== ''" class="form-group">
        <p>Select one or more members, then click CREATE TEAM</p>
        <div v-for="user in freeUsers" :key="user.uid" class="form-group">
          <input type="checkbox" :id="user.uid" :value="user.uid" v-model="checkedUserIds">
          <label class="button" :for="user.uid">{{ user.name() }}</label>
        </div>
        <button
          class="button"
          style="margin-top:2em; font-size:14px;"
          @click.prevent="addUserGroup">
          CREATE TEAM
        </button>

      </div>
    </transition>
  </form>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Actions, Mutations } from '../constants'
import { UserGroup } from '../types/common'
import User from '../models/User'
import uuidv1 from 'uuid/v1'

@Component
export default class CreateTeamForm extends Vue {
  /* data */
  public name: string = ''
  public checkedUserIds: string[] = []

  /* Computed values (getters) */
  get title() {
    return 'Group members together by adding them to a team.'
  }
  get project() {
    return this.$store.getters.project
  }
  get userGroups() {
    return this.project.userGroups || []
  }
  get users() {
    return Object.values(this.$store.getters.users) as User[]
  }
  get freeUsers() {
    const freeUsers = this.users.filter((user: User) => {
      const isInUserGroup = this.userGroups.some((group: UserGroup) => {
        return group.userIds.includes(user.uid)
      })
      return !isInUserGroup
    })
    return freeUsers
  }
  /* Methods */
  public resetForm() {
    this.$data.name = ''
    this.$data.checkedUserIds = []
  }
  public validateForm() {
    if (this.$data.name === '') {
      console.error("Name can't be blank")
      return false
    }
    if (this.$data.checkedUserIds.length < 1) {
      console.error('Select one or more members')
      return false
    }
    return true
  }
  public addUserGroup() {
    if (!this.validateForm()) {
      return null
    }
    this.project.userGroups = this.project.userGroups || []
    this.project.userGroups.push({
      uid: uuidv1(),
      name: this.$data.name,
      userIds: this.$data.checkedUserIds
    })
    this.$store.dispatch(Actions.UPDATE_USER_GROUPS, this.project)
    this.resetForm()
  }
}
</script>

<style lang="scss">
@import '../styles/_colors.scss';
.create-user-groups-form {
  padding-bottom: 6em;
  .form-group {
    margin: 4px auto;
  }
  input[type='radio'],
  input[type='checkbox'],
  input[type='file'] {
    display: block;
    position: absolute;
    visibility: hidden;
    width: 0;
  }
  select {
    width: 50%;
    height: 60px;
  }
  select,
  input[type='text'],
  input[type='number'],
  input[type='date'],
  input[type='submit'] {
    font-size: 1em;
    padding: 1em 2em;
    color: $gold;
    text-align: center;
    &:hover,
    &:active,
    &:focus {
      outline: none;
      color: darken($gold, 25%);
      background: lighten($gold, 35%);
    }
  }
  input[type='date'] {
    font-size: 1.1em;
  }
  .bordered {
    border: 3px solid $gold;
  }
  .button {
    display: block;
    margin: auto;
    padding: 1em 2em;
    font-weight: bold;
    color: $gold;
    transition: all 300ms ease-in-out;
    &:hover {
      color: darken($gold, 25%);
      background: lighten($gold, 35%);
    }
  }
  .button:active,
  input:checked + .button,
  input:checked + .button:hover,
  input[type='submit']:hover {
    background: $gold;
    color: #fff;
  }
  input[type='radio'] + label {
    flex: 0.34 60px;
    padding: 1em;
  }
  .import-transfers {
    display: flex;
    flex-direction: column;
    margin-bottom: 4px;
  }
  .select-transfer-type {
    display: block;
    label {
      margin: 2px auto;
    }
    @media screen and (min-width: 400px) {
      display: flex;
      flex-direction: row;
      justify-content: center;
      label {
        margin: auto 2px;
      }
    }
  }
}
</style>
