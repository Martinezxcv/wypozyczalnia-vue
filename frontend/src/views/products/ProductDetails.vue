<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { productService } from '@/services/productService';
import { cartService } from '@/services/cartService';
import toast from 'vue-sonner';
import { Check } from '@lucide/vue';

const route = useRoute();
const router = useRouter();

// --- Local Reactive State ---
const product = ref(null);
const loading = ref(true);
const isInCart = ref(false);
const isAdding = ref(false);

// --- Computed Values ---
const imageUrl = computed(() => {
  if (!product.value) return '';
  const fileName = product.value.imageFilepath?.split('/').pop() || '';
  return `${import.meta.env.VITE_API_BASE_URL}/img/products/${fileName}`;
});

// --- Actions / Methods ---
const syncCartPresence = async (productData) => {
  if (!productData) return;
  try {
    const cartItems = await cartService.getCart();
    isInCart.value = cartItems.some(item =>
      item.product?.name === productData.name || item.name === productData.name
    );
  } catch (err) {
    console.error("Failed to sync cart", err);
  }
};

const fetchProductAndCartData = async () => {
  const productName = route.params.name;
  if (!productName) return;

  try {
    loading.value = true;
    const data = await productService.getByName(productName);
    product.value = data;

    if (data) {
      await syncCartPresence(data);
    }
  } catch (err) {
    toast.error("Could not find this piece of gear.");
  } finally {
    loading.value = false;
  }
};

const handleAddToCart = async () => {
  if (isAdding.value || isInCart.value || !product.value?.available) return;

  isAdding.value = true;
  try {
    await cartService.addProduct(product.value.name);
    window.dispatchEvent(new Event('cartUpdated'));
    isInCart.value = true;
    toast.success(`${product.value.name} is now in your cart!`, { duration: 3000 });
  } catch (error) {
    if (error.response?.status === 409) {
      toast.info('This item is already in your cart');
      isInCart.value = true;
    } else {
      toast.error(error.response?.data?.message || "Failed to add to cart");
    }
  } finally {
    isAdding.value = false;
  }
};

const goBack = () => {
  router.back();
};

// --- Lifecycle Mount Trigger ---
onMounted(() => {
  fetchProductAndCartData();
});
</script>

<template>
  <div v-if="loading" class="loader">
    Shredding through data...
  </div>

  <div v-else-if="!product" class="error">
    Gear not found.
  </div>

  <div v-else class="pageWrapper">
    <button class="backBtn" @click="goBack">
      &larr; Back to Gallery
    </button>

    <main class="mainContent">
      <section class="imageGallery">
        <div class="mainImageContainer">
          <img :src="imageUrl" :alt="product.name" crossorigin="anonymous" />
        </div>
      </section>

      <section class="infoPanel">
        <div class="breadcrumb">
          Products / {{ product.category?.name }}
        </div>

        <h1 class="title">{{ product.name }}</h1>
        <p class="brand">{{ product.brand?.name || 'Pro Series' }}</p>

        <div class="priceTag">{{ product.price }} zł</div>

        <div class="specsGrid">
          <div class="specItem">
            <span>Size</span>
            <strong>{{ product.size || 'N/A' }}</strong>
          </div>
          <div class="specItem">
            <span>Level</span>
            <strong>{{ product.skillLevel?.name || 'All Levels' }}</strong>
          </div>
          <div class="specItem">
            <span>Weight</span>
            <strong>{{ product.weight ? `${product.weight} kg` : 'N/A' }}</strong>
          </div>
        </div>

        <p class="description">
          {{ product.description || "Engineered for maximum performance and durability in all conditions." }}
        </p>

        <button
          :class="['ctaButton', { added: isInCart }]"
          :disabled="!product.available || isAdding || isInCart"
          @click="handleAddToCart"
        >
          <span v-if="isAdding" class="spinner"></span>

          <span v-else-if="!product.available">
            Currently Rented
          </span>

          <span v-else-if="isInCart" class="with-icon">
            <Check class="btn-icon" /> Reserved in Cart
          </span>

          <span v-else>
            Add to Cart
          </span>
        </button>
      </section>
    </main>
  </div>
</template>

<style scoped>
.pageWrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 10px 10px;
}

.backBtn {
  background: transparent;
  border: none;
  color: #666;
  cursor: pointer;
  margin-bottom: 10px;
}

.mainContent {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 20px;
  margin-top: 1px;
}

.mainImageContainer {
  background: #f9f9f9;
  border-radius: 12px;
  padding: 40px;
  display: flex;
  justify-content: center;
}

.mainImageContainer img {
  max-width: 100%;
  height: auto;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.title {
  font-size: 2.5rem;
  margin: 10px 0;
  font-weight: 800;
}

.priceTag {
  font-size: 2rem;
  color: #2a9d8f;
  font-weight: 600;
  margin: 20px 0;
}

.specsGrid {
  display: flex;
  gap: 20px;
  margin: 30px 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
  padding: 20px 0;
}

.specItem {
  display: flex;
  flex-direction: column;
}

.specItem span {
  font-size: 0.8rem;
  color: #888;
  text-transform: uppercase;
}

.ctaButton {
  width: 100%;
  padding: 18px;
  background: #0066ff;
  color: #fff;
  border: none;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
}

.ctaButton:hover:not(:disabled) {
  background: #0052cc;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 102, 255, 0.3);
}

.ctaButton.added {
  background: #28a745;
  cursor: default;
  opacity: 0.9;
}

.ctaButton:disabled {
  background: #cbd5e0;
  cursor: not-allowed;
  transform: none;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 900px) {
  .mainContent {
    grid-template-columns: 1fr;
  }
}
</style>
