<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { ROUTES } from '@/constants/routes';
import { cartService } from '@/services/cartService';

import logoImg from '@/assets/shredgear-logo.png';

const router = useRouter();
const authStore = useAuthStore();
const isMenuOpen = ref(false);
const cartCount = ref(0);

function handleLogout() {
  authStore.logout();
  router.push(ROUTES.AUTH.LOGIN.PATH);
}

async function updateCartCount() {
  try {
    const items = await cartService.getCart();
    cartCount.value = items.length;
  } catch (err) {
    console.error("Cart sync failed", err);
  }
}

onMounted(() => {
  updateCartCount();
  window.addEventListener('cartUpdated', updateCartCount);
});

onUnmounted(() => {
  window.removeEventListener('cartUpdated', updateCartCount);
});
</script>

<template>
  <div class="dashboardContainer">
    <nav class="navbar">
      <div class="navLeft">
        <RouterLink :to="ROUTES.STORE.DASHBOARD.PATH">
          <img :src="logoImg" alt="ShredGear" class="navLogo"/>
        </RouterLink>
      </div>

      <div class="navRight">
        <div class="navLinks">
          <RouterLink :to="ROUTES.STORE.PRODUCTS.PATH" class="navItem">
            Products
          </RouterLink>

          <RouterLink
            v-if="authStore.user?.role === 'Manager' || authStore.user?.role === 'Employee'"
            :to="ROUTES.MANAGEMENT.DASHBOARD"
            class="navItem"
          >
            Management
          </RouterLink>

          <RouterLink :to="ROUTES.ACCOUNT.ORDERS" class="navItem">
            Orders
          </RouterLink>

          <RouterLink :to="ROUTES.STORE.CART.PATH" class="cartWrapper">
            Cart
            <span v-if="cartCount > 0" class="cartCountBadge">
                            {{ cartCount }}
                        </span>
          </RouterLink>

          <div
            class="accountWrapper"
            @mouseenter="isMenuOpen = true"
            @mouseleave="isMenuOpen = false"
          >
            <div
              class="navItem cursor-pointer"
              @click="isMenuOpen = !isMenuOpen"
            >
              Account ▾
            </div>

            <div v-if="isMenuOpen" class="dropdown">
              <div class="userInfo">
                <strong>{{ authStore.user?.username }}</strong>
                <span>{{ authStore.user?.role }}</span>
              </div>

              <RouterLink
                :to="ROUTES.ACCOUNT.PROFILE"
                class="dropdownItem"
                @click="isMenuOpen = false"
              >
                My Profile
              </RouterLink>

              <button @click="handleLogout" class="logoutBtn">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
/* --- Global Reset for the Layout --- */
.dashboardContainer {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8f9fa;
  font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  overflow-y: visible;
}

/* --- Navbar Structure --- */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 4rem;
  height: 85px;
  background: linear-gradient(to right, #ffffff 0%, #f9fafb 100%);
  border-bottom: 1px solid #edf2f7;
  box-shadow: 0 2px 10px rgba(0,0,0,0.02);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navLeft {
  display: flex;
  align-items: center;
}

.navLogo {
  height: 45px;
  width: auto;
  margin-right: 20px;
}

/* --- The Sliding Underline Links --- */
.navLinks {
  display: flex;
  gap: 35px;
  margin-left: 20px;
  align-items: center;
}

.navItem {
  text-decoration: none;
  color: #4a5568;
  font-weight: 600;
  font-size: 0.95rem;
  padding: 8px 0;
  position: relative;
  transition: color 0.3s ease;
}

/* The Line going from left */
.navItem::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background-color: #0066ff;
  transition: width 0.3s ease;
}

.navItem:hover {
  color: #0066ff;
}

.navItem:hover::after {
  width: 100%;
}

.navRight {
  display: flex;
  align-items: center;
}

.accountBtn {
  background-color: #f1f5f9;
  color: #1e293b;
  border: 1px solid #e2e8f0;
  padding: 10px 22px;
  border-radius: 50px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.accountBtn:hover {
  background-color: #e2e8f0;
  border-color: #cbd5e1;
  transform: translateY(-1px);
}

/* --- Dropdown Menu --- */
.accountWrapper {
  position: relative;
}

.dropdown {
  position: absolute;
  right: 0;
  top: 100%;
  z-index: 100;
  background: white;
  min-width: 220px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.08);
  border: 1px solid #e2e8f0;
  overflow: hidden;
  animation: fadeIn 0.2s ease-out;
}

.dropdown::before {
  content: '';
  position: absolute;
  top: -20px;
  left: 0;
  right: 0;
  height: 20px;
  background: transparent;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.userInfo {
  padding: 15px 20px;
  background-color: #f8fafc;
  border-bottom: 1px solid #f1f5f9;
}

.userInfo strong { display: block; font-size: 0.9rem; color: #0f172a; }
.userInfo span { font-size: 0.75rem; color: #64748b; text-transform: uppercase; }

.dropdownItem {
  display: block;
  padding: 12px 20px;
  color: #334155;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
}

.dropdownItem:hover {
  background-color: #f1f5f9;
  color: #0066ff;
}

.logoutBtn {
  width: 100%;
  text-align: left;
  padding: 12px 20px;
  border: none;
  background: none;
  color: #ef4444;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  border-top: 1px solid #f1f5f9;
}

.logoutBtn:hover {
  background-color: #fef2f2;
}

/* --- Dashboard Content --- */
.content {
  flex: 1 0 auto;
  padding: 50px 4rem;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  display: block;
}

/* --- Cart --- */
.cartWrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  padding: 10px 0;
  margin-right: 12px;
  color: #2d3748;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.3s ease;
}

.cartCountBadge {
  position: absolute;
  top: 2px;
  right: -14px;

  background-color: #ff3e3e;
  color: white;
  font-size: 0.65rem;
  font-weight: 800;
  min-width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  line-height: 1;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.cartWrapper::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background-color: #0066ff;
  transition: width 0.3s ease;
}

.cartWrapper:hover::after {
  width: 100%;
}
</style>
