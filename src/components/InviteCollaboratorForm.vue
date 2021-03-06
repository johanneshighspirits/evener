<template>
  <form @submit.prevent="inviteCollaborator" class="invite-collaborator-form form">
    <div class="form-group">
      <p><b>{{ statusHeading[status] }}</b></p>
      <p>{{ statusText[status] }}</p>
      <transition name="fade-in-up">
        <input v-if="!inviteLink" type="email" class="button bordered" v-model="email" placeholder="Enter email">
      </transition>
      <transition name="fade-in-up">
        <a v-if="emailIsValid && !inviteLink" href="#" @click.prevent="generateInvite" class="button bordered margin-top">{{ btnText }}</a>
      </transition>
      <transition name="fade-in-up">
        <a v-if="inviteLink && !displayInviteHelp" :href="emailLink" @click="sendInvite" class="button bordered margin-top">EMAIL INVITE</a>
      </transition>
      <transition name="fade-in-up">
        <div v-if="displayInviteHelp">
          <a :href="inviteLink" target="_blank" class="button bordered margin-top">INVITE LINK</a>
          <a href="/" class="button bordered margin-top">BACK TO PROJECT</a>
        </div>
      </transition>
    </div>
  </form>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Actions, Mutations } from '../constants'
import Transfer from '../models/Transfer'
import { TransferType, JSONTransfer } from '../types/common'
import User from '../models/User'

interface IHTMLInputEvent extends Event {
  target: HTMLInputElement & EventTarget
}

@Component
export default class InviteCollaboratorForm extends Vue {
  /* data */
  public email: string = ''
  public invitePending: boolean = false
  public timer: number = -1
  public inviteClickCounter: number = 0
  public statusHeading: string[] = [
    `Invite a friend to ${this.$store.getters.project.title}`,
    'Please, wait...',
    'Email your friend',
    'Creating email',
    "Doesn't work?"
  ]
  public statusText: string[] = [
    "Enter your friend's email address",
    'Generating an invite link',
    'Click below to open your mail program and send an email containing an invite',
    'Opening your default email program to send the invite link via email...',
    `You may also right click the invite link below, choose "copy link" and send to your friend however you want. Or go back to '${
      this.$store.getters.project.title
    }' if everything went well.`
  ]
  public btnText: string = 'GENERATE INVITE LINK'
  /* Computed values (getters) */
  get status() {
    return this.$store.state.inviteStatus
  }
  get users() {
    return this.$store.getters.users
  }
  get inviteLink() {
    return this.$store.state.inviteLink
  }
  get emailLink() {
    const subject = 'You have been invited to ' + this.$store.getters.project.title
    const body = [
      'Hi',
      'You have been invited to an Evener project.',
      `Follow this link to accept the invitation for ${this.$store.getters.project.title}`,
      this.$store.state.inviteLink
    ]
    return `mailto:${this.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
      body.join('\n')
    )}`
  }
  get emailIsValid() {
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/gi
    return emailRegex.test(this.email)
  }
  get displayInviteHelp() {
    return this.$store.state.displayInviteHelp
  }

  public handleVisibilityChange() {
    if (document.hidden) {
      this.$store.commit(Mutations.INCREMENT_INVITE_STATUS)
      this.$store.commit(Mutations.DISPLAY_INVITE_HELP, false)
      console.log('document was hidden')
    }
    document.removeEventListener('visibilitychange', this.handleVisibilityChange)
  }

  /* Methods */
  public resetForm() {
    this.$data.email = ''
  }
  public generateInvite() {
    this.$store.commit(Mutations.INCREMENT_INVITE_STATUS)
    this.$data.btnText = 'GENERATING INVITE...'
    this.$store.dispatch(Actions.INVITE_COLLABORATOR, this.email)
  }
  public sendInvite() {
    document.addEventListener('visibilitychange', this.handleVisibilityChange)
    this.inviteClickCounter += 1
    if (this.inviteClickCounter > 2) {
      clearTimeout(this.timer)
      this.$store.commit(Mutations.DISPLAY_INVITE_HELP, true)
    }
    if (this.invitePending) {
      return false
    }
    this.invitePending = true
    this.$store.commit(Mutations.INCREMENT_INVITE_STATUS)
    this.timer = setTimeout(() => {
      clearTimeout(this.timer)
      this.$store.commit(Mutations.DISPLAY_INVITE_HELP, true)
    }, 6000)
  }
}
</script>

<style lang="scss">

</style>
