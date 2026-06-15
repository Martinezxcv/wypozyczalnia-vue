<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue';
import { productService } from '@/services/productService.js';
import { cartService } from '@/services/cartService.js';
import ProductCard from '@/components/products/ProductCard.vue';

const ITEMS_PER_PAGE = 6;

// --- State Variables  ---
const products = ref([]);
const currentPage = ref(1);
const absoluteMaxPrice = ref(500);
const cartItems = ref([]);

const filters = reactive({
  equipmentType: 'All',
  category: 'All',
  skillLevel: 'All',
  size: 'All',
  maxPrice: 500,
});

// --- Actions / Methods ---
const syncCart = async () => {
  try {
    const cartData = await cartService.getCart();
    cartItems.value = cartData;
  } catch (err) {
    console.log("User not logged in, cart empty.");
    cartItems.value = [];
  }
};

const loadData = async () => {
  const productData = await productService.getAll();
  products.value = productData;

  await syncCart();

  if (productData && productData.length > 0) {
    const highest = Math.max(...productData.map(p => p.price));
    absoluteMaxPrice.value = highest;

    if (filters.maxPrice > highest) {
      filters.maxPrice = highest;
    }
  }
};

// --- Lifecycle Hooks ---
onMounted(() => {
  loadData();
  window.addEventListener('cartUpdated', syncCart);
});

onUnmounted(() => {
  window.removeEventListener('cartUpdated', syncCart);
});

// --- Computed Properties ---
const filteredProducts = computed(() => {
  return products.value.filter(p => {
    const typeMatch = filters.equipmentType === 'All' || p.equipmentType?.name === filters.equipmentType;
    const catMatch = filters.category === 'All' || p.category?.name === filters.category;
    const skillMatch = filters.skillLevel === 'All' || p.skillLevel?.name === filters.skillLevel;

    const productSizeStr = typeof p.size === 'object' ? p.size?.name : p.size;
    const sizeMatch = filters.size === 'All' || productSizeStr === filters.size;

    const priceMatch = p.price <= filters.maxPrice;

    return typeMatch && catMatch && skillMatch && sizeMatch && priceMatch;
  });
});

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredProducts.value.length / ITEMS_PER_PAGE));
});

const currentItems = computed(() => {
  const start = (currentPage.value - 1) * ITEMS_PER_PAGE;
  const end = currentPage.value * ITEMS_PER_PAGE;
  return filteredProducts.value.slice(start, end);
});

// --- Watchers ---
watch(filters, () => {
  currentPage.value = 1;
}, { deep: true });

const checkIsInCart = (product) => {
  return cartItems.value.some(item => item.product?.name === product.name || item.name === product.name);
};
</script>

<template>
  <div class="container">

    <aside class="sidebar">
      <div class="stickyFilters">
        <h3>Filters</h3>

        <div class="filterGroup">
          <label>Equipment</label>
          <select v-model="filters.equipmentType">
            <option value="All">All Types</option>
            <option value="Snowboard">Snowboard</option>
            <option value="Ski">Ski</option>
            <option value="Helmet">Helmet</option>
          </select>
        </div>

        <div class="filterGroup">
          <label>Category</label>
          <select v-model="filters.category">
            <option value="All">All Categories</option>
            <option value="Racing">Racing</option>
            <option value="Freestyle">Freestyle</option>
            <option value="All-Mountain">All-Mountain</option>
            <option value="Freeride">Freeride</option>
            <option value="Cross Country">Cross Country</option>
            <option value="All-Mountain-Freestyle">All-Mountain-Freestyle</option>
            <option value="Powder">Powder</option>
            <option value="Big-Mountain">Big-Mountain</option>
          </select>
        </div>

        <div class="filterGroup">
          <label>Size</label>
          <select v-model="filters.size">
            <option value="All">Any Size</option>
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
          </select>
        </div>

        <div class="filterGroup">
          <label>Max Price: <strong>{{ filters.maxPrice }}zł</strong></label>
          <input
            type="range"
            min="0"
            :max="absoluteMaxPrice"
            step="1"
            v-model.number="filters.maxPrice"
            class="priceSlider"
          />
          <div class="priceLabels">
            <span>0zł</span>
            <span>{{ absoluteMaxPrice }}zł</span>
          </div>
        </div>
      </div>
    </aside>

    <main class="mainContent">
      <div v-if="currentItems.length === 0" class="emptyGalleryState">
        <p>No gear matches your current filter choices.</p>
      </div>

      <div v-else class="grid">
        <ProductCard
          v-for="product in currentItems"
          :key="product.productId"
          :product="product"
          :isAlreadyInCart="checkIsInCart(product)"
        />
      </div>

      <div v-if="totalPages > 1" class="pagination">
        <button
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          &laquo;
        </button>

        <button
          v-for="page in totalPages"
          :key="page"
          :class="{ activePage: currentPage === page }"
          @click="currentPage = page"
        >
          {{ page }}
        </button>

        <button
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          &raquo;
        </button>
      </div>
    </main>

  </div>
</template>

<style scoped>
.container {
  display: flex;
  gap: 40px;
}

.sidebar {
  width: 280px;
  flex-shrink: 0;
  background: white;
  padding: 25px;
  border-radius: 16px;
  height: fit-content;
  position: sticky;
  top: 110px;
  border: 1px solid #edf2f7;
}

.stickyFilters {
  position: sticky;
  top: 110px;
  background: white;
  padding: 25px;
  border-radius: 16px;
  border: 1px solid #edf2f7;
  box-shadow: 0 4px 6px rgba(0,0,0,0.02);
}

.filterGroup {
  margin-top: 20px;
}

.filterGroup label {
  display: block;
  font-size: 0.8rem;
  font-weight: 700;
  color: #718096;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.filterGroup select {
  width: 100%;
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background-color: #f8fafc;
  font-family: inherit;
  font-weight: 500;
  cursor: pointer;
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.mainContent {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
  align-items: start;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 50px;
  padding-bottom: 50px;
}

.pagination button {
  padding: 10px 18px;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.activePage {
  background: #0066ff !important;
  color: white;
  border-color: #0066ff !important;
}

.priceSlider {
  width: 100%;
  margin-top: 10px;
  cursor: pointer;
  accent-color: #007bff;
}

.priceLabels {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #a0aec0;
  margin-top: 5px;
}

.filterGroup strong {
  color: #007bff;
  float: right;
}
</style>
