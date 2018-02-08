class User {
  uid: string
  name: string
  avatar: string
  constructor() {}
  static userFrom = (uid: string) => {
    return new User()
  }
}

export default User
