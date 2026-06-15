
export const ROUTES = {
  AUTH: {
    LOGIN: { PATH: '/login', NAME: 'Login' },
    REGISTER: { PATH: '/register', NAME: 'Register' },
    FORGOT_PASSWORD: { PATH: '/forgot-password', NAME: 'ResetPassword' },
  },
  STORE: {
    DASHBOARD: { PATH: '/main', NAME: 'Dashboard' },
    PRODUCTS: { PATH: '/products', NAME: 'Products' },
    PRODUCT_DETAILS: { PATH: '/products/:name', NAME: 'ProductDetails' },
    CART: { PATH: '/cart', NAME: 'Cart' },
  },
  ACCOUNT: {
    PROFILE: { PATH: '/profile', NAME: 'profile' },
    ORDERS: { PATH: '/orders', NAME: 'orders' },
    SETTINGS: { PATH: '/account', NAME: 'account' }
  },
  MANAGEMENT: {
    DASHBOARD: { PATH: '/management', NAME: 'Management' },
    PRODUCT_FORM: { PATH: '/management/productForm', NAME: 'ProductCreate' },
    PRODUCT_FORM_PATTERN: { PATH: '/management/productForm/:name?', NAME: 'ProductForm' },
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
