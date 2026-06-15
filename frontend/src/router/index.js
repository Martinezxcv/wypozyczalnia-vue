import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { ROUTES } from '@/constants/routes';

import Login from '@/views/auth/Login.vue';
import Register from "@/views/auth/Register.vue";
import MainLayout from "@/layouts/MainLayout.vue";
import MainDashboard from "@/views/dashboard/MainDashboard.vue";
import ProductDetails from "@/views/products/ProductDetails.vue";
import Product from "@/views/products/Product.vue";
import Cart from "@/views/cart/Cart.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: ROUTES.AUTH.LOGIN.PATH
    },
    {
      path: ROUTES.AUTH.LOGIN.PATH,
      name: ROUTES.AUTH.LOGIN.NAME,
      component: Login
    },
    {
      path: ROUTES.AUTH.REGISTER.PATH,
      name: ROUTES.AUTH.REGISTER.NAME,
      component: Register
    },

    // Private Routes
    {
      path: '/',
      component: MainLayout,
      meta: { requiresAuth: true },

      children: [
        {
          path: ROUTES.STORE.DASHBOARD.PATH,
          name: ROUTES.STORE.DASHBOARD.NAME,
          component: MainDashboard
        },
        {
          path: ROUTES.STORE.PRODUCTS.PATH,
          name: ROUTES.STORE.PRODUCTS.NAME,
          component: Product
        },
        {
          path: ROUTES.STORE.PRODUCT_DETAILS.PATH,
          name: ROUTES.STORE.PRODUCT_DETAILS.NAME,
          component: ProductDetails
        },
        {
          path: ROUTES.STORE.CART.PATH,
          name: ROUTES.STORE.CART.NAME,
          component: Cart
        },/*
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
