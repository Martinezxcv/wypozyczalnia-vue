<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ROUTES } from '@/constants/routes';
import { cartService } from '@/services/cartService';
import { toast } from 'vue-sonner';

import { ShoppingCart, Check } from '@lucide/vue';

// --- Props Configuration ---
const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  isAlreadyInCart: {
    type: Boolean,
    default: false
  }
});

const router = useRouter();

// --- Local Reactive State ---
const isAdding = ref(false);
const justAdded = ref(false);

// --- Computed Properties ---
const isInCart = computed(() => props.isAlreadyInCart || justAdded.value);
const productImageSrc = computed(() => {
  const fileName = props.product.imageFilepath?.split('/').pop() || '';
  return `${import.meta.env.VITE_API_BASE_URL}/img/products/${fileName}`;
});

// --- Methods / Event Handlers ---
const handleCardClick = () => {
  router.push({
    name: ROUTES.STORE.PRODUCT_DETAILS.NAME,
    params: { name: props.product.name }
  });
};

const handleAddToCart = async () => {
  if (isAdding.value || isInCart.value) return;
  isAdding.value = true;

  try {
    await cartService.addProduct(props.product.name);
    toast.success(`${props.product.name} added to cart!`);

    window.dispatchEvent(new Event('cartUpdated'));
    justAdded.value = true;
  } catch (error) {
    if (error.response?.status === 409) {
      toast.info('Already in your cart!');
      justAdded.value = true;
    } else {
      const fallbackMsg = typeof error.response?.data === 'string'
        ? error.response.data
        : (error.response?.data?.message || "Could not add to cart");

      toast.error(fallbackMsg);
    }
  } finally {
    isAdding.value = false;
  }
};
</script>

<template>
  <div class="card" @click="handleCardClick">

    <div class="imageWrapper">
      <img
        :src="productImageSrc"
        :alt="product.name"
        crossorigin="anonymous"
      />
      <div v-if="!product.available" class="outOfStock">Rented</div>
    </div>

    <div class="info">
      <span class="brand">brand {{ product.brand?.toLowerCase() }}</span>
      <h4>{{ product.name }}</h4>
      <p class="specs">
        category {{ product.category?.name?.toLowerCase() }} • size {{ product.size }}
      </p>

      <div class="footer">
        <span class="price">{{ product.price }}zł <small>/ day</small></span>

        <button
          v-if="product.available"
          :class="isInCart ? 'alreadyInCartBtn' : 'cartBtn'"
          @click.stop="handleAddToCart"
          :disabled="isAdding || isInCart"
          :title="isInCart ? 'Already in cart' : 'Add to cart'"
        >
          <span v-if="isAdding" class="spinner"></span>

          <span v-else-if="isInCart">
            <Check class="icon-style" />
          </span>

          <span v-else>
            <ShoppingCart class="icon-style" />
          </span>
        </button>
      </div>
    </div>

  </div>
</template>

<style scoped>
.card {
  cursor: pointer;
  width: 100%;
  max-width: 320px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  min-height: 400px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  overflow: hidden;
}

.card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border-color: #0066ff;
}

.card:hover h4 {
  color: #0066ff;
  text-decoration: underline;
}

/* --- Image Section --- */
.imageWrapper {
  position: relative;
  width: 100%;
  padding-top: 75%;
  background-color: #f8fafc;
  border-bottom: 1px solid #edf2f7;
  overflow: hidden;
}

.imageWrapper img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 20px;
  transition: transform 0.5s ease;
}

.card:hover .imageWrapper img {
  transform: scale(1.08);
}

.outOfStock {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.9);
  color: #e53e3e;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  border: 1px solid #feb2b2;
  backdrop-filter: blur(4px);
  z-index: 2;
}

/* --- Info Section --- */
.info {
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.brand {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #a0aec0;
  font-weight: 700;
  margin-bottom: 4px;
}

.info h4 {
  margin: 0 0 8px 0;
  font-size: 1.1rem;
  color: #2d3748;
  font-weight: 700;
}

.specs {
  font-size: 0.85rem;
  color: #718096;
  margin-bottom: 20px;
}

/* --- Footer Section --- */
.footer {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid #f7fafc;
}

.price {
  font-size: 1.25rem;
  font-weight: 800;
  color: #0066ff;
}

.price small {
  font-size: 0.8rem;
  color: #718096;
  font-weight: 400;
}

/* --- Cart Button --- */
.cartBtn {
  background: #0066ff;
  color: white;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1.2rem;
}

.alreadyInCartBtn {
  background: #28a745;
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  cursor: default;
  opacity: 0.9;
}

.cartBtn:hover:not(:disabled) {
  background: #0052cc;
  transform: scale(1.05);
}

.cartBtn:active {
  transform: scale(0.95);
}

.cartBtn:disabled {
  background: #cbd5e0;
  cursor: not-allowed;
}

/* --- Admin Actions --- */
.adminActions {
  display: flex;
  gap: 8px;
}

.editBtn {
  background: #f1f5f9;
  color: #475569;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.editBtn:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
