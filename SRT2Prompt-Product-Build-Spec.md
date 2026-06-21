# SRT2Prompt — Product & Build Specification

## 1. Tên sản phẩm

**SRT2Prompt**

## 2. Mục tiêu sản phẩm

SRT2Prompt là công cụ giúp creator biến **SRT hoặc script** thành bộ nội dung sẵn sàng để làm video YouTube/TikTok faceless.

Tool không tạo video.
Tool không edit video.
Tool chỉ tạo **nguyên liệu sản xuất video**.

## 3. Một câu định vị

```text
Turn SRT or scripts into scene prompts, thumbnail prompts, YouTube titles, descriptions, hashtags, and keywords.
```

Bản tiếng Việt:

```text
Biến SRT hoặc kịch bản thành prompt ảnh, thumbnail prompt, tiêu đề, mô tả, hashtag và từ khóa cho video faceless.
```

## 4. Người dùng mục tiêu

```text
- YouTube horror story creator
- Faceless YouTube creator
- TikTok story creator
- AI video maker
- Người làm video kể chuyện bằng ảnh + voice
```

## 5. Vấn đề của người dùng

Người dùng đang phải làm thủ công:

```text
Script/SRT
→ Đọc nội dung
→ Chia cảnh
→ Viết prompt ảnh
→ Viết thumbnail prompt
→ Nghĩ title
→ Viết description
→ Tạo hashtags
→ Copy qua nhiều công cụ khác nhau
```

Điều này mất thời gian và dễ bị sai format.

## 6. Giải pháp

SRT2Prompt gom toàn bộ workflow vào một màn hình:

```text
Dán SRT/script
→ Chọn loại video
→ Chọn style ảnh
→ Bấm Generate
→ Nhận content pack hoàn chỉnh
```

## 7. MVP cần làm

Bản đầu tiên chỉ cần:

```text
1. Dán SRT hoặc script
2. Upload file .srt
3. Chọn video type
4. Chọn image style
5. Chọn output language
6. Generate content pack bằng AI
7. Hiển thị output thành từng card
8. Copy từng phần
9. Export .txt
10. Lưu project
```

## 8. Chưa cần làm ở bản đầu

```text
- Không làm AI video generator
- Không làm AI voice
- Không làm editor giống CapCut
- Không làm mobile app riêng
- Không làm marketplace
- Không làm nhiều tính năng phức tạp
```

## 9. Tech stack

```text
Frontend: Next.js
UI: Tailwind CSS + shadcn/ui
Backend: Next.js API Route
Database: SQLite lúc đầu, PostgreSQL sau
AI: Gemini hoặc OpenAI
Deploy: Vercel
Payment sau này: Stripe hoặc LemonSqueezy
```

## 10. Repo nền

```text
nextjs/saas-starter
```

## 11. Thư viện cần thêm

```text
srt-parser-2
```

## 12. Cấu trúc thư mục

```text
src/
  app/
    dashboard/
      generate/
        page.tsx
      projects/
        page.tsx
    api/
      generate/
        route.ts

  components/
    generator/
      GeneratorForm.tsx
      SrtInput.tsx
      OutputTabs.tsx
      ScenePromptCard.tsx
      ThumbnailPromptCard.tsx
      TitleOptions.tsx
      HashtagPills.tsx
      ExportPanel.tsx

  lib/
    ai.ts
    prompts.ts
    srt.ts
    db.ts
    export.ts
```

## 13. Trang quan trọng nhất

```text
/dashboard/generate
```

Layout:

```text
Left panel:
- Input SRT/script
- Upload SRT
- Video type
- Image style
- Output language
- Generate button

Right panel:
- Overview
- Scene prompts
- Thumbnail prompt
- Titles
- Description
- Hashtags
- Export
```

## 14. Input người dùng

Tool nhận:

```text
- Plain script
- SRT subtitle
- File .srt
```

Ví dụ SRT:

```text
1
00:00:00,000 --> 00:00:05,000
I worked the night shift at an old hospital.

2
00:00:05,000 --> 00:00:10,000
My boss gave me a strange list of rules.
```

## 15. Output chuẩn

AI phải trả về JSON hoặc object có cấu trúc:

```json
{
  "summary": "",
  "videoType": "",
  "imageStyle": "",
  "language": "",
  "scenePrompts": [
    {
      "sceneRange": "1-3",
      "timestamp": "00:00:00,000 --> 00:00:30,000",
      "summary": "",
      "imagePrompt": ""
    }
  ],
  "thumbnail": {
    "prompt": "",
    "textOverlay": "",
    "compositionNotes": ""
  },
  "titles": [],
  "description": "",
  "hashtags": [],
  "keywords": []
}
```

## 16. Video type

Bản đầu nên có:

```text
Horror Story
Mystery Story
Reddit Story
Educational
Shorts
Product Review
```

## 17. Image style

Bản đầu nên có:

```text
Dark Cinematic
2D Minimal
Semi Realistic
Anime Inspired
Comic Panel
Children Book
```

## 18. Database tối thiểu

### projects

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
updated_at
```

### generations

```text
id
project_id
summary
scene_prompts_json
thumbnail_json
titles_json
description
hashtags_json
keywords_json
created_at
```

## 19. Free/Pro sau này

### Free

```text
3 generations/day
20 subtitle lines
Copy output
No export
```

### Pro

```text
Long SRT
Export TXT/MD/JSON
Save projects
More templates
More style presets
```

## 20. Quy tắc sản phẩm

Sản phẩm phải theo 5 nguyên tắc:

```text
1. Không giống chatbot
2. Output phải chia card rõ ràng
3. Copy từng phần thật nhanh
4. Prompt phải dùng được ngay
5. Không làm quá rộng
```

## 21. Câu nhớ khi làm

```text
Dán SRT vào → nhận bộ nội dung để làm video.
```

Đây là chức năng lõi.
Mọi thứ khác làm sau.
