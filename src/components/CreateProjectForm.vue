<template>
  <transition-group name="fade-in-up">
    <div :key="'controls'">
      <div class="form-group">
        <button v-if="!showCreateForm && !showOpenProject" class="button toggleCreateProjectForm" @click="toggleCreateProjectForm">Create new Project</button>
        <button v-if="!showCreateForm && !showOpenProject && projects.length > 1" class="button toggleOpenProject" @click="toggleOpenProject">Open Project...</button>
      </div>
    </div>
    <form v-if="showCreateForm" @submit.prevent="addProject" :key="'addProject'" class="create-project-form form">
      <h2>Create new Evener Project</h2>
      <p>Choose a name for your Project</p>
      <transition name="fade-in-up">
        <div class="form-group">
          <input type="text" class="bordered" v-model="title" autofocus placeholder="Project title">
        </div>
      </transition>
      <!-- <transition name="fade-in-up">
        <div v-if="transferType !== -1 && amount > 0" class="form-group">
          <input type="date" class="bordered" :value="inputDate" @change="setInputDate" placeholder="Transfer date">
        </div>
      </transition> -->
      <transition name="fade-in-up">
        <div v-if="title !== ''" class="form-group">
          <input type="submit" class="bordered" value="ADD PROJECT"/>
        </div>
      </transition>
    </form>
    <div v-if="showOpenProject" :key="'openProject'">
      <h2>Projects</h2>
      <p>Click a project to open</p>
      <div>
        <button class="button" v-for="project in projects" v-if="project.id !== currentProject.id" @click="openProject" :id="project.id" :key="project.id">{{ project.title }}</button>
      </div>
    </div>
  </transition-group>
</template>

<script lang="ts">
import Vue from 'vue'
import { Store } from 'vuex'
import { State } from '../Store'
import { Component, Watch } from 'vue-property-decorator'
import { Actions, Mutations } from '../constants'
import Transfer from '../models/Transfer'
import User from '../models/User'
import { Project, TransferType, JSONTransfer } from '../types/common'

interface HTMLButtonEvent extends Event {
  target: HTMLButtonElement & EventTarget
}

@Component
export default class CreateProjectForm extends Vue {
  /* data */
  title: string = ''
  // date: Date = new Date()
  showCreateForm: boolean = false
  showOpenProject: boolean = false

  /* Computed values (getters) */
  // get inputDate() {
  //   const month = `${this.$data.date.getMonth() + 1}`.padStart(2, '0')
  //   const date = `${this.$data.date.getDate()}`.padStart(2, '0')
  //   return `${this.$data.date.getFullYear()}-${month}-${date}`
  // }
  get user() {
    return this.$store.getters.user
  }
  get showCreateProjectForm() {
    return this.$store.state.showCreateProjectForm
  }
  get projects() {
    return Object.values(this.$store.getters.projects)
  }
  get currentProject() {
    return this.$store.getters.project
  }
  // /* Watchers */
  // @Watch('transferType')
  // onTransferTypeChange(newType: TransferType, oldType: TransferType) {
  //   this.$nextTick(function() {
  //     let element = <HTMLInputElement>this.$refs.amount
  //     if (element) element.focus()
  //   })
  // }
  // @Watch('amount')
  // onAmountChange(newAmount: number | string, oldAmount: number | string) {
  //   if (newAmount === 0 || newAmount === '0') {
  //     this.$nextTick(function() {
  //       this.amount = ''
  //     })
  //   }
  // }
  /* Methods */
  // setInputDate(e: any) {
  //   this.$data.date = new Date(e.target.value)
  // }
  toggleCreateProjectForm() {
    this.$data.showCreateForm = !this.$data.showCreateForm
    this.$data.showOpenProject = false
  }
  toggleOpenProject() {
    this.$data.showOpenProject = !this.$data.showOpenProject
    this.$data.showCreateForm = false
  }
  resetForm() {
    this.$data.title = ''
    this.$data.date = new Date()
  }
  validateForm() {
    if (this.$data.title === '') {
      console.error("Project name can't be empty")
      return false
    }
    if (
      Object.values(this.$store.getters.projects).find(
        project => (project as Project).title === this.$data.title
      )
    ) {
      console.error(
        "You're already member of a project named " +
          this.$data.title +
          '. Enter another name, please.'
      )
      return false
    }
    return true
  }
  addProject() {
    if (!this.validateForm()) return null
    // const date = this.$data.date.toISOString()
    this.$store.dispatch(Actions.ADD_PROJECT, this.$data.title)
    this.resetForm()
  }
  openProject(e: HTMLButtonEvent) {
    const projectId = e.target.id
    this.$store.dispatch(Actions.OPEN_PROJECT, projectId)
  }
}
</script>

<style lang="scss">
@import '../styles/_colors.scss';
@import '../styles/_mixins.scss';
.button,
.toggleCreateProjectForm,
.toggleOpenProject {
  font-size: 1em;
  @include btn-standard();
  margin: 1em auto;
}
.create-project-form {
  margin: 1em auto;
  padding-bottom: 6em;
  .form-group {
    margin: 4px auto;
  }
  input[type='radio'],
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
