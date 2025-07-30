# 🔍 **ANALISIS MASALAH LOGIC DOMAIN**

## 📋 **OVERVIEW MASALAH**

User melaporkan bahwa "logic domain tidak berfungsi". Berdasarkan analisis kode, berikut adalah masalah-masalah yang ditemukan:

## 🚨 **MASALAH YANG DITEMUKAN**

### **1. MASALAH DI FRONTEND - DomainManagementModal.vue**

#### **A. Logic Available Domains (Line 225-245)**
```typescript
const availableDomains = computed(() => {
  return allDomains.value.filter(domain => {
    // ❌ MASALAH: Menggunakan domain.hosting !== null
    if (domain.hosting !== null) {
      return false
    }
    
    // ❌ MASALAH: Menggunakan domain.vpsId !== null
    if (domain.vpsId !== null) {
      return false
    }
    
    // ✅ BENAR: Exclude domains yang sudah di-assign ke current entity
    const isAssignedToCurrentEntity = currentDomains.value.some(currentDomain => currentDomain.id === domain.id)
    if (isAssignedToCurrentEntity) {
      return false
    }
    
    return true
  })
})
```

**Masalah:**
- `domain.hosting !== null` seharusnya `domain.hostingId !== null`
- Logic ini tidak konsisten dengan struktur data

#### **B. Logic Current Domains (Line 215-225)**
```typescript
const currentDomains = computed(() => {
  if (!props.entityId) return []
  
  return allDomains.value.filter(domain => {
    if (props.entityType === 'vps') {
      return domain.vpsId === props.entityId
    } else {
      return domain.hostingId === props.entityId
    }
  })
})
```

**Masalah:**
- Logic ini bergantung pada `allDomains.value` yang mungkin tidak ter-update secara real-time
- Tidak ada refresh otomatis ketika data berubah

### **2. MASALAH DI BACKEND - domains/[id]/route.ts**

#### **A. Logic Main Domain Assignment (Line 105-125)**
```typescript
// Check if this is the first domain being assigned to this entity
const existingDomainsCount = await prisma.domain.count({
  where: {
    OR: [
      { hostingId: result.data.hostingId },
      { vpsId: result.data.vpsId }
    ],
    id: { not: id } // Exclude current domain
  }
})

if (existingDomainsCount === 0) {
  result.data.isMainDomain = true
} else {
  result.data.isMainDomain = false
}
```

**Masalah:**
- Logic ini mungkin tidak bekerja dengan benar jika ada race condition
- Tidak ada validasi tambahan untuk memastikan hanya satu main domain per entity

#### **B. Logic Single Entity Assignment (Line 130-135)**
```typescript
// Ensure domain is only assigned to one entity (either hosting or VPS)
if (result.data.hostingId) {
  result.data.vpsId = null
} else if (result.data.vpsId) {
  result.data.hostingId = null
}
```

**Masalah:**
- Logic ini mungkin tidak menghapus assignment lama dengan benar
- Tidak ada cleanup untuk `domainHosting` field

### **3. MASALAH DI DOMAIN STORE - domains.ts**

#### **A. Data Synchronization (Line 210-230)**
```typescript
// Update the domain in the list if successful
const index = domains.value.findIndex(d => d.id === id)
if (index !== -1) {
  domains.value[index] = { ...domains.value[index], ...response.data.data }
}

// Also update in allDomains if it exists there
const allIndex = allDomains.value.findIndex(d => d.id === id)
if (allIndex !== -1) {
  allDomains.value[allIndex] = { ...allDomains.value[allIndex], ...response.data.data }
}
```

**Masalah:**
- Update manual ini bisa menyebabkan inkonsistensi data
- Tidak ada refresh otomatis dari server setelah update

## 🔧 **SOLUSI YANG DIPERLUKAN**

### **1. PERBAIKAN FRONTEND**

#### **A. Fix Available Domains Logic**
```typescript
const availableDomains = computed(() => {
  return allDomains.value.filter(domain => {
    // ✅ BENAR: Check hostingId, bukan hosting object
    if (domain.hostingId !== null) {
      return false
    }
    
    // ✅ BENAR: Check vpsId
    if (domain.vpsId !== null) {
      return false
    }
    
    // ✅ BENAR: Exclude current entity domains
    const isAssignedToCurrentEntity = currentDomains.value.some(currentDomain => currentDomain.id === domain.id)
    if (isAssignedToCurrentEntity) {
      return false
    }
    
    return true
  })
})
```

#### **B. Add Real-time Data Refresh**
```typescript
// Add watcher untuk refresh data otomatis
watch(() => props.entityId, async () => {
  if (props.entityId) {
    await domainsStore.fetchDomains({ limit: 500 })
  }
}, { immediate: true })
```

### **2. PERBAIKAN BACKEND**

#### **A. Improve Main Domain Logic**
```typescript
// Add transaction untuk atomic operation
await prisma.$transaction(async (tx) => {
  // Check existing domains
  const existingDomainsCount = await tx.domain.count({
    where: {
      OR: [
        { hostingId: result.data.hostingId },
        { vpsId: result.data.vpsId }
      ],
      id: { not: id }
    }
  })

  // Set main domain logic
  if (existingDomainsCount === 0) {
    result.data.isMainDomain = true
  } else {
    result.data.isMainDomain = false
  }

  // Update domain
  const domain = await tx.domain.update({
    where: { id },
    data: result.data
  })

  return domain
})
```

#### **B. Add Cleanup Logic**
```typescript
// Cleanup old assignments
if (result.data.hostingId || result.data.vpsId) {
  // Remove from other entities
  await prisma.domain.updateMany({
    where: {
      id,
      OR: [
        { hostingId: { not: null } },
        { vpsId: { not: null } }
      ]
    },
    data: {
      hostingId: null,
      vpsId: null,
      domainHosting: null,
      isMainDomain: false
    }
  })
}
```

### **3. PERBAIKAN DOMAIN STORE**

#### **A. Add Automatic Refresh**
```typescript
async function updateDomain(id: string, domainData: Partial<Domain>) {
  try {
    const response = await api.updateDomain(id, domainData)
    
    if (response && response.data && response.data.status === 'success') {
      // ✅ BENAR: Refresh data dari server
      await fetchDomains({ limit: 500 })
      return response.data
    }
  } catch (err) {
    // Handle error
  }
}
```

## 🎯 **PRIORITAS PERBAIKAN**

### **URGENT (Harus diperbaiki segera):**
1. Fix `domain.hosting !== null` menjadi `domain.hostingId !== null`
2. Add automatic data refresh setelah update
3. Improve backend transaction logic

### **IMPORTANT (Perlu diperbaiki):**
1. Add cleanup logic untuk old assignments
2. Improve error handling
3. Add validation untuk single main domain

### **NICE TO HAVE:**
1. Add optimistic updates
2. Add loading states yang lebih baik
3. Add retry logic untuk failed operations

## 📊 **TESTING CHECKLIST**

- [ ] Assign domain ke hosting kosong → harus jadi main domain
- [ ] Assign domain kedua ke hosting → harus jadi addon domain
- [ ] Remove domain dari hosting → harus hilang dari current domains
- [ ] Assign domain yang sudah di VPS ke hosting → harus pindah dengan benar
- [ ] Test dengan multiple users secara bersamaan
- [ ] Test dengan network errors
- [ ] Test dengan invalid data

## 🔍 **DEBUGGING STEPS**

1. **Check Console Logs**: Lihat log di browser dan server
2. **Check Network Tab**: Pastikan API calls berhasil
3. **Check Database**: Pastikan data tersimpan dengan benar
4. **Check State**: Pastikan frontend state ter-update
5. **Check Permissions**: Pastikan RBAC bekerja dengan benar 