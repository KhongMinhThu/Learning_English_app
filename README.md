# English Learning Conversation API

Backend API server cho ứng dụng học tiếng Anh thông qua hội thoại với AI.

## 🚀 Tính năng

- **Hội thoại AI**: Sử dụng OpenAI GPT để tạo cuộc hội thoại tự nhiên
- **Lưu trữ lịch sử**: Lưu cuộc hội thoại locally (không cần database)
- **Tra từ điển**: Tích hợp Oxford Dictionary API
- **Kiểm tra ngữ pháp**: Sửa lỗi ngữ pháp tự động
- **Phân tích trình độ**: Đánh giá khả năng tiếng Anh của người dùng
- **Gợi ý chủ đề**: Tạo câu hỏi khởi đầu cuộc hội thoại

## 📁 Cấu trúc thư mục

```
backend/
├── app.js                 # Server chính
├── package.json           # Dependencies
├── .env                   # Environment variables
├── controllers/
│   └── messageController.js    # Xử lý logic API
├── routes/
│   └── index.js               # Định nghĩa routes
├── services/
│   └── openaiService.js       # Tích hợp OpenAI & Oxford Dictionary
└── conversations/             # Lưu trữ lịch sử hội thoại (tự tạo)
```

## 🛠️ Cài đặt

### 1. Cài đặt dependencies

```bash
cd backend
npm install
```

### 2. Cấu hình environment variables

Tạo file `.env` trong thư mục backend:

```bash
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# OpenAI API Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here

# Oxford Dictionary API Configuration (Optional)
OXFORD_APP_ID=your-oxford-app-id-here
OXFORD_APP_KEY=your-oxford-app-key-here
```

### 3. Lấy API Keys

#### OpenAI API Key (Bắt buộc)
1. Truy cập [OpenAI Platform](https://platform.openai.com/)
2. Tạo tài khoản và tạo API key
3. Copy API key vào `OPENAI_API_KEY`

#### Oxford Dictionary API (Tùy chọn)
1. Truy cập [Oxford Dictionary API](https://developer.oxforddictionaries.com/)
2. Đăng ký và tạo app để lấy App ID và App Key
3. Copy vào `OXFORD_APP_ID` và `OXFORD_APP_KEY`

*Lưu ý: Nếu không có Oxford API, hệ thống sẽ dùng OpenAI để tra từ*

### 4. Chạy server

```bash
# Development mode (với nodemon)
npm run dev

# Production mode
npm start
```

Server sẽ chạy tại: `http://localhost:5000`

## 📚 API Endpoints

### Hội thoại
- `POST /api/messages` - Gửi tin nhắn và nhận phản hồi AI
- `GET /api/conversations/:id` - Lấy lịch sử hội thoại
- `GET /api/conversations` - Lấy danh sách tất cả cuộc hội thoại
- `DELETE /api/conversations/:id` - Xóa cuộc hội thoại

### Hỗ trợ học tập
- `GET /api/conversation-starters` - Lấy gợi ý chủ đề hội thoại
- `GET /api/dictionary/:word` - Tra từ điển
- `POST /api/grammar-check` - Kiểm tra ngữ pháp
- `GET /api/analyze/:conversationId` - Phân tích trình độ tiếng Anh

### Ví dụ sử dụng

#### Gửi tin nhắn
```javascript
POST /api/messages
{
  "message": "Hello, how are you today?",
  "conversationId": "optional-conversation-id"
}
```

#### Tra từ
```javascript
GET /api/dictionary/hello
```

#### Kiểm tra ngữ pháp
```javascript
POST /api/grammar-check
{
  "text": "I are going to school"
}
```

## 🔧 Cấu hình tích hợp Frontend

Frontend React cần gọi API tại `http://localhost:5000/api/`

Ví dụ trong React