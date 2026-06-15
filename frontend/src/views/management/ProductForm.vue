<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { productService } from '@/services/productService.js';
import { ROUTES } from '@/constants/routes.js';
import { toast } from 'vue-sonner';

import { ArrowLeft, Save } from '@lucide/vue';

const route = useRoute();
const router = useRouter();

// --- Configuration Arrays ---
const categories = ["Racing", "Freestyle", "All-Mountain", "Freeride", "Cross Country", "Powder", "Big-Mountain"];
const skillLevels = ["Beginner", "Intermediate", "Advanced", "Expert"];
const equipmentTypes = ["Ski", "Snowboard", "Helmet"];

// --- State Engine ---
const loading = ref(false);
const targetParamName = computed(() => route.params.name);
const isEditMode = computed(() => !!targetParamName.value && targetParamName.value !== ':name');

const formData = ref({
  id: '',
  name: '',
  brand: '',
  model: '',
  price: '',
  description: '',
  size: '',
  weight: '',
  imageFilepath: '',
  categoryName: '',
  skillLevelName: '',
  equipmentTypeName: '',
  available: true
});

// --- Lifecycle Fetch Hook ---
const fetchProductDetails = async () => {
  if (!isEditMode.value) return;

  try {
    const data = await productService.getByName(targetParamName.value);
    formData.value = {
      id: data.id || data.productId || '',
      name: data.name || '',
      brand: data.brand || '',
      model: data.model || '',
      price: data.price || '',
      description: data.description || '',
      size: data.size || '',
      weight: data.weight || '',
      imageFilepath: data.imageFilepath || '',
      categoryName: data.category?.name || '',
      skillLevelName: data.skillLevel?.name || '',
      equipmentTypeName: data.equipmentType?.name || '',
      available: data.available ?? true
    };
  } catch (err) {
    toast.error("Error fetching gear specification metrics");
    await router.push({name: ROUTES.MANAGEMENT.DASHBOARD.NAME});
  }
};

const handleSubmit = async () => {
  loading.value = true;

  const requestPayload = {
    productDTO: {
      productId: Number(formData.value.id),
      name: formData.value.name,
      brand: formData.value.brand,
      model: formData.value.model,
      price: formData.value.price ? parseFloat(formData.value.price) : 0.0,
      description: formData.value.description,
      size: formData.value.size,
      weight: formData.value.weight,
      imageFilepath: formData.value.imageFilepath,
      available: formData.value.available
    },
    categoryName: formData.value.categoryName,
    skillLevelName: formData.value.skillLevelName,
    equipmentTypeName: formData.value.equipmentTypeName
  };

  try {
    if (isEditMode.value) {
      await productService.update(requestPayload);
      toast.success("Gear records updated successfully!");
    } else {
      await productService.create(requestPayload);
      toast.success("New stock line added successfully!");
    }
    await router.push({name: ROUTES.MANAGEMENT.DASHBOARD.NAME});
  } catch (err) {
    toast.error(err.response?.data?.message || "Operation rejected by catalog controller");
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchProductDetails();
});
</script>

<template>
  <div class="container">
    <header class="header">
      <button
        @click="router.push({ name: ROUTES.MANAGEMENT.DASHBOARD.NAME })"
        class="backBtn"
        type="button"
      >
        <ArrowLeft class="btn-icon" /> Back to Dashboard
      </button>
      <h1>
        {{ isEditMode ? `Editing Target Specifications: ${targetParamName}` : 'Add New Catalog Equipment' }}
      </h1>
    </header>

    <form @submit.prevent="handleSubmit" class="infoCard">
      <div class="inputGroup">
        <label>Product Name</label>
        <input
          type="text"
          v-model="formData.name"
          required
          :disabled="isEditMode"
        />
      </div>

      <div class="row">
        <div class="inputGroup">
          <label>Brand</label>
          <input type="text" v-model="formData.brand" required />
        </div>
        <div class="inputGroup">
          <label>Model</label>
          <input type="text" v-model="formData.model" required />
        </div>
      </div>

      <div class="row">
        <div class="inputGroup">
          <label>Price (PLN)</label>
          <input type="number" step="0.01" v-model="formData.price" required />
        </div>
        <div class="inputGroup">
          <label>Image Filename</label>
          <input type="text" v-model="formData.imageFilepath" />
        </div>
      </div>

      <div class="row">
        <div class="inputGroup">
          <label>Category</label>
          <select v-model="formData.categoryName" required>
            <option value="">Select Category Node</option>
            <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
        <div class="inputGroup">
          <label>Equipment Type</label>
          <select v-model="formData.equipmentTypeName" required>
            <option value="">Select Structural Profile</option>
            <option v-for="t in equipmentTypes" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>
      </div>

      <div class="row">
        <div class="inputGroup">
          <label>Size</label>
          <input type="text" v-model="formData.size" />
        </div>
        <div class="inputGroup">
          <label>Skill Level Threshold</label>
          <select v-model="formData.skillLevelName" required>
            <option value="">Select Level Category</option>
            <option v-for="s in skillLevels" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>
      </div>

      <div class="inputGroup">
        <label>Description Narrative</label>
        <textarea rows="4" v-model="formData.description"></textarea>
      </div>

      <div class="inputGroup checkboxGroup">
        <label class="checkboxLabel">
          <input type="checkbox" v-model="formData.available" />
          <span>Item is instantly available for client store rental placement</span>
        </label>
      </div>

      <button type="submit" class="saveBtn" :disabled="loading">
        <Save class="btn-icon" /> {{ loading ? 'Processing Catalog Push...' : 'Commit Product Specifications' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.btn-icon {
  display: inline-block;
  vertical-align: middle;
  margin-right: 6px;
  width: 1.1rem;
  height: 1.1rem;
}
.checkboxGroup { margin: 1rem 0 1.5rem 0; }
.checkboxLabel {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  cursor: pointer;
  color: #334155;
}
.checkboxLabel input { width: 18px; height: 18px; cursor: pointer; }

.container {
  max-width: 800px; /* Slightly narrower for better focus on form fields */
  margin: 40px auto;
  padding: 0 24px;
}

.header {
  display: flex;
  flex-direction: column; /* Moves button above the H1 */
  align-items: flex-start; /* Aligns everything to the left */
  gap: 12px;
  margin-bottom: 32px;
}

.backBtn {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  color: #64748b;
  padding: 8px 14px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}

.backBtn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #0f172a;
  transform: translateX(-3px);
}

.header h1 {
  font-size: 2rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.02em;
  margin: 0;
}

/* Updated card style to be a single clean unit */
.infoCard {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
}

.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.inputGroup {
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.inputGroup label {
  font-size: 0.8rem;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.inputGroup input,
.inputGroup select,
.inputGroup textarea {
  padding: 12px 16px;
  border: 1.5px solid #e2e8f0; /* Slightly thicker border for better definition */
  border-radius: 8px;
  font-family: inherit;
  font-size: 1rem;
  color: #1e293b;
  transition: all 0.2s ease;
  background-color: #fcfcfc;
}

.inputGroup input:focus,
.inputGroup select:focus,
.inputGroup textarea:focus {
  outline: none;
  border-color: #0066ff;
  background-color: #ffffff;
  box-shadow: 0 0 0 4px rgba(0, 102, 255, 0.1);
}

/* Custom styling for the Select arrows */
.inputGroup select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1em;
}

.saveBtn {
  width: 100%;
  background: #0066ff;
  color: white;
  border: none;
  padding: 16px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
  transition: background 0.2s ease, transform 0.1s ease;
}

.saveBtn:hover {
  background: #0052cc;
}

.saveBtn:active {
  transform: scale(0.98);
}

@media (max-width: 640px) {
  .row {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .container {
    padding: 0 16px;
    margin: 20px auto;
  }
}
</style>
