<script setup>
import { ref, watch, onMounted } from 'vue';
import { cartService } from '@/services/cartService';
import { toast } from 'vue-sonner';
import { VueDatePicker } from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import {
  Trash2,
  Calendar,
  ShoppingBag
} from '@lucide/vue';
import {productService} from "@/services/productService.js";

// --- Local Reactive State ---
const cartItems = ref([]);
const loading = ref(true);
const totalCost = ref(0);
const isOrdering = ref(false);
const dateRange = ref([new Date(), null]);

// --- Methods & Calculations ---
const loadCart = async () => {
  try {
    loading.value = true;

    const [rawCartItems, allProducts] = await Promise.all([
      cartService.getCart(),
      productService.getAll()
    ]);

    cartItems.value = rawCartItems.map(cartItem => {
      const matchedProduct = allProducts.find(
        p => p.name?.toLowerCase() === cartItem.name?.toLowerCase()
      );

      return {
        ...cartItem,
        price: matchedProduct ? matchedProduct.price : 0
      };
    });

  } catch (err) {
    console.error("Cart hydration failed:", err);
    toast.error("Could not load your cart details.");
  } finally {
    loading.value = false;
  }
};

const calculateTotal = () => {
  const productsPrice = cartItems.value.reduce((acc, item) => acc + (item.price || 0), 0);
  const [start, end] = dateRange.value;

  if (!start || !end) {
    totalCost.value = productsPrice;
    return;
  }

  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  const month = start.getMonth();
  let multiplier = ([11, 0, 1].includes(month)) ? 2 : ([2, 3, 10].includes(month) ? 1.5 : 1);

  totalCost.value = productsPrice + (diffDays * 10 * multiplier);
};

const handleDelete = async (name) => {
  try {
    await cartService.deleteProduct(name);
    cartItems.value = cartItems.value.filter(i => i.name !== name);
    window.dispatchEvent(new Event('cartUpdated'));
    toast.success(`${name} removed`);
  } catch (err) {
    toast.error("Failed to remove item.");
  }
};

const handlePlaceOrder = async () => {
  const [start, end] = dateRange.value;

  if (!start || !end) {
    toast.warning("Please select a return date on the calendar.");
    return;
  }

  isOrdering.value = true;
  try {
    const startDateObj = new Date(start);
    const endDateObj = new Date(end);
    const startStr = startDateObj.toISOString().split('T')[0];
    const endStr = endDateObj.toISOString().split('T')[0];

    await cartService.placeOrder(startStr, endStr);

    toast.success('Order placed! Get ready for the slopes.');

    cartItems.value = [];
    dateRange.value = [new Date(), null];
    window.dispatchEvent(new Event('cartUpdated'));

  } catch (err) {
    const errorMsg = typeof err.response?.data === 'string'
      ? err.response.data
      : (err.response?.data?.message || "Failed to place order.");

    toast.error(errorMsg);
  } finally {
    isOrdering.value = false;
  }
};

const getImageUrl = (filepath) => {
  const fileName = filepath?.split('/').pop() || '';
  return `${import.meta.env.VITE_API_BASE_URL}/img/products/${fileName}`;
};

// --- Reactive side-effect watch loops (Replacing React dependency arrays) ---
watch([cartItems, dateRange], () => {
  calculateTotal();
}, { deep: true });

onMounted(() => {
  loadCart();
});
</script>

<template>
  <div v-if="loading" class="loader">
    Loading...
  </div>

  <div v-else class="cartPage">
    <div class="container">
      <h1 class="title">
        <ShoppingBag class="title-icon" /> Your Selection
      </h1>

      <div v-if="cartItems.length === 0" class="emptyCartCard">
        <p>Your equipment selection is empty. Head back to our inventory to choose gear!</p>
      </div>

      <div v-else class="mainGrid">

        <div class="itemsSection">
          <div v-for="item in cartItems" :key="item.name" class="itemCard">
            <div class="imageWrapper">
              <img
                :src="getImageUrl(item.imageFilepath)"
                :alt="item.name"
              />
            </div>

            <div class="itemInfo">
              <h3>{{ item.name }}</h3>
              <p>{{ item.price?.toFixed(2) }} zł</p>
            </div>

            <button class="removeIconBtn" @click="handleDelete(item.name)">
              <Trash2 class="trash-icon" />
            </button>
          </div>
        </div>

        <aside class="summarySidebar">
          <div class="stickyBox">
            <h3>Rental Details</h3>

            <div class="datePickerGroup">
              <label><Calendar class="label-icon" /> Pick-up & Return</label>

              <VueDatePicker
                v-model="dateRange"
                range
                inline
                :min-date="new Date()"
                :enable-time="false"
                auto-apply
              />
            </div>

            <div class="costBreakdown">
              <div class="costRow">
                <span>Estimated Total:</span>
                <span class="totalPrice">{{ totalCost.toFixed(2) }} zł</span>
              </div>

              <button
                class="checkoutBtn"
                @click="handlePlaceOrder"
                :disabled="!dateRange[1] || cartItems.length === 0 || isOrdering"
              >
                {{ isOrdering ? "Processing..." : "Checkout Now" }}
              </button>
            </div>
          </div>
        </aside>

      </div>
    </div>
  </div>
</template>

<style scoped>
/* Paste your Cart.module.css definitions here cleanly */
.title-icon, .label-icon {
  display: inline-block;
  vertical-align: middle;
  margin-right: 8px;
  width: 1.5rem;
  height: 1.5rem;
}
.trash-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.cartPage {
  padding-top: 20px;
  background-color: #f8fafc;
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.mainGrid {
  display: grid;
  grid-template-columns: 1fr 400px;
  margin-top: 5px;
}

/* IMAGE FIX */
.imageWrapper {
  width: 120px;
  height: 120px;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 8px;
  background: #eee;
}

.imageWrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.itemCard {
  display: flex;
  gap: 20px;
  background: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  align-items: center;
}

.itemInfo {
  flex-grow: 1;
}

.removeIconBtn {
  background: none;
  border: none;
  color: #ef4444;
  font-size: 1.4rem;
  cursor: pointer;
  padding: 5px;
  transition: transform 0.2s;
}

.removeIconBtn:hover {
  transform: scale(1.1);
}

/* SIDEBAR & CALENDAR */
.stickySummary {
  position: sticky;
  top: 110px;
}

.stickyBox {
  background: white;
  padding: 25px;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

.datePickerGroup {
  margin: 20px 0;
}

:global(.react-datepicker) {
  border: none !important;
  font-family: inherit !important;
  width: 100% !important;
}

:global(.react-datepicker__month-container) {
  width: 100% !important;
}

.checkoutBtn {
  width: 100%;
  padding: 15px;
  background: #0066ff;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 20px;
}

.checkoutBtn:disabled {
  background: #cbd5e0;
  cursor: not-allowed;
}

.totalPrice {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1e293b;
}

@media (max-width: 900px) {
  .mainGrid { grid-template-columns: 1fr; }
}
</style>
