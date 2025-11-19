/**
 * COMRADE Accessibility Widget
 * 
 * Embed this script on any website to add accessibility features
 * Usage: <script src="https://your-domain.com/comrade-widget.js" data-comrade-token="YOUR_API_TOKEN"></script>
 */

(function() {
    'use strict';

    // Configuration
    const API_BASE_URL = window.COMRADE_API_URL || 'http://localhost:3000/api';
    const scriptTag = document.currentScript;
    const API_TOKEN = scriptTag ? scriptTag.getAttribute('data-comrade-token') : null;

    if (!API_TOKEN) {
        console.error('COMRADE Widget: API token not provided. Add data-comrade-token attribute to script tag.');
        return;
    }

    // Generate or retrieve user ID
    function getUserId() {
        let userId = localStorage.getItem('comrade_user_id');
        if (!userId) {
            userId = 'user_' + Math.random().toString(36).substr(2, 16);
            localStorage.setItem('comrade_user_id', userId);
        }
        return userId;
    }

    const USER_ID = getUserId();

    // API Helper
    async function apiRequest(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            'X-API-Token': API_TOKEN,
            ...options.headers
        };

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('COMRADE API Error:', error);
            throw error;
        }
    }

    // Widget State
    let currentProfile = 'standard';
    let customSettings = {};
    let isWidgetOpen = false;

    // CSS Injection
    const widgetStyles = `
        .comrade-widget-button {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 999999;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .comrade-widget-button:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
        }
        
        .comrade-widget-panel {
            position: fixed;
            bottom: 100px;
            right: 20px;
            width: 350px;
            max-height: 600px;
            background: #1a1a1a;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
            z-index: 999998;
            display: none;
            overflow: hidden;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        .comrade-widget-panel.open {
            display: flex;
            flex-direction: column;
            animation: comradeSlideIn 0.3s ease;
        }
        
        @keyframes comradeSlideIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .comrade-widget-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            color: white;
        }
        
        .comrade-widget-header h3 {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
        }
        
        .comrade-widget-header p {
            margin: 5px 0 0 0;
            font-size: 12px;
            opacity: 0.9;
        }
        
        .comrade-widget-content {
            padding: 20px;
            overflow-y: auto;
            max-height: 480px;
        }
        
        .comrade-profile-card {
            background: #2a2a2a;
            border: 2px solid #3a3a3a;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .comrade-profile-card:hover {
            border-color: #667eea;
            transform: translateY(-2px);
        }
        
        .comrade-profile-card.active {
            border-color: #667eea;
            background: #2d2d3d;
            box-shadow: 0 0 10px rgba(102, 126, 234, 0.3);
        }
        
        .comrade-profile-card h4 {
            margin: 0 0 8px 0;
            color: white;
            font-size: 16px;
            font-weight: 600;
        }
        
        .comrade-profile-card p {
            margin: 0;
            color: #aaa;
            font-size: 13px;
            line-height: 1.4;
        }

        /* Accessibility Modifications */
        body.comrade-dyslexia {
            letter-spacing: 0.12em !important;
            word-spacing: 0.16em !important;
            line-height: 1.8 !important;
        }

        body.comrade-dyslexia * {
            font-size: 1.1em !important;
        }

        body.comrade-adhd {
            font-size: 1.15em !important;
        }

        body.comrade-adhd .comrade-highlight {
            background-color: #fef08a !important;
            padding: 2px 4px;
            border-radius: 3px;
            font-weight: 600;
        }

        body.comrade-low-vision {
            font-size: 1.3em !important;
        }

        body.comrade-low-vision * {
            font-weight: 600 !important;
        }

        body.comrade-high-contrast {
            filter: contrast(1.5) !important;
            background: #000 !important;
            color: #fff !important;
        }

        body.comrade-motor-impairment a,
        body.comrade-motor-impairment button,
        body.comrade-motor-impairment input,
        body.comrade-motor-impairment [role="button"] {
            min-width: 44px !important;
            min-height: 44px !important;
            padding: 12px !important;
        }

        body.comrade-reduced-motion * {
            animation: none !important;
            transition: none !important;
        }

        @media (max-width: 768px) {
            .comrade-widget-panel {
                width: calc(100vw - 40px);
                right: 20px;
                left: 20px;
                bottom: 90px;
            }
        }
    `;

    // Inject styles
    function injectStyles() {
        const styleEl = document.createElement('style');
        styleEl.textContent = widgetStyles;
        document.head.appendChild(styleEl);
    }

    // Create widget UI
    function createWidget() {
        // Button
        const button = document.createElement('button');
        button.className = 'comrade-widget-button';
        button.innerHTML = '♿';
        button.setAttribute('aria-label', 'Open accessibility options');
        button.onclick = toggleWidget;

        // Panel
        const panel = document.createElement('div');
        panel.className = 'comrade-widget-panel';
        panel.innerHTML = `
            <div class="comrade-widget-header">
                <h3>Accessibility Settings</h3>
                <p>Choose your preferred profile</p>
            </div>
            <div class="comrade-widget-content" id="comrade-profiles-container">
                <p style="color: #999; text-align: center;">Loading profiles...</p>
            </div>
        `;

        document.body.appendChild(button);
        document.body.appendChild(panel);
    }

    // Toggle widget
    function toggleWidget() {
        isWidgetOpen = !isWidgetOpen;
        const panel = document.querySelector('.comrade-widget-panel');
        if (isWidgetOpen) {
            panel.classList.add('open');
        } else {
            panel.classList.remove('open');
        }
    }

    // Load profiles from API
    async function loadProfiles() {
        try {
            const data = await apiRequest('/profiles');
            renderProfiles(data.profiles);
        } catch (error) {
            document.getElementById('comrade-profiles-container').innerHTML = 
                '<p style="color: #f88; text-align: center;">Failed to load profiles</p>';
        }
    }

    // Render profile cards
    function renderProfiles(profiles) {
        const container = document.getElementById('comrade-profiles-container');
        container.innerHTML = profiles.map(profile => `
            <div class="comrade-profile-card ${profile.id === currentProfile ? 'active' : ''}" 
                 data-profile="${profile.id}"
                 role="button"
                 tabindex="0"
                 aria-pressed="${profile.id === currentProfile}">
                <h4>${profile.name}</h4>
                <p>${profile.description}</p>
            </div>
        `).join('');

        // Add event listeners
        container.querySelectorAll('.comrade-profile-card').forEach(card => {
            card.onclick = () => activateProfile(card.dataset.profile);
            card.onkeypress = (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    activateProfile(card.dataset.profile);
                }
            };
        });
    }

    // Apply profile
    function activateProfile(profileId) {
        // Remove old classes
        document.body.classList.remove(
            'comrade-dyslexia',
            'comrade-adhd',
            'comrade-low-vision',
            'comrade-motor-impairment',
            'comrade-high-contrast',
            'comrade-reduced-motion'
        );

        // Apply new profile
        currentProfile = profileId;
        
        switch(profileId) {
            case 'dyslexia':
                document.body.classList.add('comrade-dyslexia');
                break;
            case 'adhd':
                document.body.classList.add('comrade-adhd');
                highlightKeyTerms();
                break;
            case 'low-vision':
                document.body.classList.add('comrade-low-vision', 'comrade-high-contrast');
                break;
            case 'motor-impairment':
                document.body.classList.add('comrade-motor-impairment', 'comrade-reduced-motion');
                break;
        }

        // Update UI
        document.querySelectorAll('.comrade-profile-card').forEach(card => {
            card.classList.toggle('active', card.dataset.profile === profileId);
            card.setAttribute('aria-pressed', card.dataset.profile === profileId);
        });

        // Save settings
        saveSettings();
        
        console.log(`COMRADE: Activated profile - ${profileId}`);
    }

    // Highlight key terms for ADHD mode
    function highlightKeyTerms() {
        const keywords = ['important', 'note', 'warning', 'attention', 'focus', 'key', 'critical'];
        const textNodes = getTextNodes(document.body);
        
        textNodes.forEach(node => {
            let text = node.textContent;
            let modified = false;
            
            keywords.forEach(keyword => {
                const regex = new RegExp(`\\b(${keyword})\\b`, 'gi');
                if (regex.test(text)) {
                    modified = true;
                    text = text.replace(regex, '<span class="comrade-highlight">$1</span>');
                }
            });
            
            if (modified && node.parentNode) {
                const span = document.createElement('span');
                span.innerHTML = text;
                node.parentNode.replaceChild(span, node);
            }
        });
    }

    // Get text nodes
    function getTextNodes(element) {
        const textNodes = [];
        const walk = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: (node) => {
                    // Skip script, style, and widget elements
                    if (node.parentElement.closest('script, style, .comrade-widget-button, .comrade-widget-panel')) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    return node.textContent.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
                }
            }
        );
        
        let node;
        while (node = walk.nextNode()) {
            textNodes.push(node);
        }
        
        return textNodes;
    }

    // Save settings to backend
    async function saveSettings() {
        try {
            await apiRequest('/settings/save', {
                method: 'POST',
                body: JSON.stringify({
                    userId: USER_ID,
                    profile: currentProfile,
                    customSettings
                })
            });
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    }

    // Load saved settings
    async function loadSettings() {
        try {
            const data = await apiRequest(`/settings/load?userId=${USER_ID}`);
            if (data.profile) {
                currentProfile = data.profile;
                customSettings = data.customSettings || {};
                activateProfile(currentProfile);
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    }

    // Initialize widget
    async function init() {
        // Validate token
        try {
            await apiRequest('/tokens/validate');
        } catch (error) {
            console.error('COMRADE Widget: Invalid API token');
            return;
        }

        injectStyles();
        createWidget();
        await loadProfiles();
        await loadSettings();
        
        console.log('COMRADE Widget initialized successfully');
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose API for custom integrations
    window.COMRADE = {
        activateProfile,
        getCurrentProfile: () => currentProfile,
        saveSettings,
        loadSettings
    };

})();
