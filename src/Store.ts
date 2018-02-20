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
  noUserProjects: boolean
  projectId: string
  inviteLink: string
  inviteTimedOut: boolean
  displayInviteHelp: boolean
  inviteStatus: number
  showLoginForm: boolean
  inviteIsValid: boolean
}

const state: State = {
  user: undefined,
  projects: {},
  noUserProjects: false,
  projectId: '',
  inviteTimedOut: false,
  displayInviteHelp: false,
  inviteLink: '',
  inviteStatus: 0,
  showLoginForm: false,
  inviteIsValid: false
}

const mutations: MutationTree<State> = {
  /* Authorization */
  [Mutations.SHOW_LOGIN_FORM]: state => {
    state.showLoginForm = true
  },
  [Mutations.LOGGED_IN]: (state, user: User) => {
    state.user = user
  },
  [Mutations.LOGGED_OUT]: state => {
    state.user = undefined
    state.projects = {}
    state.projectId = ''
  },
  /* Project handling */
  [Mutations.LOAD_PROJECTS]: (state, projects) => {
    state.projects = projects
  },
  [Mutations.NO_PROJECTS_FOUND]: state => {
    state.noUserProjects = true
  },
  [Mutations.UPDATE_PROJECT_ID]: (state, projectId) => {
    state.projectId = projectId
  },
  /* Transfers */
  [Mutations.ADD_TRANSFER]: (state, transfer: Transfer) => {
    // Loop through existing transfers and find the first date that is sooner (less) than
    // incoming transfer date.
    let transferId = state.projects[state.projectId].transfers.findIndex(localTransfer => {
      return localTransfer.date.getTime() < transfer.date.getTime()
    })
    if (transferId > -1) {
      state.projects[state.projectId].transfers.splice(transferId, 0, transfer)
    } else {
      // Add transfer to end of array
      state.projects[state.projectId].transfers.push(transfer)
    }
  },
  [Mutations.EDIT_TRANSFER]: (state, transfer: Transfer) => {
    // Update Transfer
    let transferId = state.projects[state.projectId].transfers.findIndex(localTransfer => {
      return localTransfer.id === transfer.id
    })
    Vue.set(state.projects[state.projectId].transfers, transferId, transfer)
  },
  [Mutations.DELETE_TRANSFER]: (state, transfer: Transfer) => {
    // Delete Transfer from array
    let transferId = state.projects[state.projectId].transfers.findIndex(localTransfer => {
      return localTransfer.id === transfer.id
    })
    state.projects[state.projectId].transfers.splice(transferId, 1)
  },
  /* Notifications */
  [Mutations.DISPLAY_NOTIFICATION]: (state, message) => {
    console.log('[NOTIFICATION]', message)
  },
  /* Invitations */
  [Mutations.GENERATE_INVITE_LINK]: (state, inviteLink) => {
    state.inviteLink = inviteLink
    state.inviteStatus += 1
  },
  [Mutations.INCREMENT_INVITE_STATUS]: state => {
    state.inviteStatus += 1
  },
  [Mutations.DISPLAY_INVITE_HELP]: (state, displayInviteHelp) => {
    state.displayInviteHelp = displayInviteHelp
    state.inviteStatus += 1
  },
  [Mutations.INVITE_IS_VALID]: (state, isValid) => {
    state.inviteIsValid = isValid
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
      console.warn('[TODO]: Check if any projects exists in Store.Actions.GET_USER_PROJECTS.')
      commit(Mutations.LOAD_PROJECTS, projects)
      console.log('Projects loaded', projects)
      let projectId = state.user.currentProject || (await db.getUsersLastProjectId(state.user))
      // let projectId = 'yGuXxTD9cdueFvHHOisB'
      if (!projectId) {
        console.log(
          '[TODO:] Found no current project, select the first or show list of all users projects?'
        )
        projectId = Object.keys(projects)[0]
      }
      console.log('Opening project with id:', projectId)
      dispatch(Actions.OPEN_PROJECT, projectId)
    } catch (error) {
      commit(Mutations.NO_PROJECTS_FOUND)
      debugger
    }
  },
  [Actions.OPEN_PROJECT]: async ({ state, commit }, projectId) => {
    try {
      let project = state.projects[projectId]
      if (project.transfers.length === 0) {
        // Watch transfers and users
        db.watchProject(project)
        // Load transfers and users
        // await db.populateProject(project)
      }
      // Make sure currentProjectId is updated
      if (state.user && state.user.currentProject !== projectId) {
        db.storeUsersLastSetListId(state.user, projectId)
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
      commit(Mutations.DISPLAY_NOTIFICATION, 'Transfer added: -', transfer.message)
    } catch (error) {
      commit(Mutations.DISPLAY_NOTIFICATION, error)
      debugger
    }
  },
  [Actions.ADD_TRANSFERS]: async ({ state, commit }, transfers) => {
    try {
      if (state.user === undefined) throw new Error('No User')
      await db.addTransfers(transfers, state.projects[state.projectId], state.user.uid)
      commit(Mutations.DISPLAY_NOTIFICATION, 'Transfer added: - ' + transfers.message)
    } catch (error) {
      commit(Mutations.DISPLAY_NOTIFICATION, error)
      debugger
    }
  },
  /* Collaboration */
  /**
   * Register an invitation at firestore /invitations/{inviteId}
   * Generate an invite link
   * Display notification
   */
  [Actions.INVITE_COLLABORATOR]: async ({ state, commit }, email) => {
    try {
      const inviteId = await db.inviteCollaborator(
        email,
        state.user!,
        state.projects[state.projectId]
      )
      commit(Mutations.GENERATE_INVITE_LINK, `${window.location.origin}/invitations/${inviteId}`)
      commit(
        Mutations.DISPLAY_NOTIFICATION,
        `${email} invited to ${state.projects[state.projectId].title}. ${
          window.location.origin
        }/invitations/${inviteId}`
      )
    } catch (error) {
      commit(Mutations.DISPLAY_NOTIFICATION, error)
      debugger
    }
  },
  /**
   * An unauthed user has clicked an invite link, open invitation
   * and validate user
   */
  [Actions.OPEN_INVITE]: async ({ state, commit }, inviteId) => {
    try {
      const invite = await db.openInvite(inviteId)
      commit(Mutations.SHOW_LOGIN_FORM)
      commit(
        Mutations.DISPLAY_NOTIFICATION,
        `${invite.invited} opened invite to ${invite.projectName}.`
      )
    } catch (error) {
      commit(Mutations.DISPLAY_NOTIFICATION, error)
      debugger
    }
  },
  [Actions.VALIDATE_PROJECT_INVITE]: async ({ state, commit }, inviteId) => {
    try {
      const isValid = await db.validateInvite(inviteId)
      commit(Mutations.DISPLAY_NOTIFICATION, `Invite isValid: ${isValid}`)
      // Redirect to project (happens in Validate.vue when isValid switches to true)
      commit(Mutations.INVITE_IS_VALID, isValid)
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
  transfers: state => {
    return state.projects[state.projectId].transfers
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
