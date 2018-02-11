import Vue from 'vue'
import Vuex, { MutationTree, ActionTree, GetterTree } from 'vuex'
import FirestoreDatabaseConnection from './FirestoreDatabaseConnection'
import { Actions, Mutations } from './constants'
import { Project } from './types/common'
import User from './models/User'
import Transfer from './models/Transfer'

Vue.use(Vuex)

export interface State {
  user?: User
  projects: { [key: string]: Project }
  projectId: string
}

const state: State = {
  user: undefined,
  projects: {},
  projectId: ''
}

const mutations: MutationTree<State> = {
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
  },
  /* Notifications */
  [Mutations.DISPLAY_NOTIFICATION]: (state, message) => {
    console.log('[NOTIFICATION]', message)
  }
}

const actions: ActionTree<State, any> = {
  [Actions.GET_USER]: async ({ state, commit, dispatch }, userInfo) => {
    try {
      let user: User = await db.getOrCreateUser(userInfo)
      // Update local user?
      commit(Mutations.LOGGED_IN, user)
      dispatch(Actions.GET_USER_PROJECTS)
    } catch (error) {
      console.error(error)
    }
  },
  [Actions.GET_USER_PROJECTS]: async ({ state, commit, dispatch }) => {
    try {
      if (state.user === undefined) throw new Error('No user')
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
      if (project.transfers.length === 0) {
        // Load transfers and users
        await db.populateProject(project)
      }
      commit(Mutations.UPDATE_PROJECT_ID, projectId)
    } catch (error) {
      debugger
    }
  },
  [Actions.ADD_TRANSFER]: async ({ state, commit }, transfer) => {
    try {
      if (state.user === undefined) throw new Error('No User')
      await db.addTransfer(transfer, state.projectId, state.user.uid)
      commit(
        Mutations.DISPLAY_NOTIFICATION,
        'Transfer added: -',
        transfer.message
      )
    } catch (error) {
      commit(Mutations.DISPLAY_NOTIFICATION, error)
      debugger
    }
  }
}

const getters: GetterTree<State, any> = {
  project: state => {
    return state.projects[state.projectId]
  },
  user: state => {
    return state.user
  },
  users: state => {
    return state.projects[state.projectId].users
  }
}

// Init store
const store = new Vuex.Store<State>({
  state,
  getters,
  actions,
  mutations
})

// Init database connection
const db = new FirestoreDatabaseConnection(store)

export default store
