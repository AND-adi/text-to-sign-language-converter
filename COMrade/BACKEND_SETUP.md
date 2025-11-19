# COMRADE Backend - Quick Start Guide

## 🎯 Overview

The COMRADE backend enables your accessibility widget to work as an **overlay on any website** with:
- ✅ API token authentication system
- ✅ User settings storage across sessions
- ✅ Multiple accessibility profiles (Dyslexia, ADHD, Low Vision, Motor Impairment)
- ✅ Admin dashboard for token management
- ✅ Embeddable JavaScript widget

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

### Step 2: Start the Server

```bash
npm start
```

The server will run on `http://localhost:3000`

### Step 3: Access Admin Dashboard

1. Open your browser: `http://localhost:3000/admin.html`
2. Login with admin key: `comrade_admin_key_change_me`
3. Generate a new API token for your domain

### Step 4: Test the Widget

1. Open example page: `http://localhost:3000/example.html`
2. Replace the token in the script tag with your generated token
3. Click the accessibility button (♿) in bottom-right corner
4. Try different accessibility profiles!

---

## 🎨 How to Add Widget to Any Website

Simply add this one line to your HTML:

```html
<script src="http://localhost:3000/comrade-widget.js" 
        data-comrade-token="YOUR_API_TOKEN_HERE">
</script>
```

**That's it!** The accessibility widget will appear on your site.

---

## 🔧 What Does the Backend Do?

### 1. **API Token System**
- Generates unique tokens for each website
- Validates tokens on every request
- Tracks usage and statistics
- Admin can activate/deactivate tokens

### 2. **Settings Storage**
- Saves user accessibility preferences
- Syncs across browser sessions
- Stores per-user, per-site settings
- Privacy-focused (data isolated by token)

### 3. **Accessibility Profiles**

The widget provides 5 profiles:

| Profile | Changes |
|---------|---------|
| **Standard** | No modifications |
| **Dyslexia** | Increased spacing, larger text, better readability |
| **ADHD Focus** | Highlights key terms, larger fonts |
| **Low Vision** | High contrast, 30% larger text, bold fonts |
| **Motor Impairment** | Larger click targets (44px+), reduced motion |

### 4. **Cross-Site Overlay**
- Widget works on ANY website
- Non-intrusive floating button
- Customizable panel
- Respects existing site styles

---

## 📂 File Structure

```
backend/
├── server.js                 # Main API server
├── package.json             # Dependencies
├── README.md               # Full documentation
├── data/                   # Auto-created on first run
│   ├── tokens.json        # API tokens database
│   └── settings.json      # User settings database
└── public/                # Static files
    ├── comrade-widget.js  # Embeddable widget (main file!)
    ├── admin.html        # Token management dashboard
    └── example.html      # Demo integration
```

---

## 🔑 Key Features Explained

### Token Authentication
Each website gets a unique token like:
```
comrade_a8f3b2c1d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

This token:
- ✅ Identifies the website
- ✅ Prevents unauthorized use
- ✅ Tracks usage statistics
- ✅ Can be deactivated anytime

### Font & Text Changes
The widget modifies:
- Font size (1.1x - 1.3x depending on profile)
- Letter spacing (0.12em for dyslexia)
- Word spacing (0.16em for dyslexia)
- Line height (1.8 for dyslexia)
- Font weight (bold for low vision)

### Disability Type Support

#### Dyslexia
```css
body.comrade-dyslexia {
  letter-spacing: 0.12em;
  word-spacing: 0.16em;
  line-height: 1.8;
}
```

#### ADHD
- Auto-highlights keywords: "important", "note", "warning", "attention", "focus", "key", "critical"
- Yellow background for better visibility
- 15% larger font size

#### Low Vision
- 30% larger fonts
- High contrast (1.5x)
- Bold text throughout
- Black background mode

#### Motor Impairment
- All clickable elements minimum 44x44px
- Larger padding on buttons
- No animations (reduced motion)

---

## 🌐 API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/health` | GET | Check server status |
| `/api/tokens/generate` | POST | Create new token (admin) |
| `/api/tokens/list` | GET | List all tokens (admin) |
| `/api/tokens/validate` | GET | Verify token validity |
| `/api/tokens/deactivate` | POST | Deactivate token (admin) |
| `/api/settings/save` | POST | Save user preferences |
| `/api/settings/load` | GET | Load user preferences |
| `/api/profiles` | GET | Get available profiles |

---

## 💡 Example Integration

### Simple Website
```html
<!DOCTYPE html>
<html>
<head>
    <title>My Website</title>
</head>
<body>
    <h1>Welcome to my site!</h1>
    <p>Content here...</p>
    
    <!-- COMRADE Widget - Add before closing body tag -->
    <script src="http://localhost:3000/comrade-widget.js" 
            data-comrade-token="comrade_YOUR_TOKEN_HERE">
    </script>
</body>
</html>
```

### WordPress
Add to theme's `footer.php` before `</body>`:
```html
<script src="http://localhost:3000/comrade-widget.js" 
        data-comrade-token="comrade_YOUR_TOKEN_HERE">
</script>
```

### React
Add to `public/index.html`:
```html
<script src="http://localhost:3000/comrade-widget.js" 
        data-comrade-token="comrade_YOUR_TOKEN_HERE">
</script>
```

---

## 🎯 How It Works (Technical)

1. **User visits your website** with COMRADE widget installed
2. **Widget loads** and validates API token with backend
3. **Settings are fetched** (if user has saved preferences)
4. **Accessibility button appears** (♿) in bottom-right
5. **User clicks button** → Panel opens with profile options
6. **User selects profile** → CSS classes are applied to `<body>`
7. **Changes take effect** immediately (fonts, spacing, colors)
8. **Settings are saved** to backend automatically
9. **Next visit** → Settings load automatically

---

## 🔒 Security Features

- ✅ Token validation on every request
- ✅ Admin key required for token management
- ✅ CORS enabled for cross-domain usage
- ✅ Request counting and rate limiting ready
- ✅ User data isolated by token
- ✅ No sensitive data stored

---

## 🚀 Production Deployment

### Change Admin Key
```bash
export ADMIN_KEY="your_secure_random_key_here"
npm start
```

### Deploy to Heroku
```bash
cd backend
heroku create comrade-api
heroku config:set ADMIN_KEY=your_secure_key
git init
git add .
git commit -m "Initial commit"
git push heroku main
```

### Update Widget URLs
In production, change the script src:
```html
<script src="https://your-domain.com/comrade-widget.js" 
        data-comrade-token="YOUR_TOKEN">
</script>
```

---

## 📊 Admin Dashboard Features

Access at `http://localhost:3000/admin.html`

- 📝 **Generate Tokens**: Create tokens for new websites
- 📋 **View All Tokens**: See all active/inactive tokens
- 📈 **Statistics**: Request counts, last used dates
- 🗑️ **Deactivate**: Disable tokens instantly
- 📋 **Copy Integration Code**: Get ready-to-use script tags
- 🔄 **Refresh**: Real-time token list updates

---

## 🎨 Customization Options

### Add New Accessibility Profile

1. Edit `server.js` - add to `/api/profiles`:
```javascript
{
  id: 'color-blind',
  name: 'Color Blind Support',
  description: 'Adjusted color palette',
  features: ['color-filters', 'pattern-overlays']
}
```

2. Edit `comrade-widget.js` - add CSS in `widgetStyles`:
```javascript
body.comrade-color-blind {
  filter: grayscale(100%);
}
```

3. Add case in `activateProfile()` function:
```javascript
case 'color-blind':
  document.body.classList.add('comrade-color-blind');
  break;
```

---

## 🐛 Common Issues

### Widget Not Appearing
- ✅ Check browser console for errors
- ✅ Verify token is correct
- ✅ Ensure server is running
- ✅ Check CORS settings

### Settings Not Saving
- ✅ Verify token is valid (not deactivated)
- ✅ Check browser localStorage permissions
- ✅ Ensure API endpoint is reachable

### Admin Dashboard Login Fails
- ✅ Use correct admin key: `comrade_admin_key_change_me`
- ✅ Check server console for errors
- ✅ Verify server is running on port 3000

---

## 📚 Next Steps

1. ✅ **Test the system** locally with example.html
2. ✅ **Generate a token** for your website
3. ✅ **Add widget** to your site
4. ✅ **Customize profiles** to match your needs
5. ✅ **Deploy to production** when ready
6. ✅ **Monitor usage** via admin dashboard

---

## 💬 Support

For detailed documentation, see `backend/README.md`

For issues or questions, check the troubleshooting section or open an issue.

---

**🎉 You now have a fully functional accessibility overlay system that works on any website!**

The widget will:
- ✨ Automatically apply user preferences
- 🔄 Sync settings across sessions
- 🎨 Change fonts, spacing, and colors based on disability type
- 🌐 Work across multiple websites (with different tokens)
- 💾 Store user preferences securely
- 🚀 Load instantly without page refresh

**Made with ❤️ for accessibility**
