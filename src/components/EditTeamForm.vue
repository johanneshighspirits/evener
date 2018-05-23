<template>
  <form class="create-user-groups-form form">
    <h3>Edit teams</h3>
    <p>{{ title }}</p>
    <div>
      <button
        class="button"
        v-for="team in userGroups"
        @click.prevent="selectTeam(team.uid)"
        :id="team.uid"
        :key="team.uid">
        {{ team.name }}
      </button>
    </div>

    <transition name="fade-in-up">
      <div v-if="selectedTeam !== '' && freeUsers.length > 0" class="form-group">
        <h3>Add user to team</h3>
        <p>Select one or more members to add to the team</p>
        <div v-for="user in freeUsers" :key="user.uid" class="form-group">
          <input type="checkbox" :id="user.uid" :value="user.uid" v-model="checkedUserIds">
          <label class="button" :for="user.uid">{{ user.name() }}</label>
        </div>
        <button
          class="button"
          style="margin-top:2em; font-size:14px;"
          @click.prevent="addUsersToGroup">
          ADD TO TEAM
        </button>

      </div>
    </transition>
    <transition name="fade-in-up">
      <div v-if="selectedTeam !== '' && userGroups.find(group => group.uid === selectedTeam)" class="form-group">
        <h3>Remove user from team</h3>
        <p>Click a member to instantly remove them from the team</p>
        <div v-for="user in selectedTeamUsers" :key="user.uid" class="form-group">
          <input type="checkbox" :id="user.uid" @click="removeUserFromGroup(user.uid)" :value="user.uid">
          <label class="button" :for="user.uid">{{ user.name() }}</label>
        </div>
        <!-- <button
          class="button"
          style="margin-top:2em; font-size:14px;"
          @click.prevent="addUsersToGroup">
          ADD TO TEAM
        </button> -->

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
// import uuidv1 from 'uuid/v1'

@Component
export default class EditTeamForm extends Vue {
  /* data */
  public checkedUserIds: string[] = []
  public selectedTeam: string = '';
  public addUser: boolean = true;

  constructor() {
    super()
    this.addUser = this.freeUsers.length > 0
  }

  /* Computed values (getters) */
  get title() {
    return 'Select a team to add or remove a member from.'
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
  get selectedTeamUsers() {
    if (this.selectedTeam === '') {
      return []
    }
    const team = this.userGroups.find((group: UserGroup) => group.uid === this.selectedTeam)
    if (!team) {
      return []
    }
    return this.users.filter((user: User) => team.userIds.includes(user.uid))
  }
  /* Methods */
  public selectTeam(teamUid:string) {
    this.$data.selectedTeam = teamUid;
  }
  public resetForm() {
    this.$data.selectedGroup = ''
    this.$data.checkedUserIds = []
  }
  public validateForm() {
    if (this.$data.selectedGroup === '') {
      console.error("Select a team")
      return false
    }
    if (this.$data.checkedUserIds.length < 1) {
      console.error('Select one or more members')
      return false
    }
    return true
  }
  public addUsersToGroup() {
    const newUsers = [...this.$data.checkedUserIds]
    if (!this.validateForm()) {
      return null
    }
    const selectedGroup = this.project.userGroups.find((group: UserGroup) => group.uid === this.selectedTeam)
    if (selectedGroup) {
      selectedGroup.userIds = [...selectedGroup.userIds, ...this.$data.checkedUserIds]
      this.$store.dispatch(Actions.UPDATE_USER_GROUPS, this.project)
      this.resetForm()
    }
  }
  public removeUserFromGroup(uid: string) {
    const selectedGroup = this.project.userGroups.find((group: UserGroup) => group.uid === this.selectedTeam)
    if (selectedGroup) {
      selectedGroup.userIds = selectedGroup.userIds.filter((userId: string) => {
        return userId !== uid
      })
      if (selectedGroup.userIds.length < 1) {
        // Don't save empty teams
        this.project.userGroups = this.project.userGroups.filter((group: UserGroup) => group.uid !== this.selectedTeam)
        if (this.project.userGroups.length < 1) {
          // Remove userGroup property if empty
          this.project.userGroups = undefined
        }
      }
      this.$store.dispatch(Actions.UPDATE_USER_GROUPS, this.project)
      this.resetForm()
    }
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
