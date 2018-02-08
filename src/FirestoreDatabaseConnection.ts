import firebase from 'firebase'
import { Project, TransferType } from './types/common'
import User from './models/User'
import Transfer from './models/Transfer'
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

  getOrCreateUser = async (user: User): Promise<any> => {
    const db = firebase.firestore()
    try {
      let storedUserDoc = await db
        .collection('users')
        .doc(user.uid)
        .get()
      if (storedUserDoc.exists) {
        let storedUser = storedUserDoc.data()
        return storedUser
      } else {
        // create user
        db
          .collection('users')
          .doc(user.uid)
          .set(user)
          .then(() => {
            return user
          })
      }
    } catch (error) {
      console.log('error')
      console.log(error)
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

  loadTransfers = async (projectId: string): Promise<Transfer[] | any> => {
    return new Promise(async (resolve, reject) => {
      try {
        const projectsRef = await this.getCollectionRef(Collections.PROJECTS)
        const transfersCollection = await (projectsRef as any)
          .doc(projectId)
          .collection(Collections.TRANSFERS)
          .get()
        let transfers: Transfer[] = []
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
          let transfer = new Transfer(
            amount,
            date,
            transferType,
            message,
            paidBy,
            receiver
          )
          transfers.push(transfer)
        })
        return resolve(transfers)
      } catch (error) {
        console.log(error)
        debugger
        return reject({ message: 'Found no transfers' })
      }
    })
  }
}

export default FirestoreDatabaseConnection
