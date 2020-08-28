<template lang="pug">
  nuxt.
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator';

@Component
export default class extends Vue {}
</script>

<style lang="scss" scoped>
// Page transition
.page-enter-active,
.page-leave-active {
  transition: all 0.25s;
}
.page-enter,
.page-leave-active {
  opacity: 0;
}
</style>
