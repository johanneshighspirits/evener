<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script lang="ts">
export default {
  name: 'App'
}
</script>

<style lang="scss">
@import './styles/_colors.scss';

html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
}
* {
  box-sizing: border-box;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100%;
  display: flex;
  flex-direction: column;
  .center-box {
    margin: auto;
    padding-bottom: 5%;
  }
}

/* Buttons and forms */
@mixin btn-standard {
  margin: auto;
  padding: 1em 2em;
  font-weight: bold;
  transition: all 300ms ease-in-out;
  color: $gold;
  border: 3px solid $gold;
}
@mixin btn-semi {
  color: darken($gold, 25%);
  background: lighten($gold, 35%);
}
@mixin btn-solid {
  background: $gold;
  color: #fff;
}
.button {
  display: inline-block;
  cursor: pointer;
  &.block {
    display: block;
  }
  @include btn-standard();
  &:hover {
    @include btn-semi;
  }
  &:active {
    @include btn-solid();
    outline: none;
  }
  &:focus {
    outline: none;
  }
}
.form {
  display: flex;
  flex-direction: column;
  padding-bottom: 6em;
  & > * {
    flex-grow: 1;
  }
  a {
    text-decoration: none;
  }
  input {
    font-size: 1em;
    text-align: center;
    background-color: #fff;
    appearance: none;
  }
  .form-group {
    margin: 4px auto;
    padding-left: 4px;
    padding-right: 4px;
    @media screen and (min-width: 400px) {
      padding-left: 0;
      padding-right: 0;
    }
    width: 100%;
    max-width: 400px;
    & > * {
      width: 100%;
    }
  }
  .margin-top {
    margin-top: 4px;
  }
}
::-webkit-input-placeholder {
  /* Chrome/Opera/Safari */
  color: $gold;
}
::-moz-placeholder {
  /* Firefox 19+ */
  color: $gold;
}
:-ms-input-placeholder {
  /* IE 10+ */
  color: $gold;
}
:-moz-placeholder {
  /* Firefox 18- */
  color: $gold;
}

/* transitions */
.fade-in-up {
  &-enter {
    opacity: 0;
    transform: translateY(2em);
  }
  &-enter-to {
    opacity: 1;
    transform: translateY(0px);
  }
  &-enter-active,
  &-leave-active {
    transition: all 0.5s ease-in-out;
  }
  &-leave {
    opacity: 1;
    transform: scale(1, 1);
  }
  &-leave-to {
    opacity: 0;
    transform: scale(0.1, 0.1);
  }
}
.fade-in-left {
  &-enter {
    opacity: 0;
    transform: translateX(2em);
    background-color: #ffc708;
  }
  &-enter-to {
    opacity: 1;
    transform: translateX(0px);
    background-color: #fff;
  }
  &-enter-active,
  &-leave-active {
    transition: all 0.5s ease-in-out;
  }
  &-leave {
    opacity: 1;
    transform: translateX(0px);
  }
  &-leave-to {
    opacity: 0;
    transform: translateX(-50em);
  }
}
</style>
