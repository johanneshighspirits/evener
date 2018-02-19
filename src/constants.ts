export enum Mutations {
  LOGGED_IN = 'LOGGED_IN',
  LOGGED_OUT = 'LOGGED_OUT',
  LOAD_PROJECTS = 'LOAD_PROJECTS',
  NO_PROJECTS_FOUND = 'NO_PROJECTS_FOUND',
  UPDATE_PROJECT_ID = 'UPDATE_PROJECT_ID',
  DISPLAY_NOTIFICATION = 'DISPLAY_NOTIFICATION',
  GENERATE_INVITE_LINK = 'GENERATE_INVITE_LINK',
  INVITE_SENT = 'INVITE_SENT',
  INCREMENT_INVITE_STATUS = 'INCREMENT_INVITE_STATUS',
  INVITE_TIMED_OUT = 'INVITE_TIMED_OUT',
  DISPLAY_INVITE_HELP = 'DISPLAY_INVITE_HELP',
  SHOW_LOGIN_FORM = 'SHOW_LOGIN_FORM',
  INVITE_IS_VALID = 'INVITE_IS_VALID',
  ADD_TRANSFER = 'ADD_TRANSFER',
  EDIT_TRANSFER = 'EDIT_TRANSFER',
  DELETE_TRANSFER = 'DELETE_TRANSFER'
}

export enum Actions {
  GET_USER = 'GET_USER',
  GET_USER_PROJECTS = 'GET_USER_PROJECTS',
  OPEN_PROJECT = 'OPEN_PROJECT',
  ADD_TRANSFER = 'ADD_TRANSFER',
  INVITE_COLLABORATOR = 'INVITE_COLLABORATOR',
  OPEN_INVITE = 'OPEN_INVITE',
  VALIDATE_PROJECT_INVITE = 'VALIDATE_PROJECT_INVITE',
  ACCEPT_INVITE = 'ACCEPT_INVITE'
}

export enum Collections {
  PROJECTS = 'projects',
  USERS = 'users',
  TRANSFERS = 'transfers',
  INVITATIONS = 'invitations'
}
