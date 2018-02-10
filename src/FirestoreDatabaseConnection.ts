import firebase from 'firebase'
import { Project, TransferType } from './types/common'
import User from './models/User'
import Transfer from './models/Transfer'
import { UserInfo } from './types/common'
import { Collections } from './constants'

class FirestoreDatabaseConnection {
  // Store a reference to vuex store
  store: object
  unsubscribeSetListWatch: () => {}
  unsubscribeSongsWatch: () => {}
  constructor(store: object) {
    this.store = store
    this.unsubscribeSetListWatch = undefined
    this.unsubscribeSongsWatch = undefined
  }

  getOrCreateUser = async (userInfo: UserInfo): Promise<any> => {
    try {
      const usersRef = await this.getCollectionRef(Collections.USERS)
      const userDoc = await (usersRef as any).doc(userInfo.uid).get()
      if (userDoc.exists) {
        const storedUser = userDoc.data()
        const user = new User({ ...storedUser })
        return user
      } else {
        // create user
        const newUser = await usersRef.doc(userInfo.uid).set(userInfo)
        const user = new User({ ...userInfo })
        return user
      }
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * Get a reference to a firestore collection
   * @param {string} collection - Identifier for the collection to get.
   * Possible values are: `setlists`, `users`, `invitations`
   */
  getCollectionRef = async (collection: string): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      const db = firebase.firestore()
      try {
        const ref = await db.collection(collection)
        return resolve(ref)
      } catch (error) {
        return reject('Error: Found no projects. ' + error)
      }
    })
  }

  getProjects = async (uid: string): Promise<object> => {
    return new Promise(async (resolve, reject) => {
      try {
        const projectsRef = await this.getCollectionRef(Collections.PROJECTS)
        const userProjects = await (projectsRef as any)
          .where(`users.${uid}`, '==', true)
          .get()
        let projects: object = {}
        userProjects.forEach(projectSnapshot => {
          let { title, users } = projectSnapshot.data()
          let project: Project = {
            id: projectSnapshot.id,
            title,
            transfers: undefined,
            users
          }
          projects[projectSnapshot.id] = project
        })
        return resolve(projects)
      } catch (error) {
        console.log(error)
        debugger
        return reject({ message: 'Found no projects' })
      }
    })
  }

  populateProject = async (project: Project): Promise<Project> => {
    try {
      // Get projects ref
      const projectsRef = await this.getCollectionRef(Collections.PROJECTS)
      // Load users
      const storedProjectRef = await projectsRef.doc(project.id)
      const storedProjectDoc = await storedProjectRef.get()
      const storedProject = storedProjectDoc.data()
      const projectUserIds = Object.keys(storedProject.users)
      // Get users ref
      const usersRef = await this.getCollectionRef(Collections.USERS)
      let userFetchPromises = []
      // Loop through project's users' ids
      projectUserIds.forEach(userId => {
        const userFetchPromise = (usersRef as any)
          .doc(userId)
          .get()
          .then(userDoc => {
            let userInfo: UserInfo = userDoc.data()
            project.users[userInfo.uid] = new User({ ...userInfo })
          })
        userFetchPromises.push(userFetchPromise)
      })
      await Promise.all(userFetchPromises)
      // Project is now populated with users, load transfers
      const transfersCollection = await storedProjectRef
        .collection(Collections.TRANSFERS)
        .get()
      // Init transfers array
      project.transfers = []
      transfersCollection.forEach(transferDoc => {
        let transferData = transferDoc.data()
        console.log(transferData)
        let {
          amount,
          date,
          transferType,
          message,
          paidBy,
          receiver
        } = transferData
        let paidByUser = project.users[paidBy]
        let receiverUser = project.users[receiver]
        let transfer = new Transfer(
          amount,
          date,
          transferType,
          message,
          paidByUser,
          receiverUser
        )
        project.transfers.push(transfer)
      })
      // All done
      return project
    } catch (error) {
      console.error(error)
      debugger
    }
  }

  addTransfer = (
    transfer: Transfer,
    projectId: string,
    userId: string
  ): Promise<object> => {
    return new Promise(async (resolve, reject) => {
      try {
        const transfersRef = await (this.getCollectionRef(
          Collections.PROJECTS
        ) as any)
          .doc(projectId)
          .collection(Collections.TRANSFERS)
        return transfersRef.push(transfer.serialize(userId))
      } catch (error) {
        console.error(error)
        return reject(error)
      }
    })
  }
}

export default FirestoreDatabaseConnection
