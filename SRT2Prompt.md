# TÀI LIỆU LÀM TOOL: SRT2Prompt

## 1. Tên sản phẩm

**SRT2Prompt**

## 2. Ý tưởng chính

SRT2Prompt là tool giúp người làm video YouTube / TikTok / faceless video biến **SRT hoặc script** thành bộ nội dung hoàn chỉnh để sản xuất video.

Người dùng dán SRT hoặc script vào, tool tự tạo:

```text
- Tóm tắt video
- Chia cảnh
- Prompt ảnh cho từng cảnh
- Prompt thumbnail
- Title YouTube
- Description
- Hashtags
- Tags / keywords
- Dịch SRT nếu cần
```

## 3. Đối tượng mua

Tool này bán cho:

```text
- Người làm YouTube kể chuyện
- Người làm kênh horror story
- Người làm faceless video
- Người làm TikTok story
- Người làm video AI bằng ảnh + voice
```

## 4. Vấn đề của khách hàng

Hiện tại họ phải làm thủ công:

```text
1. Đọc script
2. Chia đoạn
3. Viết prompt ảnh
4. Nghĩ title
5. Viết description
6. Tạo hashtag
7. Làm thumbnail prompt
8. Dịch SRT
```

Mất nhiều thời gian và phải copy qua nhiều tool khác nhau.

## 5. Giải pháp

SRT2Prompt gom tất cả vào một nơi:

```text
Dán SRT / script
→ Chọn style
→ Bấm Generate
→ Nhận toàn bộ nội dung để làm video
```

## 6. Repo nên lấy

### Repo nền chính

```text
nextjs/saas-starter
```

Dùng để làm web SaaS có:

```text
- Landing page
- Login / Register
- Dashboard
- Payment
- User account
```

### Thư viện xử lý SRT

```text
1c7/srt-parser-2
```

Dùng để đọc nội dung `.srt`.

## 7. Stack công nghệ

```text
Frontend: Next.js
UI: Tailwind CSS + shadcn/ui
Backend: Next.js API Routes
Database: PostgreSQL hoặc SQLite lúc đầu
Auth: Auth có sẵn từ SaaS starter
Payment: Stripe
AI: Gemini / OpenAI / OpenRouter
Deploy: Vercel
```

Lúc đầu muốn dễ thì dùng:

```text
Next.js + SQLite + Gemini API
```

Sau này bán thật thì đổi sang:

```text
Next.js + PostgreSQL + Stripe
```

## 8. Chức năng MVP bản đầu tiên

Bản đầu chỉ cần 5 chức năng:

```text
1. Dán script hoặc SRT
2. Parse SRT thành từng đoạn
3. Chia cảnh tự động
4. Tạo prompt ảnh cho từng cảnh
5. Tạo title, description, hashtag
```

Không cần làm video.
Không cần render ảnh.
Không cần edit video.

Chỉ làm tool tạo “nguyên liệu sản xuất video”.

## 9. Giao diện chính

Trang dashboard có form:

```text
[ Dán SRT hoặc Script ]

Chọn loại video:
[ Horror Story ] [ Mystery ] [ Reddit Story ] [ Education ] [ Review ]

Chọn style ảnh:
[ 2D Minimal ] [ Dark Cinematic ] [ Semi Realistic ] [ Anime ]

Chọn ngôn ngữ:
[ English ] [ Vietnamese ] [ Both ]

Nút:
[ Generate Content Pack ]
```

## 10. Kết quả xuất ra

Sau khi generate, tool trả về:

```text
VIDEO SUMMARY

SCENE PROMPTS

1-3
Prompt...

4-7
Prompt...

8-10
Prompt...

THUMBNAIL PROMPT

YOUTUBE TITLES

DESCRIPTION

HASHTAGS

KEYWORDS
```

## 11. Format output chuẩn

Ví dụ:

```text
SUMMARY:
A night-shift guard accepts a job at an abandoned hospital and discovers strange rules that slowly become real.

IMAGE PROMPTS:

1-3
A dark cinematic 2D illustration of a tired night security guard walking toward an old hospital at sunset, empty street, quiet atmosphere, soft shadows, no gore.

4-7
A dark hallway inside an abandoned hospital, flickering lights, security guard holding a flashlight, tense atmosphere, cinematic composition.

THUMBNAIL PROMPT:
A terrified security guard standing in front of a dark hospital door, large text: "DO NOT BREAK THE RULES", horror YouTube thumbnail, high contrast.

TITLE OPTIONS:
1. I Worked the Night Shift at a Hospital. The Rules Were Real.
2. My Boss Gave Me a List of Rules for an Abandoned Hospital.
3. The Hospital Was Empty… Until Rule Number 4.

DESCRIPTION:
A night-shift security guard takes a strange job at an old hospital. At first, the rules seem ridiculous, but as the night goes on, each rule becomes more terrifying.

HASHTAGS:
#horrorstory #scarystory #creepypasta #mysterystory #facelessyoutube
```

## 12. Database cần có

Bản đơn giản cần các bảng:

```text
users
projects
generations
plans
```

### Bảng users

```text
id
email
name
created_at
```

### Bảng projects

```text
id
user_id
title
input_text
input_type
video_type
image_style
language
created_at
```

### Bảng generations

```text
id
project_id
summary
scene_prompts
thumbnail_prompt
titles
description
hashtags
keywords
created_at
```

### Bảng plans

```text
id
user_id
plan_name
generation_limit
created_at
```

## 13. Giới hạn bản Free và Pro

### Free

```text
- 3 lần generate/ngày
- Tối đa 20 đoạn SRT
- Không export file
- Ít style ảnh
```

### Pro

```text
- Generate nhiều hơn
- SRT dài hơn
- Export .txt / .md / .srt
- Nhiều style ảnh
- Lưu project
- Prompt thumbnail nâng cao
```

## 14. Giá bán đề xuất

Giai đoạn đầu:

```text
Lifetime: $19
```

Sau khi có người dùng:

```text
Basic: $5/tháng
Pro: $9/tháng
```

## 15. Lộ trình làm

### Giai đoạn 1: Bản chạy được

```text
1. Fork nextjs/saas-starter
2. Chạy project local
3. Tạo trang /dashboard/generate
4. Tạo textarea để dán SRT/script
5. Cài srt-parser-2
6. Parse SRT
7. Gửi text sang AI
8. Hiển thị kết quả
```

### Giai đoạn 2: Làm đẹp sản phẩm

```text
1. Thêm lựa chọn style ảnh
2. Thêm lựa chọn thể loại video
3. Thêm nút copy từng phần
4. Thêm nút export .txt
5. Lưu project vào database
```

### Giai đoạn 3: Bán được

```text
1. Thêm giới hạn free user
2. Thêm Stripe payment
3. Tạo landing page
4. Làm video demo
5. Đăng bán trên Gumroad / LemonSqueezy / website riêng
```

## 16. Cấu trúc thư mục nên có

```text
src/
  app/
    dashboard/
      generate/
        page.tsx
    api/
      generate/
        route.ts
  components/
    GeneratorForm.tsx
    OutputPanel.tsx
    PricingCard.tsx
  lib/
    srt.ts
    ai.ts
    prompts.ts
    db.ts
```

## 17. File quan trọng

### `lib/srt.ts`

Dùng để xử lý SRT:

```text
- Nhận text SRT
- Parse thành danh sách subtitle
- Gộp đoạn nhỏ thành scene
```

### `lib/ai.ts`

Dùng để gọi AI:

```text
- Gửi prompt
- Nhận kết quả
- Xử lý lỗi
```

### `lib/prompts.ts`

Chứa prompt mẫu:

```text
- Prompt tạo scene
- Prompt tạo title
- Prompt tạo description
- Prompt tạo hashtag
```

## 18. Prompt AI chính

```text
You are an assistant for faceless YouTube creators.

Convert the following SRT or script into a complete video content pack.

Return the output in this structure:

1. Summary
2. Scene Prompts
3. Thumbnail Prompt
4. YouTube Title Options
5. Description
6. Hashtags
7. Keywords

Rules:
- Keep prompts visual and clear.
- Do not include copyrighted character styles.
- Keep the same visual style across scenes.
- Group subtitle lines into useful scene ranges.
- Output must be easy to copy.
```

## 19. Không nên làm lúc đầu

Không làm các thứ này ở bản đầu:

```text
- Không làm AI video generator
- Không làm editor giống CapCut
- Không làm voice AI
- Không làm marketplace
- Không làm mobile app
- Không làm quá nhiều template
```

Chỉ tập trung một câu:

```text
Dán SRT vào → nhận prompt ảnh + title + description + hashtag.
```

## 20. Cách bán

Landing page nên ghi:

```text
Turn your SRT or script into ready-to-use image prompts, titles, descriptions, hashtags, and thumbnail prompts for faceless YouTube videos.
```

Bản tiếng Việt:

```text
Biến SRT hoặc kịch bản thành prompt ảnh, tiêu đề, mô tả, hashtag và thumbnail prompt cho video YouTube faceless.
```

## 21. Điểm khác biệt

SRT2Prompt không phải tool AI chung chung.

Nó tập trung vào một workflow:

```text
Script / SRT
→ Scene planning
→ Image prompts
→ Thumbnail prompt
→ YouTube metadata
```

Đây là điểm bán chính.

## 22. Checklist làm sản phẩm

```text
[ ] Fork repo SaaS starter
[ ] Chạy local thành công
[ ] Tạo trang Generate
[ ] Cài SRT parser
[ ] Parse được SRT
[ ] Gọi AI generate được output
[ ] Làm nút Copy
[ ] Làm export .txt
[ ] Lưu project
[ ] Làm landing page
[ ] Thêm pricing
[ ] Deploy Vercel
[ ] Làm video demo
```

## 23. Kết luận

Sản phẩm nên làm là:

```text
SRT2Prompt
```

Đây là tool cho người làm video YouTube faceless.

Chức năng chính:

```text
Dán SRT / script
→ Chia cảnh
→ Tạo prompt ảnh
→ Tạo thumbnail prompt
→ Tạo title
→ Tạo description
→ Tạo hashtag
```

Mục tiêu bản đầu:

```text
Làm nhỏ, chạy được, dễ demo, dễ bán.
```
