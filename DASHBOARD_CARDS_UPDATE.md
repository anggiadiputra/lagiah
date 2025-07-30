# Dashboard Cards Update - RENEWAL COST ADDED

## 📋 Overview
**UPDATE:** Telah ditambahkan card "Total Renewal Cost" di halaman Dashboard (`frontend/src/views/DashboardView.vue`) untuk menampilkan total biaya yang diperlukan untuk memperbaharui layanan domain, hosting, dan VPS dalam 30 hari ke depan.

## ✅ Changes Applied

### 1. Added Total Renewal Cost Card
- **Card baru** ditampilkan di atas "Domains Expiring Soon"
- **Menampilkan breakdown biaya** untuk Domains, Hosting, dan VPS
- **Total cost calculation** dengan format currency IDR
- **Visual indicators** dengan icon dan warna yang berbeda untuk setiap kategori

### 2. Improved Card Spacing
- **Stats cards**: Ditambahkan `mb-12` untuk jarak yang lebih besar
- **Quick Stats Summary**: Ditambahkan `mb-12` untuk jarak yang lebih besar
- **Total Renewal Cost Card**: Ditambahkan `mb-8` untuk jarak dengan card di bawahnya

### 3. Currency Formatting
- **Fungsi `formatCurrency`** menggunakan format IDR Indonesia
- **Format**: Rp 1,000,000 (tanpa desimal)
- **Locale**: id-ID

### 4. Cost Calculations
- **Domain Renewal**: Menghitung dari `domain.renewalPrice` yang ada
- **Hosting Renewal**: Placeholder calculation (rata-rata Rp 1,200,000)
- **VPS Renewal**: Placeholder calculation (rata-rata Rp 800,000)
- **Total Items**: Menghitung jumlah item yang akan expired

## 🎨 Design Features

### Card Layout
- **Header**: "Total Renewal Cost" dengan icon uang dan "Next 30 days"
- **3-column grid**: Domains (biru), Hosting (hijau), VPS (ungu)
- **Total section**: Border separator dengan total cost dan jumlah items

### Visual Elements
- **Icons**: Domain globe, hosting server, VPS cube
- **Colors**: Blue (domains), Green (hosting), Purple (VPS)
- **Typography**: Large numbers untuk cost, small text untuk details

## 🔧 Technical Implementation

### Computed Properties
```javascript
// Format currency helper
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

// Renewal cost calculations
const totalDomainRenewalCost = computed(() => {
  return dashboardStore.expiringDomains.reduce((total, domain) => {
    return total + (domain.renewalPrice || 0)
  }, 0)
})

const totalHostingRenewalCost = computed(() => {
  return dashboardStore.expiringHostingCount * 1200000
})

const totalVPSRenewalCost = computed(() => {
  return dashboardStore.expiringVPSCount * 800000
})

const totalRenewalCost = computed(() => {
  return totalDomainRenewalCost.value + totalHostingRenewalCost.value + totalVPSRenewalCost.value
})
```

### Template Structure
```vue
<!-- Total Renewal Cost Card -->
<div class="bg-white shadow-lg rounded-xl overflow-hidden mb-8">
  <div class="px-8 py-6 border-b border-gray-200">
    <!-- Header with title and icon -->
  </div>
  <div class="p-8">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Domains, Hosting, VPS sections -->
    </div>
    <!-- Total Cost section -->
  </div>
</div>
```

## 📱 Responsive Design
- **Mobile**: Single column layout untuk cost breakdown
- **Tablet**: 3-column grid untuk cost breakdown
- **Desktop**: Full 3-column layout dengan proper spacing

## 🚀 How to Verify Changes

1. **Open the application**: http://localhost:5178
2. **Navigate to Dashboard**: Click on Dashboard in the sidebar
3. **Look for the new card** above "Domains Expiring Soon":
   - Card dengan judul "Total Renewal Cost"
   - 3 sections: Domains, Hosting, VPS
   - Total cost di bagian bawah
4. **Check improved spacing**:
   - Jarak yang lebih besar antara Stats cards dan Quick Stats Summary
   - Jarak yang lebih besar antara Quick Stats Summary dan Total Renewal Cost
   - Jarak yang lebih besar antara Total Renewal Cost dan Main content grid
5. **Verify currency formatting**:
   - Format IDR dengan "Rp" prefix
   - Thousand separators
   - No decimal places

## 📝 Notes
- Card menampilkan biaya renewal untuk 30 hari ke depan
- Hosting dan VPS menggunakan placeholder calculation (perlu diintegrasikan dengan data real)
- Format currency menggunakan locale Indonesia
- Spacing antar card telah diperbaiki untuk tampilan yang lebih rapi 