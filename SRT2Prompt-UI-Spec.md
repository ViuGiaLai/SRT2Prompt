# UI SPEC CHI TIẾT — SRT2Prompt

## 1. Phong cách UI tổng thể

SRT2Prompt nên có giao diện:

```text
Sạch
Tối giản
Hiện đại
Giống công cụ sản xuất nội dung
Không giống chatbot AI
Không giống app edit video nặng
```

Phong cách nên theo hướng:

```text
Creator SaaS + Storyboard Workspace
```

Tức là người dùng vào tool sẽ thấy cảm giác như đang làm việc với **kịch bản video**, không phải đang chat với AI.

---

# 2. Màu sắc đề xuất

## Chủ đề chính

Nên dùng **Dark Mode** làm mặc định vì hợp với creator, video, horror story, AI workflow.

```text
Background chính: #0B0F19
Card: #111827
Card phụ: #1F2937
Text chính: #F9FAFB
Text phụ: #9CA3AF
Border: #374151
Accent: #8B5CF6
Accent phụ: #22C55E
Warning: #F59E0B
Error: #EF4444
```

## Cảm giác thương hiệu

```text
Tím = AI / creative
Xanh lá = generated / success
Đen xanh = video workspace
```

Không nên dùng quá nhiều màu. Chỉ cần:

```text
đen + trắng + xám + tím
```

---

# 3. Font chữ

Nên dùng:

```text
Inter
Geist
Satoshi
Manrope
```

Font chính:

```text
Inter
```

Cỡ chữ:

```text
Heading lớn: 40–56px
Heading trang: 28–32px
Title card: 18–20px
Body: 14–16px
Small text: 12–13px
```

---

# 4. Layout tổng thể của app

App có 2 phần chính:

```text
1. Public website
2. Dashboard app
```

---

# 5. Public Website

## 5.1 Trang Home / Landing Page

URL:

```text
/
```

Mục tiêu:

```text
Giải thích tool là gì
Cho người dùng thấy lợi ích nhanh
Có nút bắt đầu dùng
Có demo output
Có pricing
```

### Hero Section

Bố cục:

```text
Bên trái: headline + mô tả + button
Bên phải: mockup output của tool
```

Text đề xuất:

```text
Turn SRT into YouTube-ready content packs.
```

Subtext:

```text
Generate scene prompts, thumbnail prompts, titles, descriptions, hashtags, and keywords from your script or subtitle file.
```

Button:

```text
Start Creating
View Demo
```

### Hero mockup

Hiển thị một khung giả lập:

```text
Input: hospital-night-shift.srt

Generated:
✓ 12 scene prompts
✓ 5 title ideas
✓ 1 thumbnail prompt
✓ Description
✓ Hashtags
```

### Section: How it works

3 bước:

```text
1. Paste your SRT or script
2. Choose video type and image style
3. Generate your content pack
```

Hiển thị bằng 3 card ngang.

### Section: Who is it for

Các card:

```text
Horror Story Channels
Faceless YouTubers
TikTok Story Creators
AI Video Makers
Subtitle Translators
```

### Section: Output Preview

Hiển thị preview:

```text
Scene 1-3
A dark cinematic illustration of...

Scene 4-7
A quiet hospital hallway...

Thumbnail Prompt
A security guard standing...
```

### Section: Pricing

3 gói:

```text
Free
Creator
Pro
```

### Footer

Có:

```text
Product
Pricing
Terms
Privacy
Contact
```

---

# 6. Auth UI

## 6.1 Login Page

URL:

```text
/login
```

Layout:

```text
Bên trái: form login
Bên phải: preview tool
```

Form:

```text
Email
Password
Continue with Google
Login button
Forgot password
```

UI text:

```text
Welcome back
Continue creating your video content packs.
```

## 6.2 Register Page

URL:

```text
/register
```

Text:

```text
Create your workspace
Generate your first content pack in minutes.
```

Form:

```text
Name
Email
Password
Create account
Continue with Google
```

---

# 7. Dashboard Layout

Sau khi đăng nhập, app dùng layout:

```text
Sidebar bên trái
Topbar phía trên
Main workspace ở giữa
```

## Sidebar

Menu:

```text
Dashboard
Generate
Projects
Templates
History
Pricing
Settings
```

Dưới cùng:

```text
Usage: 3 / 10 generations
Upgrade button
```

## Topbar

Có:

```text
Search project
Theme toggle
User avatar
New Generate button
```

---

# 8. Dashboard Home

URL:

```text
/dashboard
```

Mục tiêu:

```text
Cho người dùng thấy nhanh họ có thể làm gì
Hiển thị project gần đây
Hiển thị số lượt generate còn lại
```

Layout:

```text
Welcome card
Quick action cards
Recent projects
Usage card
```

## Welcome Card

Text:

```text
Welcome back, Viu
Ready to turn your next script into a video content pack?
```

Button:

```text
Generate New Pack
```

## Quick Actions

4 card:

```text
Paste Script
Upload SRT
Create Horror Story Pack
Translate Subtitle
```

## Recent Projects

Table:

```text
Project name | Type | Style | Created | Action
```

Ví dụ:

```text
Night Shift Hospital | Horror | Dark Cinematic | Today | Open
```

---

# 9. Generate Page — Trang quan trọng nhất

URL:

```text
/dashboard/generate
```

Đây là màn hình chính của sản phẩm.

## Layout desktop

Chia thành 2 cột:

```text
Cột trái: Input + settings
Cột phải: Output preview
```

Tỷ lệ:

```text
Left: 45%
Right: 55%
```

---

## 9.1 Cột trái — Input Panel

Card lớn tên:

```text
Create Content Pack
```

### Input Type

Tabs:

```text
Paste Text
Upload SRT
```

### Textarea

Placeholder:

```text
Paste your SRT or script here...
```

Chiều cao:

```text
400px
```

Bên dưới textarea có info:

```text
Characters: 0
Subtitle lines: 0
Estimated scenes: 0
```

### Upload SRT

Khi chọn Upload SRT, hiện dropzone:

```text
Drop your .srt file here
or click to upload
```

Sau khi upload:

```text
File: story.srt
Subtitle lines: 128
Duration: 17:42
```

---

## 9.2 Settings Panel

Nằm dưới input.

### Video Type

Dropdown:

```text
Horror Story
Mystery Story
Reddit Story
Bedtime Story
Educational
Product Review
Shorts
```

### Image Style

Dạng card chọn style:

```text
2D Minimal
Dark Cinematic
Semi Realistic
Anime Inspired
Children Book
Comic Panel
```

Mỗi style là 1 card nhỏ có:

```text
Icon
Tên style
Mô tả 1 dòng
```

Ví dụ:

```text
Dark Cinematic
Moody, dramatic, high contrast visuals.
```

### Output Language

Radio:

```text
English
Vietnamese
Both
```

### Scene Grouping

Dropdown:

```text
Auto
Short scenes: 1–3 subtitle lines
Medium scenes: 4–7 subtitle lines
Long scenes: 8–12 subtitle lines
```

### Extra Options

Checkbox:

```text
Generate thumbnail prompt
Generate YouTube titles
Generate description
Generate hashtags
Generate keywords
Translate SRT
```

Mặc định bật:

```text
Scene prompts
Thumbnail prompt
Titles
Description
Hashtags
```

### Generate Button

Button lớn:

```text
Generate Content Pack
```

Trạng thái:

```text
Normal: Generate Content Pack
Loading: Generating...
Success: Generated
Error: Try Again
```

---

# 10. Output Panel

Cột phải là nơi hiển thị kết quả.

## Khi chưa generate

Empty state:

```text
Your content pack will appear here.
Paste a script or upload an SRT file to get started.
```

Có illustration nhỏ dạng:

```text
Script → Scenes → Prompts → YouTube Pack
```

## Khi đang loading

Hiển thị progress:

```text
Analyzing script...
Grouping scenes...
Writing image prompts...
Creating titles...
Generating thumbnail prompt...
```

Dùng skeleton card, không chỉ spinner.

## Khi generate xong

Hiển thị dạng tab:

```text
Overview
Scene Prompts
Thumbnail
Titles
Description
Hashtags
Export
```

---

# 11. Output Tab: Overview

Hiển thị:

```text
Video Summary
Estimated Video Length
Number of Scenes
Best Use Case
```

Card ví dụ:

```text
Summary
A night-shift security guard accepts a job at an old hospital and discovers that a strange list of rules may be real.

Video Type
Horror Story

Scenes
18 scenes

Style
Dark Cinematic
```

---

# 12. Output Tab: Scene Prompts

Đây là phần quan trọng nhất.

Không nên hiển thị thành văn bản dài.
Nên hiển thị bằng **storyboard cards**.

## Mỗi Scene Card gồm:

```text
Scene range
Timestamp
Short scene summary
Image prompt
Copy button
Regenerate button
```

Ví dụ UI:

```text
Scene 1–3
00:00:00 → 00:00:45

Summary:
A night-shift guard introduces himself and explains why he works at night.

Image Prompt:
A dark cinematic 2D illustration of a tired night security guard standing outside a quiet hospital at dusk, soft shadows, empty street, tense atmosphere, no gore.

[Copy Prompt] [Regenerate]
```

## Card actions

Mỗi card có:

```text
Copy Prompt
Copy Summary
Regenerate
Edit
Delete
```

## Scene card màu

```text
Border tím nhẹ
Background xám đậm
Scene number badge màu tím
Copy button màu xanh
```

---

# 13. Output Tab: Thumbnail

Hiển thị:

```text
Thumbnail Prompt
Thumbnail Text Suggestions
Composition Notes
```

Ví dụ:

```text
Thumbnail Prompt:
A terrified security guard standing in front of a dark hospital door, flashlight in hand, dramatic shadows, YouTube horror thumbnail, high contrast, text space on the left.

Text Overlay:
DO NOT BREAK THE RULES
```

Buttons:

```text
Copy Thumbnail Prompt
Regenerate
```

---

# 14. Output Tab: Titles

Hiển thị 5–10 title options.

Mỗi title là 1 card nhỏ:

```text
Title 1
I Worked the Night Shift at a Hospital. The Rules Were Real.

[Copy] [Use as Project Title]
```

Có badge:

```text
Curiosity
Horror
Mystery
Short
Long
```

---

# 15. Output Tab: Description

Hiển thị textarea editable:

```text
A night-shift security guard takes a strange job at an old hospital...
```

Buttons:

```text
Copy
Rewrite Shorter
Rewrite More Dramatic
```

Bên dưới có warning nhỏ:

```text
Review before publishing.
```

---

# 16. Output Tab: Hashtags

Hiển thị dạng pill:

```text
#horrorstory
#scarystory
#creepypasta
#mysterystory
#facelessyoutube
```

Buttons:

```text
Copy All
Copy YouTube Tags
```

---

# 17. Output Tab: Export

Cho export:

```text
Export as .txt
Export as .md
Export as .json
Copy Full Pack
```

Bản Pro mới có:

```text
Export .srt
Export CSV
Save as Template
```

---

# 18. Project Detail Page

URL:

```text
/dashboard/projects/[id]
```

Trang này dùng để xem lại project đã generate.

Layout:

```text
Header project
Tabs output
Right sidebar metadata
```

Header:

```text
Night Shift Hospital
Horror Story · Dark Cinematic · Created Today
```

Actions:

```text
Edit
Duplicate
Export
Delete
```

Right sidebar:

```text
Input type: SRT
Subtitle lines: 124
Scenes: 18
Language: English
Created: Today
```

---

# 19. Projects Page

URL:

```text
/dashboard/projects
```

Hiển thị danh sách project.

## Bộ lọc

```text
All
Horror
Mystery
Education
Shorts
```

## Search

```text
Search projects...
```

## Project cards

Mỗi project card:

```text
Project title
Video type
Scene count
Created date
Style
Open button
```

---

# 20. Templates Page

URL:

```text
/dashboard/templates
```

Dùng để chọn workflow nhanh.

Template card:

```text
Horror Story Pack
Reddit Story Pack
YouTube Shorts Pack
Educational Video Pack
Product Review Pack
```

Mỗi template có:

```text
Use Template
Preview Output
```

Template quan trọng nhất:

```text
Horror Story Pack
```

Cấu hình sẵn:

```text
Video type: Horror Story
Style: Dark Cinematic
Language: English
Scene grouping: Medium
```

---

# 21. History Page

URL:

```text
/dashboard/history
```

Dùng để xem lịch sử generate.

Table:

```text
Date | Project | Type | Tokens | Status | Action
```

Status:

```text
Completed
Failed
Draft
```

---

# 22. Pricing Page trong Dashboard

URL:

```text
/dashboard/pricing
```

Hiển thị gói:

## Free

```text
3 generations/day
20 subtitle lines
Basic scene prompts
No export
```

## Creator

```text
$5/month
100 generations/month
Long SRT support
Export TXT/MD
Thumbnail prompts
```

## Pro

```text
$9/month
Unlimited projects
Advanced templates
Export JSON/CSV
Priority generation
```

Button:

```text
Upgrade
```

---

# 23. Settings Page

URL:

```text
/dashboard/settings
```

Có các tab:

```text
Account
Billing
Preferences
API Key
```

## Preferences

Cho người dùng chọn mặc định:

```text
Default language
Default video type
Default image style
Default output format
```

Ví dụ:

```text
Default video type: Horror Story
Default image style: Dark Cinematic
```

---

# 24. Mobile UI

Trên mobile không chia 2 cột.

Layout mobile:

```text
Input ở trên
Settings ở dưới
Generate button sticky bottom
Output nằm sau khi generate
```

## Mobile Generate Page

Thứ tự:

```text
1. Header
2. Paste / Upload
3. Settings accordion
4. Generate button
5. Output tabs
```

Generate button dính dưới màn hình:

```text
[ Generate Content Pack ]
```

Scene cards full width.

---

# 25. Component cần code

## Core components

```text
AppSidebar
Topbar
GeneratorForm
SrtInput
UploadDropzone
VideoTypeSelect
ImageStylePicker
LanguageSelect
OutputTabs
ScenePromptCard
ThumbnailPromptCard
TitleOptions
DescriptionEditor
HashtagPills
ExportPanel
UsageLimitCard
PricingCard
ProjectCard
```

---

# 26. UI State cần có

## Empty State

Khi chưa có dữ liệu:

```text
No content yet.
Paste your script or upload an SRT file to generate your first pack.
```

## Loading State

```text
Generating your content pack...
```

Hiển thị checklist:

```text
✓ Reading subtitle
✓ Grouping scenes
✓ Writing image prompts
✓ Creating YouTube metadata
```

## Error State

```text
Something went wrong.
Please check your input and try again.
```

Button:

```text
Try Again
```

## Limit State

Khi hết lượt free:

```text
You have used all free generations for today.
Upgrade to continue generating.
```

Button:

```text
Upgrade
```

---

# 27. Wireframe tổng quát

## Generate Page Desktop

```text
┌──────────────────────────────────────────────────────────────┐
│ Sidebar │ Topbar: Search | New Generate | Avatar             │
│         ├────────────────────────────────────────────────────┤
│         │                                                    │
│         │  ┌──────────────────────┐  ┌────────────────────┐ │
│         │  │ Input                │  │ Output Preview      │ │
│         │  │                      │  │                    │ │
│         │  │ [Paste SRT]          │  │ Overview | Scenes   │ │
│         │  │                      │  │                    │ │
│         │  │ Video Type           │  │ Scene 1-3 Card      │ │
│         │  │ Image Style          │  │ Scene 4-7 Card      │ │
│         │  │ Language             │  │ Scene 8-10 Card     │ │
│         │  │                      │  │                    │ │
│         │  │ [Generate]           │  │ [Export]           │ │
│         │  └──────────────────────┘  └────────────────────┘ │
│         │                                                    │
└──────────────────────────────────────────────────────────────┘
```

---

# 28. UI khác biệt để không giống tool AI chung chung

Không làm:

```text
Một ô chat
Một nút Send
AI trả lời một cục text dài
```

Nên làm:

```text
Storyboard cards
Tabs rõ ràng
Copy từng phần
Export rõ ràng
Scene range rõ ràng
Template workflow
```

Điểm khác biệt:

```text
Người dùng không cảm thấy đang chat.
Người dùng cảm thấy đang sản xuất video.
```

---

# 29. Trang Generate nên có 3 chế độ xem

## Mode 1: Simple

Cho người mới:

```text
Paste SRT
Choose Style
Generate
```

## Mode 2: Advanced

Cho người chuyên nghiệp:

```text
Scene grouping
Output language
Prompt length
Thumbnail text
Hashtag count
Title tone
```

## Mode 3: Batch

Cho bản Pro sau này:

```text
Upload nhiều SRT
Generate nhiều content pack một lúc
```

Bản đầu chỉ làm Simple + một ít Advanced.

---

# 30. Cấu trúc kết quả đẹp nhất

Output không nên là text dài.

Nên chia thành:

```text
1. Summary card
2. Scene prompt cards
3. Thumbnail card
4. Title cards
5. Description editor
6. Hashtag pills
7. Export buttons
```

Đây là điểm giúp UI nhìn chuyên nghiệp.

---

# 31. Copywriting trong app

## Button text

```text
Generate Content Pack
Copy Prompt
Copy All
Export
Regenerate
Save Project
Upgrade
```

## Label text

```text
Video Type
Image Style
Output Language
Scene Grouping
Thumbnail Prompt
YouTube Titles
Description
Hashtags
Keywords
```

## Empty text

```text
Your content pack will appear here.
```

## Loading text

```text
Turning your script into a creator-ready content pack...
```

---

# 32. Landing Page copy

Headline:

```text
Turn SRT files into ready-to-use video content packs.
```

Subheadline:

```text
Generate scene prompts, thumbnail prompts, YouTube titles, descriptions, hashtags, and keywords from your script or subtitle file.
```

CTA:

```text
Start Free
Generate Demo
```

Feature cards:

```text
Scene Prompt Generator
Thumbnail Prompt Generator
YouTube Metadata Generator
SRT Translator
Project History
Export Tools
```

---

# 33. UX Flow chính

## Flow 1: Người dùng mới

```text
Vào landing page
→ Bấm Start Free
→ Đăng ký
→ Vào dashboard
→ Dán SRT
→ Chọn Horror Story
→ Chọn Dark Cinematic
→ Generate
→ Copy scene prompts
```

## Flow 2: Người dùng quay lại

```text
Login
→ Dashboard
→ New Generate
→ Upload SRT
→ Generate
→ Export .txt
```

## Flow 3: Người dùng hết lượt

```text
Generate
→ Báo hết lượt
→ Hiện pricing
→ Upgrade
```

---

# 34. Cái nên ưu tiên code trước

Thứ tự code UI:

```text
1. Dashboard layout
2. Generate page
3. Input textarea
4. Settings panel
5. Output tabs
6. Scene prompt cards
7. Copy buttons
8. Export button
9. Projects page
10. Landing page
```

Đừng làm pricing trước nếu tool chưa generate được.

---

# 35. MVP UI tối thiểu

Bản đầu tiên chỉ cần:

```text
Landing page đơn giản
Login page
Dashboard Generate page
Output scene cards
Copy button
Export TXT
```

Không cần:

```text
Template page
History nâng cao
Billing đẹp
Batch generate
Mobile app riêng
```

---

# 36. Kết luận UI

UI của SRT2Prompt nên là:

```text
Một workspace giúp creator biến SRT/script thành storyboard prompt pack.
```

Màn hình quan trọng nhất:

```text
Generate Page
```

Bố cục tốt nhất:

```text
Trái: Input + Settings
Phải: Output + Scene Cards
```

Điểm phải làm thật tốt:

```text
Scene Prompt Cards
Copy từng prompt
Thumbnail Prompt
Title Options
Export
```

Câu nhớ khi thiết kế:

```text
Không làm chatbot.
Hãy làm storyboard workspace.
```
