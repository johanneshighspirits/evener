import Vue from 'vue'
import Vuex from 'vuex'
import FirestoreDatabaseConnection from './FirestoreDatabaseConnection'
import { Actions, Mutations } from './constants'
import { User, Project } from './types/common'

Vue.use(Vuex)

interface State {
  user: User
  projects: {}
  projectId: string
}

const state: State = {
  user: undefined,
  projects: {},
  projectId: ''
}
// Init store
const store = new Vuex.Store({
  state,
  getters: {
    project: state => {
      return state.projects[state.projectId]
    }
  },
  actions: {
    [Actions.GET_USER_PROJECTS]: async ({ state, commit }) => {
      try {
        let projects: object = await db.getProjects(state.user.uid)
        commit(Mutations.LOAD_PROJECTS, projects)
        let projectId = 'yGuXxTD9cdueFvHHOisB'
        commit(Mutations.UPDATE_PROJECT_ID, projectId)
        console.log('Projects loaded')
      } catch (error) {
        debugger
      }
      // if (Object.keys(projects).length > 0) {
      //   let setListId = await db.getUsersLastSetListId(state.user.uid)
      //   if (!setListId) {
      //     setListId = Object.keys(projects)[0]
      //     if (setListId) {
      //       if (projects[setListId]) {
      //         db.persistCurrentSetListId(state.user.uid, setListId)
      //       } else {
      //         db.deleteCurrentSetListId(state.user.uid)
      //       }
      //     }
      //   }
      //   commit('loadSetLists', projects)
      //   commit('updateSetListId', setListId)
      //   db.watchSetList(setListId)
      // } else {
      //   console.warn('No projects found')
      // }
    }
  },
  mutations: {
    /* Authorization */
    [Mutations.LOGGED_IN]: (state, user: User) => {
      state.user = user
    },
    [Mutations.LOGGED_OUT]: state => {
      state.user = undefined
      state.projects = {}
      state.projectId = ''
    },
    [Mutations.LOAD_PROJECTS]: (state, projects) => {
      state.projects = projects
    },
    [Mutations.UPDATE_PROJECT_ID]: (state, projectId) => {
      state.projectId = projectId
    }
  }
})

// Init database connection
const db = new FirestoreDatabaseConnection(store)

export default store
