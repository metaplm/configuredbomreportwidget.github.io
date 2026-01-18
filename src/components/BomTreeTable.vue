<template>
  <div class="bom-tree-table">
    <!-- Toolbar -->
    <div class="tree-toolbar">
      <div class="search-box">
        <svg class="search-icon" viewBox="0 0 24 24"><path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" fill="currentColor"/></svg>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Ara..." 
          class="search-input"
          @input="onSearchInput"
        />
        <button v-if="searchQuery" class="search-clear" @click="clearSearch" title="Temizle">
          <svg viewBox="0 0 24 24"><path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" fill="currentColor"/></svg>
        </button>
      </div>
      <div class="toolbar-actions">
        <button class="toolbar-btn" @click="expandAll" title="Expand All">
          <svg viewBox="0 0 24 24"><path d="M12,18.17L8.83,15L7.42,16.41L12,21L16.59,16.41L15.17,15M12,5.83L15.17,9L16.58,7.59L12,3L7.41,7.59L8.83,9L12,5.83Z" fill="currentColor"/></svg>
        </button>
        <button class="toolbar-btn" @click="collapseAll" title="Collapse All">
          <svg viewBox="0 0 24 24"><path d="M12,9.17L15.17,6L16.58,7.41L12,12L7.41,7.41L8.83,6L12,9.17M12,14.83L8.83,18L7.42,16.59L12,12L16.59,16.59L15.17,18L12,14.83Z" fill="currentColor"/></svg>
        </button>
        <div class="toolbar-divider"></div>
        <button class="toolbar-btn" @click="expandOneLevel" title="Expand One Level">
          <svg viewBox="0 0 24 24"><path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="currentColor"/></svg>
        </button>
        <button class="toolbar-btn" @click="collapseOneLevel" title="Collapse One Level">
          <svg viewBox="0 0 24 24"><path d="M19,13H5V11H19V13Z" fill="currentColor"/></svg>
        </button>
        <div class="toolbar-divider"></div>
        <button class="toolbar-btn" @click="emit('open-columns')" title="Columns">
          <svg viewBox="0 0 24 24"><path d="M3,4H7V8H3V4M9,5V7H21V5H9M3,10H7V14H3V10M9,11V13H21V11H9M3,16H7V20H3V16M9,17V19H21V17H9" fill="currentColor"/></svg>
        </button>
        <div class="toolbar-divider"></div>
        <button class="toolbar-btn" @click="exportToExcel" title="Export to Excel">
          <svg viewBox="0 0 24 24"><path d="M21.17 3.25Q21.5 3.25 21.76 3.5 22 3.74 22 4.08V19.92Q22 20.26 21.76 20.5 21.5 20.75 21.17 20.75H7.83Q7.5 20.75 7.24 20.5 7 20.26 7 19.92V17H2.83Q2.5 17 2.24 16.76 2 16.5 2 16.17V7.83Q2 7.5 2.24 7.24 2.5 7 2.83 7H7V4.08Q7 3.74 7.24 3.5 7.5 3.25 7.83 3.25M7 13.06L8.18 15.28H9.97L8 12.06L9.93 8.89H8.22L7.13 10.9L7.09 10.96L7.06 11.03Q6.8 10.5 6.5 9.96 6.25 9.43 5.97 8.89H4.16L6.05 12.08L4 15.28H5.78M13.88 19.5V17H8.25V19.5M13.88 15.75V12.63H12V15.75M13.88 11.38V8.25H12V11.38M13.88 7V4.5H8.25V7M20.75 19.5V17H15.13V19.5M20.75 15.75V12.63H15.13V15.75M20.75 11.38V8.25H15.13V11.38M20.75 7V4.5H15.13V7Z" fill="currentColor"/></svg>
        </button>
        <button class="toolbar-btn" @click="printTable" title="Print">
          <svg viewBox="0 0 24 24"><path d="M18,3H6V7H18M19,12A1,1 0 0,1 18,11A1,1 0 0,1 19,10A1,1 0 0,1 20,11A1,1 0 0,1 19,12M16,19H8V14H16M19,8H5A3,3 0 0,0 2,11V17H6V21H18V17H22V11A3,3 0 0,0 19,8Z" fill="currentColor"/></svg>
        </button>
      </div>
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
        <div class="tree-cell tree-name-cell">Title</div>
        <div 
          v-for="(col, index) in displayColumns" 
          :key="`header-${col.key}`" 
          class="tree-cell dynamic-cell header-label"
          :class="{ 'dragging': headerDragIndex === index, 'drag-over': headerDragOverIndex === index }"
          draggable="true"
          @dragstart="onHeaderDragStart(index, $event)"
          @dragend="onHeaderDragEnd"
        @dragover.prevent.stop="onHeaderDragOver(index)"
        @drop.prevent.stop="onHeaderDrop(index, $event)"
          v-html="formatHeaderLabel(col.label)"
        >
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
          <div class="tree-cell tree-name-cell">
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
              v-if="node.icon" 
              :src="node.icon" 
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
import config from '../config.js';

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
  }
});

const emit = defineEmits(['update:selected-columns', 'open-columns']);

const treeData = ref([]);
const searchQuery = ref('');

// Header drag state
const headerDragIndex = ref(null);
const headerDragOverIndex = ref(null);

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
        '_subqty': 'SubQty',
        '_totalqty': 'Total Qty'
      };
      return { key, label: fallbackLabels[key] || key.split(':').pop() };
    });
});

// Row Drag - 3DXContent format ile dışarı sürükleme
const onRowDragStart = (node, event) => {
  event.stopPropagation();
  
  const dragData = {
    protocol: '3DXContent',
    version: '2.1',
    source: 'BOMWidget',
    widgetId: 'BOMReportWidget',
    data: {
      items: [{
        envId: config.envId,
        serviceId: '3DSpace',
        contextId: '',
        objectId: node.resourceid,
        objectType: node['ds6w:type'] || 'VPMReference',
        displayName: node['ds6w:label'] || node['ds6w:identifier'] || '',
        i3dx: ''
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
  
  // resourceid'ye göre tüm node'ları map'e ekle (Part/Product belirlemek için 3DShape de lazım)
  const allNodeMap = {};
  const analysisTypes = ['VPMReference', '3DShape'];
  
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
  const instanceTypes = ['VPMInstance', 'VPMRepInstance'];
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
  
  // Her VPMReference için Part/Product belirle
  // Part: Altında 3DShape var (yaprak parça) veya icon'da 3DPart var
  // Product: Altında VPMReference var (montaj) veya boş montaj
  Object.values(allNodeMap).forEach(node => {
    const nodeType = node['ds6w:type'];
    if (node && nodeType === 'VPMReference') {
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
  
  // Sadece VPMReference'ları içeren nodeMap oluştur
  const nodeMap = {};
  Object.entries(allNodeMap).forEach(([id, node]) => {
    if (node && node['ds6w:type'] === 'VPMReference') {
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

  // Root node'ları bul (hiçbir parent'ı olmayan)
  const childSet = new Set();
  parentChildCounts.forEach(childCounts => {
    childCounts.forEach((count, childId) => childSet.add(childId));
  });

  const roots = Object.values(nodeMap).filter(node => !childSet.has(node.resourceid));
  
  // Recursive olarak children'ları düzelt ve level'ları ayarla
  let nodeCounter = 0;
  const processNode = (node, level, parentChildCounts, nodeMap, parentPath = '', visited = new Set(), parentSubQty = 1) => {
    node.level = level;
    node._uid = `${parentPath}_${node.resourceid}_${nodeCounter++}`; // Unique identifier
    
    // SubQty hesapla: kendi Qty * parent'ın SubQty değeri
    node.subQuantity = (node.quantity || 1) * parentSubQty;
    
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
            // Recursive olarak children'ları işle (parentSubQty olarak bu node'un subQuantity'sini geç)
            processNode(childCopy, level + 1, parentChildCounts, nodeMap, node._uid, new Set(visited), node.subQuantity);
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
    processNode(root, 0, parentChildCounts, nodeMap, `root_${idx}`, new Set(), 1);
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

// Arama input handler
const onSearchInput = () => {
  if (searchQuery.value) {
    expandParentsForSearch(treeData.value, searchQuery.value);
  }
};

const clearSearch = () => {
  searchQuery.value = '';
};

// Visible nodes (expanded state ve arama filtresine göre)
const visibleNodes = computed(() => {
  const result = [];
  const query = searchQuery.value?.trim();
  
  const traverse = (nodes, parentMatches = false) => {
    if (!nodes || !Array.isArray(nodes)) return;
    
    nodes.forEach(node => {
      if (!node || !node.resourceid) return;
      
      const selfMatches = nodeMatchesSearch(node, query);
      const childrenMatch = node.children?.some(child => 
        nodeMatchesSearch(child, query) || hasMatchingDescendant(child, query)
      );
      
      // Göster: kendisi eşleşiyor, veya child'ı eşleşiyor, veya parent eşleşiyor
      if (!query || selfMatches || childrenMatch || parentMatches) {
        result.push(node);
        
        if (node.expanded && node.children?.length) {
          traverse(node.children, selfMatches || parentMatches);
        }
      }
    });
  };
  
  traverse(treeData.value);
  return result;
});

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
const expandAll = () => {
  const expand = (nodes) => {
    if (!nodes) return;
    for (const node of nodes) {
      if (node.children?.length) {
        node.expanded = true;
        expand(node.children);
      }
    }
  };
  expand(treeData.value);
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

// Expand One Level - şu an görünen node'ların çocuklarını aç
const expandOneLevel = () => {
  const expandVisible = (nodes) => {
    if (!nodes) return;
    for (const node of nodes) {
      if (node.children?.length) {
        if (node.expanded) {
          // Bu node zaten açık, çocuklarına bak
          expandVisible(node.children);
        } else {
          // Bu node kapalı ve çocukları var, aç
          node.expanded = true;
        }
      }
    }
  };
  expandVisible(treeData.value);
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

// Type'a göre renk
const getTypeColor = (displayType) => {
  return displayType === 'Part' ? '#4caf50' : '#1976d2';
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

// Hücre değerini formatla
const formatCellValue = (value, key) => {
  if (value === undefined || value === null) return '-';
  
  // Tarih alanları
  if (key === 'ds6w:created' || key === 'ds6w:modified') {
    try {
      const date = new Date(value);
      return date.toLocaleDateString('tr-TR', { 
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
}, { immediate: true });

// ==================== EXPORT FUNCTIONS ====================

// Flatten tree data for export (görünür olan tüm satırlar)
const getFlatDataForExport = () => {
  const flatData = [];
  
  const flatten = (nodes, level = 0) => {
    for (const node of nodes) {
      if (!node || !node.resourceid) continue;
      
      const row = {
        level,
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
        } else if (col.key.includes('baykar_revision')) {
          row[col.label] = getBaykarRevisionValue(node, col.key);
        } else {
          row[col.label] = node[col.key] || '-';
        }
      }
      
      flatData.push(row);
      
      // Tüm çocukları dahil et (expanded olsun olmasın)
      if (node.children?.length) {
        flatten(node.children, level + 1);
      }
    }
  };
  
  flatten(treeData.value);
  return flatData;
};

// Excel Export
const exportToExcel = () => {
  const data = getFlatDataForExport();
  
  // Header'ları oluştur
  const headers = ['Seviye', 'Title', ...displayColumns.value.map(c => c.label)];
  
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
  
  // İndir
  const fileName = `BOM_Export_${new Date().toISOString().slice(0, 10)}.xlsx`;
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
      <p class="date">Tarih: ${new Date().toLocaleDateString('tr-TR')}</p>
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
}

.toolbar-btn:hover {
  background: #e8eaed;
  color: #1976d2;
}

.toolbar-btn:active {
  background: #dadce0;
}

.toolbar-btn svg {
  width: 20px;
  height: 20px;
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
