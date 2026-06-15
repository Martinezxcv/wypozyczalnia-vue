<script setup>
import { Toaster } from 'vue-sonner';
import 'vue-sonner/style.css'
</script>

<template>
  <Toaster duration="3000" position="top-center" richColors theme="light" />
  <RouterView />
</template>
