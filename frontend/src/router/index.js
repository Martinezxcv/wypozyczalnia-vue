import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { ROUTES } from '@/constants/routes';

import Login from '@/views/auth/Login.vue';
import Register from "@/views/auth/Register.vue";
import MainLayout from "@/layouts/MainLayout.vue";
import MainDashboard from "@/views/dashboard/MainDashboard.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: ROUTES.AUTH.LOGIN
    },
    {
      path: ROUTES.AUTH.LOGIN,
      name: 'Login',
      component: Login
    },
    {
      path: ROUTES.AUTH.REGISTER,
      name: 'Register',
      component: Register
    },

    // Private Routes
    {
      path: '/',
      component: MainLayout,
      meta: { requiresAuth: true },

      children: [
        {
          path: ROUTES.STORE.DASHBOARD,
          name: 'Dashboard',
          component: MainDashboard
        },/*
        {
          path: ROUTES.STORE.PRODUCTS,
          name: 'Products',
          component: ProductPage
        },
        {
          path: ROUTES.STORE.PRODUCT_DETAILS,
          name: 'ProductDetails',
          component: ProductDetails
        },
        {
          path: ROUTES.STORE.CART,
          name: 'Cart',
          component: Cart
        },
        {
          path: ROUTES.ACCOUNT.ORDERS,
          name: 'Orders',
          component: Orders
        },
        {
          path: ROUTES.ACCOUNT.PROFILE,
          name: 'Profile',
          component: Account
        },
        {
          path: ROUTES.MANAGEMENT.PRODUCT_FORM_PATTERN,
          name: 'ProductForm',
          component: ProductForm
        },
        {
          path: ROUTES.MANAGEMENT.DASHBOARD,
          name: 'Management',
          component: Management
        }*/
      ]
    }
  ]
});

router.beforeEach((to, from) => {
  const authStore = useAuthStore();
  const isProtectedRoute = to.matched.some(record => record.meta?.requiresAuth);

  if (isProtectedRoute && !authStore.isAuthenticated) {
    return { path: ROUTES.AUTH.LOGIN };
  }

});

export default router;
