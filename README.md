# OganiAngular

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.3.17.

## Hướng dẫn cài đặt và chạy ứng dụng

1. Đảm bảo bạn đã cài đặt Node.js và npm:
   - Kiểm tra bằng lệnh: `node -v` và `npm -v`
   - Nếu chưa cài đặt, tải về từ [nodejs.org](https://nodejs.org/)

2. Cài đặt Angular CLI:
   ```
   npm install -g @angular/cli
   ```

3. Di chuyển vào thư mục dự án:
   ```
   cd ogani-angular
   ```

4. Cài đặt các dependencies:
   ```
   npm install
   ```

5. Đảm bảo các thư mục tài nguyên đã được di chuyển vào đúng vị trí:
   - `css` → `ogani-angular/src/assets/css`
   - `js` → `ogani-angular/src/assets/js`
   - `img` → `ogani-angular/src/assets/img`
   - `fonts` → `ogani-angular/src/assets/fonts`

6. Tạo thư mục assets nếu chưa có:
   ```
   mkdir -p src/assets/css src/assets/js src/assets/img src/assets/fonts
   ```

7. Chạy ứng dụng:
   ```
   ng serve
   ```

8. Truy cập ứng dụng tại địa chỉ: `http://localhost:4200/`

## Xử lý lỗi thường gặp

1. **Lỗi về jQuery và các plugin**: Đảm bảo rằng các tệp JS đã được đặt đúng vị trí và được import trong `index.html`

2. **Lỗi CORS khi tải tài nguyên**: Di chuyển tất cả tài nguyên vào thư mục assets và sử dụng đường dẫn tương đối

3. **Lỗi TypeScript**: Đã được sửa trong các component để xử lý vấn đề với context `this` trong jQuery callbacks

## Cấu trúc dự án

- `/src/app/pages`: Chứa các component trang (Home, Shop, Blog, Contact, etc.)
- `/src/app/shared`: Chứa các component dùng chung (Header, Footer, Sidebar)
- `/src/assets`: Chứa các tài nguyên tĩnh (CSS, JS, Images, Fonts)

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
