import { UserInfo } from '../types/common'

class User {
  uid: string
  firstName: string
  lastName: string
  avatar: string

  constructor(userInfo: UserInfo) {
    const { name, avatar, uid } = userInfo
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
  }

  name = (): string => {
    return `${this.firstName} ${this.lastName}`
  }

  initials = (): string => {
    return `${this.firstName[0].toLocaleUpperCase()}${this.lastName[0].toLocaleUpperCase()}`
  }
}

export default User
