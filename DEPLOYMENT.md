# Cherry Was Here - Deployment Guide

## 📋 Pre-requisitos

- Node.js 18+
- npm o yarn
- Git

## 🚀 Despliegue en Vercel

1. **Conectar con Vercel**:

   ```bash
   npm install -g vercel
   vercel login
   vercel
   ```

2. **Configurar variables de entorno**:

   - Copia `.env.example` a `.env.local`
   - Ajusta las variables según tu configuración

3. **Desplegar**:
   ```bash
   vercel --prod
   ```

## 🚀 Despliegue en Netlify

1. **Build del proyecto**:

   ```bash
   npm run build
   ```

2. **Desplegar en Netlify**:
   - Arrastra la carpeta `dist` a netlify.com
   - O conecta tu repositorio GitHub

## 🚀 Despliegue en GitHub Pages

1. **Instalar gh-pages**:

   ```bash
   npm install --save-dev gh-pages
   ```

2. **Agregar scripts al package.json**:

   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **Configurar vite.config.ts**:

   ```typescript
   export default defineConfig({
     base: "/cherry-was-here/",
     // ... resto de configuración
   });
   ```

4. **Desplegar**:
   ```bash
   npm run deploy
   ```

## 🚀 Despliegue en servidor propio

1. **Build del proyecto**:

   ```bash
   npm run build
   ```

2. **Configurar servidor web**:
   - Copia el contenido de `dist/` a tu servidor
   - Configura el servidor para SPA routing

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name tu-dominio.com;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Apache Configuration (.htaccess)

```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]
```

## 🔧 Configuración de Producción

### Variables de Entorno

```env
NODE_ENV=production
VITE_APP_NAME=Cherry Was Here
VITE_APP_VERSION=1.0.0
VITE_MAP_DEFAULT_ZOOM=1
VITE_ENABLE_ANALYTICS=true
```

### Optimizaciones

- Compresión gzip habilitada
- Cache de assets estáticos
- Minificación CSS/JS
- Tree shaking automático

## 📊 Monitoreo

### Google Analytics (opcional)

```typescript
// src/utils/analytics.ts
export const trackCountryVisit = (country: string) => {
  if (typeof gtag !== "undefined") {
    gtag("event", "country_visit", {
      country_name: country,
    });
  }
};
```

### Error Monitoring

```typescript
// src/utils/errorTracking.ts
export const trackError = (error: Error, context?: string) => {
  console.error("Error:", error, context);
  // Implementar servicio de error tracking
};
```

## 🛡️ Seguridad

- Validación de datos del usuario
- Sanitización de inputs
- Headers de seguridad configurados
- Rate limiting para APIs (si aplica)

## 📱 PWA (Progressive Web App)

Para convertir en PWA:

1. **Instalar Vite PWA plugin**:

   ```bash
   npm install -D vite-plugin-pwa
   ```

2. **Configurar en vite.config.ts**:

   ```typescript
   import { VitePWA } from "vite-plugin-pwa";

   export default defineConfig({
     plugins: [
       VitePWA({
         registerType: "autoUpdate",
         workbox: {
           globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
         },
       }),
     ],
   });
   ```

## 🔄 CI/CD

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: "--prod"
```

¡Tu aplicación Cherry Was Here está lista para el despliegue! 🎉
