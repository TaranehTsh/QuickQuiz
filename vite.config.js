import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { quizApiPlugin } from './server/quizApiPlugin.js'

export default defineConfig({
  plugins: [react(), quizApiPlugin()],
})
