# BOM Widget Deploy Rehberi

Bu doküman, `bomwidget-deploy.tar.gz` paketinin hedef sunucuya nasıl deploy edileceğini açıklar.

---

## 📦 Paket İçeriği

```
bomwidget/
├── index.html          # Ana HTML dosyası
├── bundle.js           # Ana uygulama bundle'ı
├── 634.bundle.js       # Vendor bundle (Vuetify, Vue vb.)
├── 644.bundle.js       # Lazy-loaded modüller
├── config.json         # Runtime konfigürasyon dosyası
├── static/
│   ├── images/         # Uygulama ikonları ve görseller
│   │   ├── baykar_logo.png
│   │   ├── VPMReference.png
│   │   ├── Part.png
│   │   └── ...
│   └── lib/
│       └── require.js
└── assets/
    └── help/
        └── help_en.json
```

---

## 🚀 Kurulum Adımları

### 1. Paketi Hedef Sunucuya Kopyala

```bash
scp bomwidget-deploy.tar.gz kullanici@hedef-sunucu:/tmp/
```

### 2. Paketi Aç

```bash
# Apache htdocs dizinine git
cd /var/www/html   # veya /usr/local/apache2/htdocs

# bomwidget klasörü oluştur
sudo mkdir -p bomwidget

# Paketi aç
sudo tar -xzvf /tmp/bomwidget-deploy.tar.gz -C bomwidget

# İzinleri ayarla
sudo chown -R www-data:www-data bomwidget   # veya apache:apache
sudo chmod -R 755 bomwidget
```

### 3. Apache Yapılandırması (Opsiyonel)

Eğer Apache'de özel bir konfigürasyon gerekiyorsa:

```apache
# /etc/apache2/sites-available/000-default.conf veya httpd.conf içine

Alias /bomwidget /var/www/html/bomwidget

<Directory /var/www/html/bomwidget>
    Options -Indexes +FollowSymLinks
    AllowOverride None
    Require all granted
</Directory>
```

Apache'yi yeniden yükle:

```bash
sudo systemctl reload apache2   # Debian/Ubuntu
# veya
sudo systemctl reload httpd     # CentOS/RHEL
```

---

## ⚙️ Konfigürasyon

### config.json

Uygulama ayarları `config.json` dosyasında bulunur. Bu dosyayı düzenleyerek yeniden build almadan ayarları değiştirebilirsiniz.

```json
{
  "tenant": "OnPremise",
  "envId": "OnPremise",
  "attributeType": "VPMReference",
  "endpoints": {
    "bomExpand": "/cvservlet/progressiveexpand/v2",
    "customAttributes": "/resources/ParamWS/datamodel/listofattributesfortype",
    "ecosystem": "/resources/enorelnav/v2/navigate/getEcosystem"
  }
}
```

### Ayarların Açıklaması

| Ayar | Açıklama | Örnek Değer |
|------|----------|-------------|
| `tenant` | 3DEXPERIENCE Platform tenant adı | `OnPremise`, `R2024x` |
| `envId` | Environment ID (drag-drop işlemleri için) | `OnPremise` |
| `attributeType` | Custom attribute'ların çekileceği tip | `VPMReference` |
| `endpoints.bomExpand` | BOM Expand API endpoint'i | `/cvservlet/progressiveexpand/v2` |
| `endpoints.customAttributes` | Custom Attributes API endpoint'i | `/resources/ParamWS/datamodel/listofattributesfortype` |
| `endpoints.ecosystem` | Ecosystem API endpoint'i | `/resources/enorelnav/v2/navigate/getEcosystem` |

### Konfigürasyonu Değiştirme

```bash
# Düzenle
sudo nano /var/www/html/bomwidget/config.json

# Değişiklikler anında geçerli olur (tarayıcıyı yenileyin)
```

---

## 🌐 Erişim

### Widget URL

```
https://sunucu-adresi.com/bomwidget/
```

### 3DDashboard'a Widget Ekleme

#### Adım 1: Additional App Oluşturma

1. **Platform Management** açın
2. **Members** bölümüne gidin
3. **Additional Apps** bölümüne gidin
4. **Create Additional App** butonuna tıklayın
5. Aşağıdaki bilgileri girin:

| Alan | Değer |
|------|-------|
| **Short Name** | `Baykar BOM Report` |
| **Long Name** | `Baykar BOM Report` |
| **Type** | `Widget` |
| **Storage Type** | `External` |
| **URL** | `https://sunucu-adresi.com/bomwidget/index.html` |

6. **Save** ile kaydedin

#### Adım 2: Dashboard'a Widget Ekleme

1. **3DDashboard** açın
2. **Add Content** (+ butonu) tıklayın
3. **Baykar BOM Report** widget'ını bulun
4. Dashboard'a sürükleyin

#### Widget URL

```
https://sunucu-adresi.com/bomwidget/index.html
```

---

## ✅ Doğrulama

Kurulum sonrası aşağıdaki kontrolleri yapın:

1. **Tarayıcıdan Erişim:**
   ```
   https://sunucu-adresi.com/bomwidget/
   ```
   Sayfa yüklendiğinde drop zone görünmelidir.

2. **Config Kontrolü:**
   ```
   https://sunucu-adresi.com/bomwidget/config.json
   ```
   JSON içeriği görünmelidir.

3. **Statik Dosyalar:**
   ```
   https://sunucu-adresi.com/bomwidget/static/images/baykar_logo.png
   ```
   Logo görüntülenmelidir.

---

## 🔧 Sorun Giderme

### Sayfa Yüklenmiyor

1. **Dosya izinlerini kontrol edin:**
   ```bash
   ls -la /var/www/html/bomwidget/
   ```

2. **Apache error log'ları kontrol edin:**
   ```bash
   sudo tail -f /var/log/apache2/error.log
   ```

### API Çağrıları Başarısız

1. **config.json'daki endpoint'lerin doğru olduğundan emin olun**

2. **CORS ayarlarını kontrol edin** (farklı domain'den erişim varsa)

3. **Tarayıcı Developer Tools > Network sekmesinden hataları inceleyin**

### Görseller Görünmüyor

1. **static/ klasörünün doğru kopyalandığından emin olun:**
   ```bash
   ls -la /var/www/html/bomwidget/static/images/
   ```

2. **Dosya izinlerini kontrol edin**

---

## 📋 Gereksinimler

- Apache HTTP Server (httpd) veya nginx
- SSL sertifikası (HTTPS için)
- 3DEXPERIENCE Platform erişimi (API çağrıları için)

---

## 📝 Notlar

- Bu widget `/bomwidget/` path'i için build edilmiştir
- Farklı bir path kullanmak için yeniden build gerekir
- Config değişiklikleri yeniden build gerektirmez
- Tarayıcı cache'ini temizlemeyi unutmayın

---

## 📞 Destek

Sorun yaşarsanız lütfen aşağıdaki bilgileri hazırlayın:

1. Browser console hataları
2. Network sekmesindeki başarısız istekler
3. Apache error log'ları
4. config.json içeriği
