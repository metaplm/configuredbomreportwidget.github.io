<template>
  <v-app>
    <v-main>
      <v-container fluid class="pa-0">
        <!-- Banner Header (Drop Zone when data exists) -->
        <div 
          class="widget-banner"
          :class="{ 'drop-target': result, 'drag-over': isDragOver && result }"
          @dragenter="result && onDragEnter($event)"
          @dragover.prevent="result && onDragOver($event)"
          @dragleave="result && onDragLeave()"
          @drop.prevent="result && onDrop($event)"
        >
          <img :src="getImagePath('baykar_logo.png')" alt="Baykar" class="banner-logo" />
          <span class="banner-title">BOM Report Widget</span>
          <div v-if="isDragOver && result" class="banner-drop-hint">
            <svg viewBox="0 0 24 24"><path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="currentColor"/></svg>
            <span>Yeni Ürün Ağacı</span>
          </div>
        </div>

        <div class="widget-content">
            <v-alert 
              v-if="error" 
              type="error" 
              class="mx-4 mt-4 mb-2"
              closable
              @click:close="error = null"
            >
              {{ error }}
            </v-alert>

            <!-- Warning Toast -->
            <Transition name="toast">
              <div v-if="warningMessage" class="warning-toast">
                <svg viewBox="0 0 24 24"><path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" fill="currentColor"/></svg>
                <span>{{ warningMessage }}</span>
              </div>
            </Transition>

            <!-- Column Selector Dialog -->
            <ColumnSelector 
              v-model:show="showColumnSelector"
              :available-columns="availableColumns"
              :selected-columns="selectedColumns"
              @update:selected-columns="onColumnsChanged"
            />

            <!-- Item Selector Dialog -->
            <v-dialog v-model="showItemSelector" max-width="400" persistent>
              <v-card>
                <v-card-title class="d-flex align-center">
                  <svg class="dialog-icon mr-2" viewBox="0 0 24 24">
                    <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z" fill="currentColor"/>
                  </svg>
                  <span>Ürün Seçin</span>
                </v-card-title>
                <v-divider />
                <v-card-text class="py-2">
                  <p class="text-body-2 text-grey mb-3">{{ droppedItems.length }} ürün bırakıldı. Hangisinin yapısını görmek istiyorsunuz?</p>
                  <div class="item-list">
                    <div 
                      v-for="item in droppedItems" 
                      :key="item.objectId" 
                      class="item-option"
                      @click="selectItem(item)"
                    >
                      <img :src="getImagePath('VPMReference.png')" class="item-icon" />
                      <div class="item-info">
                        <div class="item-name">{{ item.displayName || item.objectId }}</div>
                        <div class="item-type">{{ item.displayType || item.objectType }}</div>
                      </div>
                      <svg class="item-arrow" viewBox="0 0 24 24">
                        <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" fill="currentColor"/>
                      </svg>
                    </div>
                  </div>
                </v-card-text>
                <v-divider />
                <v-card-actions>
                  <v-spacer />
                  <v-btn variant="text" @click="showItemSelector = false; droppedItems = []">İptal</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>

            <!-- Main Content Area -->
            <div 
              class="drop-zone"
              :class="{ 'drag-over': isDragOver && !result }"
              @dragenter="!result && onDragEnter($event)"
              @dragover.prevent="!result && onDragOver($event)"
              @dragleave="!result && onDragLeave()"
              @drop.prevent="!result && onDrop($event)"
            >
              <!-- BOM Tree Table (data loaded) -->
              <BomTreeTable 
                v-if="result && !loading" 
                :data="result" 
                :selected-columns="selectedColumns"
                :available-columns="availableColumns"
                @update:selected-columns="onColumnsChanged"
                @open-columns="showColumnSelector = true"
                @close="closeBOM"
              />

              <!-- Placeholder Table (empty or loading) -->
              <div v-else class="placeholder-wrapper">
                <!-- Loading overlay -->
                <div v-if="loading" class="loading-overlay">
                  <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
                </div>

                <!-- Drop hint overlay (not loading) -->
                <div v-else class="drop-hint-overlay">
                  <div class="hint-split-container">
                    <!-- Sol Panel: Son Açılanlar -->
                    <div class="hint-panel recent-panel" :class="{ 'has-items': recentItems.length > 0 }">
                      <p class="panel-label">Son Açılanlar</p>
                      <div v-if="recentItems.length > 0" class="recent-list">
                        <div 
                          v-for="item in recentItems" 
                          :key="item.id" 
                          class="recent-item"
                          @click="loadRecentItem(item)"
                        >
                          <img :src="getImagePath('VPMReference.png')" class="recent-icon" />
                          <span class="recent-name">{{ item.name }}</span>
                        </div>
                      </div>
                      <div v-else class="no-recent">
                        <span class="no-recent-text">Henüz açılan ürün yok</span>
                      </div>
                    </div>

                    <!-- Dikey Ayırıcı -->
                    <div class="hint-divider"></div>

                    <!-- Sağ Panel: Drop Zone -->
                    <div class="hint-panel drop-panel">
                      <img :src="getImagePath('VPMReference.png')" alt="Product" class="drop-icon" />
                      <p class="drop-text">Açmak istediğiniz ürün ağacını buraya bırakın</p>
                    </div>
                  </div>
                </div>

                <!-- Placeholder table -->
                <div class="placeholder-table">
                  <!-- Placeholder Toolbar -->
                  <div class="placeholder-toolbar">
                    <div class="placeholder-search">
                      <span class="placeholder-bar" style="width: 16px; height: 16px; border-radius: 50%;"></span>
                      <span class="placeholder-bar" style="width: 80px;"></span>
                    </div>
                    <div class="placeholder-toolbar-btns">
                      <span class="placeholder-bar toolbar-btn-bar"></span>
                      <span class="placeholder-bar toolbar-btn-bar"></span>
                      <span class="placeholder-bar toolbar-btn-bar"></span>
                    </div>
                  </div>
                  <!-- Placeholder Header -->
                  <div class="placeholder-header">
                    <div class="placeholder-cell title-cell"><span class="placeholder-bar header-bar" style="width: 40px;"></span></div>
                    <div class="placeholder-cell"><span class="placeholder-bar header-bar short"></span></div>
                    <div class="placeholder-cell"><span class="placeholder-bar header-bar short"></span></div>
                    <div class="placeholder-cell"><span class="placeholder-bar header-bar medium"></span></div>
                    <div class="placeholder-cell"><span class="placeholder-bar header-bar short"></span></div>
                  </div>
                  <!-- Placeholder Body -->
                  <div class="placeholder-body">
                    <div v-for="i in 10" :key="i" class="placeholder-row" :class="{ 'has-children': i === 1 || i === 4 || i === 7 }">
                      <div class="placeholder-cell title-cell">
                        <span class="placeholder-indent" :style="{ width: (getPlaceholderIndent(i)) + 'px' }"></span>
                        <span v-if="i === 1 || i === 4 || i === 7" class="placeholder-expand"></span>
                        <span v-else class="placeholder-expand-spacer"></span>
                        <span class="placeholder-icon"></span>
                        <span class="placeholder-bar title-bar" :style="{ width: getPlaceholderTitleWidth(i) }"></span>
                      </div>
                      <div class="placeholder-cell"><span class="placeholder-bar short"></span></div>
                      <div class="placeholder-cell"><span class="placeholder-chip"></span></div>
                      <div class="placeholder-cell"><span class="placeholder-chip status"></span></div>
                      <div class="placeholder-cell"><span class="placeholder-bar medium"></span></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Drag over indicator (only when no data) -->
              <div v-if="isDragOver && !result" class="drag-indicator">
                <svg viewBox="0 0 24 24"><path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="currentColor"/></svg>
                <span>Buraya bırakın</span>
              </div>
            </div>
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Platform3DSpace from '../js/Platform3DSpace.js';
import BomTreeTable from './BomTreeTable.vue';
import ColumnSelector from './ColumnSelector.vue';
import config, { loadConfig, getCustomAttributesUrl, getBomExpandUrl } from '../config.js';

const loading = ref(false);
const loadingAttributes = ref(false);
const result = ref(null);
const error = ref(null);
const showColumnSelector = ref(false);
const isDragOver = ref(false);
const dragCounter = ref(0);
const warningMessage = ref(null);
const warningTimeout = ref(null);

// Multi-item selection dialog
const showItemSelector = ref(false);
const droppedItems = ref([]);

// Root ID - dinamik, drag & drop ile değişebilir
const rootPhysicalId = ref('467E9E00D30F0000696C7FC400000003');

// Image path helper
const getImagePath = (filename) => {
  // eslint-disable-next-line no-undef
  const basePath = typeof __webpack_public_path__ !== 'undefined' ? __webpack_public_path__ : '/bomwidget/';
  return `${basePath}static/images/${filename}`;
};

// Drag & Drop handlers
const onDragEnter = (event) => {
  event.preventDefault();
  dragCounter.value++;
  isDragOver.value = true;
};

const onDragOver = (event) => {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'copy';
};

const onDragLeave = () => {
  dragCounter.value--;
  if (dragCounter.value === 0) {
    isDragOver.value = false;
  }
};

// Warning mesajını göster
const showWarning = (message) => {
  // Önceki timeout'u temizle
  if (warningTimeout.value) {
    clearTimeout(warningTimeout.value);
  }
  warningMessage.value = message;
  // 4 saniye sonra kapat
  warningTimeout.value = setTimeout(() => {
    warningMessage.value = null;
  }, 4000);
};

const onDrop = (event) => {
  isDragOver.value = false;
  dragCounter.value = 0;
  
  try {
    const text = event.dataTransfer.getData('text/plain');
    if (!text) return;
    
    // Column reorder drag'ini yoksay
    if (text === 'column-reorder') return;
    
    const data = JSON.parse(text);
    
    // 3DXContent protocol kontrolü
    if (data.protocol === '3DXContent' && data.data?.items?.length > 0) {
      const items = data.data.items;
      
      if (items.length > 1) {
        // Birden fazla item varsa seçim dialog'u göster
        droppedItems.value = items;
        showItemSelector.value = true;
      } else {
        // Tek item varsa direkt yükle
        selectItem(items[0]);
      }
    }
  } catch (err) {
    console.error('Drop parse error:', err);
    error.value = 'Geçersiz veri formatı';
  }
};

// Item seçildiğinde
const selectItem = (item) => {
  if (item?.objectId) {
    rootPhysicalId.value = item.objectId;
    showItemSelector.value = false;
    droppedItems.value = [];
    expandBOM();
  }
};

// Placeholder helpers
const getPlaceholderIndent = (i) => {
  const indents = [0, 0, 20, 40, 20, 40, 40, 20, 40, 60];
  return indents[i - 1] || 0;
};

const getPlaceholderTitleWidth = (i) => {
  const widths = ['70%', '55%', '45%', '60%', '50%', '40%', '65%', '55%', '35%', '50%'];
  return widths[i - 1] || '50%';
};

// OOTB Attributes - Sabit liste (label zorunlu, kapatılamaz)
const ootbColumns = [
  { key: 'ds6w:label', label: 'Title', required: true, category: 'ootb' },
  { key: '_qty', label: 'Qty', required: false, category: 'ootb' },
  { key: '_subqty', label: 'Sub Qty', required: false, category: 'ootb' },
  { key: '_totalqty', label: 'Total Qty', required: false, category: 'ootb' },
  { key: 'ds6wg:revision', label: 'Revision', required: false, category: 'ootb' },
  { key: 'ds6w:responsible', label: 'Responsible', required: false, category: 'ootb' },
  { key: 'ds6w:status', label: 'Status', required: false, category: 'ootb' },
  { key: 'ds6w:reserved', label: 'Reserved', required: false, category: 'ootb' },
  { key: 'ds6w:cadMaster', label: 'CAD Master', required: false, category: 'ootb' },
  { key: 'ds6w:isLastRevision', label: 'Is Last Revision', required: false, category: 'ootb' },
  { key: 'ds6w:project', label: 'Project', required: false, category: 'ootb' },
  { key: 'ds6w:organizationResponsible', label: 'Organization Responsible', required: false, category: 'ootb' },
  { key: 'ds6wg:EnterpriseExtension.V_PartNumber', label: 'Part Number', required: false, category: 'ootb' }
];

// Custom Attributes - API'den yüklenecek
const customColumns = ref([]);

// Tüm kullanılabilir sütunlar
const availableColumns = computed(() => {
  return [...ootbColumns, ...customColumns.value];
});

// localStorage keys
const STORAGE_KEY = 'bomwidget_column_settings';
const RECENT_ITEMS_KEY = 'bomwidget_recent_items';

// Recent items state
const recentItems = ref(loadRecentItems());

// Recent items fonksiyonları
function loadRecentItems() {
  try {
    const saved = localStorage.getItem(RECENT_ITEMS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Error loading recent items:', e);
  }
  return [];
}

function saveRecentItem(id, name) {
  try {
    let items = loadRecentItems();
    // Aynı ID varsa kaldır
    items = items.filter(item => item.id !== id);
    // Başa ekle
    items.unshift({ id, name, date: new Date().toISOString() });
    // Max 10 tut
    items = items.slice(0, 10);
    localStorage.setItem(RECENT_ITEMS_KEY, JSON.stringify(items));
    recentItems.value = items;
  } catch (e) {
    console.warn('Error saving recent item:', e);
  }
}

async function loadRecentItem(item) {
  rootPhysicalId.value = item.id;
  await expandBOM();
}

// BOM'u kapat ve ilk ekrana dön
function closeBOM() {
  result.value = null;
  error.value = null;
  rootPhysicalId.value = '';
}

// Varsayılan sütunlar
const defaultColumns = ['ds6w:label', '_qty', '_subqty', '_totalqty', 'ds6wg:revision', 'ds6w:status', 'ds6w:responsible'];

// localStorage'dan yükle veya varsayılanı kullan
const loadSavedColumns = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // ds6w:label her zaman olmalı
      if (Array.isArray(parsed) && parsed.includes('ds6w:label')) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error loading saved columns:', e);
  }
  return defaultColumns;
};

// localStorage'a kaydet
const saveColumns = (columns) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(columns));
  } catch (e) {
    console.warn('Error saving columns:', e);
  }
};

// Seçilen sütunlar
const selectedColumns = ref(loadSavedColumns());

// Custom attributes'ları API'den yükle
const loadCustomAttributes = async () => {
  loadingAttributes.value = true;
  try {
    const response = await Platform3DSpace.call3DSpace({
      url: getCustomAttributesUrl(),
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      type: 'json'
    });

    if (response?.attributeDescription) {
      customColumns.value = response.attributeDescription
        .filter(attr => attr.isDeployed) // Sadece deploy edilmiş olanları al
        .map(attr => ({
          key: `ds6wg:${attr.m1Name}`, // API'de kullanılacak key format
          label: attr.nlsName || attr.internalName,
          required: false,
          category: 'custom',
          type: attr.type,
          internalName: attr.internalName,
          m1Name: attr.m1Name
        }));
      console.log('Custom Attributes loaded:', customColumns.value);
    }
  } catch (err) {
    console.error('Error loading custom attributes:', err);
    // Hata durumunda boş bırak, uygulamanın çalışmasını engelleme
  } finally {
    loadingAttributes.value = false;
  }
};

// Component mount olduğunda custom attributes'ları yükle
onMounted(async () => {
  // Runtime config'i yükle
  await loadConfig();
  // Custom attribute'ları yükle
  loadCustomAttributes();
});

// select_object için kullanılacak alanlar
const selectObjectFields = computed(() => {
  // ds6wg:revision her zaman dahil (baykar_revision fallback için gerekli)
  const baseFields = ['physicalid', 'ds6w:globalType', 'ds6w:type', 'ds6w:composed', 'ds6w:isLastRevision', 'ds6wg:revision'];
  // _qty gibi internal key'leri filtrele (API'ye gönderilmemeli)
  const apiColumns = selectedColumns.value.filter(col => !col.startsWith('_'));
  return [...new Set([...baseFields, ...apiColumns])];
});

const expandBOM = async () => {
  loading.value = true;
  error.value = null;
  result.value = null;

  try {
    const requestBody = {
      batch: {
        expands: [{
          label: `Expand-Level-All-${Date.now()}`,
          root: { physical_id: rootPhysicalId.value },
          filter: {
            or: {
              filters: [{
                and: {
                  filters: [{
                    prefix_filter: {
                      prefix_path: [{ physical_id_path: [rootPhysicalId.value] }]
                    }
                  }]
                }
              }]
            }
          }
        }]
      },
      outputs: {
        select_object: selectObjectFields.value,
        select_relation: [
          'physicalid', 'ds6w:globalType', 'ds6w:type', 'ds6w:identifier', 'ds6w:label',
          'matrixtxt', 'ro.pgpshowextension.V_PGP_Show', 'ro.plminstance.v_treeorder'
        ],
        hits: {
          predefined_computation: ['urlstream|thumbnail|2dthb|allrefs', 'icons']
        },
        select_pgp: ['show', 'hide'],
        format: 'entity_relation_occurrence'
      }
    };

    const response = await Platform3DSpace.call3DSpace({
      url: getBomExpandUrl(),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      data: requestBody,
      type: 'json'
    });

    result.value = response;
    console.log('BOM Expand Response:', response);
    
    // Recent items'a kaydet
    if (response?.results?.length > 0) {
      const rootNode = response.results.find(r => r.resourceid === rootPhysicalId.value);
      const name = rootNode?.['ds6w:label'] || rootNode?.['ds6w:identifier'] || rootPhysicalId.value;
      saveRecentItem(rootPhysicalId.value, name);
    }
  } catch (err) {
    error.value = err.message || err;
    console.error('BOM Expand Error:', err);
  } finally {
    loading.value = false;
  }
};

const onColumnsChanged = (columns, skipReload = false) => {
  const oldColumns = new Set(selectedColumns.value);
  const newColumns = new Set(columns);
  
  // Yeni eklenen sütunlar var mı kontrol et
  const hasNewColumns = columns.some(col => !oldColumns.has(col));
  
  selectedColumns.value = columns;
  // localStorage'a kaydet
  saveColumns(columns);
  
  // Sadece yeni sütun eklendiyse ve data varsa, tekrar yükle
  // Sıralama değişikliği için yeniden yükleme yapma
  if (!skipReload && hasNewColumns && result.value) {
    expandBOM();
  }
};
</script>

<style>
@import 'vuetify/styles';

html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden;
}

#app,
.v-application,
.v-application__wrap {
  height: 100%;
  min-height: 100% !important;
}

.v-main {
  height: 100%;
}

.v-main__wrap {
  height: 100%;
}

.v-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding-top: 5px !important;
}

/* Banner Header */
.widget-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 20px;
  background: linear-gradient(90deg, #121c4f 0%, #121c4f 60%, #006193 100%);
  border-radius: 8px 8px 0 0;
  position: relative;
  transition: all 0.2s ease;
}

.widget-banner.drop-target {
  cursor: pointer;
}

.widget-banner.drag-over {
  opacity: 0.4;
  transition: opacity 0.2s ease;
}

.banner-drop-hint {
  position: absolute;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  background: rgba(255, 255, 255, 1);
  border-radius: 8px;
  color: #1976d2;
  font-size: 18px;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: pulse 1s infinite;
}

.banner-drop-hint svg {
  width: 24px;
  height: 24px;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.banner-logo {
  height: 67px;
  width: auto;
}

.banner-title {
  color: white;
  font-size: 29px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.widget-content {
  padding: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-top: none;
  border-radius: 0 0 8px 8px;
  overflow: hidden;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/* Warning Toast */
.warning-toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #ff9800;
  color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  font-size: 14px;
  z-index: 1000;
}

.warning-toast svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

/* Toast animation */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

/* Item Selector Dialog */
.dialog-icon {
  width: 24px;
  height: 24px;
  color: #1976d2;
}

.item-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.item-option:hover {
  border-color: #1976d2;
  background: #e3f2fd;
}

.item-icon {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-weight: 500;
  font-size: 14px;
  color: #212121;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-type {
  font-size: 12px;
  color: #757575;
}

.item-arrow {
  width: 20px;
  height: 20px;
  color: #bdbdbd;
  flex-shrink: 0;
}

.item-option:hover .item-arrow {
  color: #1976d2;
}

/* Drop Zone */
.drop-zone {
  position: relative;
  border: 2px solid transparent;
  transition: all 0.2s ease;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.drop-zone.drag-over {
  border-color: #1976d2;
  border-style: dashed;
  background: rgba(25, 118, 210, 0.02);
}

/* Drag Indicator */
.drag-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(25, 118, 210, 0.95);
  border-radius: 6px;
  z-index: 100;
  color: white;
  font-size: 16px;
  font-weight: 500;
  gap: 8px;
}

.drag-indicator svg {
  width: 48px;
  height: 48px;
}

/* Placeholder Wrapper */
.placeholder-wrapper {
  position: relative;
  overflow: hidden;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/* Loading Overlay */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.85);
  z-index: 20;
}

/* Drop Hint Overlay */
.drop-hint-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.95);
  z-index: 10;
}

.hint-split-container {
  display: flex;
  align-items: stretch;
  gap: 0;
  max-width: 700px;
  width: 90%;
  min-height: 250px;
}

.hint-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.hint-divider {
  width: 1px;
  background: #e0e0e0;
  margin: 20px 0;
}

.panel-label {
  color: #1976d2;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Recent Panel */
.recent-panel {
  background: #fafafa;
  border-radius: 12px 0 0 12px;
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  max-height: 180px;
  overflow-y: auto;
}

.recent-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  font-size: 13px;
  color: #424242;
}

.recent-item:hover {
  border-color: #1976d2;
  background: #e3f2fd;
  color: #1976d2;
}

.recent-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
  flex-shrink: 0;
}

.recent-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.no-recent {
  text-align: center;
  padding: 20px;
}

.no-recent-text {
  color: #9e9e9e;
  font-size: 13px;
}

/* Drop Panel */
.drop-panel {
  background: #f5f9ff;
  border-radius: 0 12px 12px 0;
  border: 2px dashed #c5d9f0;
}

.drop-icon {
  width: 64px;
  height: 64px;
  object-fit: contain;
  opacity: 0.7;
  margin-bottom: 12px;
}

.drop-text {
  color: #1976d2;
  font-size: 14px;
  font-weight: 500;
}

/* Placeholder Table */
.placeholder-table {
  opacity: 0.9;
  pointer-events: none;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.placeholder-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 8px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
}

.placeholder-search {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  width: 140px;
}

.placeholder-toolbar-btns {
  display: flex;
  gap: 4px;
}

.placeholder-bar.toolbar-btn-bar {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: #b0b0b0;
}

.placeholder-header {
  display: flex;
  background: linear-gradient(135deg, #111f5a 0%, #0c6193 100%);
  padding: 10px 8px;
  align-items: center;
  min-height: 44px;
}

.placeholder-header .placeholder-cell {
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-header .placeholder-cell.title-cell {
  justify-content: flex-start;
}

.placeholder-bar.header-bar {
  height: 14px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 3px;
}

.placeholder-bar.header-bar.short {
  width: 50px;
}

.placeholder-bar.header-bar.medium {
  width: 70px;
}

.placeholder-body {
  flex: 1;
  overflow: hidden;
}

.placeholder-row {
  display: flex;
  padding: 8px;
  border-bottom: 1px solid #f0f0f0;
  background: white;
  align-items: center;
}

.placeholder-row.has-children {
  background: #fafafa;
}

.placeholder-cell {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 0 8px;
  justify-content: center;
}

.placeholder-cell.title-cell {
  flex: 0 0 280px;
  justify-content: flex-start;
  gap: 6px;
}

.placeholder-indent {
  display: inline-block;
  flex-shrink: 0;
}

.placeholder-expand {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  background: #b0b0b0;
  flex-shrink: 0;
}

.placeholder-expand-spacer {
  width: 26px;
  flex-shrink: 0;
}

.placeholder-icon {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  background: #a0a0a0;
  flex-shrink: 0;
}

.placeholder-bar {
  height: 12px;
  background: #b0b0b0;
  border-radius: 4px;
}

.placeholder-bar.title-bar {
  height: 14px;
}

.placeholder-bar.short {
  width: 30px;
  margin: 0 auto;
}

.placeholder-bar.medium {
  width: 55px;
  margin: 0 auto;
}

.placeholder-chip {
  width: 36px;
  height: 20px;
  border-radius: 10px;
  background: #a0a0a0;
  margin: 0 auto;
}

.placeholder-chip.status {
  width: 52px;
  background: #dcedc8;
}
</style>