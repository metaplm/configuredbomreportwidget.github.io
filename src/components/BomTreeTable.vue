<template>
  <div class="bom-tree-table">
    <!-- Toolbar -->
    <div class="tree-toolbar">
      <div class="search-box">
        <svg v-if="!isSearching" class="search-icon" viewBox="0 0 24 24"><path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" fill="currentColor"/></svg>
        <v-progress-circular v-else indeterminate size="16" width="2" color="primary" class="search-spinner"></v-progress-circular>
        <input 
          v-model="searchQuery" 
          type="text" 
          :placeholder="searchQuery.length === 1 ? 'At least 2 characters...' : 'Search...'" 
          class="search-input"
          @input="onSearchInput"
        />
        <span v-if="searchQuery.length === 1" class="search-hint">+1</span>
        <button v-if="searchQuery" class="search-clear" @click="clearSearch" title="Clear">
          <svg viewBox="0 0 24 24"><path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" fill="currentColor"/></svg>
        </button>
      </div>
      
      <!-- Active Filters Indicator -->
      <div v-if="activeFilterCount > 0" class="active-filters-indicator">
        <svg class="filter-icon" viewBox="0 0 24 24"><path d="M14,12V19.88C14.04,20.18 13.94,20.5 13.71,20.71C13.32,21.1 12.69,21.1 12.3,20.71L10.29,18.7C10.06,18.47 9.96,18.16 10,17.87V12H9.97L4.21,4.62C3.87,4.19 3.95,3.56 4.38,3.22C4.57,3.08 4.78,3 5,3H19C19.22,3 19.43,3.08 19.62,3.22C20.05,3.56 20.13,4.19 19.79,4.62L14.03,12H14Z" fill="currentColor"/></svg>
        <span class="filter-count">{{ activeFilterCount }} active</span>
        <button class="clear-filters-btn" @click="clearAllFilters" title="Clear all filters">
          <svg viewBox="0 0 24 24"><path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" fill="currentColor"/></svg>
        </button>
      </div>
      
      <div class="toolbar-actions">
        <button class="toolbar-btn expand-btn" @click="expandAll" :data-tooltip="isExpanding ? `${Math.round((expandProgress / expandTotal) * 100)}%` : 'Expand All'" :disabled="isExpandingAny">
          <svg v-if="!isExpanding" viewBox="0 0 24 24"><path d="M10,21V19H6.41L10.91,14.5L9.5,13.09L5,17.59V14H3V21H10M14.5,10.91L19,6.41V10H21V3H14V5H17.59L13.09,9.5L14.5,10.91Z" fill="currentColor"/></svg>
          <div v-else class="expand-progress-wrapper">
            <v-progress-circular 
              indeterminate
              size="20" 
              width="2.5" 
              color="primary"
            ></v-progress-circular>
            <span class="expand-percent">{{ expandTotal > 0 ? Math.round((expandProgress / expandTotal) * 100) : 0 }}</span>
          </div>
        </button>
        <button class="toolbar-btn" @click="collapseAll" data-tooltip="Collapse All" :disabled="isExpandingAny">
          <svg viewBox="0 0 24 24"><path d="M19.5,3.09L15,7.59V4H13V11H20V9H16.41L20.91,4.5L19.5,3.09M4,13V15H7.59L3.09,19.5L4.5,20.91L9,16.41V20H11V13H4Z" fill="currentColor"/></svg>
        </button>
        <div class="toolbar-divider"></div>
        <button class="toolbar-btn expand-btn" @click="expandOneLevel" :data-tooltip="isExpandingOne ? `${Math.round((expandOneProgress / expandOneTotal) * 100)}%` : 'Expand One Level'" :disabled="isExpandingAny">
          <svg v-if="!isExpandingOne" viewBox="0 0 24 24"><path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="currentColor"/></svg>
          <div v-else class="expand-progress-wrapper">
            <v-progress-circular 
              indeterminate
              size="20" 
              width="2.5" 
              color="primary"
            ></v-progress-circular>
            <span class="expand-percent">{{ expandOneTotal > 0 ? Math.round((expandOneProgress / expandOneTotal) * 100) : 0 }}</span>
          </div>
        </button>
        <button class="toolbar-btn" @click="collapseOneLevel" data-tooltip="Collapse One Level" :disabled="isExpandingAny">
          <svg viewBox="0 0 24 24"><path d="M19,13H5V11H19V13Z" fill="currentColor"/></svg>
        </button>
        <button class="toolbar-btn" @click="emit('close')" data-tooltip="Close">
          <svg viewBox="0 0 24 24"><path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" fill="currentColor"/></svg>
        </button>
        <button class="toolbar-btn" @click="emit('refresh')" data-tooltip="Refresh" :disabled="isExpandingAny">
          <svg viewBox="0 0 24 24"><path d="M12,18A6,6 0 0,1 6,12C6,10.21 6.78,8.61 8,7.5V10H10V4H4V6H6.5C4.96,7.61 4,9.78 4,12A8,8 0 0,0 12,20A8,8 0 0,0 19.93,13H17.85A6,6 0 0,1 12,18M20,12A8,8 0 0,0 12,4A8,8 0 0,0 4.07,11H6.15A6,6 0 0,1 12,6A6,6 0 0,1 18,12C18,13.79 17.22,15.39 16,16.5V14H14V20H20V18H17.5C19.04,16.39 20,14.22 20,12Z" fill="currentColor"/></svg>
        </button>
        <div class="toolbar-divider"></div>
        <button class="toolbar-btn" @click="emit('open-columns')" data-tooltip="Columns" :disabled="isExpandingAny">
          <svg viewBox="0 0 24 24"><path d="M3,4H7V8H3V4M9,5V7H21V5H9M3,10H7V14H3V10M9,11V13H21V11H9M3,16H7V20H3V16M9,17V19H21V17H9" fill="currentColor"/></svg>
        </button>
        <div class="toolbar-divider"></div>
        <button class="toolbar-btn" @click="exportToExcel" data-tooltip="Excel" :disabled="isExpandingAny">
          <svg viewBox="0 0 24 24"><path d="M21.17 3.25Q21.5 3.25 21.76 3.5 22 3.74 22 4.08V19.92Q22 20.26 21.76 20.5 21.5 20.75 21.17 20.75H7.83Q7.5 20.75 7.24 20.5 7 20.26 7 19.92V17H2.83Q2.5 17 2.24 16.76 2 16.5 2 16.17V7.83Q2 7.5 2.24 7.24 2.5 7 2.83 7H7V4.08Q7 3.74 7.24 3.5 7.5 3.25 7.83 3.25M7 13.06L8.18 15.28H9.97L8 12.06L9.93 8.89H8.22L7.13 10.9L7.09 10.96L7.06 11.03Q6.8 10.5 6.5 9.96 6.25 9.43 5.97 8.89H4.16L6.05 12.08L4 15.28H5.78M13.88 19.5V17H8.25V19.5M13.88 15.75V12.63H12V15.75M13.88 11.38V8.25H12V11.38M13.88 7V4.5H8.25V7M20.75 19.5V17H15.13V19.5M20.75 15.75V12.63H15.13V15.75M20.75 11.38V8.25H15.13V11.38M20.75 7V4.5H15.13V7Z" fill="currentColor"/></svg>
        </button>
        <button class="toolbar-btn" @click="printTable" data-tooltip="Print" :disabled="isExpandingAny">
          <svg viewBox="0 0 24 24"><path d="M18,3H6V7H18M19,12A1,1 0 0,1 18,11A1,1 0 0,1 19,10A1,1 0 0,1 20,11A1,1 0 0,1 19,12M16,19H8V14H16M19,8H5A3,3 0 0,0 2,11V17H6V21H18V17H22V11A3,3 0 0,0 19,8Z" fill="currentColor"/></svg>
        </button>
      </div>
    </div>

    <!-- Configuration Selection Bar -->
    <div class="config-bar">
      <!-- Model Selection -->
      <div class="config-section">
        <label class="config-label">Model</label>
        <select 
          v-model="selectedModel" 
          class="config-select"
          :disabled="isLoadingModels"
        >
          <option value="">Select Model</option>
          <option v-for="model in models" :key="model.id" :value="model.id">
            {{ model.name }}
          </option>
        </select>
        <v-progress-circular v-if="isLoadingModels" indeterminate size="16" width="2" color="primary" class="config-spinner"></v-progress-circular>
      </div>

      <!-- Version Selection (only show if multiple versions) -->
      <div v-if="showProductSelector" class="config-section">
        <label class="config-label">Version</label>
        <select 
          v-model="selectedProduct" 
          class="config-select"
          :disabled="isLoadingProducts"
        >
          <option value="">Select Version</option>
          <option v-for="product in products" :key="product.id" :value="product.id">
            {{ product.name }}
          </option>
        </select>
        <v-progress-circular v-if="isLoadingProducts" indeterminate size="16" width="2" color="primary" class="config-spinner"></v-progress-circular>
      </div>

      <!-- Configuration Selection -->
      <div class="config-section">
        <label class="config-label">Configuration</label>
        <select 
          v-model="selectedConfiguration" 
          class="config-select"
          :disabled="!activeProductId || isLoadingConfigs"
        >
          <option value="">Select Configuration</option>
          <option v-for="config in productConfigurations" :key="config.id" :value="config.id">
            {{ config.name }}
          </option>
        </select>
        <v-progress-circular v-if="isLoadingConfigs" indeterminate size="16" width="2" color="primary" class="config-spinner"></v-progress-circular>
      </div>

      <button 
        class="config-apply-btn"
        :disabled="!activeProductId || !selectedConfiguration || isApplyingConfig"
        @click="applyConfiguration"
      >
        <v-progress-circular v-if="isApplyingConfig" indeterminate size="16" width="2" color="white"></v-progress-circular>
        <svg v-else viewBox="0 0 24 24"><path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" fill="currentColor"/></svg>
        <span>Apply</span>
      </button>

      <button 
        v-if="selectedModel || selectedConfiguration"
        class="config-clear-btn"
        @click="clearConfiguration"
        title="Clear selection"
      >
        <svg viewBox="0 0 24 24"><path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" fill="currentColor"/></svg>
      </button>
    </div>

    <!-- Scrollable Table Container -->
    <div class="tree-scroll-container">
      <div class="tree-table-inner">
        <!-- Header with Drag & Drop (Sticky) - Drop zone dışında -->
        <div 
          class="tree-header"
          @dragenter.stop
          @dragleave.stop
        >
        <div class="tree-cell tree-name-cell" :style="{ width: columnWidths['_title'] ? columnWidths['_title'] + 'px' : null, flex: columnWidths['_title'] ? 'none' : null }">
          <span class="header-text">Title</span>
          <!-- Title Filter -->
          <button 
            class="filter-btn"
            :class="{ 'active': hasActiveFilter('ds6w:label') }"
            @click.stop="toggleFilterDropdown('ds6w:label', $event)"
          >
            <svg viewBox="0 0 24 24"><path d="M14,12V19.88C14.04,20.18 13.94,20.5 13.71,20.71C13.32,21.1 12.69,21.1 12.3,20.71L10.29,18.7C10.06,18.47 9.96,18.16 10,17.87V12H9.97L4.21,4.62C3.87,4.19 3.95,3.56 4.38,3.22C4.57,3.08 4.78,3 5,3H19C19.22,3 19.43,3.08 19.62,3.22C20.05,3.56 20.13,4.19 19.79,4.62L14.03,12H14Z" fill="currentColor"/></svg>
          </button>
          <div 
            class="resize-handle"
            @mousedown.prevent.stop="startResize('_title', $event)"
          ></div>
        </div>
        <div 
          v-for="(col, index) in displayColumns" 
          :key="`header-${col.key}`" 
          class="tree-cell dynamic-cell header-label"
          :class="{ 'dragging': headerDragIndex === index, 'drag-over': headerDragOverIndex === index, 'has-filter': hasActiveFilter(col.key) }"
          :style="{ width: columnWidths[col.key] ? columnWidths[col.key] + 'px' : null, flex: columnWidths[col.key] ? 'none' : null }"
          draggable="true"
          @dragstart="onHeaderDragStart(index, $event)"
          @dragend="onHeaderDragEnd"
          @dragover.prevent.stop="onHeaderDragOver(index)"
          @drop.prevent.stop="onHeaderDrop(index, $event)"
        >
          <span class="header-text" v-html="formatHeaderLabel(col.label)"></span>
          <!-- Column Filter -->
          <button 
            class="filter-btn"
            :class="{ 'active': hasActiveFilter(col.key) }"
            @click.stop="toggleFilterDropdown(col.key, $event)"
          >
            <svg viewBox="0 0 24 24"><path d="M14,12V19.88C14.04,20.18 13.94,20.5 13.71,20.71C13.32,21.1 12.69,21.1 12.3,20.71L10.29,18.7C10.06,18.47 9.96,18.16 10,17.87V12H9.97L4.21,4.62C3.87,4.19 3.95,3.56 4.38,3.22C4.57,3.08 4.78,3 5,3H19C19.22,3 19.43,3.08 19.62,3.22C20.05,3.56 20.13,4.19 19.79,4.62L14.03,12H14Z" fill="currentColor"/></svg>
          </button>
          <div 
            class="resize-handle"
            @mousedown.prevent.stop="startResize(col.key, $event)"
          ></div>
        </div>
      </div>

      <!-- Filter Dropdown -->
      <div 
        v-if="openFilterColumn" 
        class="filter-dropdown"
        :style="filterDropdownStyle"
        @click.stop
      >
        <div class="filter-header">
          <span class="filter-title">Filter: {{ getFilterColumnLabel(openFilterColumn) }}</span>
          <button class="filter-close" @click="closeFilterDropdown">
            <svg viewBox="0 0 24 24"><path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" fill="currentColor"/></svg>
          </button>
        </div>
        <div class="filter-search">
          <input 
            v-model="filterSearchQuery" 
            type="text" 
            placeholder="Search values..."
            class="filter-search-input"
          />
        </div>
        <div class="filter-actions">
          <button class="filter-action-btn" @click="selectAllFilterValues">Select All</button>
          <button class="filter-action-btn" @click="clearFilterValues">Clear</button>
        </div>
        <div class="filter-values-list">
          <label 
            v-for="value in filteredUniqueValues" 
            :key="value" 
            class="filter-value-item"
          >
            <input 
              type="checkbox" 
              :checked="isFilterValueSelected(openFilterColumn, value)"
              @change="toggleFilterValue(openFilterColumn, value)"
            />
            <span class="filter-value-label">{{ value || '(empty)' }}</span>
            <span class="filter-value-count">{{ getValueCount(openFilterColumn, value) }}</span>
          </label>
        </div>
        <div class="filter-footer">
          <button class="filter-apply-btn" @click="applyFilter">Apply</button>
        </div>
      </div>

      <!-- Tree Body -->
      <div class="tree-body">
      <template v-for="(node, index) in visibleNodes" :key="node?._uid || index">
        <div 
          v-if="node && node.resourceid"
          class="tree-row" 
          :class="{ 'expanded': node.expanded, 'has-children': node.children?.length, 'clickable': node.children?.length }"
          draggable="true"
          @dragstart="onRowDragStart(node, $event)"
          @click="node.children?.length && toggleNode(node)"
        >
          <!-- Tree Indent + Expand/Collapse + Title -->
          <div class="tree-cell tree-name-cell" :style="{ width: columnWidths['_title'] ? columnWidths['_title'] + 'px' : null, flex: columnWidths['_title'] ? 'none' : null }">
            <span class="indent-spacer" :style="{ width: getIndent(node.level) + 'px' }"></span>
            <button 
              v-if="node.children?.length" 
              class="expand-btn"
              @click.stop="toggleNode(node)"
            >
              <svg v-if="node.expanded" class="icon-svg" viewBox="0 0 24 24">
                <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
              </svg>
              <svg v-else class="icon-svg" viewBox="0 0 24 24">
                <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
              </svg>
            </button>
            <span v-else class="leaf-spacer"></span>
            <img 
              :src="getNodeIcon(node)" 
              class="type-img" 
              :alt="node.displayType"
            />
            <span class="node-title">{{ node['ds6w:label'] || node['ds6w:identifier'] || '-' }}</span>
          </div>

          <!-- Dynamic Columns (including Qty, SubQty) -->
          <div 
            v-for="col in displayColumns" 
            :key="`${node._uid}-${col.key}`" 
            class="tree-cell dynamic-cell"
            :style="{ width: columnWidths[col.key] ? columnWidths[col.key] + 'px' : null, flex: columnWidths[col.key] ? 'none' : null }"
          >
            <!-- Qty -->
            <span v-if="col.key === '_qty'" :class="{ 'qty-multiple': node.quantity > 1 }">
              {{ node.quantity || 1 }}
            </span>
            <!-- SubQty -->
            <span v-else-if="col.key === '_subqty'" :class="{ 'qty-multiple': node.subQuantity > 1 }">
              {{ node.subQuantity || 1 }}
            </span>
            <!-- Total Qty -->
            <span v-else-if="col.key === '_totalqty'" :class="{ 'qty-multiple': node.totalQuantity > 1 }">
              {{ node.totalQuantity || 1 }}
            </span>
            <!-- Parent Product -->
            <span v-else-if="col.key === '_parentProduct'" class="cell-text">
              {{ node._parentProduct || '-' }}
            </span>
            <!-- Type -->
            <span v-else-if="col.key === 'ds6w:type'" class="chip-wrapper">
              <v-chip size="x-small" :color="getTypeColor(node.displayType)" variant="tonal">
                {{ node.displayType || node['ds6w:type'] || '-' }}
              </v-chip>
            </span>
            <!-- Revision -->
            <span v-else-if="col.key === 'ds6wg:revision'" class="chip-wrapper">
              <v-chip size="x-small" color="purple" variant="tonal">
                {{ node['ds6wg:revision'] || '-' }}
              </v-chip>
            </span>
            <!-- Baykar Revision (özel kural) -->
            <span v-else-if="col.key.includes('baykar_revision')" class="chip-wrapper">
              <v-chip size="x-small" :color="getBaykarRevisionColor(getBaykarRevisionValue(node, col.key))" variant="tonal">
                {{ getBaykarRevisionValue(node, col.key) }}
              </v-chip>
            </span>
            <!-- Status -->
            <span v-else-if="col.key === 'ds6w:status'" class="chip-wrapper">
              <v-chip size="x-small" :color="getStateColor(node['ds6w:status'])" variant="flat">
                {{ formatState(node['ds6w:status']) }}
              </v-chip>
            </span>
            <!-- Boolean (True/False) -->
            <span v-else-if="isBooleanValue(node[col.key])" class="chip-wrapper">
              <v-chip size="x-small" :color="getBooleanColor(node[col.key])" variant="tonal">
                {{ formatBooleanValue(node[col.key]) }}
              </v-chip>
            </span>
            <!-- Other -->
            <span v-else class="cell-text">
              {{ formatCellValue(node[col.key], col.key) }}
            </span>
          </div>
        </div>
      </template>
    </div>

      <!-- Empty State -->
      <div v-if="!visibleNodes.length" class="empty-state">
      <svg class="empty-icon" viewBox="0 0 24 24">
        <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M7,10L12,15L17,10H7Z" fill="#bdbdbd"/>
      </svg>
      <p>No BOM data available</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import config, { getMfgItemConfiguredUrl } from '../config.js';
import Platform3DSpace from '../js/Platform3DSpace.js';

const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
  },
  selectedColumns: {
    type: Array,
    default: () => ['ds6w:label', '_qty', 'ds6wg:revision', 'ds6w:status', 'ds6w:responsible']
  },
  availableColumns: {
    type: Array,
    default: () => []
  },
  columnWidths: {
    type: Object,
    default: () => ({})
  },
  rootPhysicalId: {
    type: String,
    default: ''
  },
  itemType: {
    type: String,
    default: 'VPMReference', // 'VPMReference' | 'CreateAssembly'
    validator: (value) => ['VPMReference', 'CreateAssembly'].includes(value)
  }
});

const emit = defineEmits(['update:selected-columns', 'update:column-widths', 'open-columns', 'close', 'refresh', 'apply-configuration']);

const treeData = ref([]);

// ==================== CONFIGURATION SELECTION STATE ====================
// Step 1: Models
const models = ref([]);
const selectedModel = ref('');
const isLoadingModels = ref(false);

// Step 2: Products (ModelVersions/RootVersions)
const products = ref([]);
const selectedProduct = ref('');
const isLoadingProducts = ref(false);

// Step 3: Configurations
const productConfigurations = ref([]);
const selectedConfiguration = ref('');
const isLoadingConfigs = ref(false);

const isApplyingConfig = ref(false);

// Computed: Show product selector only if multiple products
const showProductSelector = computed(() => products.value.length > 1);

// Computed: Active product ID (auto-select if single, otherwise user selection)
const activeProductId = computed(() => {
  if (products.value.length === 1) {
    return products.value[0].id;
  }
  return selectedProduct.value;
});

// ==================== API FUNCTIONS ====================

// Step 1: Load Models from API
const loadModels = async () => {
  if (!props.rootPhysicalId) {
    console.warn('No rootPhysicalId provided, cannot load models');
    models.value = [];
    return;
  }
  
  isLoadingModels.value = true;
  try {
    // itemType'a göre farklı API endpoint kullan
    let url;
    if (props.itemType === 'CreateAssembly') {
      // MfgItem için: /resources/v1/modeler/dsmfg/dsmfg:MfgItem/{id}/dscfg:Configured
      url = getMfgItemConfiguredUrl(props.rootPhysicalId);
    } else {
      // VPMReference için: /resources/v1/modeler/dseng/dseng:EngItem/{id}/dscfg:Configured
      url = `/resources/v1/modeler/dseng/dseng:EngItem/${props.rootPhysicalId}/dscfg:Configured`;
    }
    
    console.log(`[loadModels] itemType: ${props.itemType}, URL: ${url}`);
    
    const response = await Platform3DSpace.call3DSpace({
      url: url,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      type: 'json'
    });
    
    console.log('Models API Response:', response);
    
    // Parse response - models are in member[0].configurationCtxt.member
    if (response?.member?.[0]?.configurationCtxt?.member) {
      models.value = response.member[0].configurationCtxt.member.map(model => ({
        id: model.id,
        name: model.title || model.name,
        description: model.description,
        state: model.state,
        revision: model.revision,
        relativePath: model.relativePath,
        raw: model
      }));
      console.log('Parsed Models:', models.value);
    } else {
      console.warn('No models found in response');
      models.value = [];
    }
  } catch (err) {
    console.error('Error loading models:', err);
    models.value = [];
  } finally {
    isLoadingModels.value = false;
  }
};

// Step 2: Load Products (RootVersions) from Model
const loadProducts = async (modelId) => {
  if (!modelId) {
    products.value = [];
    return;
  }
  
  isLoadingProducts.value = true;
  try {
    // API: GET /resources/v1/modeler/dspfl/dspfl:Model/{modelId}?$mask=dsmvpfl:ModelRootVersionMask
    const url = `/resources/v1/modeler/dspfl/dspfl:Model/${modelId}?$mask=dsmvpfl:ModelRootVersionMask`;
    
    const response = await Platform3DSpace.call3DSpace({
      url: url,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      type: 'json'
    });
    
    console.log('Products (RootVersions) API Response:', response);
    
    // Parse response - products are in member[0].rootVersion.member
    if (response?.member?.[0]?.rootVersion?.member) {
      products.value = response.member[0].rootVersion.member.map(product => ({
        id: product.id,
        name: product.title || product.name,
        description: product.description,
        state: product.state,
        revision: product.revision,
        relativePath: product.relativePath,
        raw: product
      }));
      console.log('Parsed Products:', products.value);
      
      // If single product, auto-trigger configuration loading
      if (products.value.length === 1) {
        console.log('Single product found, auto-loading configurations...');
        loadProductConfigurations(products.value[0].id);
      }
    } else {
      console.warn('No products found in response');
      products.value = [];
    }
  } catch (err) {
    console.error('Error loading products:', err);
    products.value = [];
  } finally {
    isLoadingProducts.value = false;
  }
};

// Step 3: Load Product Configurations
const loadProductConfigurations = async (productId) => {
  if (!productId) {
    productConfigurations.value = [];
    return;
  }
  
  isLoadingConfigs.value = true;
  try {
    // API: GET /resources/v1/modeler/dspfl/dspfl:ModelVersion/{productId}/dspfl:ProductConfiguration
    const url = `/resources/v1/modeler/dspfl/dspfl:ModelVersion/${productId}/dspfl:ProductConfiguration`;
    
    const response = await Platform3DSpace.call3DSpace({
      url: url,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      type: 'json'
    });
    
    console.log('Product Configurations API Response:', response);
    
    // Parse response - configurations are in member array
    if (response?.member) {
      productConfigurations.value = response.member.map(config => ({
        id: config.id,
        name: config.title || config.name,
        description: config.description,
        state: config.state,
        revision: config.revision,
        completenessStatus: config.completenessStatus,
        compliancyStatus: config.compliancyStatus,
        relativePath: config.relativePath,
        raw: config
      }));
      console.log('Parsed Product Configurations:', productConfigurations.value);
    } else {
      console.warn('No product configurations found in response');
      productConfigurations.value = [];
    }
  } catch (err) {
    console.error('Error loading product configurations:', err);
    productConfigurations.value = [];
  } finally {
    isLoadingConfigs.value = false;
  }
};

// ==================== WATCHERS ====================

// Watch for Model changes → Load Products
watch(selectedModel, (newValue) => {
  // Reset downstream selections
  selectedProduct.value = '';
  selectedConfiguration.value = '';
  products.value = [];
  productConfigurations.value = [];
  
  if (newValue) {
    loadProducts(newValue);
  }
});

// Watch for Product changes → Load Configurations (only when multiple products)
watch(selectedProduct, (newValue) => {
  // Reset configuration selection
  selectedConfiguration.value = '';
  productConfigurations.value = [];
  
  if (newValue) {
    loadProductConfigurations(newValue);
  }
});

// Watch for rootPhysicalId changes → Reload models
watch(() => props.rootPhysicalId, (newValue, oldValue) => {
  if (newValue && newValue !== oldValue) {
    // Reset all selections when root changes (not on initial load)
    selectedModel.value = '';
    selectedProduct.value = '';
    selectedConfiguration.value = '';
    models.value = [];
    products.value = [];
    productConfigurations.value = [];
    loadModels();
  } else if (newValue && !oldValue) {
    // Initial load - just load models without resetting
    loadModels();
  }
}, { immediate: true });

// Watch for itemType changes → Reload models with new API
watch(() => props.itemType, (newValue, oldValue) => {
  if (newValue !== oldValue && props.rootPhysicalId) {
    console.log(`[itemType changed] ${oldValue} → ${newValue}, reloading models...`);
    // Reset all selections when itemType changes
    selectedModel.value = '';
    selectedProduct.value = '';
    selectedConfiguration.value = '';
    models.value = [];
    products.value = [];
    productConfigurations.value = [];
    loadModels();
  }
});

// Watch for data changes → Stop loading spinner after configuration apply
watch(() => props.data, (newValue) => {
  if (newValue && isApplyingConfig.value) {
    isApplyingConfig.value = false;
  }
}, { deep: false });

// ==================== ACTIONS ====================

// Apply Configuration
const applyConfiguration = () => {
  if (!activeProductId.value || !selectedConfiguration.value) return;
  
  isApplyingConfig.value = true;
  
  emit('apply-configuration', {
    modelId: selectedModel.value,
    productId: activeProductId.value,
    configurationId: selectedConfiguration.value,
    model: models.value.find(m => m.id === selectedModel.value),
    product: products.value.find(p => p.id === activeProductId.value),
    configuration: productConfigurations.value.find(c => c.id === selectedConfiguration.value),
    itemType: props.itemType // itemType bilgisini ekle
  });
  
  // Parent will handle the actual expand, we just emit the event
  // isApplyingConfig will be set to false when data is reloaded
};

// Clear Configuration
const clearConfiguration = () => {
  selectedModel.value = '';
  selectedProduct.value = '';
  selectedConfiguration.value = '';
  products.value = [];
  productConfigurations.value = [];
};

const searchQuery = ref('');
const activeSearchQuery = ref(''); // Gerçek arama için kullanılan query
const isSearching = ref(false);
const isExpanding = ref(false);

// ==================== COLUMN FILTERS ====================
const activeFilters = ref({}); // { columnKey: Set(['value1', 'value2']) }
const pendingFilters = ref({}); // Geçici seçimler (Apply'a basana kadar)
const openFilterColumn = ref(null); // Açık olan filtre dropdown'ı
const filterDropdownPosition = ref({ top: 0, left: 0 });
const filterSearchQuery = ref('');

// Filter dropdown pozisyonu
const filterDropdownStyle = computed(() => ({
  top: `${filterDropdownPosition.value.top}px`,
  left: `${filterDropdownPosition.value.left}px`
}));

// Belirli bir kolonda aktif filtre var mı?
const hasActiveFilter = (columnKey) => {
  return activeFilters.value[columnKey]?.size > 0;
};

// Toplam aktif filtre sayısı
const activeFilterCount = computed(() => {
  return Object.values(activeFilters.value).reduce((count, set) => count + (set?.size || 0), 0);
});

// Tüm node'lardan unique değerleri topla (filtre uygulanmadan önce)
const getAllNodes = () => {
  const nodes = [];
  const traverse = (items) => {
    if (!items) return;
    for (const node of items) {
      if (node?.resourceid) {
        nodes.push(node);
        if (node.children?.length) {
          traverse(node.children);
        }
      }
    }
  };
  traverse(treeData.value);
  return nodes;
};

// Belirli bir kolon için unique değerleri al
const getUniqueValuesForColumn = (columnKey) => {
  const allNodes = getAllNodes();
  const values = new Map(); // value -> count
  
  for (const node of allNodes) {
    let value = getNodeValueForColumn(node, columnKey);
    // Boş değerleri "(empty)" olarak göster
    if (value === null || value === undefined || value === '') {
      value = '';
    }
    values.set(value, (values.get(value) || 0) + 1);
  }
  
  // Değerleri sırala
  return Array.from(values.keys()).sort((a, b) => {
    if (a === '') return 1;
    if (b === '') return -1;
    return String(a).localeCompare(String(b));
  });
};

// Node'dan kolon değerini al
const getNodeValueForColumn = (node, columnKey) => {
  if (columnKey === '_qty') return node.quantity || 1;
  if (columnKey === '_subqty') return node.subQuantity || 1;
  if (columnKey === '_totalqty') return node.totalQuantity || 1;
  if (columnKey === '_parentProduct') return node._parentProduct || '-';
  if (columnKey === 'ds6w:label') return node['ds6w:label'] || node['ds6w:identifier'] || '-';
  if (columnKey === 'ds6w:status') return formatState(node['ds6w:status']);
  if (columnKey === 'ds6w:type') return node.displayType || node['ds6w:type'] || '-';
  return node[columnKey] || '-';
};

// Filtrelenmiş unique değerler (arama sorgusu uygulanmış)
const filteredUniqueValues = computed(() => {
  if (!openFilterColumn.value) return [];
  const values = getUniqueValuesForColumn(openFilterColumn.value);
  if (!filterSearchQuery.value) return values;
  const query = filterSearchQuery.value.toLowerCase();
  return values.filter(v => String(v).toLowerCase().includes(query));
});

// Değer sayısını al
const getValueCount = (columnKey, value) => {
  const allNodes = getAllNodes();
  return allNodes.filter(node => {
    const nodeValue = getNodeValueForColumn(node, columnKey);
    return (nodeValue === '' ? '' : nodeValue) === value;
  }).length;
};

// Filtre dropdown'ını aç/kapa
const toggleFilterDropdown = (columnKey, event) => {
  if (openFilterColumn.value === columnKey) {
    closeFilterDropdown();
  } else {
    openFilterDropdown(columnKey, event);
  }
};

// Filtre dropdown'ını aç
const openFilterDropdown = (columnKey, event) => {
  const rect = event.target.getBoundingClientRect();
  const scrollContainer = document.querySelector('.tree-scroll-container');
  const containerRect = scrollContainer?.getBoundingClientRect() || { top: 0, left: 0 };
  
  filterDropdownPosition.value = {
    top: rect.bottom - containerRect.top + (scrollContainer?.scrollTop || 0) + 5,
    left: Math.min(rect.left - containerRect.left, window.innerWidth - 280)
  };
  
  openFilterColumn.value = columnKey;
  filterSearchQuery.value = '';
  
  // Mevcut aktif filtreleri pending'e kopyala
  pendingFilters.value[columnKey] = new Set(activeFilters.value[columnKey] || []);
};

// Filtre dropdown'ını kapat
const closeFilterDropdown = () => {
  openFilterColumn.value = null;
  filterSearchQuery.value = '';
};

// Filtre kolon etiketini al
const getFilterColumnLabel = (columnKey) => {
  if (columnKey === 'ds6w:label') return 'Title';
  const col = props.availableColumns.find(c => c.key === columnKey);
  return col?.label || columnKey.split(':').pop();
};

// Filtre değeri seçili mi?
const isFilterValueSelected = (columnKey, value) => {
  return pendingFilters.value[columnKey]?.has(value) || false;
};

// Filtre değerini toggle et
const toggleFilterValue = (columnKey, value) => {
  if (!pendingFilters.value[columnKey]) {
    pendingFilters.value[columnKey] = new Set();
  }
  
  if (pendingFilters.value[columnKey].has(value)) {
    pendingFilters.value[columnKey].delete(value);
  } else {
    pendingFilters.value[columnKey].add(value);
  }
};

// Tüm filtre değerlerini seç
const selectAllFilterValues = () => {
  if (!openFilterColumn.value) return;
  const values = filteredUniqueValues.value;
  pendingFilters.value[openFilterColumn.value] = new Set(values);
};

// Tüm filtre değerlerini temizle
const clearFilterValues = () => {
  if (!openFilterColumn.value) return;
  pendingFilters.value[openFilterColumn.value] = new Set();
};

// Filtreyi uygula
const applyFilter = () => {
  if (!openFilterColumn.value) return;
  
  const columnKey = openFilterColumn.value;
  const selectedValues = pendingFilters.value[columnKey];
  
  if (selectedValues?.size > 0) {
    activeFilters.value[columnKey] = new Set(selectedValues);
  } else {
    delete activeFilters.value[columnKey];
  }
  
  closeFilterDropdown();
};

// Tüm filtreleri temizle
const clearAllFilters = () => {
  activeFilters.value = {};
  pendingFilters.value = {};
};

// Node filtrelere uyuyor mu?
const nodeMatchesFilters = (node) => {
  for (const [columnKey, allowedValues] of Object.entries(activeFilters.value)) {
    if (!allowedValues || allowedValues.size === 0) continue;
    
    const nodeValue = getNodeValueForColumn(node, columnKey);
    const normalizedValue = nodeValue === '' ? '' : nodeValue;
    
    if (!allowedValues.has(normalizedValue)) {
      return false;
    }
  }
  return true;
};
const expandProgress = ref(0);
const expandTotal = ref(0);

const isExpandingOne = ref(false);
const expandOneProgress = ref(0);
const expandOneTotal = ref(0);

// Herhangi bir expand işlemi devam ediyor mu?
const isExpandingAny = computed(() => isExpanding.value || isExpandingOne.value);

// Header drag state
const headerDragIndex = ref(null);
const headerDragOverIndex = ref(null);

// Column resize state
const resizingColumn = ref(null);
const resizeStartX = ref(0);
const resizeStartWidth = ref(0);

// Column resize functions
const startResize = (columnKey, event) => {
  resizingColumn.value = columnKey;
  resizeStartX.value = event.clientX;
  
  // Mevcut genişliği al
  const currentWidth = props.columnWidths[columnKey];
  if (currentWidth) {
    resizeStartWidth.value = currentWidth;
  } else {
    // Eğer genişlik tanımlı değilse, elementi bul ve mevcut genişliği al
    const header = event.target.closest('.tree-cell');
    resizeStartWidth.value = header ? header.offsetWidth : 100;
  }
  
  document.addEventListener('mousemove', onResize);
  document.addEventListener('mouseup', stopResize);
  document.body.style.cursor = 'col-resize';
  document.body.style.userSelect = 'none';
};

const onResize = (event) => {
  if (!resizingColumn.value) return;
  
  const diff = event.clientX - resizeStartX.value;
  const newWidth = Math.max(60, resizeStartWidth.value + diff); // Minimum 60px
  
  // Yeni genişlikleri emit et
  const newWidths = { ...props.columnWidths, [resizingColumn.value]: newWidth };
  emit('update:column-widths', newWidths);
};

const stopResize = () => {
  resizingColumn.value = null;
  document.removeEventListener('mousemove', onResize);
  document.removeEventListener('mouseup', stopResize);
  document.body.style.cursor = '';
  document.body.style.userSelect = '';
};

// Gösterilecek sütunları hesapla (Title hariç)
const displayColumns = computed(() => {
  return props.selectedColumns
    .filter(key => key !== 'ds6w:label')
    .map(key => {
      const col = props.availableColumns.find(c => c.key === key);
      if (col) return col;
      // Fallback labels for calculated fields
      const fallbackLabels = {
        '_qty': 'Qty',
        '_subqty': 'Sub Qty',
        '_totalqty': 'Total Qty',
        '_parentProduct': 'Parent Product'
      };
      return { key, label: fallbackLabels[key] || key.split(':').pop() };
    });
});

// Row Drag - 3DXContent 2.1 format (X3DSEAR_AP / preview uyumlu)
const onRowDragStart = (node, event) => {
  event.stopPropagation();
  
  const objectId = node.resourceid;
  // itemType'a göre objectType belirle
  let objectType = node['ds6w:type'] || 'VPMReference';
  let displayType = node.displayType || 'Physical Product';
  
  if (props.itemType === 'CreateAssembly') {
    objectType = 'CreateAssembly';
    displayType = node.displayType || 'Create Assembly';
  }
  
  const dragData = {
    protocol: '3DXContent',
    version: '2.1',
    source: 'X3DSEAR_AP',
    widgetId: 'preview-388dc6',
    data: {
      items: [{
        envId: config.tenant,
        serviceId: '3DSpace',
        contextId: '',
        objectId,
        objectType,
        displayName: node['ds6w:label'] || node['ds6w:identifier'] || '',
        i3dx: '',
        displayType
      }]
    }
  };
  
  event.dataTransfer.effectAllowed = 'copyMove';
  event.dataTransfer.setData('text/plain', JSON.stringify(dragData));
};

// Header Drag & Drop
const onHeaderDragStart = (index, event) => {
  event.stopPropagation();
  headerDragIndex.value = index;
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', 'column-reorder');
};

const onHeaderDragEnd = () => {
  headerDragIndex.value = null;
  headerDragOverIndex.value = null;
};

const onHeaderDragOver = (index) => {
  if (headerDragIndex.value !== null && headerDragIndex.value !== index) {
    headerDragOverIndex.value = index;
  }
};

const onHeaderDrop = (targetIndex, event) => {
  event.stopPropagation();
  event.preventDefault();
  
  if (headerDragIndex.value === null || headerDragIndex.value === targetIndex) return;
  
  // ds6w:label hariç sütunları al (displayColumns sırası)
  const columns = props.selectedColumns.filter(k => k !== 'ds6w:label');
  
  // Sürüklenen elemanı çıkar ve yeni yerine ekle
  const [draggedItem] = columns.splice(headerDragIndex.value, 1);
  columns.splice(targetIndex, 0, draggedItem);
  
  // ds6w:label'ı başa ekleyerek güncelle
  const newColumns = ['ds6w:label', ...columns];
  emit('update:selected-columns', newColumns);
  
  headerDragIndex.value = null;
  headerDragOverIndex.value = null;
};

// Response'u tree yapısına dönüştür (Yeni progressiveexpand v2 API formatı)
const buildTree = (response) => {
  if (!response?.results) return [];

  const results = response.results;
  const responseItemType = response.itemType || props.itemType || 'VPMReference';
  
  // resourceid'ye göre tüm node'ları map'e ekle (Part/Product belirlemek için 3DShape de lazım)
  const allNodeMap = {};
  
  // itemType'a göre analiz edilecek tipler
  let analysisTypes;
  let instanceTypes;
  
  if (responseItemType === 'CreateAssembly') {
    // MfgItem için: CreateAssembly, ElementaryEndItem, Provide vb. ana tipler
    analysisTypes = ['CreateAssembly', 'ElementaryEndItem', 'Provide', 'CreateKit', 'CreateMaterial', 'ProcessContinuousProvide', 'dsmfg:MfgItem'];
    instanceTypes = ['DELFmiFunctionIdentifiedInstance', 'ProcessInstanceContinuous', 'dsmfg:ProcessInstanceContinuous'];
  } else {
    // VPMReference için: VPMReference ve 3DShape
    analysisTypes = ['VPMReference', '3DShape'];
    instanceTypes = ['VPMInstance', 'VPMRepInstance'];
  }
  
  results.forEach(item => {
    const type = item['ds6w:type'];
    if (item && item.resourceid && type && analysisTypes.includes(type)) {
      allNodeMap[item.resourceid] = {
        ...item,
        children: [],
        expanded: false,
        level: 0,
        quantity: 1
      };
    }
  });

  // Instance'lardan from/to ilişkisini al
  const instanceMap = {};
  results.forEach(item => {
    const type = item['ds6w:type'];
    if (item && item.resourceid && type && instanceTypes.includes(type) && item.from && item.to) {
      instanceMap[item.resourceid] = {
        from: item.from,
        to: item.to
      };
    }
  });

  // Path'lerden parent-child ilişkisi ve quantity hesapla
  const paths = results.filter(item => item.Path);
  
  // Parent -> Child -> Set(InstanceIds) - unique instance'ları say
  const parentChildInstances = new Map();
  // Parent -> Child tiplerini takip et (Part/Product belirlemek için)
  const parentChildTypes = new Map();
  
  paths.forEach(pathObj => {
    const path = pathObj.Path;
    // Path: [refId, instanceId, refId, instanceId, refId, ...]
    // Çift indeksler (0,2,4...) VPMReference/3DShape, tek indeksler (1,3,5...) Instance
    for (let i = 0; i < path.length - 2; i += 2) {
      const parentId = path[i];
      const instanceId = path[i + 1];
      const childId = path[i + 2];
      
      const parentNode = allNodeMap[parentId];
      const childNode = allNodeMap[childId];
      
      if (parentNode && childNode) {
        const childType = childNode['ds6w:type'];
        // Parent-child instance ilişkisi
        if (!parentChildInstances.has(parentId)) {
          parentChildInstances.set(parentId, new Map());
        }
        const childMap = parentChildInstances.get(parentId);
        if (!childMap.has(childId)) {
          childMap.set(childId, new Set());
        }
        childMap.get(childId).add(instanceId);
        
        // Parent'ın çocuk tiplerini kaydet
        if (!parentChildTypes.has(parentId)) {
          parentChildTypes.set(parentId, new Set());
        }
        if (childType) {
          parentChildTypes.get(parentId).add(childType);
        }
      }
    }
  });
  
  // Her node için displayType belirle
  // VPMReference için: Part/Product
  // MfgItem için: tip bazlı (CreateAssembly, ElementaryEndItem, Provide, vb.)
  Object.values(allNodeMap).forEach(node => {
    const nodeType = node['ds6w:type'];
    
    if (responseItemType === 'CreateAssembly') {
      // MfgItem için displayType belirleme - orijinal tipe göre
      switch (nodeType) {
        case 'CreateAssembly':
          node.displayType = 'Assembly';
          break;
        case 'ElementaryEndItem':
          node.displayType = 'Manufactured Part';
          break;
        case 'Provide':
          node.displayType = 'Provide';
          break;
        case 'CreateKit':
          node.displayType = 'Kit';
          break;
        case 'CreateMaterial':
          node.displayType = 'Material';
          break;
        case 'ProcessContinuousProvide':
          node.displayType = 'Continuous Provide';
          break;
        default:
          node.displayType = nodeType || 'MfgItem';
      }
    } else if (nodeType === 'VPMReference') {
      // VPMReference için Part/Product belirleme
      const childTypes = parentChildTypes.get(node.resourceid);
      
      if (childTypes && childTypes.has('VPMReference')) {
        // Altında başka VPMReference varsa kesinlikle Product
        node.displayType = 'Product';
      } else if (childTypes && childTypes.has('3DShape')) {
        // Altında sadece 3DShape varsa Part
        node.displayType = 'Part';
      } else {
        // Çocuğu yoksa veya başka tip çocukları varsa icon'dan belirle
        // Icon URL'inde "3DPart" varsa Part, yoksa Product (boş montaj)
        const iconUrl = node.icon || '';
        if (iconUrl.includes('3DPart')) {
          node.displayType = 'Part';
        } else {
          // Boş montaj veya henüz içeriği olmayan Product
          node.displayType = 'Product';
        }
      }
    }
  });
  
  // Ana tipleri içeren nodeMap oluştur (VPMReference veya MfgItem tipleri)
  const nodeMap = {};
  const mainTypes = responseItemType === 'CreateAssembly' 
    ? ['CreateAssembly', 'ElementaryEndItem', 'Provide', 'CreateKit', 'CreateMaterial', 'ProcessContinuousProvide', 'dsmfg:MfgItem']
    : ['VPMReference'];
    
  Object.entries(allNodeMap).forEach(([id, node]) => {
    if (node && mainTypes.includes(node['ds6w:type'])) {
      nodeMap[id] = node;
    }
  });
  
  // Instance set'lerini count'a çevir (parent -> child -> quantity)
  const parentChildCounts = new Map();
  parentChildInstances.forEach((childMap, parentId) => {
    // Sadece VPMReference parent'ları için
    if (!nodeMap[parentId]) return;
    const countMap = new Map();
    childMap.forEach((instanceSet, childId) => {
      // Sadece VPMReference children için
      if (nodeMap[childId]) {
        countMap.set(childId, instanceSet.size);
      }
    });
    if (countMap.size > 0) {
      parentChildCounts.set(parentId, countMap);
    }
  });

  // Root node'ları bul: Tüm path'lerde child olarak görünen VPMReference'ları topla
  // (parent tipi ne olursa olsun - ElectricalGeometry vb. olabilir)
  const childSet = new Set();
  paths.forEach(pathObj => {
    const path = pathObj.Path;
    // Path'teki her child pozisyonunu kontrol et (index 2, 4, 6, ...)
    for (let i = 2; i < path.length; i += 2) {
      const childId = path[i];
      // Sadece VPMReference olan child'ları childSet'e ekle
      if (nodeMap[childId]) {
        childSet.add(childId);
      }
    }
  });

  console.log('[TreeBuild] parentChildInstances size:', parentChildInstances.size);
  console.log('[TreeBuild] parentChildCounts size:', parentChildCounts.size);
  console.log('[TreeBuild] childSet size:', childSet.size);
  console.log('[TreeBuild] nodeMap size:', Object.keys(nodeMap).length);
  console.log('[TreeBuild] paths count:', paths.length);

  const roots = Object.values(nodeMap).filter(node => !childSet.has(node.resourceid));
  console.log('[TreeBuild] roots count:', roots.length);
  
  // Recursive olarak children'ları düzelt ve level'ları ayarla
  let nodeCounter = 0;
  const processNode = (node, level, parentChildCounts, nodeMap, parentPath = '', visited = new Set(), parentSubQty = 1, parentNode = null) => {
    node.level = level;
    node._uid = `${parentPath}_${node.resourceid}_${nodeCounter++}`; // Unique identifier
    
    // SubQty hesapla: kendi Qty * parent'ın SubQty değeri
    node.subQuantity = (node.quantity || 1) * parentSubQty;
    
    // Parent Product bilgisini ekle (parent'ın Part Number'ı)
    node._parentProduct = parentNode 
      ? (parentNode['ds6wg:EnterpriseExtension.V_PartNumber'] || parentNode['ds6w:identifier'] || '-') 
      : '-';
    
    // Circular reference kontrolü
    if (visited.has(node.resourceid)) {
      node.children = [];
      return;
    }
    visited.add(node.resourceid);
    
    // Bu node'un kendi children'larını parentChildCounts'tan al
    if (parentChildCounts.has(node.resourceid)) {
      const childCounts = parentChildCounts.get(node.resourceid);
      node.children = Array.from(childCounts.entries())
        .map(([childId, count]) => {
          const originalChild = nodeMap[childId];
          if (originalChild) {
            const childCopy = {
              ...originalChild,
              quantity: count,
              children: [],
              expanded: false,
              level: level + 1
            };
            // Recursive olarak children'ları işle (parentSubQty olarak bu node'un subQuantity'sini geç, parentNode olarak mevcut node'u geç)
            processNode(childCopy, level + 1, parentChildCounts, nodeMap, node._uid, new Set(visited), node.subQuantity, node);
            return childCopy;
          }
          return null;
        })
        .filter(Boolean);
    }
  };
  
  roots.forEach((root, idx) => {
    root.quantity = 1;
    root._uid = `root_${root.resourceid}_${idx}`;
    root._parentProduct = '-'; // Root'un parent'ı yok
    processNode(root, 0, parentChildCounts, nodeMap, `root_${idx}`, new Set(), 1, null);
  });

  // Total Qty hesapla: Aynı resourceid'ye sahip tüm node'ların SubQty toplamı
  const resourceTotals = new Map();
  
  // Tüm node'ları topla ve resourceid bazında SubQty'leri topla
  const collectNodes = (nodes, allNodes = []) => {
    for (const node of nodes) {
      if (!node) continue;
      allNodes.push(node);
      const id = node.resourceid;
      const currentTotal = resourceTotals.get(id) || 0;
      resourceTotals.set(id, currentTotal + (node.subQuantity || 1));
      if (node.children?.length) {
        collectNodes(node.children, allNodes);
      }
    }
    return allNodes;
  };
  
  const allNodes = collectNodes(roots);
  
  // Her node'a totalQuantity değerini ata
  allNodes.forEach(node => {
    node.totalQuantity = resourceTotals.get(node.resourceid) || node.subQuantity || 1;
  });

  return roots.filter(Boolean);
};

// Node'un arama kriterine uyup uymadığını kontrol et
const nodeMatchesSearch = (node, query) => {
  if (!query) return true;
  const lowerQuery = query.toLowerCase();
  
  // Tüm seçili sütunlarda ara
  for (const key of props.selectedColumns) {
    let value = '';
    if (key === '_qty') {
      value = String(node.quantity || 1);
    } else if (key === '_subqty') {
      value = String(node.subQuantity || 1);
    } else if (key === '_totalqty') {
      value = String(node.totalQuantity || 1);
    } else if (key === '_parentProduct') {
      value = String(node._parentProduct || '-');
    } else {
      value = String(node[key] || '');
    }
    if (value.toLowerCase().includes(lowerQuery)) {
      return true;
    }
  }
  
  // displayType'da da ara
  if (node.displayType?.toLowerCase().includes(lowerQuery)) {
    return true;
  }
  
  return false;
};

// Arama sonuçlarına göre parent'ları otomatik aç
const expandParentsForSearch = (nodes, query, parentPath = []) => {
  if (!nodes || !query) return false;
  
  let hasMatchingChild = false;
  
  for (const node of nodes) {
    const selfMatches = nodeMatchesSearch(node, query);
    const childMatches = node.children?.length 
      ? expandParentsForSearch(node.children, query, [...parentPath, node])
      : false;
    
    if (selfMatches || childMatches) {
      hasMatchingChild = true;
      // Parent'ları aç
      if (childMatches && node.children?.length) {
        node.expanded = true;
      }
    }
  }
  
  return hasMatchingChild;
};

// Arama için debounce timeout
let searchTimeout = null;

// Arama input handler
const onSearchInput = () => {
  // Önceki timeout'u temizle
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  
  const query = searchQuery.value?.trim() || '';
  
  // 2 karakterden az ise aramayı temizle
  if (query.length < 2) {
    activeSearchQuery.value = '';
    isSearching.value = false;
    return;
  }
  
  // Loading başlat
  isSearching.value = true;
  
  // Debounce ile arama yap (300ms)
  searchTimeout = setTimeout(async () => {
    // Parent node'ları genişlet
    expandParentsForSearch(treeData.value, query);
    
    // Kısa bir bekleme (UI güncellemesi için)
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Aktif aramayı güncelle
    activeSearchQuery.value = query;
    
    // Loading'i kapat
    isSearching.value = false;
  }, 300);
};

const clearSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  searchQuery.value = '';
  activeSearchQuery.value = '';
  isSearching.value = false;
};

// Visible nodes (expanded state, arama filtresi ve kolon filtrelerine göre)
const visibleNodes = computed(() => {
  const result = [];
  const query = activeSearchQuery.value?.trim();
  const hasFilters = Object.keys(activeFilters.value).length > 0;
  
  const traverse = (nodes, parentMatches = false, parentPassesFilter = true) => {
    if (!nodes || !Array.isArray(nodes)) return;
    
    nodes.forEach(node => {
      if (!node || !node.resourceid) return;
      
      // Arama eşleşmesi
      const selfMatchesSearch = nodeMatchesSearch(node, query);
      const childrenMatchSearch = node.children?.some(child => 
        nodeMatchesSearch(child, query) || hasMatchingDescendant(child, query)
      );
      
      // Filtre eşleşmesi
      const selfPassesFilter = !hasFilters || nodeMatchesFilters(node);
      const childPassesFilter = !hasFilters || node.children?.some(child => 
        nodeMatchesFilters(child) || hasFilterMatchingDescendant(child)
      );
      
      // Arama için: kendisi eşleşiyor, veya child'ı eşleşiyor, veya parent eşleşiyor
      const searchOk = !query || selfMatchesSearch || childrenMatchSearch || parentMatches;
      
      // Filtre için: kendisi geçiyor, veya child'ı geçiyor
      const filterOk = !hasFilters || selfPassesFilter || childPassesFilter;
      
      if (searchOk && filterOk) {
        result.push(node);
        
        if (node.expanded && node.children?.length) {
          traverse(node.children, selfMatchesSearch || parentMatches, selfPassesFilter);
        }
      }
    });
  };
  
  traverse(treeData.value);
  return result;
});

// Alt node'larda filtre eşleşmesi var mı kontrol et
const hasFilterMatchingDescendant = (node) => {
  if (!node.children?.length) return false;
  
  for (const child of node.children) {
    if (nodeMatchesFilters(child)) return true;
    if (hasFilterMatchingDescendant(child)) return true;
  }
  return false;
};

// Alt node'larda eşleşme var mı kontrol et
const hasMatchingDescendant = (node, query) => {
  if (!node.children?.length || !query) return false;
  
  for (const child of node.children) {
    if (nodeMatchesSearch(child, query)) return true;
    if (hasMatchingDescendant(child, query)) return true;
  }
  return false;
};

// Indent hesapla (maksimum limit ile)
const getIndent = (level) => {
  if (level === undefined || level === null) return 0;
  const indentPerLevel = 20; // Her seviye için 20px
  const maxIndent = 200; // Maksimum indent (10 seviye sonrası sabit)
  return Math.min(level * indentPerLevel, maxIndent);
};

// Toggle node expansion - _uid ile orijinal node'u bul ve toggle et
const toggleNode = (nodeToToggle) => {
  const findAndToggle = (nodes) => {
    if (!nodes) return false;
    for (const node of nodes) {
      if (node._uid === nodeToToggle._uid) {
        node.expanded = !node.expanded;
        return true;
      }
      if (node.children?.length && findAndToggle(node.children)) {
        return true;
      }
    }
    return false;
  };
  findAndToggle(treeData.value);
};

// Expand All - tüm node'ları aç
// Async expand all - chunk'lar halinde işle
const expandAll = async () => {
  if (isExpanding.value) return;
  
  isExpanding.value = true;
  expandProgress.value = 0;
  
  // Tüm expandable node'ları topla
  const expandableNodes = [];
  const collectExpandable = (nodes) => {
    if (!nodes) return;
    for (const node of nodes) {
      if (node.children?.length && !node.expanded) {
        expandableNodes.push(node);
      }
      if (node.children?.length) {
        collectExpandable(node.children);
      }
    }
  };
  collectExpandable(treeData.value);
  
  expandTotal.value = expandableNodes.length;
  
  // Chunk'lar halinde expand et (her 100 node'da bir yield)
  const chunkSize = 100;
  for (let i = 0; i < expandableNodes.length; i += chunkSize) {
    const chunk = expandableNodes.slice(i, i + chunkSize);
    for (const node of chunk) {
      node.expanded = true;
    }
    
    // Progress güncelle
    expandProgress.value = Math.min(i + chunkSize, expandableNodes.length);
    
    // UI thread'ini serbest bırak
    if (i + chunkSize < expandableNodes.length) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
  
  // Tamamlandı
  expandProgress.value = expandTotal.value;
  await new Promise(resolve => setTimeout(resolve, 200)); // Kısa bir bekleme
  
  isExpanding.value = false;
  expandProgress.value = 0;
  expandTotal.value = 0;
};

// Collapse All - tüm node'ları kapat
const collapseAll = () => {
  const collapse = (nodes) => {
    if (!nodes) return;
    for (const node of nodes) {
      node.expanded = false;
      if (node.children?.length) {
        collapse(node.children);
      }
    }
  };
  collapse(treeData.value);
};

// Expand One Level - şu an görünen node'ların çocuklarını aç (async)
const expandOneLevel = async () => {
  if (isExpandingOne.value) return;
  
  isExpandingOne.value = true;
  expandOneProgress.value = 0;
  
  // Açılması gereken node'ları topla (kapalı olan ve çocukları olan, görünür olanlar)
  const nodesToExpand = [];
  const collectNodesToExpand = (nodes) => {
    if (!nodes) return;
    for (const node of nodes) {
      if (node.children?.length) {
        if (node.expanded) {
          // Bu node zaten açık, çocuklarına bak
          collectNodesToExpand(node.children);
        } else {
          // Bu node kapalı ve çocukları var, listeye ekle
          nodesToExpand.push(node);
        }
      }
    }
  };
  collectNodesToExpand(treeData.value);
  
  expandOneTotal.value = nodesToExpand.length;
  
  // Eğer açılacak node yoksa hemen çık
  if (nodesToExpand.length === 0) {
    isExpandingOne.value = false;
    return;
  }
  
  // Chunk'lar halinde aç
  const chunkSize = 50;
  for (let i = 0; i < nodesToExpand.length; i += chunkSize) {
    const chunk = nodesToExpand.slice(i, i + chunkSize);
    chunk.forEach(node => {
      node.expanded = true;
    });
    
    // Progress güncelle
    expandOneProgress.value = Math.min(i + chunkSize, nodesToExpand.length);
    
    // UI thread'ini serbest bırak
    if (i + chunkSize < nodesToExpand.length) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
  
  // Tamamlandı
  expandOneProgress.value = expandOneTotal.value;
  await new Promise(resolve => setTimeout(resolve, 200));
  
  isExpandingOne.value = false;
  expandOneProgress.value = 0;
  expandOneTotal.value = 0;
};

// Collapse One Level - en derin açık seviyeyi kapat
const collapseOneLevel = () => {
  // Önce maksimum açık derinliği bul
  let maxExpandedLevel = -1;
  const findMaxLevel = (nodes, level = 0) => {
    if (!nodes) return;
    for (const node of nodes) {
      if (node.expanded && node.children?.length) {
        // Bu node'un çocukları arasında açık olan var mı?
        const hasExpandedChild = node.children.some(c => c.expanded && c.children?.length);
        if (!hasExpandedChild) {
          // Bu node en derin açık seviye
          maxExpandedLevel = Math.max(maxExpandedLevel, level);
        } else {
          findMaxLevel(node.children, level + 1);
        }
      }
    }
  };
  findMaxLevel(treeData.value);
  
  if (maxExpandedLevel < 0) return;
  
  // O seviyedeki tüm node'ları kapat
  const collapseAtLevel = (nodes, level = 0) => {
    if (!nodes) return;
    for (const node of nodes) {
      if (node.expanded && node.children?.length) {
        if (level === maxExpandedLevel) {
          node.expanded = false;
        } else {
          collapseAtLevel(node.children, level + 1);
        }
      }
    }
  };
  collapseAtLevel(treeData.value);
};

// Image path helper
const getImagePath = (filename) => {
  // eslint-disable-next-line no-undef
  const basePath = typeof __webpack_public_path__ !== 'undefined' ? __webpack_public_path__ : '/configuredbomwidget/';
  return `${basePath}static/images/${filename}`;
};

// Node icon'u al - API'den gelen veya local icon
const getNodeIcon = (node) => {
  // Eğer API'den icon geldiyse onu kullan (VPMReference için)
  if (node.icon) {
    return node.icon;
  }
  
  // MfgItem tipleri için local icon
  const nodeType = node['ds6w:type'] || node.displayType;
  
  switch (nodeType) {
    case 'CreateAssembly':
    case 'Assembly':
      return getImagePath('CreateAssembly.png');
    case 'ElementaryEndItem':
    case 'Manufactured Part':
      return getImagePath('ElementaryEndItem.png');
    case 'Provide':
      return getImagePath('Provide.png');
    case 'CreateMaterial':
    case 'Material':
      return getImagePath('CreateMaterial.png');
    case 'ProcessContinuousProvide':
    case 'Continuous Provide':
    case 'ProcessInstanceContinuous':
    case 'Continuous':
      return getImagePath('Continuous.png');
    // VPMReference fallback
    case 'VPMReference':
    case 'Product':
      return getImagePath('VPMReference.png');
    case 'Part':
      return getImagePath('Part.png');
    default:
      // Varsayılan icon
      return getImagePath('VPMReference.png');
  }
};

// Type'a göre renk
const getTypeColor = (displayType) => {
  switch (displayType) {
    // VPMReference tipleri
    case 'Part':
      return '#4caf50'; // Yeşil
    case 'Product':
      return '#1976d2'; // Mavi
    // MfgItem tipleri
    case 'Assembly':
      return '#9c27b0'; // Mor
    case 'Manufactured Part':
      return '#4caf50'; // Yeşil
    case 'Provide':
      return '#ff9800'; // Turuncu
    case 'Kit':
      return '#00bcd4'; // Cyan
    case 'Material':
      return '#795548'; // Kahverengi
    case 'Continuous Provide':
      return '#e91e63'; // Pembe
    default:
      return '#1976d2';
  }
};

// State'e göre renk
const getStateColor = (state) => {
  if (!state) return 'grey';
  // Status genellikle VPLM_SMB_Definition_MajorRev.IN_WORK formatında geliyor
  const statePart = state?.split('.')?.pop() || state;
  switch (statePart) {
    case 'IN_WORK': return 'warning';
    case 'RELEASED': return 'success';
    case 'FROZEN': return 'info';
    default: return 'grey';
  }
};

// Baykar Revision değerini al - boşsa ds6wg:revision kullan
const getBaykarRevisionValue = (node, colKey) => {
  const baykarRevision = node[colKey];
  // Eğer baykar_revision boş veya "-" ise, ds6wg:revision değerini kullan
  if (!baykarRevision || baykarRevision === '-' || baykarRevision.trim() === '') {
    return node['ds6wg:revision'] || '-';
  }
  return baykarRevision;
};

// Baykar Revision rengini belirle - "." içeriyorsa turuncu, içermiyorsa yeşil
const getBaykarRevisionColor = (value) => {
  if (!value || value === '-') return 'grey';
  return value.includes('.') ? 'orange' : 'success';
};

// State formatla
const formatState = (state) => {
  if (!state) return '-';
  // Status genellikle VPLM_SMB_Definition_MajorRev.IN_WORK formatında geliyor
  const statePart = state?.split('.')?.pop() || state;
  switch (statePart) {
    case 'IN_WORK': return 'In Work';
    case 'RELEASED': return 'Released';
    case 'FROZEN': return 'Frozen';
    default: return statePart || '-';
  }
};

// Boolean değer kontrolü
const isBooleanValue = (value) => {
  if (value === undefined || value === null) return false;
  const strValue = String(value).toLowerCase().trim();
  return strValue === 'true' || strValue === 'false';
};

// Boolean değer rengi
const getBooleanColor = (value) => {
  const strValue = String(value).toLowerCase().trim();
  return strValue === 'true' ? 'success' : 'error';
};

// Boolean değer formatı
const formatBooleanValue = (value) => {
  const strValue = String(value).toLowerCase().trim();
  return strValue === 'true' ? 'True' : 'False';
};

// Hücre değerini formatla
const formatCellValue = (value, key) => {
  if (value === undefined || value === null) return '-';
  
  // Tarih alanları
  if (key === 'ds6w:created' || key === 'ds6w:modified') {
    try {
      const date = new Date(value);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return value;
    }
  }
  
  return value;
};

// Header label formatla - 10 karakteri geçince alt satıra geç
const formatHeaderLabel = (label) => {
  if (!label) return '-';
  if (label.length <= 10) return label;
  
  const words = label.split(' ');
  if (words.length <= 1) return label;
  
  // 10 karaktere kadar ilk satırda, geri kalanı alt satırda
  let firstLine = '';
  let secondLine = '';
  
  for (let i = 0; i < words.length; i++) {
    const testLine = firstLine ? `${firstLine} ${words[i]}` : words[i];
    if (testLine.length <= 10 || !firstLine) {
      firstLine = testLine;
    } else {
      secondLine = words.slice(i).join(' ');
      break;
    }
  }
  
  return secondLine ? `${firstLine}<br>${secondLine}` : firstLine;
};

// Data değiştiğinde tree'yi yeniden oluştur
watch(() => props.data, (newData) => {
  if (newData?.results) {
    treeData.value = buildTree(newData);
    // İlk root'u otomatik aç
    if (treeData.value.length > 0) {
      treeData.value[0].expanded = true;
    }
  }
  // Reset applying state when data changes
  isApplyingConfig.value = false;
}, { immediate: true });

// ==================== EXPORT FUNCTIONS ====================

// Flatten tree data for export (sadece ekranda görünen satırlar)
const getFlatDataForExport = () => {
  const flatData = [];
  
  // visibleNodes'u kullan - sadece ekranda görünen satırlar
  for (const node of visibleNodes.value) {
    if (!node || !node.resourceid) continue;
    
    const row = {
      level: node.level || 0,
      title: node['ds6w:label'] || node['ds6w:identifier'] || '-',
    };
    
    // Dinamik sütunları ekle
    for (const col of displayColumns.value) {
      if (col.key === '_qty') {
        row[col.label] = node.quantity || 1;
      } else if (col.key === '_subqty') {
        row[col.label] = node.subQuantity || 1;
      } else if (col.key === '_totalqty') {
        row[col.label] = node.totalQuantity || 1;
      } else if (col.key === '_parentProduct') {
        row[col.label] = node._parentProduct || '-';
      } else if (col.key.includes('baykar_revision')) {
        row[col.label] = getBaykarRevisionValue(node, col.key);
      } else if (col.key === 'ds6w:status') {
        // Status için formatState kullan
        row[col.label] = formatState(node[col.key]);
      } else if (col.key === 'ds6w:type') {
        // Type için displayType kullan
        row[col.label] = node.displayType || node[col.key] || '-';
      } else if (isBooleanValue(node[col.key])) {
        // Boolean değerler için formatBooleanValue kullan
        row[col.label] = formatBooleanValue(node[col.key]);
      } else {
        row[col.label] = node[col.key] || '-';
      }
    }
    
    flatData.push(row);
  }
  
  return flatData;
};

// Excel Export
const exportToExcel = () => {
  const data = getFlatDataForExport();
  
  // Header'ları oluştur
  const headers = ['Level', 'Title', ...displayColumns.value.map(c => c.label)];
  
  // Satırları oluştur
  const rows = data.map(row => {
    const rowData = [row.level, row.title];
    for (const col of displayColumns.value) {
      rowData.push(row[col.label]);
    }
    return rowData;
  });
  
  // Worksheet oluştur
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  
  // Sütun genişlikleri
  ws['!cols'] = headers.map((h, i) => ({ wch: i === 0 ? 8 : i === 1 ? 40 : 15 }));
  
  // Workbook oluştur
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'BOM');
  
  // Dosya adı: ROOT_PRODUCT-BAYKAR_REVISION-TARIH.xlsx
  const rootNode = treeData.value?.[0];
  const rootName = rootNode?.['ds6w:label'] || 'BOM';
  const baykarRevKey = 'ds6wg:XP_VPMReference_Ext.baykar_revision';
  const baykarRev = getBaykarRevisionValue(rootNode || {}, baykarRevKey);
  const dateStr = new Date().toLocaleDateString('en-US').replace(/\//g, '-');
  
  // Dosya adından geçersiz karakterleri temizle
  const sanitize = (str) => str.replace(/[<>:"/\\|?*]/g, '_');
  const fileName = `${sanitize(rootName)}-${sanitize(baykarRev)}-${dateStr}.xlsx`;
  
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }), fileName);
};

// Print
const printTable = () => {
  const data = getFlatDataForExport();
  
  // Print için HTML oluştur
  const headers = ['#', 'Title', ...displayColumns.value.map(c => c.label)];
  
  let tableHtml = `
    <html>
    <head>
      <title>BOM Report</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { color: #111f5a; margin-bottom: 5px; }
        .date { color: #666; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; }
        th { background: #111f5a; color: white; padding: 8px 6px; text-align: left; }
        td { padding: 6px; border-bottom: 1px solid #ddd; }
        tr:nth-child(even) { background: #f9f9f9; }
        .indent { color: #888; }
        @media print {
          body { padding: 0; }
          button { display: none; }
        }
      </style>
    </head>
    <body>
      <h1>BOM Report</h1>
      <p class="date">Date: ${new Date().toLocaleDateString('en-US')}</p>
      <table>
        <thead>
          <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
        </thead>
        <tbody>
  `;
  
  data.forEach((row, idx) => {
    const indent = '&nbsp;&nbsp;'.repeat(row.level * 2);
    tableHtml += '<tr>';
    tableHtml += `<td>${idx + 1}</td>`;
    tableHtml += `<td><span class="indent">${indent}</span>${row.title}</td>`;
    for (const col of displayColumns.value) {
      tableHtml += `<td>${row[col.label]}</td>`;
    }
    tableHtml += '</tr>';
  });
  
  tableHtml += `
        </tbody>
      </table>
      <script>window.onload = function() { window.print(); }<\/script>
    </body>
    </html>
  `;
  
  // Yeni pencerede aç ve yazdır
  const printWindow = window.open('', '_blank');
  printWindow.document.write(tableHtml);
  printWindow.document.close();
};
</script>

<style scoped>
.bom-tree-table {
  border: none;
  overflow: hidden;
  font-size: 13px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.tree-scroll-container {
  flex: 1;
  overflow: auto;
  min-height: 0;
}

.tree-table-inner {
  display: inline-block;
  min-width: 100%;
}

.tree-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
}

/* Configuration Bar */
.config-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 12px;
  background: linear-gradient(135deg, #f0f4f8 0%, #e8eef5 100%);
  border-bottom: 1px solid #d0d7de;
}

.config-section {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.config-label {
  font-size: 12px;
  font-weight: 600;
  color: #424242;
  white-space: nowrap;
}

.config-select {
  min-width: 200px;
  padding: 6px 32px 6px 10px;
  font-size: 12px;
  border: 1px solid #c0c8d0;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  outline: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23666' d='M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 6px center;
  background-size: 18px;
  transition: all 0.15s ease;
}

.config-select:hover:not(:disabled) {
  border-color: #1976d2;
}

.config-select:focus {
  border-color: #1976d2;
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.15);
}

.config-select:disabled {
  background-color: #f5f5f5;
  color: #9e9e9e;
  cursor: not-allowed;
}

.config-spinner {
  position: absolute;
  right: 30px;
}

.config-apply-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  font-size: 12px;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 0 2px 4px rgba(25, 118, 210, 0.3);
}

.config-apply-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #1565c0 0%, #0d47a1 100%);
  box-shadow: 0 3px 6px rgba(25, 118, 210, 0.4);
}

.config-apply-btn:active:not(:disabled) {
  transform: translateY(1px);
  box-shadow: 0 1px 2px rgba(25, 118, 210, 0.3);
}

.config-apply-btn:disabled {
  background: #bdbdbd;
  cursor: not-allowed;
  box-shadow: none;
}

.config-apply-btn svg {
  width: 16px;
  height: 16px;
}

.config-clear-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 1px solid #d0d7de;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  color: #757575;
  transition: all 0.15s ease;
}

.config-clear-btn:hover {
  border-color: #f44336;
  background: #ffebee;
  color: #f44336;
}

.config-clear-btn svg {
  width: 16px;
  height: 16px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: white;
  border: 1px solid #dadce0;
  border-radius: 6px;
  flex: 0 0 200px;
  max-width: 200px;
}

.search-box:focus-within {
  border-color: #1976d2;
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.1);
}

.search-icon {
  width: 16px;
  height: 16px;
  color: #5f6368;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 12px;
  background: transparent;
  min-width: 0;
}

.search-input::placeholder {
  color: #9e9e9e;
}

.search-clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: #e0e0e0;
  cursor: pointer;
  color: #5f6368;
  flex-shrink: 0;
}

.search-clear:hover {
  background: #bdbdbd;
}

.search-clear svg {
  width: 12px;
  height: 12px;
}

.search-spinner {
  flex-shrink: 0;
}

.search-hint {
  font-size: 10px;
  color: #9e9e9e;
  padding: 2px 4px;
  background: #f5f5f5;
  border-radius: 4px;
  flex-shrink: 0;
}

/* Active Filters Indicator */
.active-filters-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: #e3f2fd;
  border: 1px solid #90caf9;
  border-radius: 16px;
  font-size: 12px;
  color: #1565c0;
}

.active-filters-indicator .filter-icon {
  width: 14px;
  height: 14px;
}

.active-filters-indicator .filter-count {
  font-weight: 500;
}

.clear-filters-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: #1565c0;
  color: white;
  cursor: pointer;
  transition: background 0.2s;
}

.clear-filters-btn:hover {
  background: #0d47a1;
}

.clear-filters-btn svg {
  width: 10px;
  height: 10px;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.toolbar-divider {
  width: 1px;
  height: 20px;
  background: #dadce0;
  margin: 0 4px;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  transition: all 0.15s ease;
  color: #5f6368;
  position: relative;
}

.toolbar-btn:hover {
  background: #e8eaed;
  color: #1976d2;
}

/* Custom Tooltip */
.toolbar-btn[data-tooltip]::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 8px;
  background: #333;
  color: white;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
  border-radius: 4px;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s, visibility 0.2s;
  z-index: 100;
  pointer-events: none;
}

.toolbar-btn[data-tooltip]::before {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  border: 4px solid transparent;
  border-bottom-color: #333;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s, visibility 0.2s;
  z-index: 100;
}

.toolbar-btn[data-tooltip]:hover::after,
.toolbar-btn[data-tooltip]:hover::before {
  opacity: 1;
  visibility: visible;
}

.toolbar-btn:active:not(:disabled) {
  background: #dadce0;
}

.toolbar-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.toolbar-btn svg {
  width: 20px;
  height: 20px;
}

.expand-progress-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
}

.expand-percent {
  position: absolute;
  font-size: 7px;
  font-weight: 700;
  color: #1976d2;
  line-height: 1;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.tree-header {
  display: flex;
  background: linear-gradient(135deg, #111f5a 0%, #0c6193 100%);
  color: white;
  font-weight: 600;
  padding: 10px 8px;
  align-items: stretch;
  min-height: 44px;
  position: sticky;
  top: 0;
  z-index: 10;
  min-width: max-content;
}

.tree-header .tree-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.tree-header .tree-name-cell {
  justify-content: flex-start;
  font-size: 15px;
}

.header-label {
  text-align: center;
  line-height: 1.3;
  font-size: 15px;
  font-weight: 600;
  cursor: grab;
  user-select: none;
  transition: all 0.15s ease;
  border-radius: 4px;
  padding: 4px 8px !important;
}

.header-label:hover {
  background: rgba(255,255,255,0.2);
}

.header-label:active {
  cursor: grabbing;
}

.header-label.dragging {
  opacity: 0.5;
  background: rgba(255,255,255,0.3);
}

.header-label.drag-over {
  background: rgba(255,255,255,0.4);
  box-shadow: inset 0 0 0 2px rgba(255,255,255,0.8);
}

/* Column Resize Handle */
.resize-handle {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 6px;
  cursor: col-resize;
  background: transparent;
  z-index: 5;
  transition: background 0.15s ease;
}

.resize-handle:hover {
  background: rgba(255, 255, 255, 0.4);
}

/* Header text and filter button layout */
.tree-header .tree-cell {
  display: flex;
  align-items: center;
  gap: 4px;
}

.tree-header .header-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Column Filter Button */
.filter-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;
  opacity: 0;
}

.tree-header .tree-cell:hover .filter-btn,
.filter-btn.active {
  opacity: 1;
}

.filter-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.filter-btn.active {
  background: rgba(255, 255, 255, 0.3);
  color: white;
}

.filter-btn svg {
  width: 14px;
  height: 14px;
}

.header-label.has-filter {
  background: rgba(255, 255, 255, 0.15);
}

/* Filter Dropdown */
.filter-dropdown {
  position: absolute;
  z-index: 1000;
  width: 260px;
  max-height: 400px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.filter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
}

.filter-title {
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.filter-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #666;
  cursor: pointer;
}

.filter-close:hover {
  background: #e0e0e0;
}

.filter-close svg {
  width: 16px;
  height: 16px;
}

.filter-search {
  padding: 10px 14px;
  border-bottom: 1px solid #e0e0e0;
}

.filter-search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #dadce0;
  border-radius: 6px;
  font-size: 13px;
  outline: none;
}

.filter-search-input:focus {
  border-color: #1976d2;
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.1);
}

.filter-actions {
  display: flex;
  gap: 8px;
  padding: 8px 14px;
  border-bottom: 1px solid #e0e0e0;
}

.filter-action-btn {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #dadce0;
  border-radius: 4px;
  background: white;
  font-size: 12px;
  color: #5f6368;
  cursor: pointer;
  transition: all 0.15s;
}

.filter-action-btn:hover {
  background: #f5f5f5;
  border-color: #c0c0c0;
}

.filter-values-list {
  flex: 1;
  overflow-y: auto;
  max-height: 220px;
  padding: 8px 0;
}

.filter-value-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  cursor: pointer;
  transition: background 0.15s;
}

.filter-value-item:hover {
  background: #f5f5f5;
}

.filter-value-item input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #1976d2;
}

.filter-value-label {
  flex: 1;
  font-size: 13px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.filter-value-count {
  font-size: 11px;
  color: #9e9e9e;
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 10px;
}

.filter-footer {
  padding: 10px 14px;
  border-top: 1px solid #e0e0e0;
  background: #f8f9fa;
}

.filter-apply-btn {
  width: 100%;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: #1976d2;
  color: white;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}

.filter-apply-btn:hover {
  background: #1565c0;
}

.resize-handle:active {
  background: rgba(255, 255, 255, 0.6);
}

.tree-row {
  display: flex;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.15s ease;
  min-width: max-content;
}

.tree-row:hover {
  background-color: #f5f9ff;
}

.tree-row.has-children {
  font-weight: 500;
}

.tree-row.clickable {
  cursor: pointer;
}

.tree-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 8px;
}

/* Title sütunu - sabit, geniş */
.tree-name-cell {
  flex: 0 0 280px;
  min-width: 280px;
  overflow: hidden;
}

/* Tüm dinamik sütunlar için ortak stil */
.dynamic-cell {
  flex: 1 1 100px;
  min-width: 80px;
  justify-content: center;
  text-align: center;
  overflow: hidden;
}

.qty-multiple {
  font-weight: 600;
  color: #1976d2;
}

.chip-wrapper {
  display: inline-flex;
}

.cell-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.expand-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.15s ease;
}

.expand-btn:hover {
  background-color: #e3f2fd;
}

.icon-svg {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

.leaf-spacer {
  width: 26px;
  flex-shrink: 0;
}

.indent-spacer {
  display: inline-block;
  flex-shrink: 0;
}

.type-img {
  width: 20px;
  height: 20px;
  object-fit: contain;
  flex-shrink: 0;
}

.empty-icon {
  width: 64px;
  height: 64px;
}

.node-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty-state {
  padding: 48px;
  text-align: center;
  color: #9e9e9e;
}

.empty-state p {
  margin-top: 12px;
  font-size: 14px;
}

/* Scrollbar styling */
.tree-scroll-container::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.tree-scroll-container::-webkit-scrollbar-track {
  background: #f5f5f5;
}

.tree-scroll-container::-webkit-scrollbar-thumb {
  background: #bdbdbd;
  border-radius: 4px;
}

.tree-scroll-container::-webkit-scrollbar-thumb:hover {
  background: #9e9e9e;
}
</style>
