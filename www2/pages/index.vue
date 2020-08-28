<template lang="pug">
  p Vetur bug repro. $test2 should be accessible from mounted function but it appears that the types aren't read from the types folder.
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator';

@Component
export default class extends Vue {
  get myGetter() {
    return this.$test2;
  }

  mounted() {
    console.log(this.$test2); // Not accessible because it's types folder of www that is being read and not www2
    console.log(this.$test); // Is accessible because it's types folder of www that is being read and not www2
  }
}
</script>

<style lang="scss" scoped></style>
