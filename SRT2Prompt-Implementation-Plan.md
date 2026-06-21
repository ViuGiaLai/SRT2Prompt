# SRT2Prompt — Implementation Plan

Ngoài **tài liệu sản phẩm** và **UI**, bạn cần thêm mấy thứ này để bắt đầu làm:

## 1. Repo nền

Dùng:

```text
nextjs/saas-starter
+
srt-parser-2
```

Đây là bộ nền để làm **SRT2Prompt SaaS**.

---

## 2. Môi trường code

Cần cài:

```text
Node.js
pnpm
VS Code
Git
GitHub
```

Sau đó tạo project:

```bash
git clone repo
cd project
pnpm install
pnpm dev
```

---

## 3. API AI

Chọn 1 cái trước thôi:

```text
Gemini API  → rẻ, dễ bắt đầu
OpenAI API  → tốt hơn nhưng tốn tiền hơn
OpenRouter → nhiều model
```

Bản đầu nên dùng:

```text
Gemini API
```

---

## 4. File `.env`

Cần chuẩn bị:

```env
DATABASE_URL=
AUTH_SECRET=
GEMINI_API_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_APP_URL=
```

Lúc đầu chưa cần Stripe cũng được.

---

## 5. Database

Bản đầu cần 3 bảng là đủ:

```text
users
projects
generations
```

Chưa cần làm phức tạp.

---

## 6. Prompt AI chuẩn

Bạn cần viết sẵn prompt để AI tạo output.

Ví dụ:

```text
Convert this SRT/script into:
1. Summary
2. Scene prompts
3. Thumbnail prompt
4. YouTube titles
5. Description
6. Hashtags
7. Keywords
```

Prompt này đặt trong:

```text
lib/prompts.ts
```

---

## 7. Logic xử lý SRT

Cần làm được:

```text
Đọc SRT
→ Tách từng dòng
→ Gộp thành cảnh
→ Gửi sang AI
→ Nhận kết quả
→ Hiển thị thành card
```

File nên có:

```text
lib/srt.ts
lib/ai.ts
lib/prompts.ts
```

---

## 8. Dữ liệu test

Bạn cần 3–5 file SRT mẫu để test:

```text
horror-story.srt
reddit-story.srt
shorts-story.srt
education.srt
```

Không có dữ liệu test thì rất khó biết tool chạy tốt hay chưa.

---

## 9. Checklist tính năng MVP

Bản đầu chỉ làm:

```text
[ ] Dán SRT/script
[ ] Upload file .srt
[ ] Chọn video type
[ ] Chọn image style
[ ] Generate output
[ ] Hiển thị scene cards
[ ] Copy từng prompt
[ ] Copy full output
[ ] Export .txt
[ ] Lưu project
```

Chưa cần:

```text
Thanh toán
Mobile app
AI video
AI voice
Marketplace
```

---

## 10. Landing page bán hàng

Cần 1 trang giới thiệu:

```text
SRT2Prompt biến SRT/script thành prompt ảnh, title, description, hashtag và thumbnail prompt cho video YouTube faceless.
```

Có nút:

```text
Start Free
View Demo
```

---

## 11. Luật license

Nếu lấy code GitHub, cần kiểm tra:

```text
MIT / Apache / BSD → dùng tốt
GPL / AGPL → cẩn thận
No License → không nên lấy
```

---

## 12. Kế hoạch làm theo thứ tự

Làm đúng thứ tự này:

```text
1. Clone repo nền
2. Chạy được local
3. Làm trang Generate
4. Làm ô dán SRT
5. Parse SRT
6. Gọi Gemini API
7. Hiển thị output
8. Làm copy button
9. Làm export TXT
10. Lưu project
11. Deploy Vercel
12. Làm landing page
13. Sau đó mới thêm payment
```

## Chốt lại

Bạn cần chuẩn bị:

```text
Repo nền
API AI
Database
File .env
Prompt AI
Logic parse SRT
Dữ liệu test
Checklist MVP
Landing page
Kế hoạch code
```

Quan trọng nhất để bắt đầu ngay:

```text
1. Clone nextjs/saas-starter
2. Tạo trang /dashboard/generate
3. Làm chức năng dán SRT → generate prompt
```

Làm được 3 cái đó là sản phẩm đã bắt đầu chạy được.
