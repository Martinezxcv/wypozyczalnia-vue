<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { productService } from '@/services/productService.js';
import { ROUTES } from '@/constants/routes.js';
import { toast } from 'vue-sonner';

import {
  Plus,
  Pencil,
  Trash2,
  Search
} from '@lucide/vue';

const router = useRouter();

// --- Reactive State ---
const products = ref([]);
const loading = ref(true);
const absoluteMaxPrice = ref(1000);

const filters = ref({
  search: '',
  equipmentType: 'All',
  category: 'All',
  skillLevel: 'All',
  maxPrice: 1000,
});

// --- Actions & API Synchronization ---
const loadInventory = async () => {
  loading.value = true;
  try {
    const data = await productService.getAll();
    products.value = data || [];

    if (data && data.length > 0) {
      const highest = Math.max(...data.map(p => p.price));
      absoluteMaxPrice.value = highest;
      if (filters.value.maxPrice > highest) {
        filters.value.maxPrice = highest;
      }
    }
  } catch (err) {
    toast.error("Failed to sync inventory database");
  } finally {
    loading.value = false;
  }
};

const handleDelete = async (id, name) => {
  toast(`Are you sure you want to delete ${name}?`, {
    duration: Infinity,
    action: {
      label: 'Delete',
      onClick: async () => {
        try {
          await productService.delete(id);
          toast.success(`${name} removed successfully.`);
          await loadInventory();
        } catch (err) {
          toast.error("Deletion task rejected by server.");
        }
      },
    },
    cancel: {
      label: 'Cancel'
    }
  });
};

// --- Computed Filtering Core ---
const filteredProducts = computed(() => {
  return products.value.filter(p => {
    const nameMatch = (p.name || '').toLowerCase().includes(filters.value.search.toLowerCase());
    const typeMatch = filters.value.equipmentType === 'All' || p.equipmentType?.name === filters.value.equipmentType;
    const catMatch = filters.value.category === 'All' || p.category?.name === filters.value.category;
    const skillMatch = filters.value.skillLevel === 'All' || p.skillLevel?.name === filters.value.skillLevel;
    const priceMatch = p.price <= filters.value.maxPrice;
    return nameMatch && typeMatch && catMatch && skillMatch && priceMatch;
  });
});

onMounted(() => {
  loadInventory();
});
</script>

<template>
  <div v-if="loading" class="loaderContainer">
    Accessing ShredGear Database...
  </div>

  <div v-else class="container">
    <header class="header">
      <div>
        <h1>Inventory Management</h1>
        <p>Showing {{ filteredProducts.length }} of {{ products.length }} items</p>
      </div>
      <button
        class="addBtn"
        @click="router.push({ name: ROUTES.MANAGEMENT.PRODUCT_FORM.NAME })"
      >
        <Plus class="btn-icon" /> Add New Gear
      </button>
    </header>

    <section class="filterBar">
      <div class="searchBox">
        <Search class="search-icon" />
        <input
          v-model="filters.search"
          placeholder="Search by name..."
        />
      </div>

      <div class="selectGroup">
        <select v-model="filters.equipmentType">
          <option value="All">All Types</option>
          <option value="Ski">Ski</option>
          <option value="Snowboard">Snowboard</option>
        </select>

        <select v-model="filters.category">
          <option value="All">All Categories</option>
          <option value="Racing">Racing</option>
          <option value="Freestyle">Freestyle</option>
        </select>
      </div>

      <div class="priceRange">
        <label>Max: <strong>{{ filters.maxPrice }}zł</strong></label>
        <input
          type="range"
          min="0"
          :max="absoluteMaxPrice"
          v-model.number="filters.maxPrice"
        />
      </div>
    </section>

    <div class="tableWrapper">
      <table class="table">
        <thead>
        <tr>
          <th>Product Details</th>
          <th>Type / Category</th>
          <th>Status</th>
          <th>Price</th>
          <th>Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr v-if="filteredProducts.length === 0">
          <td colSpan="5" class="emptyTableState">
            No gear items match your selected filter criteria.
          </td>
        </tr>

        <tr v-else v-for="product in filteredProducts" :key="product.productId">
          <td>
            <div class="productInfo">
              <strong>{{ product.name }}</strong>
              <span class="subText">{{ product.brand }} {{ product.model }}</span>
            </div>
          </td>
          <td>{{ product.equipmentType?.name }} / {{ product.category?.name }}</td>
          <td>
              <span class="statusBadge" :class="product.available ? 'available' : 'unavailable'">
                {{ product.available ? "Available" : "Unavailable" }}
              </span>
          </td>
          <td>{{ product.price }} zł</td>
          <td>
            <div class="actionBtns">
              <button
                class="editBtn"
                @click="router.push({ name: ROUTES.MANAGEMENT.PRODUCT_FORM_PATTERN.NAME, params: { name: product.name } })"
              >
                <Pencil class="action-icon" />
              </button>
              <button
                class="deleteBtn"
                @click="handleDelete(product.productId, product.name)"
              >
                <Trash2 class="action-icon" />
              </button>
            </div>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.loaderContainer {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  font-size: 1.2rem;
  font-weight: 700;
  color: #0066ff;
}
.btn-icon, .search-icon, .action-icon {
  display: inline-block;
  vertical-align: middle;
  width: 1.1rem;
  height: 1.1rem;
}
.action-icon { width: 1rem; height: 1rem; }

.container {
  max-width: 1300px;
  margin: 40px auto;
  padding: 0 24px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 30px;
}

.header h1 {
  font-size: 2.2rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.header p {
  color: #64748b;
  margin-top: 5px;
  font-weight: 500;
}

.addBtn {
  background: #0066ff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

/* Horizontal Filter Bar */
.filterBar {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 24px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.searchBox {
  position: relative;
  flex: 1;
}

.searchBox svg {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}
.searchBox input {
  width: 100%;
  padding: 10px 10px 10px 40px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.selectGroup {
  display: flex;
  gap: 12px;
}

.selectGroup select {
  padding: 10px 30px 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background-color: #f8fafc;
  cursor: pointer;
}

.priceRange {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 150px;
}

.priceRange label {
  font-size: 0.75rem;
  color: #64748b;
}

/* Table Styling */
.tableWrapper {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.table th {
  background: #f8fafc;
  padding: 16px;
  color: #64748b;
  font-size: 0.75rem;
  text-transform: uppercase;
  border-bottom: 1px solid #e2e8f0;

}
.table td {
  padding: 16px;
  border-bottom: 1px solid #f1f5f9;
}

.nameCell {
  display: flex;
  flex-direction: column;
}

.nameCell span {
  font-size: 0.8rem;
  color: #94a3b8;
}

.badgeGroup {
  display: flex;
  gap: 6px;
}

.typeTag {
  background: #eff6ff;
  color: #1e40af;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 700;
}

.catTag {
  background: #f1f5f9;
  color: #475569;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 700;
}

.statusIn {
  color: #16a34a;
  font-weight: 700;
  font-size: 0.85rem;
}

.statusOut {
  color: #dc2626;
  font-weight: 700;
  font-size: 0.85rem;
}

.actionBtns {
  display: flex;
  gap: 10px;
}

.editBtn, .deleteBtn {
  background: none;
  border: 1px solid #e2e8f0;
  padding: 6px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  font-size: 1.1rem;
}
.editBtn { color: #0066ff; }
.deleteBtn { color: #dc2626; }

.editBtn:hover { background: #eff6ff; border-color: #0066ff; }
.deleteBtn:hover { background: #fef2f2; border-color: #dc2626; }

.productInfo {
  display: flex;
  flex-direction: column;
}

.subText {
  font-size: 0.85rem;
  color: #666;
  margin-top: 2px;
}

.nameHeader {
  display: flex;
  align-items: center;
  gap: 10px;
}

.statusBadge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-align: center;
  min-width: 90px;
}

.available {
  background-color: #dcfce7;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.unavailable {
  background-color: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.checkboxLabel {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-weight: 500;
  margin-top: 10px;
}
</style>
