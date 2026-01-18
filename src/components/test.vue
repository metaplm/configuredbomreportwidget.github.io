<template>
  <div class="test-container">
    <div class="status-alert">
      <strong>Test   :</strong> {{ platformStatus }}
    </div>
    
    <div class="cards-row">
      <!-- Sol taraf: Authenticated Request -->
      <div class="card">
        <div class="card-header primary">
          🔐 Authenticated Request
        </div>
        <div class="card-content">
          <div class="input-group">
            <label>Test ID:</label>
            <input 
              v-model="testId" 
              type="text"
              placeholder="4E5027030000206068F7CF3E0000F958"
            />
          </div>
          
          <button 
            @click="testPlatformInterface" 
            :disabled="authenticatedLoading" 
            class="btn btn-primary"
          >
            {{ authenticatedLoading ? '⏳ Loading...' : '🚀 Test Authenticated Request' }}
          </button>
        </div>
      </div>
      
      <!-- Sağ taraf: Proxified Request -->
      <div class="card">
        <div class="card-header success">
          🌐 Proxified Request
        </div>
        <div class="card-content">
          <div class="input-group">
            <label>External API URL:</label>
            <input 
              v-model="proxifiedUrl" 
              type="text"
              placeholder="https://jsonplaceholder.typicode.com/posts/1"
            />
          </div>
          
          <button 
            @click="testProxifiedRequest" 
            :disabled="proxifiedLoading" 
            class="btn btn-success"
          >
            {{ proxifiedLoading ? '⏳ Loading...' : '🚀 Test Proxified Request' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Response Alanı -->
    <div class="card response-card">
      <div class="card-header">
        <span>📋 Response Data</span>
        <span v-if="responseType" class="chip" :class="responseType">
          {{ responseType === 'authenticated' ? 'Authenticated' : 'Proxified' }}
        </span>
      </div>
      <div class="card-content">
        <textarea
          v-if="responseData"
          v-model="responseData"
          readonly
          class="response-textarea"
        ></textarea>
        <div v-else class="empty-state">
          <div class="empty-icon">📝</div>
          <div>Test butonlarından birine tıklayarak response görebilirsiniz.</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// Reactive data
const platformStatus = ref("Initializing...")
const testId = ref("4E5027030000206068F7CF3E0000F958")
const proxifiedUrl = ref("https://jsonplaceholder.typicode.com/posts/1")
const responseData = ref("")
const responseType = ref("") // 'authenticated' or 'proxified'
const authenticatedLoading = ref(false)
const proxifiedLoading = ref(false)

// Methods
const testPlatformInterface = async () => {
  try {
    authenticatedLoading.value = true
    responseType.value = "authenticated"
    
    // PlatformInterface'i test et
    const PlatformInterface = await import("../js/PlatformInterface")
    platformStatus.value = "Platform Interface loaded successfully"
    console.log("✅ PlatformInterface loaded:", PlatformInterface.default)
    
    // Authenticated request test
    await testAuthenticatedRequest(PlatformInterface.default)
    
  } catch (error) {
    platformStatus.value = "Error loading PlatformInterface: " + error.message
    console.error("❌ PlatformInterface error:", error)
    responseData.value = `Error: ${error.message}`
  } finally {
    authenticatedLoading.value = false
  }
}

const testAuthenticatedRequest = async (PlatformInterface) => {
  try {
    platformStatus.value = "Testing authenticated request..."
    responseData.value = "" // Clear previous response
    
    const testUrl = `https://3ddashboard25x.metaplm.com/3dspace/resources/v1/modeler/dseng/dseng:EngItem/${testId.value}?xrequestedwith=xmlhttprequest&SecurityContext=VPLMProjectLeader.Company%20Name.Common%20Space`
    
    const result = await PlatformInterface.callWebService({
      method: "GET",
      url: testUrl,
      type: "json",
      headers: {
        "SecurityContext": "VPLMProjectLeader.Company Name.Common Space"
      }
    })
    
    platformStatus.value = "✅ Authenticated request successful!"
    console.log("✅ Authenticated request result:", result)
    
    // Format response data for display
    responseData.value = JSON.stringify(result, null, 2)
    
  } catch (error) {
    platformStatus.value = "❌ Authenticated request failed: " + error.message
    console.error("❌ Authenticated request error:", error)
    
    // Show error in response area
    responseData.value = `Error: ${error.message}`
  }
}

const testProxifiedRequest = async () => {
  try {
    proxifiedLoading.value = true
    responseType.value = "proxified"
    platformStatus.value = "Testing proxified request..."
    responseData.value = "" // Clear previous response
    
    // Load PlatformInterface
    const PlatformInterface = await import("../js/PlatformInterface")
    
    // Use dynamic URL from input field
    const testUrl = proxifiedUrl.value || "https://jsonplaceholder.typicode.com/posts/1"
    
    const result = await PlatformInterface.default.callProxifiedWebService({
      method: "GET",
      url: testUrl,
      type: "json",
      headers: {
        "Content-Type": "application/json"
      }
    })
    
    platformStatus.value = "✅ Proxified request successful!"
    console.log("✅ Proxified request result:", result)
    
    // Format response data for display
    responseData.value = JSON.stringify(result, null, 2)
    
  } catch (error) {
    platformStatus.value = "❌ Proxified request failed: " + error.message
    console.error("❌ Proxified request error:", error)
    
    // Show error in response area
    responseData.value = `Error: ${error.message}`
  } finally {
    proxifiedLoading.value = false
  }
}

// Lifecycle
onMounted(() => {
  testPlatformInterface()
})
</script>

<style scoped>
.test-container {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.status-alert {
  background: #e3f2fd;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  border-left: 4px solid #1976d2;
  color: #1976d2;
}

.cards-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.card {
  flex: 1;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
}

.card-header {
  padding: 16px 20px;
  font-weight: 600;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-header.primary {
  background: #e3f2fd;
  color: #1976d2;
}

.card-header.success {
  background: #e8f5e8;
  color: #388e3c;
}

.card-content {
  padding: 20px;
}

.input-group {
  margin-bottom: 16px;
}

.input-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #333;
}

.input-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.input-group input:focus {
  outline: none;
  border-color: #1976d2;
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
}

.btn {
  width: 100%;
  padding: 12px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #1976d2;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #1565c0;
}

.btn-success {
  background: #388e3c;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #2e7d32;
}

.response-card {
  margin-top: 20px;
}

.response-textarea {
  width: 100%;
  height: 300px;
  padding: 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  background: #fafafa;
  resize: vertical;
}

.empty-state {
  padding: 40px;
  text-align: center;
  color: #666;
  background: #f9f9f9;
  border-radius: 6px;
  border: 2px dashed #ddd;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.chip {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.chip.authenticated {
  background: #e3f2fd;
  color: #1976d2;
}

.chip.proxified {
  background: #e8f5e8;
  color: #388e3c;
}
</style>