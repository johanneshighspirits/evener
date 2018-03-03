<template>
  <transition name="fade-in-up" appear>
    <section v-if="project">
      <div class="menu" :class="{open: showMenu}">
        <div v-if="!showMenu" @click="showMenu = !showMenu">
          <p>MENU</p>
        </div>
        <div v-else>
          <p class="closer" @click="showMenu = false">X</p>
          <ul>
            <li v-for="(item, i) in menuItems" :key="i" @click="selectMenuItem(i)">{{ item }}</li>
          </ul>
        </div>
      </div>
      <article @click="showMenu = false" :class="{blurred: showMenu}" class="blurrable">
        <h2>{{ project.title }}</h2>
        <transition name="fade-in-left">
          <add-transfer-form v-if="menuSelection == 0"/>
          <add-transfers-form v-if="menuSelection == 1"/>
          <invite-collaborator-form v-else-if="menuSelection == 2"/>
          <open-project-form v-else-if="menuSelection == 3" />
          <create-project-form v-else-if="menuSelection == 4" />
        </transition>
        <calculator/>
        <transfers/>
      </article>
    </section>
    <section v-else>
      <div v-if="noUserProjects">
        <create-project-form />
      </div>
      <div v-else>
        <p>Loading project...</p>
      </div>
    </section>
  </transition>
</template>

<script lang="ts">
import Vue from 'vue'
import Transfers from './Transfers.vue'
import Calculator from './Calculator.vue'
import AddTransferForm from './AddTransferForm.vue'
import AddTransfersForm from './AddTransfersForm.vue'
import CreateProjectForm from './CreateProjectForm.vue'
import OpenProjectForm from './OpenProjectForm.vue'
import InviteCollaboratorForm from './InviteCollaboratorForm.vue'
import { Project } from '../types/common'
import { Mutations } from '../constants'
export default Vue.extend({
  name: 'project',
  data() {
    return {
      showMenu: false,
      menuItems: [
        'Add Transfer',
        'Add Transfers',
        'Share Project',
        'Open Project',
        'Create Project'
      ]
    }
  },
  components: {
    Transfers,
    Calculator,
    AddTransferForm,
    AddTransfersForm,
    CreateProjectForm,
    OpenProjectForm,
    InviteCollaboratorForm
  },
  computed: {
    noUserProjects(): boolean {
      return this.$store.state.noUserProjects
    },
    project(): Project {
      return this.$store.getters.project
    },
    menuSelection(): number {
      return this.$store.state.menuSelection
    }
  },
  methods: {
    selectMenuItem(item: number) {
      if (this.menuSelection === item) {
        this.$store.commit(Mutations.SELECT_MENU, -1)
        // this.menuSelection = -1
      } else {
        this.$store.commit(Mutations.SELECT_MENU, item)
        // this.menuSelection = item
      }
      this.showMenu = false
    }
  }
})
</script>

<style lang="scss" scoped>
@import '../styles/_colors.scss';
@import '../styles/_mixins.scss';

.menu {
  position: absolute;
  left: 1em;
  top: 1em;
  padding: 0 1em 0.5em;
  cursor: pointer;
  z-index: 999;
  &.open {
    // border: 1px solid red;
  }
  ul,
  li {
    padding: 0;
    list-style: none;
  }
  li {
    @include btn-standard();
    margin-bottom: 3px;
    background: #fff;
    &:hover {
      @include btn-semi();
    }
  }
}
</style>
