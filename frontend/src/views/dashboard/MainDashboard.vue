<script setup>
import { useAuthStore } from '@/stores/auth';

import EmployeeView from './EmployeeView.vue';
import ClientView from './ClientView.vue';

const authStore = useAuthStore();
</script>

<template>
  <EmployeeView
    v-if="authStore.user?.role === 'Manager' || authStore.user?.role === 'Employee'"
  />

  <ClientView v-else />
</template>
