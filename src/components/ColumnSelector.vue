<template>
  <v-dialog v-model="showDialog" max-width="700" persistent>
    <v-card>
      <v-card-title class="d-flex align-center">
        <svg class="title-icon mr-2" viewBox="0 0 24 24">
          <path d="M3,4H7V8H3V4M9,5V7H21V5H9M3,10H7V14H3V10M9,11V13H21V11H9M3,16H7V20H3V16M9,17V19H21V17H9" fill="currentColor"/>
        </svg>
        <span>Column Selection and Ordering</span>
        <v-spacer />
        <v-btn icon size="small" variant="text" @click="closeDialog">
          <svg class="close-icon" viewBox="0 0 24 24">
            <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" fill="currentColor"/>
          </svg>
        </v-btn>
      </v-card-title>

      <v-divider />

      <v-card-text class="py-3 dialog-content">
        <div class="two-column-layout">
          <!-- Sol Panel: Sütun Seçimi -->
          <div class="selection-panel">
            <div class="panel-title">Available Columns</div>
            
            <!-- OOTB Attributes -->
            <div class="section-header">
              <span>Standard</span>
              <v-chip size="x-small">{{ ootbColumns.length }}</v-chip>
            </div>
            <div class="columns-grid">
              <div 
                v-for="col in ootbColumns" 
                :key="col.key"
                class="column-item"
                :class="{ 'selected': isSelected(col.key), 'required': col.required, 'disabled': col.required }"
                :draggable="!col.required && !isSelected(col.key)"
                @click="!col.required && toggleColumn(col.key, !isSelected(col.key))"
                @dragstart="onSourceDragStart(col.key, $event)"
                @dragend="onSourceDragEnd"
              >
                <span class="check-icon">
                  <svg v-if="isSelected(col.key)" viewBox="0 0 24 24">
                    <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" fill="currentColor"/>
                  </svg>
                </span>
                <span class="column-label" :title="col.label">{{ truncateLabel(col.label) }}</span>
              </div>
            </div>

            <!-- EBOM Custom Attributes -->
            <div class="section-header mt-3">
              <span>EBOM Custom</span>
              <v-chip size="x-small" color="blue">{{ ebomCustomColumns.length }}</v-chip>
            </div>
            <div v-if="ebomCustomColumns.length > 0" class="columns-grid">
              <div 
                v-for="col in ebomCustomColumns" 
                :key="col.key"
                class="column-item custom ebom"
                :class="{ 'selected': isSelected(col.key) }"
                :draggable="!isSelected(col.key)"
                @click="toggleColumn(col.key, !isSelected(col.key))"
                @dragstart="onSourceDragStart(col.key, $event)"
                @dragend="onSourceDragEnd"
              >
                <span class="check-icon">
                  <svg v-if="isSelected(col.key)" viewBox="0 0 24 24">
                    <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" fill="currentColor"/>
                  </svg>
                </span>
                <span class="column-label" :title="col.label">{{ truncateLabel(col.label) }}</span>
              </div>
            </div>
            <div v-else class="empty-custom">
              <span class="text-caption text-grey">No EBOM custom attributes</span>
            </div>

            <!-- MBOM Custom Attributes -->
            <div class="section-header mt-3">
              <span>MBOM Custom</span>
              <v-chip size="x-small" color="purple">{{ mbomCustomColumns.length }}</v-chip>
            </div>
            <div v-if="mbomCustomColumns.length > 0" class="columns-grid">
              <div 
                v-for="col in mbomCustomColumns" 
                :key="col.key"
                class="column-item custom mbom"
                :class="{ 'selected': isSelected(col.key) }"
                :draggable="!isSelected(col.key)"
                @click="toggleColumn(col.key, !isSelected(col.key))"
                @dragstart="onSourceDragStart(col.key, $event)"
                @dragend="onSourceDragEnd"
              >
                <span class="check-icon">
                  <svg v-if="isSelected(col.key)" viewBox="0 0 24 24">
                    <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" fill="currentColor"/>
                  </svg>
                </span>
                <span class="column-label" :title="col.label">{{ truncateLabel(col.label) }}</span>
              </div>
            </div>
            <div v-else class="empty-custom">
              <span class="text-caption text-grey">No MBOM custom attributes</span>
            </div>

            <!-- Quick Actions -->
            <div class="quick-actions mt-3">
              <v-btn size="x-small" variant="text" @click="selectAllOotb">OOTB</v-btn>
              <v-btn size="x-small" variant="text" @click="selectAll">All</v-btn>
              <v-btn size="x-small" variant="text" @click="selectMinimum">Min</v-btn>
            </div>
          </div>

          <!-- Sağ Panel: Sıralama -->
          <div class="order-panel">
            <div class="panel-title">Ordering</div>
            
            <div 
              class="order-list"
              :class="{ 'drop-zone-active': isDraggingFromSource }"
              @dragover.prevent="onOrderListDragOver"
              @dragleave="onOrderListDragLeave"
              @drop="onOrderListDrop"
            >
              <!-- Title - Sabit -->
              <div class="order-item fixed">
                <span class="order-handle disabled">
                  <svg viewBox="0 0 24 24"><path d="M9,3H11V5H9V3M13,3H15V5H13V3M9,7H11V9H9V7M13,7H15V9H13V7M9,11H11V13H9V11M13,11H15V13H13V11M9,15H11V17H9V15M13,15H15V17H13V15M9,19H11V21H9V19M13,19H15V21H13V19Z" fill="currentColor"/></svg>
                </span>
                <span class="order-label">Title</span>
                <span class="fixed-badge">Fixed</span>
              </div>

              <!-- Sıralanabilir Sütunlar -->
              <div 
                v-for="(key, index) in orderedColumns" 
                :key="key"
                class="order-item"
                :class="{ 'dragging': dragIndex === index, 'drag-over': dragOverIndex === index }"
                draggable="true"
                @dragstart="onDragStart(index, $event)"
                @dragend="onDragEnd"
                @dragover.prevent="onDragOver(index, $event)"
                @drop.stop="onDrop(index)"
              >
                <span class="order-handle">
                  <svg viewBox="0 0 24 24"><path d="M9,3H11V5H9V3M13,3H15V5H13V3M9,7H11V9H9V7M13,7H15V9H13V7M9,11H11V13H9V11M13,11H15V13H13V11M9,15H11V17H9V15M13,15H15V17H13V15M9,19H11V21H9V19M13,19H15V21H13V21Z" fill="currentColor"/></svg>
                </span>
                <span class="order-label">{{ getColumnLabel(key) }}</span>
                <button class="remove-btn" @click.stop="toggleColumn(key, false)">
                  <svg viewBox="0 0 24 24"><path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" fill="currentColor"/></svg>
                </button>
              </div>

              <!-- Drop zone placeholder -->
              <div v-if="orderedColumns.length === 0 || isDraggingFromSource" class="drop-placeholder" :class="{ 'active': isOverDropZone }">
                <span>{{ orderedColumns.length === 0 ? 'Select columns or drag here' : 'Drop here' }}</span>
              </div>
            </div>
          </div>
        </div>
      </v-card-text>

      <v-divider />

      <v-card-actions class="px-4 py-3">
        <span class="text-caption text-grey">
          {{ localSelectedColumns.length }} columns selected
        </span>
        <v-spacer />
        <v-btn variant="text" @click="closeDialog">Cancel</v-btn>
        <v-btn color="primary" variant="flat" @click="applySelection">
          Apply
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  availableColumns: {
    type: Array,
    default: () => []
  },
  selectedColumns: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:show', 'update:selected-columns']);

// Local state for editing
const localSelectedColumns = ref([...props.selectedColumns]);

// Drag state - reorder within list
const dragIndex = ref(null);
const dragOverIndex = ref(null);

// Drag state - from source to order list
const isDraggingFromSource = ref(false);
const draggingColumnKey = ref(null);
const isOverDropZone = ref(false);

// Dialog visibility computed
const showDialog = computed({
  get: () => props.show,
  set: (val) => emit('update:show', val)
});

// OOTB ve Custom sütunları ayır
const ootbColumns = computed(() => {
  return props.availableColumns.filter(col => col.category === 'ootb');
});

// EBOM Custom Attributes (VPMReference) + shared
const ebomCustomColumns = computed(() => {
  return props.availableColumns.filter(col => col.category === 'ebom_custom' || col.category === 'shared_custom');
});

// MBOM Custom Attributes (DELFmiFunctionPPRReference) + shared
const mbomCustomColumns = computed(() => {
  return props.availableColumns.filter(col => col.category === 'mbom_custom' || col.category === 'shared_custom');
});

// Backward compatibility - tüm custom columns
const customColumns = computed(() => {
  return props.availableColumns.filter(col => col.category === 'ebom_custom' || col.category === 'mbom_custom' || col.category === 'shared_custom' || col.category === 'custom');
});

// Sıralanmış sütunlar (ds6w:label hariç)
const orderedColumns = computed(() => {
  return localSelectedColumns.value.filter(key => key !== 'ds6w:label');
});

// Watch for external changes
watch(() => props.selectedColumns, (newVal) => {
  localSelectedColumns.value = [...newVal];
}, { immediate: true });

// Watch for dialog open to reset local state
watch(() => props.show, (isOpen) => {
  if (isOpen) {
    localSelectedColumns.value = [...props.selectedColumns];
  }
});

const isSelected = (key) => {
  return localSelectedColumns.value.includes(key);
};

const getColumnLabel = (key) => {
  const col = props.availableColumns.find(c => c.key === key);
  return col?.label || key.split(':').pop();
};

const truncateLabel = (label, maxLength = 15) => {
  if (!label) return '-';
  return label.length > maxLength ? label.substring(0, maxLength) + '...' : label;
};

const toggleColumn = (key, selected) => {
  if (selected) {
    if (!localSelectedColumns.value.includes(key)) {
      localSelectedColumns.value.push(key);
    }
  } else {
    localSelectedColumns.value = localSelectedColumns.value.filter(k => k !== key);
  }
};

// Drag & Drop handlers - Reorder within list
const onDragStart = (index, event) => {
  dragIndex.value = index;
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('type', 'reorder');
};

const onDragEnd = () => {
  dragIndex.value = null;
  dragOverIndex.value = null;
};

const onDragOver = (index, event) => {
  dragOverIndex.value = index;
  event.dataTransfer.dropEffect = 'move';
};

const onDrop = (targetIndex) => {
  // Source'dan sürükleme ise bu pozisyona ekle
  if (isDraggingFromSource.value && draggingColumnKey.value) {
    const key = draggingColumnKey.value;
    if (!localSelectedColumns.value.includes(key)) {
      const columns = localSelectedColumns.value.filter(k => k !== 'ds6w:label');
      columns.splice(targetIndex, 0, key);
      localSelectedColumns.value = ['ds6w:label', ...columns];
    }
    resetSourceDrag();
    return;
  }
  
  // Normal reorder
  if (dragIndex.value === null || dragIndex.value === targetIndex) return;
  
  // ds6w:label hariç sütunları al
  const columns = localSelectedColumns.value.filter(k => k !== 'ds6w:label');
  
  // Sürüklenen elemanı çıkar ve yeni yerine ekle
  const [draggedItem] = columns.splice(dragIndex.value, 1);
  columns.splice(targetIndex, 0, draggedItem);
  
  // ds6w:label'ı başa ekleyerek güncelle
  localSelectedColumns.value = ['ds6w:label', ...columns];
  
  dragIndex.value = null;
  dragOverIndex.value = null;
};

// Drag from source (available columns) to order list
const onSourceDragStart = (key, event) => {
  if (isSelected(key)) return; // Zaten seçili ise sürükleme
  isDraggingFromSource.value = true;
  draggingColumnKey.value = key;
  event.dataTransfer.effectAllowed = 'copy';
  event.dataTransfer.setData('type', 'add');
  event.dataTransfer.setData('key', key);
};

const onSourceDragEnd = () => {
  resetSourceDrag();
};

const resetSourceDrag = () => {
  isDraggingFromSource.value = false;
  draggingColumnKey.value = null;
  isOverDropZone.value = false;
  dragOverIndex.value = null;
};

// Order list as drop zone
const onOrderListDragOver = (event) => {
  if (isDraggingFromSource.value) {
    isOverDropZone.value = true;
    event.dataTransfer.dropEffect = 'copy';
  }
};

const onOrderListDragLeave = () => {
  isOverDropZone.value = false;
};

const onOrderListDrop = () => {
  if (isDraggingFromSource.value && draggingColumnKey.value) {
    const key = draggingColumnKey.value;
    if (!localSelectedColumns.value.includes(key)) {
      localSelectedColumns.value.push(key);
    }
  }
  resetSourceDrag();
};

const selectAll = () => {
  // Mevcut sırayı koru, yenileri sona ekle
  const currentOrder = localSelectedColumns.value.filter(k => k !== 'ds6w:label');
  const allKeys = props.availableColumns.map(col => col.key);
  const newKeys = allKeys.filter(k => k !== 'ds6w:label' && !currentOrder.includes(k));
  localSelectedColumns.value = ['ds6w:label', ...currentOrder, ...newKeys];
};

const selectAllOotb = () => {
  const ootbKeys = ootbColumns.value.map(col => col.key);
  // Mevcut OOTB sırasını koru
  const currentOotb = localSelectedColumns.value.filter(k => ootbKeys.includes(k) && k !== 'ds6w:label');
  const newOotb = ootbKeys.filter(k => k !== 'ds6w:label' && !currentOotb.includes(k));
  localSelectedColumns.value = ['ds6w:label', ...currentOotb, ...newOotb];
};

const selectMinimum = () => {
  localSelectedColumns.value = props.availableColumns
    .filter(col => col.required)
    .map(col => col.key);
};

const closeDialog = () => {
  showDialog.value = false;
};

const applySelection = () => {
  emit('update:selected-columns', [...localSelectedColumns.value]);
  closeDialog();
};
</script>

<style scoped>
.title-icon {
  width: 24px;
  height: 24px;
}

.close-icon {
  width: 20px;
  height: 20px;
}

.dialog-content {
  max-height: 65vh;
  overflow-y: auto;
}

.two-column-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.selection-panel,
.order-panel {
  background: #fafafa;
  border-radius: 6px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.panel-title {
  font-weight: 600;
  font-size: 12px;
  margin-bottom: 6px;
  color: #1976d2;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  font-size: 11px;
  margin-bottom: 6px;
  color: #616161;
  text-transform: uppercase;
}

.columns-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px;
}

.column-item {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
  background: white;
  cursor: pointer;
  transition: all 0.15s ease;
  font-size: 11px;
  user-select: none;
  height: 28px;
  min-width: 0;
}

.column-item:hover {
  border-color: #1976d2;
  background-color: #e3f2fd;
}

.column-item.selected {
  border-color: #1976d2;
  background-color: #bbdefb;
}

.column-item.disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.column-item.required.selected {
  background-color: #c8e6c9;
  border-color: #4caf50;
}

.column-item.custom {
  border-color: #ce93d8;
}

.column-item.custom.selected {
  border-color: #9c27b0;
  background-color: #e1bee7;
}

/* EBOM Custom - Blue theme */
.column-item.custom.ebom {
  border-color: #90caf9;
}

.column-item.custom.ebom.selected {
  border-color: #1976d2;
  background-color: #bbdefb;
}

.column-item.custom.ebom.selected .check-icon {
  background: #1976d2;
  border-color: #1976d2;
  color: white;
}

/* MBOM Custom - Purple theme */
.column-item.custom.mbom {
  border-color: #ce93d8;
}

.column-item.custom.mbom.selected {
  border-color: #9c27b0;
  background-color: #e1bee7;
}

.column-item.custom.mbom.selected .check-icon {
  background: #9c27b0;
  border-color: #9c27b0;
  color: white;
}

.check-icon {
  width: 14px;
  height: 14px;
  min-width: 14px;
  border-radius: 3px;
  border: 1.5px solid #bdbdbd;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
}

.check-icon svg {
  width: 10px;
  height: 10px;
}

.column-item.selected .check-icon {
  background: #1976d2;
  border-color: #1976d2;
  color: white;
}

.column-item.required.selected .check-icon {
  background: #4caf50;
  border-color: #4caf50;
}

.column-item.custom.selected .check-icon {
  background: #9c27b0;
  border-color: #9c27b0;
  color: white;
}

.column-label {
  overflow: hidden;
  white-space: nowrap;
  flex: 1;
  font-size: 11px;
}

.quick-actions {
  display: flex;
  gap: 4px;
  justify-content: center;
}

.empty-custom {
  padding: 8px;
  text-align: center;
  background: white;
  border-radius: 4px;
  border: 1px dashed #e0e0e0;
}

/* Order Panel */
.order-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 6px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 3px;
  font-size: 11px;
  cursor: grab;
  transition: all 0.15s ease;
}

.order-item:hover {
  border-color: #1976d2;
  background: #f5f9ff;
}

.order-item.fixed {
  cursor: default;
  background: #e8f5e9;
  border-color: #4caf50;
}

.order-item.dragging {
  opacity: 0.5;
  border-color: #1976d2;
  background: #e3f2fd;
}

.order-item.drag-over {
  border-color: #1976d2;
  border-style: dashed;
  background: #bbdefb;
}

.order-handle {
  width: 12px;
  height: 12px;
  color: #9e9e9e;
  cursor: grab;
}

.order-handle.disabled {
  cursor: default;
  color: #4caf50;
}

.order-handle svg {
  width: 12px;
  height: 12px;
}

.order-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 11px;
}

.fixed-badge {
  font-size: 8px;
  padding: 1px 4px;
  background: #4caf50;
  color: white;
  border-radius: 2px;
  text-transform: uppercase;
}

.remove-btn {
  width: 14px;
  height: 14px;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  color: #bdbdbd;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
  transition: all 0.15s ease;
}

.remove-btn:hover {
  color: #f44336;
  background: #ffebee;
}

.remove-btn svg {
  width: 12px;
  height: 12px;
}

.empty-order {
  padding: 16px;
  text-align: center;
  background: white;
  border: 1px dashed #e0e0e0;
  border-radius: 4px;
}

/* Drop zone styles */
.order-list.drop-zone-active {
  border: 2px dashed #1976d2;
  background: #e3f2fd;
  border-radius: 6px;
}

.drop-placeholder {
  padding: 12px;
  text-align: center;
  background: #f5f5f5;
  border: 1px dashed #bdbdbd;
  border-radius: 4px;
  font-size: 11px;
  color: #757575;
  transition: all 0.15s ease;
}

.drop-placeholder.active {
  background: #bbdefb;
  border-color: #1976d2;
  color: #1976d2;
}

/* Draggable source items */
.column-item[draggable="true"] {
  cursor: grab;
}

.column-item[draggable="true"]:active {
  cursor: grabbing;
}

.column-item[draggable="false"] {
  cursor: pointer;
}
</style>
