<script setup>
import {ref, watchEffect} from 'vue';
import {useRouter} from 'vue-router';
import {useAuthStore} from '@/stores/auth';
import {authService} from '@/services/authService';
import {ROUTES} from '@/constants/routes';

import loginBg from '@/assets/Snowboarder.jpg';
import logoImg from '@/assets/shredgear-logo.png';

const username = ref('');
const password = ref('');
const error = ref('');
const isLoading = ref(false);

const router = useRouter();
const authStore = useAuthStore();

watchEffect(() => {
  if (authStore.isAuthenticated) {
    router.replace(ROUTES.STORE.DASHBOARD.PATH);
  }
});

async function handleLogin() {
  error.value = '';
  isLoading.value = true;

  try {
    const data = await authService.login({
      username: username.value,
      password: password.value
    });
    authStore.login(data.jwtToken);
  } catch (err) {
    error.value = err.response?.data?.message || 'Login failed. Check your connection.';
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="mainWrapper">
    <div class="loginCard">

      <div class="imageColumn">
        <img :src="loginBg" alt="Snowboarder jumping in the snow" />
      </div>

      <div class="formColumn">
        <div class="logoArea">
          <img :src="logoImg" alt="ShredGear Logo" class="mainLogo"/>
        </div>
        <p class="subtitle">Sign into your account</p>

        <div v-if="error" class="errorMessage">{{ error }}</div>

        <form @submit.prevent="handleLogin" class="loginForm">

          <div class="inputGroup">
            <label for="username" class="label">Username</label>
            <input
              id="username"
              type="text"
              class="inputField"
              v-model="username"
              required
            />
          </div>

          <div class="inputGroup">
            <label for="password" class="label">Password</label>
            <input
              id="password"
              type="password"
              class="inputField"
              v-model="password"
              required
            />
          </div>

          <button
            type="submit"
            class="loginButton"
            :disabled="isLoading"
          >
            {{ isLoading ? 'Signing in...' : 'Login' }}
          </button>
        </form>

        <div class="secondaryLinks">
          <a href="#forgot" class="forgotLink">Forgot password?</a>
          <span class="registerText">
                        Don't have an account?
                        <RouterLink :to="ROUTES.AUTH.REGISTER.PATH" class="registerLink">
                            Register here
                        </RouterLink>
                    </span>
        </div>

        <div class="footerLinks">
          <a href="#terms">Terms of use</a>. <a href="#privacy">Privacy policy</a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* src/components/Login/Login.module.css */

.mainWrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #0b2559;
  padding: 20px;
}

.loginCard {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 850px;
  min-height: 550px;
  display: flex;
  overflow: hidden;
}

.imageColumn {
  flex: 1;
}

.imageColumn img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.formColumn {
  flex: 1;
  padding: 30px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.logoArea {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 15px;
  width: 100%;
}

.mainLogo {
  height: 70px;
  width: auto;
  object-fit: contain;
}

.logoIcon {
  color: #3b82f6;
  font-size: 24px;
  margin-right: 10px;
  font-weight: bold;
}

.rentalTitle {
  font-size: 32px;
  font-weight: bold;
  color: #000000;
  margin: 0;
}

.subtitle {
  color: #666;
  margin-bottom: 40px;
  font-size: 16px;
}

.loginForm {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.inputGroup {
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 14px;
  color: #555;
  margin-bottom: 8px;
  text-align: left;
}

.inputField {
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;
}

.inputField:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.loginButton {
  margin-top: 10px;
  padding: 14px;
  background-color: #1e1e1e;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  width: 100px;
}

.loginButton:hover {
  background-color: #333;
}

.secondaryLinks {
  margin-top: 25px;
  font-size: 14px;
  color: #666;
}

.forgotLink {
  color: #3b82f6;
  text-decoration: none;
  display: block;
  margin-bottom: 10px;
}

.registerText {
  display: block;
}

.registerLink {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
}

.footerLinks {
  margin-top: 50px;
  font-size: 12px;
  color: #888;
}

.footerLinks a {
  color: #888;
  text-decoration: none;
}

.footerLinks a:hover {
  text-decoration: underline;
}

.errorMessage {
  background-color: #fff1f2;
  color: #e11d48;
  border: 1px solid #fda4af;
  padding: 10px;
  border-radius: 6px;
  text-align: center;
  font-size: 14px;
  margin-bottom: 20px;
}
</style>
