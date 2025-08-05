# 🎯 Outline API Client Demo

Interactive demonstration of the Outline API Client library with a user-friendly web interface.

## 🚨 Important: Browser Limitations

This demo runs in the browser and faces CORS (Cross-Origin Resource Sharing) restrictions when connecting to the Outline API. This is a browser security feature that prevents direct API calls to different domains.

### Why CORS Matters

Browsers block requests to different origins unless the server explicitly allows them. Since Outline's API is designed for server-side use, it doesn't enable CORS headers by default.

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/aid-on-libs/outline-api-client.git
cd outline-api-client/demo

# Install dependencies
npm install

# Start the development server
npm run demo:dev

# Build for production
npm run demo:build
```

The demo will be available at `http://localhost:5173`

## 🔧 Setup Options

### Option 1: Vite Proxy Configuration (Recommended)

Create or modify `vite.config.ts` in the demo directory:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://your-outline-instance.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
        headers: {
          'Origin': 'https://your-outline-instance.com'
        }
      }
    }
  }
});
```

Then in the demo, use `/api` as your API URL instead of the full Outline URL.

### Option 2: Custom Proxy Server

Create a simple proxy server using Express:

```javascript
// proxy-server.js
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();

// Enable CORS for your demo
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Proxy all /api requests to Outline
app.use('/api', createProxyMiddleware({
  target: 'https://your-outline-instance.com',
  changeOrigin: true,
  onProxyReq: (proxyReq, req) => {
    // Add your API key here
    proxyReq.setHeader('Authorization', `Bearer ${process.env.OUTLINE_API_KEY}`);
  }
}));

app.listen(3001, () => {
  console.log('Proxy server running on http://localhost:3001');
});
```

Run the proxy server:
```bash
OUTLINE_API_KEY=your-api-key node proxy-server.js
```

### Option 3: Nginx Reverse Proxy

For production deployments, use Nginx:

```nginx
server {
    listen 80;
    server_name demo.yourdomain.com;

    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass https://your-outline-instance.com/api;
        proxy_set_header Host your-outline-instance.com;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Add CORS headers
        add_header 'Access-Control-Allow-Origin' '$http_origin' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type' always;
        
        if ($request_method = 'OPTIONS') {
            return 204;
        }
    }
}
```

## 🎨 Demo Features

The demo application showcases:

- 🔐 **Authentication** - Test API connection and view user info
- 📄 **Document Operations** - List, search, create, update, and delete documents
- 📁 **Collection Management** - Browse and manage collections
- 🔍 **Search Functionality** - Full-text search across your knowledge base
- 📤 **Export Options** - Export documents in different formats
- 🎯 **Real-time Updates** - See API responses and errors in real-time

## 🛠️ Development

### Project Structure

```
demo/
├── src/
│   ├── components/      # React components
│   ├── hooks/          # Custom React hooks
│   ├── services/       # API service layer
│   ├── types/          # TypeScript types
│   └── App.tsx         # Main application
├── public/             # Static assets
├── index.html          # Entry HTML
└── vite.config.ts      # Vite configuration
```

### Environment Variables

Create a `.env.local` file:

```bash
# API Configuration
VITE_OUTLINE_API_URL=http://localhost:3001/api  # Your proxy URL
VITE_OUTLINE_API_KEY=your-api-key               # Only for development

# Demo Configuration
VITE_DEMO_MODE=development                       # or production
VITE_ENABLE_DEBUG=true                          # Show debug info
```

### Available Scripts

```bash
# Development
npm run demo:dev        # Start dev server
npm run demo:build      # Build for production
npm run demo:preview    # Preview production build

# Testing
npm run test           # Run tests
npm run test:watch     # Run tests in watch mode

# Code Quality
npm run lint           # Lint code
npm run type-check     # Type check
```

## 🚀 Production Deployment

### Security Checklist

- [ ] Never expose API keys in client-side code
- [ ] Always use HTTPS in production
- [ ] Implement proper authentication on your proxy server
- [ ] Rate limit API requests
- [ ] Validate and sanitize all user inputs
- [ ] Use environment variables for sensitive configuration

### Deployment Options

1. **Vercel/Netlify** with serverless functions for proxying
2. **Docker** container with Node.js proxy server
3. **Traditional hosting** with Nginx reverse proxy

## 🆘 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| CORS errors | Ensure proxy is configured correctly |
| 401 Unauthorized | Check API key and permissions |
| Connection refused | Verify proxy server is running |
| Empty responses | Check API URL and network connectivity |

### Debug Mode

Enable debug mode to see detailed API requests:

```typescript
// In your code
window.DEBUG_API = true;
```

Or set the environment variable:
```bash
VITE_ENABLE_DEBUG=true npm run demo:dev
```

## 📚 Resources

- [Outline API Documentation](https://www.getoutline.com/developers)
- [Vite Proxy Documentation](https://vitejs.dev/config/server-options.html#server-proxy)
- [CORS Explained](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [http-proxy-middleware](https://github.com/chimurai/http-proxy-middleware)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This demo is part of the Outline API Client project and is licensed under the MIT License.