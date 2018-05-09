import uuidv1 from 'uuid/v1'
import Vue from 'vue'
import Vuex, { ActionTree, GetterTree, MutationTree } from 'vuex'
import { Actions, Mutations } from './constants'
import FirestoreDatabaseConnection from './FirestoreDatabaseConnection'
import Transfer from './models/Transfer'
import User from './models/User'
import { Notification, Project } from './types/common'

Vue.use(Vuex)

export interface IState {
  user?: User
  projects: { [key: string]: Project }
  noUserProjects: boolean
  projectId: string
  isOpening: boolean
  inviteLink: string
  inviteTimedOut: boolean
  displayInviteHelp: boolean
  inviteStatus: number
  inviteIsValid: boolean
  showLoginForm: boolean
  showContextMenu: boolean
  menu: object
  menuSelection: number
  notifications: Notification[]
}

const initialState: IState = {
  user: undefined,
  projects: {},
  noUserProjects: false,
  projectId: '',
  isOpening: true,
  inviteTimedOut: false,
  displayInviteHelp: false,
  inviteLink: '',
  inviteStatus: 0,
  showLoginForm: false,
  showContextMenu: false,
  inviteIsValid: false,
  menu: {},
  menuSelection: -1,
  notifications: []
}

const mutations: MutationTree<IState> = {
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
  [Mutations.OPENING_PROJECT]: (state, isOpening) => {
    state.isOpening = isOpening
  },
  [Mutations.UPDATE_PROJECT_ID]: (state, projectId) => {
    state.projectId = projectId
  },
  /* Transfers */
  [Mutations.ADD_TRANSFER]: (state, transfer: Transfer) => {
    // Loop through existing transfers and find the first date that is sooner (less) than
    // incoming transfer date.
    const transferId = state.projects[state.projectId].transfers.findIndex(localTransfer => {
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
    const transferId = state.projects[state.projectId].transfers.findIndex(localTransfer => {
      return localTransfer.id === transfer.id
    })
    Vue.set(state.projects[state.projectId].transfers, transferId, transfer)
  },
  [Mutations.DELETE_TRANSFER]: (state, transfer: Transfer) => {
    // Delete Transfer from array
    const transferId = state.projects[state.projectId].transfers.findIndex(localTransfer => {
      return localTransfer.id === transfer.id
    })
    state.projects[state.projectId].transfers.splice(transferId, 1)
  },
  /* Notifications */
  [Mutations.DISPLAY_NOTIFICATION]: (state, notification) => {
    console.log('[NOTIFICATION]', notification)
    if (!notification.message) {
      throw new Error('[NO MESSAGE:] ' + notification)
    }
    const id = uuidv1()
    state.notifications.unshift({
      id,
      title: notification.title,
      message: notification.message
    })
    setTimeout(() => {
      state.notifications = state.notifications.filter(n => {
        return n.id !== id
      })
    }, 5000)
  },
  [Mutations.CLOSE_NOTIFICATION]: (state, id) => {
    state.notifications = state.notifications.filter(notification => {
      return notification.id !== id
    })
  },
  /* Menu */
  [Mutations.SELECT_MENU]: (state, item) => {
    state.menuSelection = item
  },
  /* Context Menu */
  [Mutations.SHOW_CONTEXT_MENU]: (state, menu) => {
    state.showContextMenu = true
    state.menu = menu
  },
  [Mutations.HIDE_CONTEXT_MENU]: (state, menu) => {
    state.showContextMenu = false
    state.menu = {}
  },
  /* Invitations */
  [Mutations.GENERATE_INVITE_LINK]: (state, inviteLink) => {
    state.inviteLink = inviteLink
    state.inviteStatus += 1
  },
  [Mutations.INCREMENT_INVITE_STATUS]: state => {
    state.inviteStatus += 1
    console.log(`state.inviteStatus: ${state.inviteStatus}`)
  },
  [Mutations.DISPLAY_INVITE_HELP]: (state, displayInviteHelp) => {
    state.displayInviteHelp = displayInviteHelp
    state.inviteStatus += 1
  },
  [Mutations.INVITE_IS_VALID]: (state, isValid) => {
    state.inviteIsValid = isValid
  }
}

const actions: ActionTree<IState, any> = {
  [Actions.GET_USER]: async ({ state, commit, dispatch }, userInfo) => {
    try {
      const user: User = await db.getOrCreateUser(userInfo)
      // Update local user?
      commit(Mutations.LOGGED_IN, user)
      dispatch(Actions.GET_USER_PROJECTS)
    } catch (error) {
      console.error(error)
    }
  },
  [Actions.GET_USER_PROJECTS]: async ({ state, commit, dispatch }) => {
    try {
      if (state.user === undefined) {
        throw new Error('No user')
      }
      const projects: { [key: string]: Project } = await db.getProjects(state.user.uid)
      if (Object.keys(projects).length === 0) {
        state.noUserProjects = true
      } else {
        commit(Mutations.LOAD_PROJECTS, projects)
        let projectId = state.user.currentProject || (await db.getUsersLastProjectId(state.user))
        if (!projectId) {
          console.log(
            '[TODO:] Found no current project, select the first or show list of all users projects?'
          )
          projectId = Object.keys(projects)[0]
        }
        console.log('Opening project with id:', projectId)
        dispatch(Actions.OPEN_PROJECT, projectId)
      }
    } catch (error) {
      commit(Mutations.NO_PROJECTS_FOUND)
      debugger
    }
  },
  [Actions.OPEN_PROJECT]: async ({ state, commit }, projectId) => {
    try {
      const project = state.projects[projectId]
      // Watch transfers and users
      commit(Mutations.OPENING_PROJECT, true)
      db.watchProject(project)
      // Make sure currentProjectId is updated
      if (state.user && state.user.currentProject !== projectId) {
        db.storeUsersLastSetListId(state.user, projectId)
      }
      commit(Mutations.UPDATE_PROJECT_ID, projectId)
    } catch (error) {
      debugger
    }
  },
  [Actions.ADD_PROJECT]: async ({ state, commit, dispatch }, title) => {
    try {
      if (state.user === undefined) {
        throw new Error('No User')
      }
      const newProjectId = await db.addProject(title, state.user)
      state.user.currentProject = newProjectId
      dispatch(Actions.GET_USER_PROJECTS)
      commit(Mutations.SELECT_MENU, -1)
      commit(Mutations.DISPLAY_NOTIFICATION, {
        title: `Project ${title} added`,
        message: 'Opening...'
      })
    } catch (error) {
      debugger
      commit(Mutations.DISPLAY_NOTIFICATION, {
        title: 'ERROR',
        message: error
      })
    }
  },
  [Actions.ADD_TRANSFER]: async ({ state, commit }, transfer) => {
    try {
      if (state.user === undefined) {
        throw new Error('No User')
      }
      await db.addTransfer(transfer, state.projectId, state.user.uid)
      commit(Mutations.SELECT_MENU, -1)
      commit(Mutations.DISPLAY_NOTIFICATION, {
        title: 'Transfer added',
        message: transfer.message
      })
    } catch (error) {
      commit(Mutations.DISPLAY_NOTIFICATION, {
        title: 'ERROR',
        message: error
      })
      debugger
    }
  },
  [Actions.ADD_TRANSFERS]: async ({ state, commit }, transfers) => {
    try {
      if (state.user === undefined) {
        throw new Error('No User')
      }
      await db.addTransfers(transfers, state.projects[state.projectId], state.user.uid)
      commit(Mutations.SELECT_MENU, -1)
      commit(Mutations.DISPLAY_NOTIFICATION, {
        title: 'Transfers added',
        message: transfers.message
      })
    } catch (error) {
      commit(Mutations.DISPLAY_NOTIFICATION, {
        title: 'ERROR',
        message: error
      })
      debugger
    }
  },
  [Actions.EDIT_TRANSFER]: async ({ state, commit }, transfer) => {
    console.log(transfer)
    debugger
    // try {
    //   if (state.user === undefined) throw new Error('No User')
    //   await db.addTransfer(transfer, state.projectId, state.user.uid)
    //   commit(Mutations.DISPLAY_NOTIFICATION, 'Transfer added: - ' + transfer.message)
    // } catch (error) {
    //   commit(Mutations.DISPLAY_NOTIFICATION, error)
    //   debugger
    // }
  },
  [Actions.DELETE_TRANSFER]: async ({ state, commit }, transferId) => {
    try {
      await db.deleteTransfer(transferId, state.projectId)
      commit(Mutations.DISPLAY_NOTIFICATION, {
        title: 'Transfer deleted',
        message: ''
      })
    } catch (error) {
      commit(Mutations.DISPLAY_NOTIFICATION, {
        title: 'ERROR',
        message: error
      })
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
      commit(Mutations.DISPLAY_NOTIFICATION, {
        title: 'Invitation complete.',
        message: `${email} invited to ${state.projects[state.projectId].title}. ${
          window.location.origin
        }/invitations/${inviteId}`
      })
    } catch (error) {
      commit(Mutations.DISPLAY_NOTIFICATION, {
        title: 'ERROR',
        message: error
      })
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
      commit(Mutations.DISPLAY_NOTIFICATION, {
        title: `Finding invite`,
        message: `${invite.invited} opened invite to ${invite.projectName}.`
      })
    } catch (error) {
      commit(Mutations.DISPLAY_NOTIFICATION, {
        title: 'ERROR',
        message: error
      })
      debugger
    }
  },
  [Actions.VALIDATE_PROJECT_INVITE]: async ({ state, commit }, inviteId) => {
    try {
      const isValid = await db.validateInvite(inviteId)
      commit(Mutations.DISPLAY_NOTIFICATION, {
        title: `Invite isValid: ${isValid}`,
        message: 'Opening project...'
      })
      // Redirect to project (happens in Validate.vue when isValid switches to true)
      commit(Mutations.INVITE_IS_VALID, isValid)
    } catch (error) {
      commit(Mutations.DISPLAY_NOTIFICATION, {
        title: 'ERROR',
        message: error
      })
      debugger
    }
  }
}

const getters: GetterTree<IState, any> = {
  project: state => {
    return state.projects[state.projectId]
  },
  projects: state => {
    return state.projects
  },
  isOpening: state => {
    return state.isOpening
  },
  transfers: state => {
    if (!state.projects[state.projectId]) {
      return
    }
    return state.projects[state.projectId].transfers
  },
  user: state => {
    return state.user
  },
  users: state => {
    if (!state.projects[state.projectId]) {
      return
    }
    return state.projects[state.projectId].users
  },
  showContextMenu: state => {
    return state.showContextMenu
  },
  menu: state => {
    return state.menu
  }
}

// Init store
const store = new Vuex.Store<IState>({
  state: initialState,
  getters,
  actions,
  mutations
})

// Init database connection
const db = new FirestoreDatabaseConnection(store)

export default store
