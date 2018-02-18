import { UserInfo } from '../types/common'

class User {
  uid: string
  firstName: string
  lastName: string
  avatar: string
  email: string
  currentProject: string

  constructor(userInfo: UserInfo) {
    const { name, email, avatar, uid, currentProject } = userInfo
    if (name) {
      const names = name.split(' ')
      this.firstName = names[0]
      this.lastName = names[1]
    } else {
      this.firstName = 'Undefined'
      this.lastName = 'Undefined'
    }
    this.uid = uid
    this.avatar = avatar
    this.email = email
    this.currentProject = currentProject
  }

  name = (): string => {
    return `${this.firstName} ${this.lastName}`
  }

  initials = (): string => {
    return `${this.firstName[0].toLocaleUpperCase()}${this.lastName[0].toLocaleUpperCase()}`
  }
}

export default User
