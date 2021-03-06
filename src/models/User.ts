import { UserInfo } from '../types/common'

class User {
  public uid: string
  public firstName: string
  public lastName: string
  public avatar: string
  public email: string
  public currentProject: string

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

  public name = (): string => {
    return `${this.firstName} ${this.lastName}`
  }

  public initials = (): string => {
    return `${this.firstName[0].toLocaleUpperCase()}${this.lastName[0].toLocaleUpperCase()}`
  }
}

export default User
