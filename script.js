class CryptoDashboard {
    constructor() {
        this.cryptoData = [];
        this.marketData = {};
        this.chart = null;
        this.refreshInterval = null;
        this.isLoading = false;
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadInitialData();
        this.setupAutoRefresh();
        this.initializeChart();
    }

    setupEventListeners() {
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.refreshData();
        });

        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.toggleView(e.target.dataset.view);
            });
        });

        document.querySelectorAll('.time-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.updateChart(e.target.dataset.time);
            });
        });
    }

    async loadInitialData() {
        try {
            this.showLoading();
            await Promise.all([
                this.fetchMarketData(),
                this.fetchCryptoData(),
                this.fetchTrendingData()
            ]);
            this.hideLoading();
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showError('Failed to load data. Please try again.');
        }
    }

    async fetchMarketData() {
        const marketData = {
            totalMarketCap: 2100000000000,
            volume24h: 89200000000,
            activeCoins: 8945,
            btcDominance: 42.3
        };

        this.marketData = marketData;
        this.updateMarketStats();
    }

    async fetchCryptoData() {
        const cryptoData = [
            {
                id: 'bitcoin',
                rank: 1,
                name: 'Bitcoin',
                symbol: 'BTC',
                price: 43250.67,
                change24h: 2.34,
                marketCap: 847000000000,
                volume24h: 15600000000,
                icon: '₿'
            },
            {
                id: 'ethereum',
                rank: 2,
                name: 'Ethereum',
                symbol: 'ETH',
                price: 2580.45,
                change24h: -1.23,
                marketCap: 310000000000,
                volume24h: 8900000000,
                icon: 'Ξ'
            },
            {
                id: 'binancecoin',
                rank: 3,
                name: 'BNB',
                symbol: 'BNB',
                price: 315.89,
                change24h: 4.56,
                marketCap: 47500000000,
                volume24h: 1200000000,
                icon: 'B'
            },
            {
                id: 'solana',
                rank: 4,
                name: 'Solana',
                symbol: 'SOL',
                price: 98.76,
                change24h: 7.89,
                marketCap: 42500000000,
                volume24h: 2100000000,
                icon: '◎'
            },
            {
                id: 'cardano',
                rank: 5,
                name: 'Cardano',
                symbol: 'ADA',
                price: 0.52,
                change24h: -2.15,
                marketCap: 18500000000,
                volume24h: 450000000,
                icon: '₳'
            },
            {
                id: 'xrp',
                rank: 6,
                name: 'XRP',
                symbol: 'XRP',
                price: 0.61,
                change24h: 1.87,
                marketCap: 34000000000,
                volume24h: 890000000,
                icon: '✕'
            },
            {
                id: 'dogecoin',
                rank: 7,
                name: 'Dogecoin',
                symbol: 'DOGE',
                price: 0.084,
                change24h: 5.23,
                marketCap: 12000000000,
                volume24h: 670000000,
                icon: 'Ð'
            },
            {
                id: 'avalanche',
                rank: 8,
                name: 'Avalanche',
                symbol: 'AVAX',
                price: 36.45,
                change24h: -0.89,
                marketCap: 13800000000,
                volume24h: 340000000,
                icon: '🔺'
            }
        ];

        this.cryptoData = cryptoData;
        this.updateCryptoTable();
    }

    async fetchTrendingData() {
        const trendingData = [
            { name: 'Bitcoin', symbol: 'BTC', price: 43250.67, change: 2.34 },
            { name: 'Solana', symbol: 'SOL', price: 98.76, change: 7.89 },
            { name: 'Dogecoin', symbol: 'DOGE', price: 0.084, change: 5.23 },
            { name: 'BNB', symbol: 'BNB', price: 315.89, change: 4.56 },
            { name: 'Cardano', symbol: 'ADA', price: 0.52, change: -2.15 }
        ];

        this.updateTrendingList(trendingData);
    }

    updateMarketStats() {
        const stats = {
            totalMarketCap: this.formatCurrency(this.marketData.totalMarketCap),
            volume24h: this.formatCurrency(this.marketData.volume24h),
            activeCoins: this.marketData.activeCoins.toLocaleString(),
            dominance: `BTC ${this.marketData.btcDominance}%`
        };

        Object.keys(stats).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                element.textContent = stats[key];
            }
        });

        this.updateChangeIndicators();
    }

    updateChangeIndicators() {
        const changes = {
            marketCapChange: '+2.4%',
            volumeChange: '+12.8%',
            coinsChange: '+23',
            dominanceChange: '-1.2%'
        };

        Object.keys(changes).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                element.textContent = changes[key];
                element.className = `stat-change ${changes[key].startsWith('+') ? 'positive' : 'negative'}`;
            }
        });
    }

    updateCryptoTable() {
        const tbody = document.getElementById('cryptoTableBody');
        tbody.innerHTML = '';

        this.cryptoData.forEach(crypto => {
            const row = document.createElement('tr');
            row.className = 'crypto-row';
            row.innerHTML = `
                <td>${crypto.rank}</td>
                <td>
                    <div class="crypto-symbol">
                        <div class="crypto-icon">${crypto.icon}</div>
                        <div>
                            <div class="crypto-name">${crypto.name}</div>
                            <div class="crypto-symbol-text">${crypto.symbol}</div>
                        </div>
                    </div>
                </td>
                <td class="price">$${this.formatPrice(crypto.price)}</td>
                <td>
                    <span class="change ${crypto.change24h >= 0 ? 'positive' : 'negative'}">
                        ${crypto.change24h >= 0 ? '+' : ''}${crypto.change24h.toFixed(2)}%
                    </span>
                </td>
                <td>$${this.formatCurrency(crypto.marketCap)}</td>
                <td>$${this.formatCurrency(crypto.volume24h)}</td>
            `;
            tbody.appendChild(row);
        });
    }

    updateTrendingList(trendingData) {
        const trendingList = document.getElementById('trendingList');
        trendingList.innerHTML = '';

        trendingData.forEach((crypto, index) => {
            const item = document.createElement('div');
            item.className = 'trending-item';
            item.innerHTML = `
                <div class="trending-info">
                    <div class="trending-rank">${index + 1}</div>
                    <div>
                        <div class="trending-name">${crypto.name}</div>
                        <div class="crypto-symbol-text">${crypto.symbol}</div>
                    </div>
                </div>
                <div class="trending-price">$${this.formatPrice(crypto.price)}</div>
            `;
            trendingList.appendChild(item);
        });
    }

    initializeChart() {
        const ctx = document.getElementById('priceChart');
        if (!ctx) return;

        this.chart = ctx.getContext('2d');
        this.drawChart();
    }

    drawChart() {
        const canvas = document.getElementById('priceChart');
        const ctx = this.chart;
        const width = canvas.width = canvas.offsetWidth * 2;
        const height = canvas.height = canvas.offsetHeight * 2;
        ctx.scale(2, 2);

        ctx.clearRect(0, 0, width, height);

        const dataPoints = 50;
        const data = [];
        let price = 43000;
        
        for (let i = 0; i < dataPoints; i++) {
            price += (Math.random() - 0.5) * 1000;
            data.push({
                x: (i / (dataPoints - 1)) * (width / 2),
                y: height / 2 - (price - 42000) * 0.01
            });
        }

        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        data.forEach((point, index) => {
            if (index === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        });
        
        ctx.stroke();

        const gradient = ctx.createLinearGradient(0, 0, 0, height / 2);
        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.3)');
        gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
        
        ctx.fillStyle = gradient;
        ctx.lineTo(data[data.length - 1].x, height / 2);
        ctx.lineTo(data[0].x, height / 2);
        ctx.closePath();
        ctx.fill();
    }

    updateChart(timeframe) {
        console.log(`Updating chart for ${timeframe}`);
        setTimeout(() => {
            this.drawChart();
        }, 300);
    }

    toggleView(view) {
        const tableContainer = document.querySelector('.crypto-table-container');
        if (view === 'cards') {
            tableContainer.style.display = 'none';
            console.log('Switching to cards view');
        } else {
            tableContainer.style.display = 'block';
            console.log('Switching to table view');
        }
    }

    async refreshData() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        const refreshBtn = document.getElementById('refreshBtn');
        const icon = refreshBtn.querySelector('i');
        
        icon.style.animation = 'spin 1s linear infinite';
        refreshBtn.style.pointerEvents = 'none';
        
        try {
            await this.loadInitialData();
            this.drawChart();
        } catch (error) {
            console.error('Error refreshing data:', error);
            this.showError('Failed to refresh data. Please try again.');
        } finally {
            this.isLoading = false;
            icon.style.animation = '';
            refreshBtn.style.pointerEvents = 'auto';
        }
    }

    setupAutoRefresh() {
        this.refreshInterval = setInterval(() => {
            this.refreshData();
        }, 30000);
    }

    showLoading() {
        const elements = document.querySelectorAll('.stat-value, .crypto-table tbody');
        elements.forEach(el => {
            if (!el.querySelector('.loading')) {
                const loading = document.createElement('div');
                loading.className = 'loading';
                el.innerHTML = '';
                el.appendChild(loading);
            }
        });
    }

    hideLoading() {
        const loadingElements = document.querySelectorAll('.loading');
        loadingElements.forEach(el => el.remove());
    }

    showError(message) {
        console.error(message);
        alert(message);
    }

    formatCurrency(value) {
        if (value >= 1e12) {
            return (value / 1e12).toFixed(2) + 'T';
        } else if (value >= 1e9) {
            return (value / 1e9).toFixed(2) + 'B';
        } else if (value >= 1e6) {
            return (value / 1e6).toFixed(2) + 'M';
        } else if (value >= 1e3) {
            return (value / 1e3).toFixed(2) + 'K';
        }
        return value.toFixed(2);
    }

    formatPrice(price) {
        if (price >= 1000) {
            return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        } else if (price >= 1) {
            return price.toFixed(4);
        } else {
            return price.toFixed(6);
        }
    }

    destroy() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new CryptoDashboard();
    
    window.addEventListener('resize', debounce(() => {
        dashboard.drawChart();
    }, 250));
    
    window.addEventListener('beforeunload', () => {
        dashboard.destroy();
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const cryptoRows = document.querySelectorAll('.crypto-row');
    cryptoRows.forEach(row => {
        row.addEventListener('mouseenter', () => {
            row.style.transform = 'translateX(4px)';
        });
        
        row.addEventListener('mouseleave', () => {
            row.style.transform = 'translateX(0)';
        });
    });

    const buttons = document.querySelectorAll('button, .refresh-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
});

const style = document.createElement('style');
style.textContent = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
