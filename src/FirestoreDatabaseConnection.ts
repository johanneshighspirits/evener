import * as firebase from 'firebase'
import { Project, TransferType } from './types/common'
import User from './models/User'
import Transfer from './models/Transfer'
import { UserInfo, Invitation } from './types/common'
import { Collections, Mutations } from './constants'
import { Store } from 'vuex'
import { State } from './Store'

// interface FirestoreDatabaseConnection {
//   // Store a reference to vuex store
//   store: Store<State>
//   getOrCreateUser: (userInfo: UserInfo) => Promise<any>
//   // unsubscribeSetListWatch: () => {}
//   // unsubscribeSongsWatch: () => {}
// }

class FirestoreDatabaseConnection {
  projectUnsubscribe: () => void
  constructor(public store: Store<State>) {
    this.projectUnsubscribe = () => {}
    // this.store = store
  }

  getOrCreateUser = async (userInfo: UserInfo): Promise<any> => {
    try {
      const usersRef = await this.getCollectionRef(Collections.USERS)
      const userDoc = await (usersRef as any).doc(userInfo.uid).get()
      if (userDoc.exists) {
        const storedUser = userDoc.data()
        const user = new User({ ...storedUser })
        if (storedUser.avatar !== userInfo.avatar) {
          // Update avatar locally
          user.avatar = userInfo.avatar
          // Update avatar in firestore
          usersRef.doc(userInfo.uid).update({
            avatar: userInfo.avatar
          })
        }
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

  getProjects = (uid: string): Promise<{ [key: string]: Project }> => {
    return new Promise(async (resolve, reject) => {
      try {
        const projectsRef = await this.getCollectionRef(Collections.PROJECTS)
        const userProjects = await projectsRef.where(`users.${uid}`, '==', true).get()
        let projects: { [key: string]: Project } = {}
        userProjects.forEach(projectSnapshot => {
          let { title, users } = projectSnapshot.data()
          let project: Project = {
            id: projectSnapshot.id,
            title,
            transfers: [],
            users
          }
          projects[`${projectSnapshot.id}`] = project
        })
        return resolve(projects)
      } catch (error) {
        console.log(error)
        console.log('Found no projects')
        debugger
        return reject()
      }
    })
  }

  getUsersLastProjectId = (user: User): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      try {
        // Get users ref
        const usersRef = await this.getCollectionRef(Collections.USERS)
        const userDoc = await usersRef.doc(user.uid).get()
        const storedUser = userDoc.data()
        let currentProject = storedUser.currentProject
        return resolve(currentProject)
      } catch (error) {
        return reject(error)
      }
    })
  }

  storeUsersLastSetListId = (user: User, projectId: string): void => {
    // Get users ref
    this.getCollectionRef(Collections.USERS).then(usersRef => {
      return usersRef.doc(user.uid).set(
        {
          currentProject: projectId
        },
        { merge: true }
      )
    })
  }

  watchProject = (project: Project): void => {
    this.projectUnsubscribe()
    this.populateProjectUsers(project).then(() => {
      this.getCollectionRef(Collections.PROJECTS).then(projectsRef => {
        this.projectUnsubscribe = projectsRef
          .doc(project.id)
          .collection(Collections.TRANSFERS)
          .onSnapshot(snapshot => {
            snapshot.docChanges.forEach(change => {
              const transfer = Transfer.fromSnapshot(change.doc, project.users)
              const transferId = change.doc.id
              if (change.doc.metadata.hasPendingWrites) {
                // console.log('LOCAL CHANGE ONLY')
                switch (change.type) {
                  case 'added':
                    console.log(`Adding transfer ${transfer.date} to currentProject`)
                    this.store.commit(Mutations.ADD_TRANSFER, transfer)
                    break
                  case 'modified':
                    console.log('Edit transfer')
                    this.store.commit(Mutations.EDIT_TRANSFER, transfer)
                    break
                  case 'removed':
                    console.log('Remove transfer from currentProject')
                    this.store.commit(Mutations.DELETE_TRANSFER, transfer)
                    break
                }
              } else {
                // console.log('INCOMING CHANGE - UPDATE UI!!!')
                switch (change.type) {
                  case 'added':
                    console.log(`Adding transfer ${transfer.date} to currentProject`)
                    this.store.commit(Mutations.ADD_TRANSFER, transfer)
                    break
                  case 'modified':
                    console.log('Edit transfer')
                    this.store.commit(Mutations.EDIT_TRANSFER, transfer)
                    break
                  case 'removed':
                    console.log('Remove transfer from currentProject')
                    this.store.commit(Mutations.DELETE_TRANSFER, transfer)
                    break
                }
              }
            })
          })
      })
    })
  }

  /**
   * Populate Project with Users
   */
  populateProjectUsers = async (project: Project): Promise<Project> => {
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
            let { uid, name, avatar, email, currentProject } = userDoc.data()
            let userInfo: UserInfo = {
              uid,
              name,
              avatar,
              email,
              currentProject
            }
            project.users[userInfo.uid] = new User({ ...userInfo })
          })
        userFetchPromises.push(userFetchPromise)
      })
      await Promise.all(userFetchPromises)
      return project
    } catch (error) {
      debugger
      return project
    }
  }

  // populateProject = async (project: Project): Promise<Project> => {
  //   try {
  //     // Populate project with users
  //     await this.populateProjectUsers(project)
  //     // Project is now populated with users, load transfers
  //     await this.populateProjectTransfers(project)
  //     // All done
  //     return Promise.resolve(project)
  //   } catch (error) {
  //     console.error(error)
  //     debugger
  //     return Promise.reject(error)
  //   }
  // }

  // populateProjectTransfers = async (project: Project): Promise<Project> => {
  //   try {
  //     if (!project.users) await this.populateProjectUsers(project)
  //     const projectsRef = await this.getCollectionRef(Collections.PROJECTS)
  //     const storedProjectRef = await projectsRef.doc(project.id)
  //     const transfersCollection = await storedProjectRef.collection(Collections.TRANSFERS).get()
  //     // Init transfers array
  //     project.transfers = []
  //     transfersCollection.forEach(transferDoc => {
  //       project.transfers.push(Transfer.fromSnapshot(transferDoc, project.users))
  //     })
  //     // Sort according to date
  //     project.transfers = Transfer.sortByDate(project.transfers)
  //     return Promise.resolve(project)
  //   } catch (error) {
  //     return Promise.reject(error)
  //   }
  // }

  addTransfer = (transfer: Transfer, projectId: string, userId: string): Promise<object> => {
    return new Promise(async (resolve, reject) => {
      try {
        const projectsRef = await this.getCollectionRef(Collections.PROJECTS)
        const transfersRef = await projectsRef.doc(projectId).collection(Collections.TRANSFERS)
        // Check if transfer already exists
        let transferExists = false
        const serializedTransfer = transfer.serialize(userId)
        const transferDocs = await transfersRef
          .where('amount', '==', serializedTransfer.amount)
          .where('paidBy', '==', serializedTransfer.paidBy)
          .where('receiver', '==', serializedTransfer.receiver)
          .where('message', '==', serializedTransfer.message)
          .get()
        if (transferDocs) {
          transferDocs.forEach(doc => {
            let storedTransfer = doc.data()
            const storedDate = new Date(storedTransfer.date)
            if (
              storedDate.getFullYear() === transfer.date.getFullYear() &&
              storedDate.getMonth() === transfer.date.getMonth() &&
              storedDate.getDate() === transfer.date.getDate()
            ) {
              transferExists = true
            }
          })
          // Found no matches, proceed
        }
        if (transferExists) {
          console.log('Transfer already exists')
          throw new Error('Transfer already exists')
        }
        const transferDoc = await transfersRef.add(serializedTransfer)
        return resolve(transferDoc)
      } catch (error) {
        console.error(error)
        return reject(error)
      }
    })
  }

  addTransfers = (transfers: Transfer[], project: Project, userId: string): Promise<object> => {
    return new Promise(async (resolve, reject) => {
      try {
        const projectsRef = await this.getCollectionRef(Collections.PROJECTS)
        const transfersRef = await projectsRef.doc(project.id).collection(Collections.TRANSFERS)
        // Find existing transfers
        const existingTransfers = project.transfers.slice()
        // Sort added transfers
        const sortedTransfers = Transfer.sortByDate(transfers)
        // Init batch
        const db = firebase.firestore()
        let batch = db.batch()
        // Loop added transfers
        sortedTransfers.forEach((transfer, i) => {
          // Check if transfer already exists
          if (existingTransfers.find(storedTransfer => storedTransfer.isEqual(transfer))) {
            // Ignore existing transfer
            console.log('Transfer already exists, ignoring', transfer)
          } else {
            // Add transfer
            // Prepare for storage
            const serializedTransfer = transfer.serialize(userId)
            // Create doc ref
            let docRef = transfersRef.doc()
            // Add transfer
            batch.set(docRef, serializedTransfer)
          }
        })
        return batch.commit()
      } catch (error) {
        console.error(error)
        return reject(error)
      }
    })
  }

  deleteTransfer = (transferId: string, projectId: string) => {
    return new Promise(async (resolve, reject) => {
      try {
        const projectsRef = await this.getCollectionRef(Collections.PROJECTS)
        const transfersRef = await projectsRef.doc(projectId).collection(Collections.TRANSFERS)
        return resolve(transfersRef.doc(transferId).delete())
      } catch (error) {
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
        const invitationsRef = await this.getCollectionRef(Collections.INVITATIONS)
        // Check if invitation exists
        const existingInvitations = await invitationsRef
          .where('invited', '==', email)
          .where('projectId', '==', project.id)
          .limit(1)
          .get()
        if (!existingInvitations.empty) {
          // Return existing invitation id
          console.log('Found existing invitation', existingInvitations.docs[0])
          debugger
          return resolve(existingInvitations.docs[0].id)
        }
        // Create new invitation
        const invitationResult = await invitationsRef.add(invitation)
        console.log('Created new invitation', invitationResult)
        // Register invitation id on project
        const projectsRef = await this.getCollectionRef(Collections.PROJECTS)
        const projectInvitationResult = await projectsRef.doc(project.id).set(
          {
            invitedUsers: {
              [`${email}`]: true
            }
          },
          {
            merge: true
          }
        )
        return resolve(invitationResult.id)
      } catch (error) {
        console.error(error)
        return reject(error)
      }
    })
  }

  openInvite = (inviteId: string): Promise<Invitation> => {
    return new Promise(async (resolve, reject) => {
      try {
        const invitationsRef = await this.getCollectionRef(Collections.INVITATIONS)
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
        const invitationsRef = await this.getCollectionRef(Collections.INVITATIONS)
        const invitationDoc = await invitationsRef.doc(inviteId).get()
        const invitation = invitationDoc.data() as Invitation
        let user = firebase.auth().currentUser
        if (!user) {
          throw new Error('Can not validate invite if user is not logged in')
        } else {
          if (user.email === invitation.invited) {
            // User is valid, add user uid to project.users
            const accepted = await this.acceptInvite(invitation, inviteId, user.uid)
            if (!accepted)
              throw new Error(
                'User is valid but something went wrong when trying to unlock project.'
              )
            return resolve(true)
          } else {
            console.log("User's email doesn't match the invitation")
          }
        }
        return resolve(false)
      } catch (error) {
        console.error(error)
        return reject(false)
      }
    })
  }

  acceptInvite = (invitation: Invitation, inviteId: string, uid: string): Promise<boolean> => {
    return new Promise(async (resolve, reject) => {
      try {
        const projectsRef = await this.getCollectionRef(Collections.PROJECTS)
        // Remove invited email from project.invitedUsers and
        // add user uid to project.users
        await projectsRef.doc(invitation.projectId).set(
          {
            invitedUsers: {
              [`${invitation.invited}`]: firebase.firestore.FieldValue.delete()
            },
            users: {
              [`${uid}`]: true
            }
          },
          { merge: true }
        )
        // Remove invitation
        const invitationsRef = await this.getCollectionRef(Collections.INVITATIONS)
        await invitationsRef.doc(inviteId).delete()
        // Success
        return resolve(true)
      } catch (error) {
        console.error(error)
        return reject(error)
      }
    })
  }
}

export default FirestoreDatabaseConnection
