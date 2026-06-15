<script setup>
import {computed, onMounted, ref, watch} from 'vue';
import {useAuthStore} from '@/stores/auth';
import {orderService} from '@/services/orderService';
import {toast} from 'vue-sonner';

import {
  Bell,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Eye,
  EyeOff,
  MapPin,
  Phone,
  Send,
  User
} from '@lucide/vue';

// --- Declarative State Machine Mapping ---
const STATUS_IDS = {
  PROCESSING: 1,
  READY: 2,
  RENTED: 3,
  RETURNED: 4,
  REJECTED: 5,
  ACCEPTED: 6,
  CANCELED: 7
};

// --- Local Reactive State ---
const authStore = useAuthStore();
const orders = ref([]);
const loading = ref(true);
const expandedOrderId = ref(null);
const orderDetails = ref({});

const filterStatus = ref('All');
const currentPage = ref(1);
const ordersPerPage = 4;

const statusOptions = ['All', 'Processing', 'Accepted', 'Ready', 'Rented', 'Returned', 'Rejected', 'Canceled'];

// --- Computed Properties ---
const isStaff = computed(() => {
  const role = authStore.user?.role;
  return role === 'Manager' || role === 'Employee' || role === 'Online Sales Representative';
});

const filteredOrders = computed(() => {
  if (filterStatus.value === 'All') return orders.value;
  return orders.value.filter(order =>
    order.orderStatus?.status?.toLowerCase() === filterStatus.value.toLowerCase()
  );
});

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredOrders.value.length / ordersPerPage));
});

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * ordersPerPage;
  return filteredOrders.value.slice(start, start + ordersPerPage);
});

// --- Action & API Handlers ---
const loadOrders = async () => {
  try {
    loading.value = true;
    orders.value = await orderService.getOrders(isStaff.value);
  } catch (err) {
    toast.error("Failed to load order history");
  } finally {
    loading.value = false;
  }
};

const handleToggleDetails = async (orderId) => {
  if (expandedOrderId.value === orderId) {
    expandedOrderId.value = null;
    return;
  }

  if (!orderDetails.value[orderId]) {
    try {
      const data = await orderService.getOrderDetails(orderId);
      orderDetails.value[orderId] = data;
    } catch (err) {
      toast.error("Could not fetch items for this order.");
      return;
    }
  }
  expandedOrderId.value = orderId;
};

const handleStatusChange = async (orderId, statusId) => {
  try {
    await orderService.changeStatus(orderId, statusId);
    toast.success("Order status updated!");
    await loadOrders();
  } catch (err) {
    toast.error("Failed to update status.");
  }
};

const handleSendInvoice = async (orderId) => {
  try {
    await orderService.sendInvoice(orderId);
    toast.success("Invoice sent successfully!");
  } catch (err) {
    toast.error("Error sending invoice.");
  }
};

const getStatusClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'accepted':
    case 'approved':
    case 'ready':
    case 'rented':
    case 'returned':
      return 'statusGreen';
    case 'rejected':
    case 'canceled':
      return 'statusRed';
    default:
      return 'statusYellow';
  }
};

const getImageUrl = (filepath) => {
  const fileName = filepath?.split('/').pop() || '';
  return `${import.meta.env.VITE_API_BASE_URL}/img/products/${fileName}`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString();
};

onMounted(() => {
  if (authStore.user && Object.keys(authStore.user).length > 0) {
    loadOrders();
  } else {
    setTimeout(() => {
      if (loading.value) loading.value = false;
    }, 1500);
  }
});

watch(() => authStore.user, (newUser) => {
  if (newUser) loadOrders();
}, { immediate: true });
</script>

<template>
  <div v-if="loading" class="loader">
    Loading orders...
  </div>

  <div v-else class="container">
    <header class="pageHeader">
      <h1 class="pageTitle">Orders History</h1>

      <div class="filterSection">
        <span>Filter by Status:</span>
        <select
          v-model="filterStatus"
          @change="currentPage = 1"
          class="statusSelect"
        >
          <option v-for="opt in statusOptions" :key="opt" :value="opt">
            {{ opt }}
          </option>
        </select>
      </div>
    </header>

    <div class="orderGrid">
      <!-- Empty Filter State Container -->
      <div v-if="paginatedOrders.length === 0" class="emptyOrdersCard">
        <p>No logged rental entries match your current status filter criteria.</p>
      </div>

      <!-- Main Order Cards Map Render -->
      <div v-else v-for="order in paginatedOrders" :key="order.orderId" class="orderCard">
        <div class="cardMain">
          <div class="header">
            <h3><User class="order-icon" /> {{ order.cart?.user?.firstname }} {{ order.cart?.user?.lastname }}'s Order</h3>
            <p class="contact"><Phone class="order-icon" /> Client contact: {{ order.cart?.user?.phone }}</p>
          </div>

          <div class="infoLine">
            <MapPin class="order-icon" />
            <span>Address: {{ order.address?.city }}, {{ order.address?.street }} {{ order.address?.number }}</span>
          </div>

          <div class="infoLine">
            <Calendar class="order-icon" />
            <span>Rental: {{ formatDate(order.rentalDateStart) }} - {{ formatDate(order.rentalDateEnd) }}</span>
          </div>

          <div class="infoLine">
            <Bell class="order-icon" />
            <span>
              Status:
              <span class="statusBadge" :class="getStatusClass(order.orderStatus?.status)">
                {{ order.orderStatus?.status }}
              </span>
            </span>
          </div>

          <div class="infoLine">
            <CircleDollarSign class="order-icon" />
            <span>Cost: <strong>{{ order.totalCost?.toFixed(2) }} zł</strong></span>
          </div>

          <!-- Dynamic Interaction Layer Matrix -->
          <div class="actionButtons">
            <button @click="handleToggleDetails(order.orderId)" class="btnShow">
              <template v-if="expandedOrderId === order.orderId">
                <EyeOff class="btn-icon" /> Hide
              </template>
              <template v-else>
                <Eye class="btn-icon" /> Show details
              </template>
            </button>

            <button @click="handleSendInvoice(order.orderId)" class="btnInvoice">
              <Send class="btn-icon" /> Send Invoice
            </button>

            <!-- Client Cancellation Handler -->
            <button
              v-if="order.orderStatus?.orderStatusId === STATUS_IDS.PROCESSING && !isStaff"
              @click="handleStatusChange(order.orderId, STATUS_IDS.CANCELED)"
              class="btnCancel"
            >
              Cancel Order
            </button>

            <!-- Staff Lifecycle Management State Machine Controls -->
            <div v-if="isStaff" class="staffActions">
              <template v-if="order.orderStatus?.orderStatusId === STATUS_IDS.PROCESSING">
                <button @click="handleStatusChange(order.orderId, STATUS_IDS.ACCEPTED)" class="btnApprove">Approve</button>
                <button @click="handleStatusChange(order.orderId, STATUS_IDS.REJECTED)" class="btnReject">Reject</button>
              </template>

              <button
                v-if="order.orderStatus?.orderStatusId === STATUS_IDS.ACCEPTED"
                @click="handleStatusChange(order.orderId, STATUS_IDS.READY)"
                class="btnReady"
              >
                Ready
              </button>

              <button
                v-if="order.orderStatus?.orderStatusId === STATUS_IDS.READY"
                @click="handleStatusChange(order.orderId, STATUS_IDS.RENTED)"
                class="btnRent"
              >
                Rent
              </button>

              <button
                v-if="order.orderStatus?.orderStatusId === STATUS_IDS.RENTED"
                @click="handleStatusChange(order.orderId, STATUS_IDS.RETURNED)"
                class="btnReturn"
              >
                Return
              </button>
            </div>
          </div>
        </div>

        <!-- Inner Tray Detail Drawer Mapping Panel -->
        <div v-if="expandedOrderId === order.orderId && orderDetails[order.orderId]" class="detailsTray">
          <h4>Items in this order:</h4>
          <div class="productList">
            <div
              v-for="(product, idx) in orderDetails[order.orderId].productsDTO"
              :key="`${product.name}-${idx}`"
              class="productMiniCard"
            >
              <img :src="getImageUrl(product.imageFilepath)" :alt="product.name" />
              <p>{{ product.name }}</p>
              <span>{{ product.price }} zł</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Interface Navigation Pagination Footer Controls -->
    <div class="pagination">
      <button :disabled="currentPage === 1" @click="currentPage--">
        <ChevronLeft />
      </button>
      <span>Page {{ currentPage }} of {{ totalPages }}</span>
      <button :disabled="currentPage === totalPages" @click="currentPage++">
        <ChevronRight />
      </button>
    </div>
  </div>
</template>

<style scoped>
.ordersPage {
  background-color: #f1f5f9;
  min-height: 100vh;
  padding: 2rem 1rem;
}

.container {
  max-width: 900px;
  margin: 0 auto;
}

.pageHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e2e8f0;
}

.pageTitle {
  margin: 0;
  font-size: 2.2rem;
  font-weight: 800;
  color: #0f172a;
}

.orderCard {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.cardMain {
  padding: 1.5rem;
}

.header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: darkblue;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.contact {
  color: #64748b;
  font-size: 0.9rem;
  margin: 0.25rem 0 1rem 0;
}

.infoLine {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  color: #334155;
}

.infoLine strong {
  color: #0f172a;
}

.actionButtons button {
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

/* Button Variants */
.btnShow { background: #f8fafc; border: 1px solid #e2e8f0 !important; color: #475569; }
.btnShow:hover { background: #f1f5f9; }

.btnInvoice { background: #ecfdf5; color: #059669; border: 1px solid #10b981 !important; }
.btnInvoice:hover { background: #d1fae5; }

.btnCancel { background: #fef2f2; color: #dc2626; border: 1px solid #ef4444 !important; }
.btnCancel:hover { background: #fee2e2; }

/* Details Tray Fix */
.detailsTray {
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  padding: 1.5rem;
}

.detailsTray h4 { margin: 0 0 1rem 0; color: #475569; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.05em; }

.productList {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.productMiniCard {
  background: white;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  width: 140px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.productMiniCard img {
  width: 80px;
  height: 80px;
  object-fit: contain;
  margin-bottom: 8px;
}

.productMiniCard p { margin: 0; font-weight: 700; font-size: 0.9rem; color: #1e293b; }
.productMiniCard span { color: #64748b; font-size: 0.85rem; }

.pageHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.filterSection {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filterSection span {
  font-weight: 600;
  color: #64748b;
  font-size: 0.95rem;
}

.statusSelect {
  padding: 10px 16px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  background-color: white;
  font-weight: 600;
  color: #1e293b;
  cursor: pointer;
  outline: none;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.statusSelect:hover {
  border-color: #0066ff;
}

.statusSelect:focus {
  border-color: #0066ff;
}

.noOrders {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 12px;
  color: #64748b;
  border: 1px dashed #cbd5e1;
}

.statusGreen {
  color: #166534;
}

.statusRed {
  color: #991b1b;
}

.statusYellow {
  color: #854d0e;
}

/* Kontener nadrzędny */
.actionButtons {
  display: flex;
  gap: 10px;
  margin-top: 1.5rem;
  flex-wrap: wrap;
  align-items: center;
}

/* Wspólny styl dla WSZYSTKICH przycisków w gridzie */
.actionButtons button,
.staffActions button {
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
  font-size: 0.85rem; /* Spójna wielkość czcionki */
}

/* Wrapper dla przycisków personelu - aby nie psuły layoutu gapami */
.staffActions {
  display: flex;
  gap: 10px;
}

/* Warianty Kolorystyczne dla Staffu (Dopasowane do btnInvoice/btnCancel) */

.btnApprove {
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #10b981 !important;
}
.btnApprove:hover { background: #d1fae5; }

.btnReject {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #ef4444 !important;
}
.btnReject:hover { background: #fee2e2; }

.btnReady {
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #3b82f6 !important;
}
.btnReady:hover { background: #dbeafe; }

.btnRent {
  background: #f5f3ff;
  color: #7c3aed;
  border: 1px solid #8b5cf6 !important;
}
.btnRent:hover { background: #ede9fe; }

.btnReturn {
  background: #f0fdf4;
  color: #166534;
  border: 1px solid #22c55e !important;
}
.btnReturn:hover { background: #dcfce7; }

pagination {
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

.order-icon {
  display: inline-block;
  vertical-align: middle;
  margin-right: 8px;
  width: 1.15rem;
  height: 1.15rem;
  color: #718096;
}
.btn-icon {
  width: 1rem;
  height: 1rem;
  margin-right: 4px;
  display: inline-block;
  vertical-align: middle;
}

.loader {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  font-size: 1.2rem;
  font-weight: 700;
  color: #0066ff;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 50px;
  padding-bottom: 50px;
}
</style>
