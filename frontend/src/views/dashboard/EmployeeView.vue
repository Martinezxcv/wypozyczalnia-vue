<script setup>
function handleAddProduct() {
  console.log('Add new product clicked');
}

function handleScanReturn() {
  console.log('Scan return clicked');
}

function handleGenerateReport() {
  console.log('Generate report clicked');
}
</script>

<template>
  <div class="container">
    <header class="header">
      <h1>Operations Dashboard</h1>
      <p>Monitor equipment rentals and manage ShredGear inventory.</p>
    </header>

    <div class="statsGrid">
      <div class="statCard">
        <span class="label">Active Rentals</span>
        <span class="value">42</span>
        <span class="trendUp">+12% from yesterday</span>
      </div>
      <div class="statCard">
        <span class="label">Pending Orders</span>
        <span class="value">8</span>
        <span class="statusYellow">Requires Action</span>
      </div>
      <div class="statCard">
        <span class="label">Items Overdue</span>
        <span class="value">3</span>
        <span class="statusRed">Critical</span>
      </div>
    </div>

    <div class="mainGrid">

      <section class="section">
        <h3>Quick Management</h3>
        <div class="buttonGrid">
          <button @click="handleAddProduct" class="actionBtn">
            Add New Product
          </button>
          <button @click="handleScanReturn" class="actionBtn">
            Scan Return
          </button>
          <button @click="handleGenerateReport" class="actionBtnSecondary">
            Generate Report
          </button>
        </div>
      </section>

      <section class="section">
        <h3>Inventory Health</h3>

        <div class="healthBarWrapper">
          <div class="healthLabel">
            <span>Snowboards</span>
            <span>85%</span>
          </div>
          <div class="barContainer">
            <div class="barFill" :style="{ width: '85%' }"></div>
          </div>
        </div>

        <div class="healthBarWrapper">
          <div class="healthLabel">
            <span>Boots & Bindings</span>
            <span>40%</span>
          </div>
          <div class="barContainer">
            <div class="barFillLow" :style="{ width: '40%' }"></div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.container {
  animation: slideIn 0.4s ease-out;
}

.header {
  margin-bottom: 30px;
}

.header h1 {
  font-size: 1.8rem;
  color: #1a202c;
  margin-bottom: 5px;
}

/* Stats Row */
.statsGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.statCard {
  background: white;
  padding: 25px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #718096;
  text-transform: uppercase;
  margin-bottom: 10px;
}

.value {
  font-size: 2.2rem;
  font-weight: 800;
  color: #2d3748;
}

/* Action Section */
.mainGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.section {
  background: white;
  padding: 25px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.section h3 {
  font-size: 1rem;
  margin-bottom: 20px;
  color: #4a5568;
}

.buttonGrid {
  display: grid;
  gap: 10px;
}

.actionBtn {
  background: #0066ff;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.actionBtnSecondary {
  background: #f7fafc;
  color: #4a5568;
  border: 1px solid #e2e8f0;
  padding: 12px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

/* Inventory Bars */
.healthBarWrapper {
  margin-bottom: 15px;
}

.healthLabel {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  margin-bottom: 5px;
  font-weight: 500;
}

.barContainer {
  height: 8px;
  background: #edf2f7;
  border-radius: 4px;
  overflow: hidden;
}

.barFill { background: #48bb78; height: 100%; }
.barFillLow { background: #f6ad55; height: 100%; }

/* Status Colors */
.statusYellow { color: #d69e2e; font-size: 0.8rem; font-weight: 700; }
.statusRed { color: #e53e3e; font-size: 0.8rem; font-weight: 700; }
.trendUp { color: #48bb78; font-size: 0.8rem; font-weight: 600; }

@keyframes slideIn {
  from { opacity: 0; transform: translateX(-10px); }
  to { opacity: 1; transform: translateX(0); }
}
</style>
