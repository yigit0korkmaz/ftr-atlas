import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({plugins:[react()],base:'/ftr-atlas/',build:{outDir:'dist',target:'es2022',rolldownOptions:{output:{codeSplitting:{groups:[{name:'clinical-content',test:/clinical-bank\.json/},{name:'vendor',test:/node_modules/}]}}}}});
