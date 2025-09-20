class SettingsManager {
    constructor() {
        this.settings = this.loadSettings();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSettingsUI();
    }

    setupEventListeners() {
        document.getElementById('saveSettingsBtn').addEventListener('click', () => {
            this.saveSettings();
        });

        document.getElementById('autoRefreshToggle').addEventListener('change', (e) => {
            this.toggleRefreshInterval(e.target.checked);
        });

        document.getElementById('themeSelect').addEventListener('change', (e) => {
            this.changeTheme(e.target.value);
        });

        document.getElementById('clearDataBtn').addEventListener('click', () => {
            this.showConfirmModal('Clear All Data', 'Are you sure you want to clear all data? This action cannot be undone.', () => {
                this.clearAllData();
            });
        });

        document.getElementById('exportDataBtn').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('closeConfirmModalBtn').addEventListener('click', () => {
            this.closeConfirmModal();
        });

        document.getElementById('cancelConfirmBtn').addEventListener('click', () => {
            this.closeConfirmModal();
        });

        document.getElementById('confirmBtn').addEventListener('click', () => {
            this.executeConfirmAction();
        });

        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.theme-option').forEach(o => o.classList.remove('active'));
                option.classList.add('active');
                this.changeTheme(option.dataset.theme);
            });
        });

        document.querySelectorAll('select, input[type="checkbox"]').forEach(element => {
            element.addEventListener('change', () => {
                this.markSettingsChanged();
            });
        });
    }

    loadSettings() {
        const defaultSettings = {
            currency: 'USD',
            theme: 'dark',
            language: 'en',
            autoRefresh: true,
            refreshInterval: 30,
            showPortfolioValue: true,
            portfolioView: 'table',
            pnlMethod: 'fifo',
            transactionNotifications: true,
            priceAlerts: true,
            volumeAlerts: false,
            marketCapAlerts: false,
            alertSound: false,
            dataCollection: false,
            localStorage: true
        };

        const saved = localStorage.getItem('cryptoSettings');
        return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    }

    loadSettingsUI() {
        document.getElementById('currencySelect').value = this.settings.currency;
        document.getElementById('languageSelect').value = this.settings.language;
        document.getElementById('autoRefreshToggle').checked = this.settings.autoRefresh;
        document.getElementById('refreshIntervalSelect').value = this.settings.refreshInterval;
        document.getElementById('showPortfolioValue').checked = this.settings.showPortfolioValue;
        document.getElementById('portfolioViewSelect').value = this.settings.portfolioView;
        document.getElementById('pnlMethodSelect').value = this.settings.pnlMethod;
        document.getElementById('transactionNotifications').checked = this.settings.transactionNotifications;
        document.getElementById('priceAlerts').checked = this.settings.priceAlerts;
        document.getElementById('volumeAlerts').checked = this.settings.volumeAlerts;
        document.getElementById('marketCapAlerts').checked = this.settings.marketCapAlerts;
        document.getElementById('alertSound').checked = this.settings.alertSound;
        document.getElementById('dataCollection').checked = this.settings.dataCollection;
        document.getElementById('localStorage').checked = this.settings.localStorage;

        document.querySelector(`.theme-option[data-theme="${this.settings.theme}"]`).classList.add('active');

        this.toggleRefreshInterval(this.settings.autoRefresh);
    }

    saveSettings() {
        const newSettings = {
            currency: document.getElementById('currencySelect').value,
            theme: document.querySelector('.theme-option.active').dataset.theme,
            language: document.getElementById('languageSelect').value,
            autoRefresh: document.getElementById('autoRefreshToggle').checked,
            refreshInterval: parseInt(document.getElementById('refreshIntervalSelect').value),
            showPortfolioValue: document.getElementById('showPortfolioValue').checked,
            portfolioView: document.getElementById('portfolioViewSelect').value,
            pnlMethod: document.getElementById('pnlMethodSelect').value,
            transactionNotifications: document.getElementById('transactionNotifications').checked,
            priceAlerts: document.getElementById('priceAlerts').checked,
            volumeAlerts: document.getElementById('volumeAlerts').checked,
            marketCapAlerts: document.getElementById('marketCapAlerts').checked,
            alertSound: document.getElementById('alertSound').checked,
            dataCollection: document.getElementById('dataCollection').checked,
            localStorage: document.getElementById('localStorage').checked
        };

        this.settings = { ...this.settings, ...newSettings };
        localStorage.setItem('cryptoSettings', JSON.stringify(this.settings));
        
        this.showNotification('Settings saved successfully!', 'success');
        this.resetSettingsChanged();
    }

    toggleRefreshInterval(enabled) {
        const intervalSetting = document.getElementById('refreshIntervalSetting');
        if (enabled) {
            intervalSetting.style.display = 'flex';
        } else {
            intervalSetting.style.display = 'none';
        }
    }

    changeTheme(theme) {
        document.body.className = theme === 'light' ? 'light-theme' : '';
        
        if (theme === 'light') {
            document.documentElement.style.setProperty('--bg-primary', '#ffffff');
            document.documentElement.style.setProperty('--bg-secondary', '#f8fafc');
            document.documentElement.style.setProperty('--bg-tertiary', '#e2e8f0');
            document.documentElement.style.setProperty('--text-primary', '#1e293b');
            document.documentElement.style.setProperty('--text-secondary', '#64748b');
            document.documentElement.style.setProperty('--text-muted', '#94a3b8');
            document.documentElement.style.setProperty('--border-color', '#e2e8f0');
        } else {
            document.documentElement.style.setProperty('--bg-primary', '#0f0f23');
            document.documentElement.style.setProperty('--bg-secondary', '#1a1a2e');
            document.documentElement.style.setProperty('--bg-tertiary', '#16213e');
            document.documentElement.style.setProperty('--text-primary', '#ffffff');
            document.documentElement.style.setProperty('--text-secondary', '#a1a1aa');
            document.documentElement.style.setProperty('--text-muted', '#71717a');
            document.documentElement.style.setProperty('--border-color', '#27272a');
        }
    }

    showConfirmModal(title, message, action) {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalMessage').textContent = message;
        document.getElementById('confirmModal').style.display = 'flex';
        this.confirmAction = action;
    }

    closeConfirmModal() {
        document.getElementById('confirmModal').style.display = 'none';
        this.confirmAction = null;
    }

    executeConfirmAction() {
        if (this.confirmAction) {
            this.confirmAction();
        }
        this.closeConfirmModal();
    }

    clearAllData() {
        localStorage.clear();
        this.showNotification('All data has been cleared!', 'success');
        
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    }

    exportData() {
        const data = {
            settings: this.settings,
            portfolio: JSON.parse(localStorage.getItem('cryptoPortfolio') || '{}'),
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `crypto-dashboard-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('Data exported successfully!', 'success');
    }

    markSettingsChanged() {
        const saveBtn = document.getElementById('saveSettingsBtn');
        saveBtn.style.background = 'var(--primary-color)';
        saveBtn.style.transform = 'scale(1.05)';
    }

    resetSettingsChanged() {
        const saveBtn = document.getElementById('saveSettingsBtn');
        saveBtn.style.background = '';
        saveBtn.style.transform = '';
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--glass-bg);
            border: 1px solid var(--glass-border);
            border-radius: 0.75rem;
            padding: 1rem;
            backdrop-filter: blur(20px);
            z-index: 1000;
            transform: translateX(400px);
            transition: transform 0.3s ease;
            max-width: 300px;
        `;

        if (type === 'success') {
            notification.style.borderColor = 'var(--success-color)';
        } else if (type === 'error') {
            notification.style.borderColor = 'var(--error-color)';
        }

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    getSetting(key) {
        return this.settings[key];
    }

    updateSetting(key, value) {
        this.settings[key] = value;
        localStorage.setItem('cryptoSettings', JSON.stringify(this.settings));
    }
}

let settingsManager;

document.addEventListener('DOMContentLoaded', () => {
    settingsManager = new SettingsManager();
});

