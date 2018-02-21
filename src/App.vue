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
@import './styles/_mixins.scss';
@import './styles/_transitions.scss';

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
</style>
