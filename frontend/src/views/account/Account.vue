<script setup>
import { ref, computed, onMounted } from 'vue';
import { accountService } from '@/services/accountService';
import { toast } from 'vue-sonner';

import {
  User,
  Home,
  Mail,
  Phone,
  SquarePen
} from '@lucide/vue';

// --- Local Reactive Navigation & Modals State ---
const activeTab = ref('profile');
const userData = ref(null);
const isEditingProfile = ref(false);
const isChangingPassword = ref(false);

// --- Form State Variables ---
const profileForm = ref({ firstname: '', lastname: '', username: '', email: '', phone: '' });
const passwordForm = ref({ oldPassword: '', newPassword: '', confirmPassword: '' });
const addresses = ref([]);
const addressForm = ref({ city: '', street: '', number: '', postalCode: '' });

// --- Computed Properties ---
const avatarInitials = computed(() => {
  if (!userData.value?.firstname || !userData.value?.lastname) return '??';
  return `${userData.value.firstname[0].toUpperCase()}${userData.value.lastname[0].toUpperCase()}`;
});

// --- API Service Action Handlers ---
const loadData = async () => {
  try {
    const [info, addrList] = await Promise.all([
      accountService.getUserInfo(),
      accountService.getAddresses()
    ]);

    userData.value = info;
    addresses.value = addrList;

    profileForm.value = {
      firstname: info?.firstname || '',
      lastname: info?.lastname || '',
      username: info?.username || '',
      email: info?.email || '',
      phone: info?.phone || ''
    };
  } catch (err) {
    toast.error("Failed to load user account metadata.");
  }
};

const handleSetDefault = async (id) => {
  try {
    await accountService.setDefaultAddress(id);
    toast.success("Default address updated successfully");
    await loadData();
  } catch (err) {
    toast.error("Failed to update default address.");
  }
};

const handleAddAddress = async () => {
  try {
    await accountService.addAddress(addressForm.value);
    toast.success("New address added successfully");

    addressForm.value = { city: '', street: '', number: '', postalCode: '' };
    await loadData();
  } catch (err) {
    toast.error("Failed to add address details.");
  }
};

const handleProfileUpdate = async () => {
  try {
    await accountService.updateUser(profileForm.value);
    toast.success("Profile updated successfully");
    isEditingProfile.value = false;
    await loadData();
  } catch (err) {
    console.error(err);
    toast.error("Failed to update profile settings.");
  }
};

const handlePasswordUpdate = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    toast.error("New passwords do not match.");
    return;
  }

  try {
    // await accountService.updatePassword(passwordForm.value);
    toast.success("Password changed successfully!");
    isChangingPassword.value = false;
    passwordForm.value = { oldPassword: '', newPassword: '', confirmPassword: '' };
  } catch (err) {
    toast.error("Failed to change account password.");
  }
};

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="settingsPage">
    <div class="container">

      <aside class="sidebar">
        <div class="userIdentity">
          <div class="avatarLarge">
            {{ avatarInitials }}
          </div>
          <h3>{{ userData?.firstname }} {{ userData?.lastname }}</h3>
          <span class="roleTag">{{ userData?.role || 'User' }}</span>
        </div>

        <nav class="sideNav">
          <button
            :class="{ active: activeTab === 'profile' }"
            @click="activeTab = 'profile'"
          >
            <User class="nav-icon" /> General
          </button>
          <button
            :class="{ active: activeTab === 'addresses' }"
            @click="activeTab = 'addresses'"
          >
            <Home class="nav-icon" /> Addresses
          </button>
        </nav>
      </aside>

      <main class="content">

        <div v-if="activeTab === 'profile'" class="profileSection">
          <div class="card">
            <div class="cardHeader">
              <h2>Personal Information</h2>
              <button
                v-if="!isEditingProfile"
                @click="isEditingProfile = true"
                class="btnSecondary"
              >
                <SquarePen class="btn-icon" /> Edit
              </button>
            </div>

            <form v-if="isEditingProfile" @submit.prevent="handleProfileUpdate" class="profileForm">
              <div class="formGrid">
                <div class="inputGroup">
                  <label>First Name</label>
                  <input type="text" v-model="profileForm.firstname" required />
                </div>
                <div class="inputGroup">
                  <label>Last Name</label>
                  <input type="text" v-model="profileForm.lastname" required />
                </div>
                <div class="inputGroup">
                  <label>Username</label>
                  <input type="text" v-model="profileForm.username" required />
                </div>
                <div class="inputGroup">
                  <label>Email Address</label>
                  <input type="email" v-model="profileForm.email" required />
                </div>
                <div class="inputGroup">
                  <label>Phone Number</label>
                  <input type="text" v-model="profileForm.phone" />
                </div>
              </div>

              <div class="formActionsUnder">
                <button type="button" @click="isEditingProfile = false" class="btnGhost">
                  Cancel
                </button>
                <button type="submit" class="btnPrimary">
                  Save Changes
                </button>
              </div>
            </form>

            <div v-else class="infoDisplay">
              <div class="infoItem">
                <Mail class="info-icon" /> {{ userData?.email }}
              </div>
              <div class="infoItem">
                <Phone class="info-icon" /> {{ userData?.phone || 'No phone provided' }}
              </div>
            </div>
          </div>

          <div class="card">
            <div class="cardHeader">
              <h2>Security</h2>
            </div>

            <div v-if="!isChangingPassword" class="passwordSummary">
              <p>Manage your account password to keep your data secure.</p>
              <button @click="isChangingPassword = true" class="btnSecondary">
                Change Password
              </button>
            </div>

            <form v-else @submit.prevent="handlePasswordUpdate" class="profileForm">
              <div class="inputGroup fullWidth">
                <label>New Password</label>
                <input
                  type="password"
                  placeholder="Min. 8 characters"
                  v-model="passwordForm.newPassword"
                  required
                />
              </div>

              <div class="inputGroup fullWidth">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  v-model="passwordForm.confirmPassword"
                  required
                />
              </div>

              <div class="formActionsRight">
                <button type="button" @click="isChangingPassword = false" class="btnGhost">
                  Cancel
                </button>
                <button type="submit" class="btnPrimary">
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>

        <div v-if="activeTab === 'addresses'" class="addressSection">
          <div class="card">
            <div class="cardHeader">
              <h2>My Addresses</h2>
            </div>

            <div class="addressList">
              <div
                v-for="addr in addresses"
                :key="addr.addressId"
                class="addressCard"
                :class="{ default: addr.default }"
              >
                <div class="addressInfo">
                  <Home class="addressIcon" />
                  <div>
                    <div class="addressHeaderRow">
                      <p><strong>{{ addr.city }}</strong></p>
                      <span v-if="addr.default" class="defaultBadge">Default</span>
                    </div>
                    <p>{{ addr.street }} {{ addr.number }}, {{ addr.postalCode }}</p>
                  </div>
                </div>

                <div class="addressActions">
                  <button
                    v-if="!addr.default"
                    @click="handleSetDefault(addr.addressId)"
                    class="btnSecondary"
                  >
                    Set as Default
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="cardHeader">
              <h2>Add New Address</h2>
            </div>

            <form @submit.prevent="handleAddAddress" class="formGrid">
              <div class="inputGroup">
                <label>City</label>
                <input type="text" placeholder="e.g. Warsaw" v-model="addressForm.city" required />
              </div>
              <div class="inputGroup">
                <label>Street</label>
                <input type="text" placeholder="e.g. Zwycięstwa" v-model="addressForm.street" required />
              </div>
              <div class="inputGroup">
                <label>Number</label>
                <input type="text" placeholder="e.g. 44" v-model="addressForm.number" required />
              </div>
              <div class="inputGroup">
                <label>Postal Code</label>
                <input type="text" placeholder="00-000" v-model="addressForm.postalCode" required />
              </div>
              <div class="fullWidth">
                <button type="submit" class="btnPrimary">Save Address</button>
              </div>
            </form>
          </div>
        </div>

      </main>
    </div>
  </div>
</template>

<style scoped>
/* --- Layout & Core Structure --- */
.settingsPage {
  background: #f8fafc;
  min-height: 100vh;
  padding: 40px 20px;
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 30px;
}

.sidebar {
  background: white;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e2e8f0;
  height: fit-content;
}

/* --- User Identity Section --- */
.userIdentity {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f1f5f9;
}

.avatarLarge {
  width: 80px;
  height: 80px;
  background: #0066ff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 700;
  margin: 0 auto 15px;
  box-shadow: 0 4px 6px -1px rgba(0, 102, 255, 0.2);
}

.userIdentity h3 {
  margin: 0;
  color: #1e293b;
  font-size: 1.1rem;
}

.userIdentity span {
  color: #64748b;
  font-size: 0.85rem;
}

/* --- Sidebar Navigation --- */
.sideNav {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sideNav button {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border: 1px solid transparent;
  background: none;
  color: #64748b;
  font-weight: 600;
  cursor: pointer;
  border-radius: 8px;
  text-align: left;
  transition: all 0.2s ease;
}

.sideNav button:hover {
  background: #f8fafc;
  color: #1e293b;
}

.sideNav button.active {
  background: #eff6ff;
  color: #0066ff;
  border: 1px solid #0066ff;
}

/* --- Cards & Content Containers --- */
.card {
  background: white;
  border: 1px solid #eef2f6;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.cardHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 15px;
}

.cardHeader h2 {
  font-size: 1.25rem;
  color: #1e293b;
  margin: 0;
}

/* --- Form Elements --- */
.profileForm {
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: stretch;
}

.formGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  width: 100%;
}

.fullWidth {
  grid-column: span 2;
}

.inputGroup {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.inputGroup label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
}

.inputGroup input {
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  width: 100%;
  outline: none;
  transition: all 0.2s;
}

.inputGroup input:focus {
  border-color: #0066ff;
  box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.1);
}

/* --- Buttons --- */
.btnPrimary {
  background: #0066ff;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btnPrimary:hover {
  background: #0052cc;
}

.btnSecondary {
  color: #0066ff;
  background: #f0f7ff;
  border: 1px solid #cce3ff;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.btnSecondary:hover {
  background: #e0efff;
}

.btnGhost {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-weight: 500;
  padding: 8px 16px;
}

.btnGhost:hover {
  color: #64748b;
}

.formActions {
  grid-column: span 2;
  grid-row: start;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #f1f5f9;
}

.formActionsUnder {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 25px;
  padding-top: 15px;
  border-top: 1px solid #f1f5f9;
  width: 100%;
}

.formActionsRight {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 25px;
  padding-top: 15px;
  border-top: 1px solid #f1f5f9;
  width: 100%;
  box-sizing: border-box;
}


/* --- Display & Security --- */
.infoDisplay {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.infoDisplay .fullWidth {
  grid-column: span 2;
}

.infoItem {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #334155;
  font-weight: 500;
  padding: 10px;
  background: #fbfcfd;
  border-radius: 8px;
}

.passwordSummary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.passwordSummary p {
  color: #64748b;
  margin: 0;
  font-size: 0.95rem;
}

/* --- Responsive Queries --- */
@media (max-width: 768px) {
  .container {
    grid-template-columns: 1fr;
  }

  .formGrid, .infoDisplay {
    grid-template-columns: 1fr;
  }

  .passwordSummary {
    flex-direction: column;
    align-items: flex-start;
  }
}

/* --- Address Specific Styles --- */
.addressList {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.addressCard {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  transition: all 0.2s;
}


.addressCard.default {
  border: 2px solid #10b981 !important;
  background: #f0fdf4;
}

.addressInfo {
  display: flex;
  align-items: flex-start;
  gap: 15px;
}

.addressIcon {
  font-size: 1.5rem;
  color: #64748b;
  margin-top: 2px;
}


.addressCard.default .addressIcon {
  color: #10b981;
}

.addressInfo p {
  margin: 0;
  color: #334155;
  line-height: 1.4;
}

.addressHeaderRow {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}

.defaultBadge {
  background: #10b981;
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
  text-transform: uppercase;
}

.addressSection h2 {
  margin-bottom: 20px;
}
.nav-icon, .btn-icon, .info-icon {
  display: inline-block;
  vertical-align: middle;
  margin-right: 8px;
  width: 1.2rem;
  height: 1.2rem;
}
</style>
