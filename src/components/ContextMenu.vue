<template>
  <div class="context-menu-modal" @click="hideMenu">
    <div class="context-menu" :style="{top: (menu.y - 10) + 'px', left: (menu.x - 123) + 'px'}">
      <span class="context-menu-header"><b>{{ menu.title }}</b></span>
      <ul>
        <li
          v-for="(item, i) in menu.items"
          @click="item.action"
          :class="{last: i === menu.items.length - 1}"
          :key="i">
          {{item.text}}
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapGetters } from 'vuex'
import { Mutations } from '../constants'
export default Vue.extend({
  name: 'context-menu',
  computed: {
    ...mapGetters(['menu'])
  },
  methods: {
    hideMenu() {
      this.$store.commit(Mutations.HIDE_CONTEXT_MENU)
    }
  }
})
</script>

<style lang="scss" scoped>
@import '../styles/_colors.scss';
@import '../styles/_mixins.scss';

.context-menu-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.5);
  .context-menu {
    display: block;
    position: absolute;
    cursor: pointer;
    width: 246px;
    @include btn-standard();
    background: $gold;
    padding: 0;
    ul,
    li {
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .context-menu-header {
      display: block;
      padding: 0.7em 0 0.6em;
      @include btn-solid;
    }
    li {
      padding: 0.6em 1em;
      background: #fff;
      // border-top: 1px solid #eee;
      &.last {
        // border-bottom: 1px solid #eee;
        padding-bottom: 0.5em;
      }
      &:hover {
        @include btn-semi();
        // background: #eee;
      }
    }
  }
}
</style>
