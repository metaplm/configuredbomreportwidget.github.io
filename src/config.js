/**
 * BOM Widget Konfigürasyon Dosyası
 * 
 * Runtime config: /config.json dosyasından okunur
 * Build almadan config değiştirilebilir.
 */

// Varsayılan değerler (config.json yüklenemezse kullanılır)
const defaultConfig = {
  tenant: 'OnPremise',
  envId: 'OnPremise',
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
export const loadConfig = async () => {
  if (runtimeConfig) {
    return runtimeConfig;
  }
  
  try {
    const response = await fetch('./config.json');
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
 * BOM Expand API URL'i oluşturur
 * @returns {string} API URL
 */
export const getBomExpandUrl = () => {
  return buildApiUrl('bomExpand', { output_format: 'cvjson' });
};

/**
 * Ecosystem API URL'i oluşturur
 * @returns {string} API URL
 */
export const getEcosystemUrl = () => {
  return buildApiUrl('ecosystem');
};

// Geriye uyumluluk için default export
export default {
  get tenant() { return getConfig().tenant; },
  get envId() { return getConfig().envId; },
  get attributeType() { return getConfig().attributeType; },
  get endpoints() { return getConfig().endpoints || defaultConfig.endpoints; },
  defaultQueryParams
};
