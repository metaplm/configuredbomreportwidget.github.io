/**
 * BOM Widget Konfigürasyon Dosyası
 * 
 * Bu dosya, farklı ortamlara deploy edilirken değiştirilmesi gereken
 * tüm hardcoded değerleri içerir.
 */

const config = {
  // 3DEXPERIENCE Platform Tenant
  tenant: 'OnPremise',
  
  // Environment ID (drag-drop için)
  envId: 'OnPremise',
  
  // Attribute tipi (custom attribute'ları çekmek için)
  attributeType: 'VPMReference',
  
  // API Endpoints
  endpoints: {
    // BOM Expand API
    bomExpand: '/cvservlet/progressiveexpand/v2',
    
    // Custom Attributes API
    customAttributes: '/resources/ParamWS/datamodel/listofattributesfortype',
    
    // Ecosystem API (Route bilgileri için)
    ecosystem: '/resources/enorelnav/v2/navigate/getEcosystem'
  },
  
  // Varsayılan query parametreleri
  defaultQueryParams: {
    output_format: 'cvjson',
    xrequestedwith: 'xmlhttprequest'
  }
};

/**
 * API URL oluşturur
 * @param {string} endpoint - Endpoint key (örn: 'bomExpand')
 * @param {Object} additionalParams - Ek query parametreleri
 * @returns {string} Tam URL
 */
export const buildApiUrl = (endpoint, additionalParams = {}) => {
  const baseUrl = config.endpoints[endpoint];
  if (!baseUrl) {
    throw new Error(`Unknown endpoint: ${endpoint}`);
  }
  
  const params = new URLSearchParams({
    ...config.defaultQueryParams,
    tenant: config.tenant,
    ...additionalParams
  });
  
  return `${baseUrl}?${params.toString()}`;
};

/**
 * Custom Attributes API URL'i oluşturur
 * @param {string} type - Attribute tipi (varsayılan: VPMReference)
 * @returns {string} API URL
 */
export const getCustomAttributesUrl = (type = config.attributeType) => {
  return buildApiUrl('customAttributes', { type });
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

export default config;
