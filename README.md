# Gerçek Zamanlı Sohbet Uygulaması

Bu proje, Node.js, Express, Socket.IO, MongoDB ve Angular kullanılarak geliştirilmiş gerçek zamanlı bir sohbet uygulamasıdır.

## Özellikler

- Kullanıcı kayıt ve giriş sistemi
- Birebir gerçek zamanlı sohbet
- Grup sohbeti desteği
- Emoji desteği
- Çevrimiçi kullanıcı takibi
- Sonsuz kaydırmalı mesaj geçmişi
- Masaüstü bildirimleri
- JWT tabanlı kimlik doğrulama

## Kurulum

### Backend

1. Backend dizinine gidin:
```bash
cd backend
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. MongoDB'nin çalıştığından emin olun

4. .env dosyasını düzenleyin:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/chat-app
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=http://localhost:4200
```

5. Sunucuyu başlatın:
```bash
npm run dev
```

### Frontend

1. Angular CLI'yi yükleyin (eğer yüklü değilse):
```bash
npm install -g @angular/cli
```

2. Frontend dizinine gidin ve bağımlılıkları yükleyin:
```bash
cd frontend
npm install
```

3. Uygulamayı başlatın:
```bash
ng serve
```

## Kullanım

1. http://localhost:4200 adresine gidin
2. Yeni bir hesap oluşturun veya giriş yapın
3. Sol menüden bir kullanıcı seçin veya yeni bir grup oluşturun
4. Sohbet etmeye başlayın!

## Teknolojiler

- Backend:
  - Node.js
  - Express.js
  - Socket.IO
  - MongoDB
  - JWT
  - Mongoose

- Frontend:
  - Angular
  - Socket.IO Client
  - Bootstrap
  - emoji-picker-element

## Lisans

MIT
