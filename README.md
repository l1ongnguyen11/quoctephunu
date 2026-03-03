# Web Chúc mừng 8/3 - Ngày Quốc tế Phụ nữ

Website kỷ niệm ngày 8 tháng 3 với tông màu hồng chủ đạo.

## Cách sử dụng

1. Mở file `index.html` trong trình duyệt (Chrome, Edge, Firefox...)
2. **Màn hình khóa**: Nhập mật mã mặc định `0803` để vào trang chính
3. **Trang chính** có 4 ô:
   - **Nhạc**: Thêm file MP3 (kéo thả hoặc chọn file) để nghe nhạc
   - **Thư**: Xem bức thư — có thể sửa nội dung trong `index.html` tại `#letter-body`
   - **Ảnh**: Bỏ ảnh vào thư mục `images/` và thêm tên file vào `images/photos.json`
   - **Quà**: Bông hoa và trái tim/chữ rơi xuống

## Thêm ảnh

1. Copy ảnh vào thư mục `images/` (vd: `anh1.jpg`, `anh2.png`)
2. Mở file `images/photos.js` và thêm tên file vào mảng `PHOTO_FILES`, ví dụ: `["anh1.jpg", "anh2.png"]`

Hoạt động cả khi mở trực tiếp `index.html` hoặc qua HTTP.

## Tùy chỉnh

- **Đổi mật mã**: Sửa biến `PASSCODE` trong `app.js` (dòng đầu)
- **Đổi ảnh màn hình khóa**: Thay file `images/lock-avatar.svg` bằng ảnh của bạn (hoặc đổi `src` trong `index.html` sang `images/ten-anh-cua-ban.png`)
- **Sửa nội dung thư**: Chỉnh trong `index.html` tại `<div class="letter-body">`
- **Đổi lời rơi trong Quà**: Sửa mảng `GIFT_MESSAGES` trong `app.js`

## Chạy local server (nếu cần)

Một số tính năng có thể yêu cầu chạy qua HTTP. Dùng VS Code Live Server hoặc:

```bash
npx serve .
```
