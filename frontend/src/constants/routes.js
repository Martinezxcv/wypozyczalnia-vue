
export const ROUTES = {
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
  },
  STORE: {
    DASHBOARD: '/main',
    PRODUCTS: '/products',
    PRODUCT_DETAILS: '/products/:name',
    CART: '/cart',
  },
  ACCOUNT: {
    PROFILE: '/profile',
    ORDERS: '/orders',
    SETTINGS: '/account',
  },
  MANAGEMENT: {
    DASHBOARD: '/management',
    PRODUCT_FORM: '/management/productForm',
    PRODUCT_FORM_PATTERN: '/management/productForm/:name?',
  }
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/user/signin',
    REGISTER: '/user/signup',
  },
  CART: {
    GET: '/cart',
    ADD_ITEM: '/cart/addProduct',
    REMOVE_ITEM: '/cart/deleteProduct',
    CLEAR: '/cart/clear',
  },
  PRODUCTS: {
    GET_ALL: '/product',
    GET_BY_NAME: (name) => `/product/${encodeURIComponent(name)}`,
    CREATE: '/product',
    UPDATE: '/product',
    DELETE: (id) => `/product/${id}`,
  },
  ORDERS: {
    GET: '/orders',
    GET_LIST: (isStaff) => isStaff ? '/orders/all' : '/orders',
    DETAILS: '/orders/details',
    SEND_INVOICE: '/orders/invoice',
    CHANGE_STATUS: '/orders/changeOrderStatus',
  },
  USER: {
    INFO: '/user/info',
    UPDATE: '/user/change',
  },
  ADDRESS: {
    GET_ALL: '/address',
    ADD: '/address/add',
    SET_DEFAULT: '/address/setDefault',
  }
};
