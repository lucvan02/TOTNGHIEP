import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })


export default defineConfig({
  plugins: [react()],
  server: {
    port: 1234, // thay 3000 bằng cổng bạn muốn
    strictPort: true // nếu true thì chỉ dùng đúng cổng này, nếu đang bận sẽ báo lỗi
  }
});