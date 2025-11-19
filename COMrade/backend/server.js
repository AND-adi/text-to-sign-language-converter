const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Database file paths
const DB_DIR = path.join(__dirname, 'data');
const TOKENS_DB = path.join(DB_DIR, 'tokens.json');
const SETTINGS_DB = path.join(DB_DIR, 'settings.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize database
async function initDatabase() {
    try {
        await fs.mkdir(DB_DIR, { recursive: true });
        
        // Initialize tokens database
        try {
            await fs.access(TOKENS_DB);
        } catch {
            await fs.writeFile(TOKENS_DB, JSON.stringify({ tokens: [] }, null, 2));
        }
        
        // Initialize settings database
        try {
            await fs.access(SETTINGS_DB);
        } catch {
            await fs.writeFile(SETTINGS_DB, JSON.stringify({ settings: {} }, null, 2));
        }
        
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Failed to initialize database:', error);
    }
}

// Helper functions
async function readTokens() {
    const data = await fs.readFile(TOKENS_DB, 'utf-8');
    return JSON.parse(data);
}

async function writeTokens(data) {
    await fs.writeFile(TOKENS_DB, JSON.stringify(data, null, 2));
}

async function readSettings() {
    const data = await fs.readFile(SETTINGS_DB, 'utf-8');
    return JSON.parse(data);
}

async function writeSettings(data) {
    await fs.writeFile(SETTINGS_DB, JSON.stringify(data, null, 2));
}

function generateToken() {
    return 'comrade_' + crypto.randomBytes(32).toString('hex');
}

// Middleware to validate API token
async function validateToken(req, res, next) {
    const token = req.headers['x-api-token'] || req.query.token;
    
    if (!token) {
        return res.status(401).json({ error: 'API token required' });
    }
    
    try {
        const db = await readTokens();
        const tokenData = db.tokens.find(t => t.token === token && t.active);
        
        if (!tokenData) {
            return res.status(403).json({ error: 'Invalid or inactive token' });
        }
        
        // Update last used timestamp
        tokenData.lastUsed = new Date().toISOString();
        tokenData.requestCount = (tokenData.requestCount || 0) + 1;
        await writeTokens(db);
        
        req.tokenData = tokenData;
        next();
    } catch (error) {
        res.status(500).json({ error: 'Token validation failed' });
    }
}

// Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Generate new API token (protected - in production, add admin authentication)
app.post('/api/tokens/generate', async (req, res) => {
    try {
        const { domain, description, adminKey } = req.body;
        
        // Simple admin authentication (replace with proper auth in production)
        if (adminKey !== process.env.ADMIN_KEY && adminKey !== 'comrade_admin_key_change_me') {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        const token = generateToken();
        const tokenData = {
            token,
            domain: domain || 'localhost',
            description: description || 'New token',
            active: true,
            createdAt: new Date().toISOString(),
            lastUsed: null,
            requestCount: 0
        };
        
        const db = await readTokens();
        db.tokens.push(tokenData);
        await writeTokens(db);
        
        res.json({ 
            success: true, 
            token,
            message: 'Token generated successfully',
            tokenData 
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate token' });
    }
});

// List all tokens (protected - admin only)
app.get('/api/tokens/list', async (req, res) => {
    try {
        const { adminKey } = req.query;
        
        if (adminKey !== process.env.ADMIN_KEY && adminKey !== 'comrade_admin_key_change_me') {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        const db = await readTokens();
        res.json({ tokens: db.tokens });
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve tokens' });
    }
});

// Deactivate token (protected - admin only)
app.post('/api/tokens/deactivate', async (req, res) => {
    try {
        const { token, adminKey } = req.body;
        
        if (adminKey !== process.env.ADMIN_KEY && adminKey !== 'comrade_admin_key_change_me') {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        const db = await readTokens();
        const tokenData = db.tokens.find(t => t.token === token);
        
        if (!tokenData) {
            return res.status(404).json({ error: 'Token not found' });
        }
        
        tokenData.active = false;
        tokenData.deactivatedAt = new Date().toISOString();
        await writeTokens(db);
        
        res.json({ success: true, message: 'Token deactivated' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to deactivate token' });
    }
});

// Validate token endpoint (used by widget)
app.get('/api/tokens/validate', validateToken, (req, res) => {
    res.json({ 
        valid: true, 
        domain: req.tokenData.domain,
        message: 'Token is valid' 
    });
});

// Save user accessibility settings
app.post('/api/settings/save', validateToken, async (req, res) => {
    try {
        const { userId, profile, customSettings } = req.body;
        
        if (!userId) {
            return res.status(400).json({ error: 'userId required' });
        }
        
        const db = await readSettings();
        const settingsKey = `${req.tokenData.token}_${userId}`;
        
        db.settings[settingsKey] = {
            profile: profile || 'standard',
            customSettings: customSettings || {},
            updatedAt: new Date().toISOString()
        };
        
        await writeSettings(db);
        
        res.json({ 
            success: true, 
            message: 'Settings saved successfully' 
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save settings' });
    }
});

// Retrieve user accessibility settings
app.get('/api/settings/load', validateToken, async (req, res) => {
    try {
        const { userId } = req.query;
        
        if (!userId) {
            return res.status(400).json({ error: 'userId required' });
        }
        
        const db = await readSettings();
        const settingsKey = `${req.tokenData.token}_${userId}`;
        const userSettings = db.settings[settingsKey];
        
        if (!userSettings) {
            return res.json({ 
                profile: 'standard', 
                customSettings: {},
                message: 'No saved settings found' 
            });
        }
        
        res.json(userSettings);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load settings' });
    }
});

// Get available profiles and features
app.get('/api/profiles', validateToken, (req, res) => {
    res.json({
        profiles: [
            {
                id: 'standard',
                name: 'Standard UI',
                description: 'Default interface without modifications'
            },
            {
                id: 'dyslexia',
                name: 'Dyslexia Support',
                description: 'Enhanced readability with adjusted spacing and fonts',
                features: ['increased-spacing', 'larger-text', 'dyslexia-font-option']
            },
            {
                id: 'adhd',
                name: 'ADHD Focus',
                description: 'Reduced distractions with focus enhancements',
                features: ['focus-mode', 'tooltips', 'highlighted-terms']
            },
            {
                id: 'low-vision',
                name: 'Low Vision Support',
                description: 'High contrast and larger text for better visibility',
                features: ['high-contrast', 'zoom', 'simplified-layout']
            },
            {
                id: 'motor-impairment',
                name: 'Motor Impairment',
                description: 'Larger click targets and keyboard navigation',
                features: ['large-targets', 'keyboard-nav', 'reduced-motion']
            }
        ]
    });
});

// Start server
async function startServer() {
    await initDatabase();
    
    app.listen(PORT, () => {
        console.log(`🚀 COMRADE Backend Server running on port ${PORT}`);
        console.log(`📡 API endpoint: http://localhost:${PORT}/api`);
        console.log(`🔑 Admin key: ${process.env.ADMIN_KEY || 'comrade_admin_key_change_me'}`);
    });
}

startServer();
