import fs from 'fs';
import { execSync } from 'child_process';

const hasClientFolder = fs.existsSync('client');

if (hasClientFolder) {
  console.log('📦 [WarehouseFlow] Building client from repository root...');
  execSync('npm install --prefix client && npm run build --prefix client', { stdio: 'inherit' });

  if (fs.existsSync('client/dist')) {
    if (!fs.existsSync('dist')) {
      fs.mkdirSync('dist', { recursive: true });
    }
    fs.cpSync('client/dist', 'dist', { recursive: true });
  }
} else {
  console.log('📦 [WarehouseFlow] Building inside client directory...');
  execSync('npx vite build', { stdio: 'inherit' });

  if (fs.existsSync('dist')) {
    if (!fs.existsSync('client/dist')) {
      fs.mkdirSync('client/dist', { recursive: true });
    }
    fs.cpSync('dist', 'client/dist', { recursive: true });
  }
}

console.log('✅ [WarehouseFlow] Build completed successfully with all output directories ready!');
