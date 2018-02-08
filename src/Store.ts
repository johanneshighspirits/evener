import Vue from 'vue'
import Vuex from 'vuex'
import FirestoreDatabaseConnection from './FirestoreDatabaseConnection'
import { Actions, Mutations } from './constants'
import { Project } from './types/common'
import User from './models/User'
import Transfer from './models/Transfer'

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
    [Actions.GET_USER_PROJECTS]: async ({ state, commit, dispatch }) => {
      try {
        let projects: object = await db.getProjects(state.user.uid)
        commit(Mutations.LOAD_PROJECTS, projects)
        console.log('Projects loaded, open project')
        let projectId = 'yGuXxTD9cdueFvHHOisB'
        dispatch(Actions.OPEN_PROJECT, projectId)
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
    },
    [Actions.OPEN_PROJECT]: async ({ state, commit }, projectId) => {
      try {
        let project = state.projects[projectId]
        if (project.transfers === undefined) {
          // Load transfers
          let transfers: Transfer[] = await db.loadTransfers(projectId)
          project.transfers = transfers
        }
        commit(Mutations.UPDATE_PROJECT_ID, projectId)
      } catch (error) {
        debugger
      }
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
