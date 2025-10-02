<script setup>
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';
</script>

<template>
  <div class="wrapper">
    <div class="content">
      <Header />
        <slot />

    </div>
    <Footer />
  </div>
</template>

<style lang="scss" scoped></style>
