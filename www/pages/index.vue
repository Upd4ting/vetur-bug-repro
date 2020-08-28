<template lang="pug">
  p Vetur bug repro. $test should be accessible from mounted function but it appears that the types aren't read from the types folder.
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator';

@Component
export default class extends Vue {
  get myGetter() {
    return this.$test;
  }

  mounted() {
    console.log(this.$test);
  }
}
</script>

<style lang="scss" scoped></style>
