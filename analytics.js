class AnalyticsDashboard {
    constructor() {
        this.charts = {};
        this.currentAsset = 'BTC';
        this.currentTimeframe = '24h';
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadMarketData();
        this.initializeCharts();
        this.updateAnalytics();
    }

    setupEventListeners() {
        document.querySelectorAll('.time-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentTimeframe = e.target.dataset.time;
                this.updateCharts();
            });
        });

        document.getElementById('assetSelect').addEventListener('change', (e) => {
            this.currentAsset = e.target.value;
            this.updateCharts();
        });

        document.getElementById('refreshAnalyticsBtn').addEventListener('click', () => {
            this.refreshData();
        });
    }

    async loadMarketData() {
        const marketData = {
            fearGreedIndex: 45,
            marketSentiment: 'Bearish',
            volatility: 'High',
            volume24h: 89200000000,
            volumeChange: 12.8,
            avgVolume7d: 76400000000,
            rsi: 45.2,
            macd: -0.45,
            ma50: 42850,
            ma200: 38920
        };

        this.marketData = marketData;
        this.updateMarketOverview();
        this.updateTechnicalIndicators();
        this.updateVolumeAnalysis();
    }

    updateMarketOverview() {
        document.getElementById('fearGreedIndex').textContent = this.marketData.fearGreedIndex;
        document.getElementById('marketSentiment').textContent = this.marketData.marketSentiment;
        document.getElementById('volatility').textContent = this.marketData.volatility;
    }

    updateTechnicalIndicators() {
        document.getElementById('rsiValue').textContent = this.marketData.rsi.toFixed(1);
        document.getElementById('macdValue').textContent = this.marketData.macd.toFixed(2);
        document.getElementById('ma50Value').textContent = `$${this.marketData.ma50.toLocaleString()}`;
        document.getElementById('ma200Value').textContent = `$${this.marketData.ma200.toLocaleString()}`;

        const rsiStatus = document.getElementById('rsiValue').nextElementSibling;
        rsiStatus.textContent = this.marketData.rsi > 70 ? 'Overbought' : 
                               this.marketData.rsi < 30 ? 'Oversold' : 'Neutral';
        rsiStatus.className = `indicator-status ${
            this.marketData.rsi > 70 ? 'negative' : 
            this.marketData.rsi < 30 ? 'positive' : 'neutral'
        }`;

        const macdStatus = document.getElementById('macdValue').nextElementSibling;
        macdStatus.textContent = this.marketData.macd > 0 ? 'Bullish' : 'Bearish';
        macdStatus.className = `indicator-status ${this.marketData.macd > 0 ? 'positive' : 'negative'}`;

        const ma50Status = document.getElementById('ma50Value').nextElementSibling;
        const ma200Status = document.getElementById('ma200Value').nextElementSibling;
        ma50Status.textContent = 'Above';
        ma50Status.className = 'indicator-status positive';
        ma200Status.textContent = 'Above';
        ma200Status.className = 'indicator-status positive';
    }

    updateVolumeAnalysis() {
        document.getElementById('volume24h').textContent = this.formatCurrency(this.marketData.volume24h);
        document.getElementById('volumeChange').textContent = `+${this.marketData.volumeChange.toFixed(1)}%`;
        document.getElementById('avgVolume7d').textContent = this.formatCurrency(this.marketData.avgVolume7d);
    }

    initializeCharts() {
        this.initializePriceChart();
        this.initializeDominanceChart();
    }

    initializePriceChart() {
        const canvas = document.getElementById('priceAnalysisChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth * 2;
        canvas.height = canvas.offsetHeight * 2;
        ctx.scale(2, 2);

        this.charts.priceChart = ctx;
        this.drawPriceChart();
    }

    initializeDominanceChart() {
        const canvas = document.getElementById('dominanceChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth * 2;
        canvas.height = canvas.offsetHeight * 2;
        ctx.scale(2, 2);

        this.charts.dominanceChart = ctx;
        this.drawDominanceChart();
    }

    drawPriceChart() {
        const canvas = document.getElementById('priceAnalysisChart');
        const ctx = this.charts.priceChart;
        if (!ctx) return;

        const width = canvas.width / 2;
        const height = canvas.height / 2;

        ctx.clearRect(0, 0, width, height);

        const dataPoints = this.generatePriceData();
        
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 3;
        ctx.beginPath();

        dataPoints.forEach((point, index) => {
            const x = (index / (dataPoints.length - 1)) * width;
            const y = height - ((point.price - point.min) / (point.max - point.min)) * height;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();

        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.3)');
        gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
        
        ctx.fillStyle = gradient;
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fill();

        this.drawPriceAnnotations(ctx, width, height, dataPoints);
    }

    drawPriceAnnotations(ctx, width, height, dataPoints) {
        const lastPoint = dataPoints[dataPoints.length - 1];
        const x = width - 10;
        const y = 10;

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Inter';
        ctx.textAlign = 'right';
        ctx.fillText(`${this.currentAsset} Price`, x, y);
        
        ctx.font = '12px Inter';
        ctx.fillText(`$${lastPoint.price.toLocaleString()}`, x, y + 20);
        
        const change = ((lastPoint.price - dataPoints[0].price) / dataPoints[0].price) * 100;
        ctx.fillStyle = change >= 0 ? '#10b981' : '#ef4444';
        ctx.fillText(`${change >= 0 ? '+' : ''}${change.toFixed(2)}%`, x, y + 40);
    }

    drawDominanceChart() {
        const canvas = document.getElementById('dominanceChart');
        const ctx = this.charts.dominanceChart;
        if (!ctx) return;

        const width = canvas.width / 2;
        const height = canvas.height / 2;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(centerX, centerY) - 20;

        ctx.clearRect(0, 0, width, height);

        const dominanceData = [
            { name: 'BTC', percentage: 42.3, color: '#f7931a' },
            { name: 'ETH', percentage: 18.7, color: '#627eea' },
            { name: 'BNB', percentage: 4.2, color: '#f3ba2f' },
            { name: 'SOL', percentage: 2.8, color: '#9945ff' },
            { name: 'Others', percentage: 32.0, color: '#71717a' }
        ];

        let currentAngle = 0;

        dominanceData.forEach(item => {
            const sliceAngle = (item.percentage / 100) * 2 * Math.PI;

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();
            ctx.fillStyle = item.color;
            ctx.fill();

            const labelAngle = currentAngle + sliceAngle / 2;
            const labelX = centerX + Math.cos(labelAngle) * (radius + 30);
            const labelY = centerY + Math.sin(labelAngle) * (radius + 30);

            ctx.fillStyle = '#ffffff';
            ctx.font = '12px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(`${item.name} ${item.percentage}%`, labelX, labelY);

            currentAngle += sliceAngle;
        });
    }

    generatePriceData() {
        const points = 100;
        const data = [];
        let price = 43000;
        const basePrice = price;

        for (let i = 0; i < points; i++) {
            price += (Math.random() - 0.5) * 2000;
            price = Math.max(price, basePrice * 0.8);
            price = Math.min(price, basePrice * 1.2);
            data.push(price);
        }

        const min = Math.min(...data);
        const max = Math.max(...data);

        return data.map(price => ({ price, min, max }));
    }

    updateCharts() {
        this.drawPriceChart();
        this.drawDominanceChart();
    }

    updateAnalytics() {
        this.updateMarketOverview();
        this.updateTechnicalIndicators();
        this.updateVolumeAnalysis();
        this.updateCorrelationMatrix();
    }

    updateCorrelationMatrix() {
        const correlationData = {
            BTC: { BTC: 1.00, ETH: 0.78, BNB: 0.65, SOL: 0.72 },
            ETH: { BTC: 0.78, ETH: 1.00, BNB: 0.69, SOL: 0.81 },
            BNB: { BTC: 0.65, ETH: 0.69, BNB: 1.00, SOL: 0.58 },
            SOL: { BTC: 0.72, ETH: 0.81, BNB: 0.58, SOL: 1.00 }
        };

        const tbody = document.querySelector('#correlationTable tbody');
        tbody.innerHTML = '';

        Object.keys(correlationData).forEach(asset1 => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${asset1}</strong></td>
                ${Object.keys(correlationData[asset1]).map(asset2 => 
                    `<td class="correlation-value">${correlationData[asset1][asset2].toFixed(2)}</td>`
                ).join('')}
            `;
            tbody.appendChild(row);
        });
    }

    async refreshData() {
        const refreshBtn = document.getElementById('refreshAnalyticsBtn');
        const icon = refreshBtn.querySelector('i');
        
        icon.style.animation = 'spin 1s linear infinite';
        refreshBtn.style.pointerEvents = 'none';

        await new Promise(resolve => setTimeout(resolve, 1000));

        await this.loadMarketData();
        this.updateCharts();
        
        icon.style.animation = '';
        refreshBtn.style.pointerEvents = 'auto';
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
}

let analyticsDashboard;

document.addEventListener('DOMContentLoaded', () => {
    analyticsDashboard = new AnalyticsDashboard();
    
    window.addEventListener('resize', () => {
        if (analyticsDashboard) {
            analyticsDashboard.initializeCharts();
        }
    });
});

