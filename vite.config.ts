import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({plugins:[react()],base:'/ftr-atlas/',build:{outDir:'dist',target:'es2022',rolldownOptions:{output:{codeSplitting:{groups:[{name:'clinical-content',test:/(clinical-bank|expansion)\.json/,priority:30},{name:'motion',test:/node_modules.*(motion|framer)/,priority:20},{name:'radix',test:/node_modules.*radix-ui/,priority:15},{name:'vendor',test:/node_modules/}]}}}}});
