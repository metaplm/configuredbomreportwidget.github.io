/**
 * BOM Widget Konfigürasyon Dosyası
 * 
 * Runtime config: /config.json dosyasından okunur
 * Build almadan config değiştirilebilir.
 */

// Varsayılan değerler (config.json yüklenemezse kullanılır) - Cloud
const defaultConfig = {
  tenant: 'R1132101868454',
  attributeType: 'VPMReference',
  endpoints: {
    bomExpand: '/cvservlet/progressiveexpand/v2',
    customAttributes: '/resources/ParamWS/datamodel/listofattributesfortype',
    ecosystem: '/resources/enorelnav/v2/navigate/getEcosystem'
  }
};

// Runtime config cache
let runtimeConfig = null;

/**
 * Runtime config'i yükler
 * @returns {Promise<Object>} Config objesi
 */
export const loadConfig = async (forceReload = false) => {
  if (runtimeConfig && !forceReload) {
    console.log('[Config] Using cached config:', runtimeConfig);
    return runtimeConfig;
  }
  
  try {
    const configUrl = `./config.json?_t=${Date.now()}`;
    console.log('[Config] Fetching config from:', configUrl);
    
    const response = await fetch(configUrl);
    console.log('[Config] Fetch response status:', response.status, response.ok);
    
    if (response.ok) {
      runtimeConfig = await response.json();
      console.log('[Config] Runtime config yüklendi:', runtimeConfig);
    } else {
      console.warn('[Config] config.json bulunamadı, varsayılan değerler kullanılıyor');
      runtimeConfig = { ...defaultConfig };
    }
  } catch (error) {
    console.warn('[Config] config.json okunamadı, varsayılan değerler kullanılıyor:', error.message);
    runtimeConfig = { ...defaultConfig };
  }
  
  return runtimeConfig;
};

/**
 * Senkron config erişimi (loadConfig çağrıldıktan sonra kullanılmalı)
 * @returns {Object} Config objesi
 */
export const getConfig = () => {
  if (!runtimeConfig) {
    console.warn('[Config] getConfig called but runtimeConfig is null! Using defaultConfig.');
  }
  return runtimeConfig || defaultConfig;
};

// Varsayılan query parametreleri
const defaultQueryParams = {
  output_format: 'cvjson',
  xrequestedwith: 'xmlhttprequest'
};

/**
 * API URL oluşturur
 * @param {string} endpoint - Endpoint key (örn: 'bomExpand')
 * @param {Object} additionalParams - Ek query parametreleri
 * @returns {string} Tam URL
 */
export const buildApiUrl = (endpoint, additionalParams = {}) => {
  const config = getConfig();
  const baseUrl = config.endpoints?.[endpoint] || defaultConfig.endpoints[endpoint];
  if (!baseUrl) {
    throw new Error(`Unknown endpoint: ${endpoint}`);
  }
  
  const params = new URLSearchParams({
    ...defaultQueryParams,
    tenant: config.tenant,
    ...additionalParams
  });
  
  return `${baseUrl}?${params.toString()}`;
};

/**
 * Custom Attributes API URL'i oluşturur
 * @param {string} type - Attribute tipi
 * @returns {string} API URL
 */
export const getCustomAttributesUrl = (type) => {
  const config = getConfig();
  return buildApiUrl('customAttributes', { type: type || config.attributeType });
};

/**
 * BOM Expand API URL'i oluşturur (Cloud path).
 * @returns {string} API URL
 */
export const getBomExpandUrl = () => {
  const config = getConfig();
  const basePath = config.endpoints?.bomExpand ?? defaultConfig.endpoints.bomExpand;
  const params = new URLSearchParams({
    ...defaultQueryParams,
    tenant: config.tenant,
    output_format: 'cvjson'
  });
  return `${basePath}?${params.toString()}`;
};

/**
 * Ecosystem API URL'i oluşturur
 * @returns {string} API URL
 */
export const getEcosystemUrl = () => {
  return buildApiUrl('ecosystem');
};

// ==================== MfgItem (CreateAssembly) API URLs ====================

/**
 * MfgItem Expand API URL'i oluşturur
 * @param {string} physicalId - MfgItem physical ID
 * @returns {string} API URL
 */
export const getMfgItemExpandUrl = (physicalId) => {
  return `/resources/v1/modeler/dsmfg/dsmfg:MfgItem/${physicalId}/expand?xrequestedwith=xmlhttprequest&$mask=dsmfg:MfgItem.ExpandMask.Details.V1`;
};

/**
 * MfgItem Details API URL'i oluşturur
 * @param {string} physicalId - MfgItem physical ID
 * @returns {string} API URL
 */
export const getMfgItemDetailsUrl = (physicalId) => {
  return `/resources/v1/modeler/dsmfg/dsmfg:MfgItem/${physicalId}?xrequestedwith=xmlhttprequest&$mask=dsmfg:MfgItemMask.Details`;
};

/**
 * MfgItem Configured (Model) API URL'i oluşturur
 * @param {string} physicalId - MfgItem physical ID
 * @returns {string} API URL
 */
export const getMfgItemConfiguredUrl = (physicalId) => {
  return `/resources/v1/modeler/dsmfg/dsmfg:MfgItem/${physicalId}/dscfg:Configured`;
};

/**
 * MfgItem Filtered Expand API URL'i oluşturur (Configuration ile)
 * @param {string} physicalId - MfgItem physical ID
 * @returns {string} API URL
 */
export const getMfgItemFilteredExpandUrl = (physicalId) => {
  return `/resources/v1/modeler/dsmfg/dsmfg:MfgItem/${physicalId}/expand?xrequestedwith=xmlhttprequest`;
};

// Geriye uyumluluk için default export
export default {
  get tenant() { return getConfig().tenant; },
  get attributeType() { return getConfig().attributeType; },
  get endpoints() { return getConfig().endpoints || defaultConfig.endpoints; },
  defaultQueryParams
};
