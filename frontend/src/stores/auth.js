import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { jwtDecode } from 'jwt-decode';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const token = ref(localStorage.getItem('jwtToken') || null);

  const isAuthenticated = computed(() => !!token.value);

  function login(newToken) {
    token.value = newToken;
    localStorage.setItem('jwtToken', newToken);
    try {
      const decoded = jwtDecode(newToken);
      user.value = { username: decoded.sub, role: decoded.role };
    } catch (err) {
      logout();
    }
  }

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem('jwtToken');
    sessionStorage.removeItem('jwtToken');
  }

  function checkTokenExpiry() {
    if (!token.value) return;
    try {
      const decoded = jwtDecode(token.value);
      if (decoded.exp < Date.now() / 1000) {
        logout();
      } else {
        user.value = { username: decoded.sub, role: decoded.role };
      }
    } catch {
      logout();
    }
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('authExpired', () => {
      console.log('Pinia Store caught expiry event. Resetting state...');
      logout();
    });
  }

  return { user, token, isAuthenticated, login, logout, checkTokenExpiry };
});
