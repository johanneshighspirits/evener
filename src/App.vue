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
</style>
