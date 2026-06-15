<script setup>
import { useRouter } from 'vue-router';
import { ROUTES } from '@/constants/routes';

const router = useRouter();

function handleBrowseArrivals() {
  router.push(ROUTES.STORE.PRODUCTS.PATH);
}
</script>

<template>
  <div class="container">
    <header class="hero">
      <div class="heroText">
        <h1>Ready to hit the powder?</h1>
        <p>Check out the latest gear and upcoming ShredEvents.</p>
        <button @click="handleBrowseArrivals" class="ctaBtn">
          Browse New Arrivals
        </button>
      </div>
    </header>

    <div class="dashboardGrid">
      <section class="panel promoPanel">
        <h3>Current Promotions</h3>
        <div class="promoContent">
          <div class="badge">SALE</div>
          <h4>End of Season Clearance</h4>
          <p>Up to 40% off on all 2025 bindings.</p>
        </div>
      </section>

      <section class="panel">
        <h3>Recommended for Your Style</h3>
        <div class="recomGrid">
          <div class="miniCard">Burton Custom</div>
          <div class="miniCard">Lib Tech Orca</div>
        </div>
      </section>

      <section class="panel eventPanel">
        <h3>Upcoming Events</h3>
        <ul>
          <li>
            <strong>Mar 12:</strong> ShredGear Night Session
          </li>
          <li>
            <strong>Mar 20:</strong> Waxing Workshop (Free)
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<style scoped>
.container {
  animation: fadeIn 0.5s ease-in;
}

.hero {
  background: linear-gradient(135deg, #0066ff 0%, #00d4ff 100%);
  border-radius: 20px;
  padding: 60px;
  color: white;
  margin-bottom: 40px;
  box-shadow: 0 10px 30px rgba(0, 102, 255, 0.2);
}

.hero h1 { font-size: 2.5rem; margin-bottom: 10px; }

.ctaBtn {
  background: white;
  color: #0066ff;
  border: none;
  padding: 12px 25px;
  border-radius: 10px;
  font-weight: 700;
  margin-top: 20px;
  cursor: pointer;
  transition: transform 0.2s;
}

.ctaBtn:hover { transform: scale(1.05); }

.dashboardGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.panel {
  background: white;
  padding: 30px;
  border-radius: 15px;
  border: 1px solid #edf2f7;
  box-shadow: 0 4px 6px rgba(0,0,0,0.02);
}

.panel h3 {
  margin-bottom: 20px;
  font-size: 1.1rem;
  color: #2d3748;
  border-left: 4px solid #0066ff;
  padding-left: 15px;
}

.miniCard {
  background: #f7fafc;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  font-weight: 600;
}

.promoPanel {
  background: #fffaf0;
  border: 1px solid #feebc8;
}

.badge {
  background: #f56565;
  color: white;
  padding: 4px 8px;
  border-radius: 5px;
  font-size: 0.7rem;
  display: inline-block;
  margin-bottom: 10px;
}



@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
