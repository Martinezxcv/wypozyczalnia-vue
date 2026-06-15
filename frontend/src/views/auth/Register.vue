<script setup>
import {onMounted, onUnmounted, ref} from 'vue';
import {useRouter} from 'vue-router';
import {ROUTES} from '@/constants/routes';
import {authService} from '@/services/authService';
import {registerSchema} from '@/schemas/authSchema';
import {toast} from 'vue-sonner';

import registerBg from '@/assets/Snowboarder.jpg';
import logoImg from '@/assets/shredgear-logo.png';

const router = useRouter();

let originalOverflow = '';
onMounted(() => {
  originalOverflow = window.getComputedStyle(document.body).overflow;
  document.body.style.overflow = 'hidden';
});

onUnmounted(() => {
  document.body.style.overflow = originalOverflow;
});

const formData = ref({
  firstname: '',
  lastname: '',
  email: '',
  phone: '',
  username: '',
  password: ''
});

const fieldErrors = ref({});
const formError = ref('');
const isLoading = ref(false);

function validateField(id) {
  const fieldSchema = registerSchema.shape[id];

  if (fieldSchema) {
    const valueToValidate = formData.value[id] || '';
    const result = fieldSchema.safeParse(valueToValidate);

    if (result.success) {
      fieldErrors.value[id] = '';
    } else {
      fieldErrors.value[id] = result.error.issues[0]?.message || 'Invalid input';
    }
  }
}

async function handleRegister() {
  formError.value = '';

  const validationPayload = {
    firstname: formData.value.firstname,
    lastname: formData.value.lastname,
    email: formData.value.email,
    phone: formData.value.phone,
    username: formData.value.username,
    password: formData.value.password
  };

  const result = registerSchema.safeParse(validationPayload);

  if (!result.success) {
    const newErrors = {};
    result.error.issues.forEach((issue) => {
      const formFieldKey = issue.path[0];
      newErrors[formFieldKey] = issue.message;
    });
    fieldErrors.value = newErrors;
    toast.error("Please correct the highlighted fields.");
    return;
  }

  isLoading.value = true;
  try {
    await authService.register(validationPayload);
    toast.success('Registration successful! Welcome to ShredGear.');
    await router.push(ROUTES.AUTH.LOGIN.PATH);
  } catch (err) {
    const backendData = err.response?.data;
    formError.value = (typeof backendData === 'object' ? backendData.message : backendData)
      || 'Registration failed. Please try again.';
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="mainWrapper">
    <div class="loginCard registerCard">

      <div class="imageColumn">
        <img :src="registerBg" alt="Snowboarder" />
      </div>

      <div class="formColumn">
        <div class="logoArea">
          <img :src="logoImg" alt="Logo" class="mainLogo" />
        </div>

        <div v-if="formError" class="errorMessage">{{ formError }}</div>

        <form @submit.prevent="handleRegister" class="loginForm">

          <div class="row">
            <div class="inputGroup">
              <input
                id="firstName"
                type="text"
                placeholder="First Name"
                v-model="formData.firstname"
                @input="validateField('firstname')"
                required
                :class="['inputField', { inputError: fieldErrors.firstname }]"
              />
              <span v-if="fieldErrors.firstname" class="errorText">{{ fieldErrors.firstname }}</span>
            </div>

            <div class="inputGroup">
              <input
                id="lastName"
                type="text"
                placeholder="Last Name"
                v-model="formData.lastname"
                @input="validateField('lastname')"
                required
                :class="['inputField', { inputError: fieldErrors.lastname }]"
              />
              <span v-if="fieldErrors.lastname" class="errorText">{{ fieldErrors.lastname }}</span>
            </div>
          </div>

          <div class="inputGroup">
            <input
              id="email"
              type="email"
              placeholder="Email"
              v-model="formData.email"
              @input="validateField('email')"
              required
              :class="['inputField', { inputError: fieldErrors.email }]"
            />
            <span v-if="fieldErrors.email" class="errorText">{{ fieldErrors.email }}</span>
          </div>

          <div class="inputGroup">
            <input
              id="phone"
              type="text"
              placeholder="Phone (9 digits)"
              v-model="formData.phone"
              @input="validateField('phone')"
              required
              :class="['inputField', { inputError: fieldErrors.phone }]"
            />
            <span v-if="fieldErrors.phone" class="errorText">{{ fieldErrors.phone }}</span>
          </div>

          <div class="inputGroup">
            <input
              id="username"
              type="text"
              placeholder="Username"
              v-model="formData.username"
              @input="validateField('username')"
              required
              :class="['inputField', { inputError: fieldErrors.username }]"
            />
            <span v-if="fieldErrors.username" class="errorText">{{ fieldErrors.username }}</span>
          </div>

          <div class="inputGroup">
            <input
              id="password"
              type="password"
              placeholder="Password"
              v-model="formData.password"
              @input="validateField('password')"
              required
              :class="['inputField', { inputError: fieldErrors.password }]"
            />
            <span v-if="fieldErrors.password" class="errorText">{{ fieldErrors.password }}</span>
          </div>

          <button type="submit" class="loginButton" :disabled="isLoading">
            {{ isLoading ? 'Creating Account...' : 'Register' }}
          </button>
        </form>

        <p class="registerText">
          Already have an account?
          <RouterLink :to="ROUTES.AUTH.LOGIN.PATH" class="registerLink">Log in</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
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

.loginForm {
  display: flex;
  flex-direction: column;
  gap: 16px; /* Optimized spacing for additional inputs */
}

.row {
  display: flex;
  gap: 12px;
  width: 100%;
}

.row .inputGroup {
  flex: 1;
}

.inputGroup {
  display: flex;
  flex-direction: column;
  position: relative;
}

.inputField {
  width: 100%;
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

.inputError {
  border-color: #e11d48 !important;
  background-color: #fff1f2;
}

.errorText {
  color: #e11d48;
  font-size: 12px;
  margin-top: 4px;
  text-align: left;
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
  width: 100%;
}

.loginButton:hover {
  background-color: #333;
}

.loginButton:disabled {
  background-color: #94a3b8;
  cursor: not-allowed;
}

.registerText {
  margin-top: 20px;
  font-size: 14px;
  color: #666;
}

.registerLink {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
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
