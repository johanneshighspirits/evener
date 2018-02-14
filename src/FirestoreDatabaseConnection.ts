import * as firebase from 'firebase'
import { Project, TransferType } from './types/common'
import User from './models/User'
import Transfer from './models/Transfer'
import { UserInfo, Invitation } from './types/common'
import { Collections } from './constants'
import { Store } from 'vuex'
import { State } from './Store'

interface FirestoreDatabaseConnection {
  // Store a reference to vuex store
  store: Store<State>
  getOrCreateUser: (userInfo: UserInfo) => Promise<any>
  // unsubscribeSetListWatch: () => {}
  // unsubscribeSongsWatch: () => {}
}

class FirestoreDatabaseConnection {
  constructor(public store: Store<State>) {
    // this.store = store
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
  getCollectionRef = async (
    collection: string
  ): Promise<firebase.firestore.CollectionReference> => {
    return firebase.firestore().collection(collection)
  }

  getProjects = async (
    uid: string
  ): Promise<{ [key: string]: Project } | object> => {
    return new Promise(async (resolve, reject) => {
      try {
        const projectsRef = await this.getCollectionRef(Collections.PROJECTS)
        const userProjects = await projectsRef
          .where(`users.${uid}`, '==', true)
          .get()
        let projects: { [key: string]: Project } = {}
        userProjects.forEach(projectSnapshot => {
          let { title, users } = projectSnapshot.data()
          let project: Project = {
            id: projectSnapshot.id,
            title,
            transfers: [],
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
      let userFetchPromises: Promise<void>[] = []
      // Loop through project's users' ids
      projectUserIds.forEach(userId => {
        const userFetchPromise = usersRef
          .doc(userId)
          .get()
          .then(userDoc => {
            let { uid, name, avatar, email } = userDoc.data()
            let userInfo: UserInfo = {
              uid,
              name,
              avatar,
              email
            }
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
        // console.log(transferData)
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
      // Sort according to date
      project.transfers.sort((a, b) => {
        return a.date < b.date ? 1 : -1
      })

      // All done
      return Promise.resolve(project)
    } catch (error) {
      console.error(error)
      debugger
      return Promise.reject(error)
    }
  }

  addTransfer = (
    transfer: Transfer,
    projectId: string,
    userId: string
  ): Promise<object> => {
    return new Promise(async (resolve, reject) => {
      try {
        const projectsRef = await this.getCollectionRef(Collections.PROJECTS)
        const transfersRef = await projectsRef
          .doc(projectId)
          .collection(Collections.TRANSFERS)
        const transferDoc = await transfersRef.add(transfer.serialize(userId))
        return resolve(transferDoc)
      } catch (error) {
        console.error(error)
        return reject(error)
      }
    })
  }

  inviteCollaborator = (
    email: string,
    inviter: User,
    project: Project
  ): Promise<string | object> => {
    return new Promise(async (resolve, reject) => {
      try {
        const invitation: Invitation = {
          invited: email,
          inviter: inviter.uid,
          projectId: project.id,
          projectName: project.title
        }
        const invitationsRef = await this.getCollectionRef(
          Collections.INVITATIONS
        )
        const result = await invitationsRef.add(invitation)
        return resolve(result.id)
      } catch (error) {
        console.error(error)
        return reject(error)
      }
    })
  }

  openInvite = (inviteId: string): Promise<Invitation> => {
    return new Promise(async (resolve, reject) => {
      try {
        const invitationsRef = await this.getCollectionRef(
          Collections.INVITATIONS
        )
        const invitationDoc = await invitationsRef.doc(inviteId).get()
        const invitation = invitationDoc.data() as Invitation
        return resolve(invitation)
      } catch (error) {
        console.error(error)
        return reject(error)
      }
    })
  }

  validateInvite = (inviteId: string): Promise<boolean> => {
    return new Promise(async (resolve, reject) => {
      try {
        const invitationsRef = await this.getCollectionRef(
          Collections.INVITATIONS
        )
        const invitationDoc = await invitationsRef.doc(inviteId).get()
        const invitation = invitationDoc.data() as Invitation
        let user = firebase.auth().currentUser
        if (!user) {
          console.error('Can not validate invite if user is not logged in')
        } else {
          if (user.email === invitation.invited) {
            // User is valid, add user uid to project.users
            const accepted = await this.acceptInvite(invitation, user.uid)
            if (!accepted)
              throw new Error(
                'User is valid but something went wrong when trying to unlock project.'
              )
            return resolve(true)
          }
        }
        return resolve(false)
      } catch (error) {
        console.error(error)
        return reject(false)
      }
    })
  }

  acceptInvite = (invitation: Invitation, uid: string): Promise<boolean> => {
    return new Promise(async (resolve, reject) => {
      try {
        const projectsRef = await this.getCollectionRef(Collections.PROJECTS)
        const result = await projectsRef.doc(invitation.projectId).set(
          {
            [`users.${uid}`]: true
          },
          { merge: true }
        )
        if (!result) {
          debugger
          throw new Error('error in db.acceptInvite()')
        }
        return resolve(true)
      } catch (error) {
        console.error(error)
        return reject(error)
      }
    })
  }
}

export default FirestoreDatabaseConnection
