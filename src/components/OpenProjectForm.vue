<template>
  <transition name="fade-in-up">
    <div>
      <h2>Projects</h2>
      <p>Click a project to open</p>
      <div>
        <button
          class="button"
          v-for="project in projects"
          v-if="project.id !== currentProject.id"
          @click="openProject"
          :id="project.id"
          :key="project.id">
          {{ project.title }}
        </button>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import { Actions } from '../constants'
import { Project } from '../types/common'

interface HTMLButtonEvent extends Event {
  target: HTMLButtonElement & EventTarget
}

@Component
export default class OpenProjectForm extends Vue {
  /* data */
  /* Computed values (getters) */
  get projects() {
    return Object.values(this.$store.getters.projects)
  }
  get currentProject() {
    return this.$store.getters.project
  }
  /* Methods */
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
