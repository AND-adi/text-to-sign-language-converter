# COMRADE Backend API

A comprehensive backend system for the COMRADE accessibility widget with API token management, user settings storage, and cross-site integration capabilities.

## 🚀 Features

- **API Token Management**: Generate, validate, and manage API tokens for different websites
- **User Settings Storage**: Store and sync accessibility preferences across sessions
- **Multiple Accessibility Profiles**:
  - Standard UI
  - Dyslexia Support (enhanced spacing, larger text)
  - ADHD Focus Mode (keyword highlighting, tooltips)
  - Low Vision Support (high contrast, larger fonts)
  - Motor Impairment (larger click targets, reduced motion)
- **Admin Dashboard**: Web-based interface for token management
- **Embeddable Widget**: Easy-to-integrate JavaScript widget for any website
- **CORS Enabled**: Works across different domains
- **Persistent Storage**: JSON-based file storage (easily upgradeable to database)

---

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn

---

## 🛠️ Installation

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables** (optional):
   Create a `.env` file in the backend directory:
   ```env
   PORT=3000
   ADMIN_KEY=your_secure_admin_key_here
   ```

4. **Start the server**:
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3000`

---

## 📡 API Endpoints

### Health Check
```
GET /api/health
```
Check if the API is running.

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### Generate API Token
```
POST /api/tokens/generate
```
Generate a new API token for a website.

**Request Body**:
```json
{
  "domain": "example.com",
  "description": "Production website",
  "adminKey": "your_admin_key"
}
```

**Response**:
```json
{
  "success": true,
  "token": "comrade_abc123...",
  "message": "Token generated successfully",
  "tokenData": {
    "token": "comrade_abc123...",
    "domain": "example.com",
    "description": "Production website",
    "active": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "lastUsed": null,
    "requestCount": 0
  }
}
```

---

### List All Tokens
```
GET /api/tokens/list?adminKey=YOUR_ADMIN_KEY
```
Retrieve all API tokens (admin only).

**Response**:
```json
{
  "tokens": [
    {
      "token": "comrade_abc123...",
      "domain": "example.com",
      "active": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "requestCount": 150
    }
  ]
}
```

---

### Validate Token
```
GET /api/tokens/validate
Headers: X-API-Token: your_token_here
```
Validate an API token.

**Response**:
```json
{
  "valid": true,
  "domain": "example.com",
  "message": "Token is valid"
}
```

---

### Deactivate Token
```
POST /api/tokens/deactivate
```
Deactivate an API token (admin only).

**Request Body**:
```json
{
  "token": "comrade_abc123...",
  "adminKey": "your_admin_key"
}
```

---

### Save User Settings
```
POST /api/settings/save
Headers: X-API-Token: your_token_here
```
Save user accessibility preferences.

**Request Body**:
```json
{
  "userId": "user_xyz",
  "profile": "dyslexia",
  "customSettings": {
    "fontSize": 1.2,
    "letterSpacing": 0.15
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Settings saved successfully"
}
```

---

### Load User Settings
```
GET /api/settings/load?userId=user_xyz
Headers: X-API-Token: your_token_here
```
Retrieve user accessibility preferences.

**Response**:
```json
{
  "profile": "dyslexia",
  "customSettings": {
    "fontSize": 1.2,
    "letterSpacing": 0.15
  },
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

### Get Available Profiles
```
GET /api/profiles
Headers: X-API-Token: your_token_here
```
Get list of available accessibility profiles.

**Response**:
```json
{
  "profiles": [
    {
      "id": "standard",
      "name": "Standard UI",
      "description": "Default interface without modifications"
    },
    {
      "id": "dyslexia",
      "name": "Dyslexia Support",
      "description": "Enhanced readability with adjusted spacing and fonts",
      "features": ["increased-spacing", "larger-text", "dyslexia-font-option"]
    }
  ]
}
```

---

## 🎨 Widget Integration

### Basic Integration

Add this script tag to any webpage:

```html
<script 
  src="http://localhost:3000/comrade-widget.js" 
  data-comrade-token="YOUR_API_TOKEN">
</script>
```

### Custom API URL

If hosting on a different domain:

```html
<script>
  window.COMRADE_API_URL = 'https://your-api-domain.com/api';
</script>
<script 
  src="https://your-api-domain.com/comrade-widget.js" 
  data-comrade-token="YOUR_API_TOKEN">
</script>
```

### Programmatic Control

The widget exposes a global API:

```javascript
// Activate a specific profile
window.COMRADE.activateProfile('dyslexia');

// Get current profile
const current = window.COMRADE.getCurrentProfile();

// Manually save settings
window.COMRADE.saveSettings();

// Reload settings from server
window.COMRADE.loadSettings();
```

---

## 🔐 Admin Dashboard

Access the admin dashboard at `http://localhost:3000/admin.html`

**Default Admin Key**: `comrade_admin_key_change_me`

**Features**:
- Generate new API tokens
- View all tokens and their statistics
- Deactivate tokens
- Copy integration code snippets
- Monitor token usage

---

## 📁 Project Structure

```
backend/
├── server.js              # Main Express server
├── package.json          # Node.js dependencies
├── README.md            # This file
├── data/                # JSON database files (auto-created)
│   ├── tokens.json      # API tokens
│   └── settings.json    # User settings
└── public/              # Static files
    ├── comrade-widget.js    # Embeddable widget
    ├── admin.html          # Admin dashboard
    └── example.html        # Integration example
```

---

## 🧪 Testing the System

1. **Start the server**:
   ```bash
   npm start
   ```

2. **Open admin dashboard**:
   Navigate to `http://localhost:3000/admin.html`

3. **Generate a token**:
   - Login with admin key: `comrade_admin_key_change_me`
   - Enter domain (e.g., "localhost") and description
   - Click "Generate Token"
   - Copy the generated token

4. **Test the widget**:
   - Open `http://localhost:3000/example.html`
   - Update the token in the script tag with your generated token
   - Click the accessibility button (♿) in the bottom-right
   - Try different profiles!

---

## 🎯 Accessibility Profiles

### 1. Standard UI
Default interface without modifications.

### 2. Dyslexia Support
- Increased letter spacing (0.12em)
- Increased word spacing (0.16em)
- Larger line height (1.8)
- 10% larger font size

### 3. ADHD Focus Mode
- 15% larger font size
- Automatic keyword highlighting
- Keywords: important, note, warning, attention, focus, key, critical
- Yellow highlighting for better visibility

### 4. Low Vision Support
- 30% larger font size
- Bold text throughout
- High contrast mode (1.5x contrast)
- Simplified color scheme

### 5. Motor Impairment
- Minimum 44x44px click targets
- Larger button padding
- Reduced motion (no animations)
- Enhanced keyboard navigation

---

## 🔒 Security Considerations

### Production Deployment

1. **Change the admin key**:
   ```env
   ADMIN_KEY=your_very_secure_random_key_here
   ```

2. **Use HTTPS**: Always serve the API and widget over HTTPS in production

3. **Implement rate limiting**: Add rate limiting to prevent abuse
   ```bash
   npm install express-rate-limit
   ```

4. **Add proper authentication**: Consider JWT tokens for admin access

5. **Database upgrade**: Replace JSON files with a proper database (MongoDB, PostgreSQL, etc.)

6. **Environment variables**: Use `.env` file and never commit secrets

---

## 🚀 Deployment

### Heroku

```bash
heroku create comrade-api
heroku config:set ADMIN_KEY=your_secure_key
git push heroku main
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t comrade-backend .
docker run -p 3000:3000 -e ADMIN_KEY=your_key comrade-backend
```

### VPS/Cloud Server

1. Install Node.js on your server
2. Clone the repository
3. Install dependencies: `npm install --production`
4. Set up a process manager (PM2):
   ```bash
   npm install -g pm2
   pm2 start server.js --name comrade-api
   pm2 save
   ```
5. Configure nginx as reverse proxy
6. Set up SSL with Let's Encrypt

---

## 🛠️ Customization

### Adding New Profiles

Edit `server.js`, add to the `/api/profiles` endpoint:

```javascript
{
  id: 'custom-profile',
  name: 'Custom Profile',
  description: 'Your custom accessibility profile',
  features: ['feature-1', 'feature-2']
}
```

Then update `comrade-widget.js` to handle the new profile in the `activateProfile()` function.

### Custom CSS Modifications

Add new CSS rules in `comrade-widget.js` under the `widgetStyles` constant:

```javascript
body.comrade-custom-profile {
  /* Your custom styles */
}
```

---

## 📊 Database Schema

### Tokens (tokens.json)
```json
{
  "tokens": [
    {
      "token": "comrade_...",
      "domain": "example.com",
      "description": "Production site",
      "active": true,
      "createdAt": "ISO timestamp",
      "lastUsed": "ISO timestamp",
      "requestCount": 0,
      "deactivatedAt": "ISO timestamp (optional)"
    }
  ]
}
```

### Settings (settings.json)
```json
{
  "settings": {
    "token_userId": {
      "profile": "dyslexia",
      "customSettings": {},
      "updatedAt": "ISO timestamp"
    }
  }
}
```

---

## 🐛 Troubleshooting

### Widget not loading
- Check console for errors
- Verify API token is correct
- Ensure CORS is enabled
- Check network tab for failed requests

### Settings not saving
- Verify token is valid
- Check browser localStorage
- Ensure API endpoint is accessible

### Admin dashboard not working
- Verify admin key is correct
- Check server logs for errors
- Ensure server is running

---

## 📝 License

MIT License - feel free to use this in your projects!

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📧 Support

For issues and questions, please open an issue on GitHub or contact the development team.

---

**Made with ❤️ for accessibility**
