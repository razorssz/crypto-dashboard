class PortfolioManager {
    constructor() {
        this.portfolio = this.loadPortfolio();
        this.cryptoData = [];
        this.chart = null;
        
        this.init();
    }

    async init() {
        await this.loadCryptoData();
        this.setupEventListeners();
        this.updatePortfolioDisplay();
        this.initializeChart();
    }

    setupEventListeners() {
        document.getElementById('addAssetBtn').addEventListener('click', () => {
            this.openAddAssetModal();
        });

        document.getElementById('closeModalBtn').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('addAssetForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addAsset();
        });

        document.getElementById('refreshPortfolioBtn').addEventListener('click', () => {
            this.refreshPortfolio();
        });

        document.getElementById('sortSelect').addEventListener('change', (e) => {
            this.sortPortfolio(e.target.value);
        });

        document.getElementById('transactionFilter').addEventListener('change', (e) => {
            this.filterTransactions(e.target.value);
        });

        document.getElementById('clearDataBtn').addEventListener('click', () => {
            this.clearPortfolio();
        });

        document.getElementById('exportDataBtn').addEventListener('click', () => {
            this.exportPortfolio();
        });
    }

    async loadCryptoData() {
        const cryptoData = [
            { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', price: 43250.67, change24h: 2.34 },
            { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', price: 2580.45, change24h: -1.23 },
            { id: 'binancecoin', name: 'BNB', symbol: 'BNB', price: 315.89, change24h: 4.56 },
            { id: 'solana', name: 'Solana', symbol: 'SOL', price: 98.76, change24h: 7.89 },
            { id: 'cardano', name: 'Cardano', symbol: 'ADA', price: 0.52, change24h: -2.15 },
            { id: 'xrp', name: 'XRP', symbol: 'XRP', price: 0.61, change24h: 1.87 },
            { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE', price: 0.084, change24h: 5.23 },
            { id: 'avalanche', name: 'Avalanche', symbol: 'AVAX', price: 36.45, change24h: -0.89 }
        ];

        this.cryptoData = cryptoData;
        this.populateAssetSelect();
    }

    populateAssetSelect() {
        const select = document.getElementById('assetSelect');
        select.innerHTML = '<option value="">Choose an asset</option>';
        
        this.cryptoData.forEach(crypto => {
            const option = document.createElement('option');
            option.value = crypto.id;
            option.textContent = `${crypto.name} (${crypto.symbol}) - $${this.formatPrice(crypto.price)}`;
            select.appendChild(option);
        });
    }

    openAddAssetModal() {
        document.getElementById('addAssetModal').style.display = 'flex';
        document.getElementById('transactionDateInput').value = new Date().toISOString().split('T')[0];
    }

    closeModal() {
        document.getElementById('addAssetModal').style.display = 'none';
        document.getElementById('addAssetForm').reset();
    }

    addAsset() {
        const assetId = document.getElementById('assetSelect').value;
        const amount = parseFloat(document.getElementById('amountInput').value);
        const buyPrice = parseFloat(document.getElementById('buyPriceInput').value);
        const transactionDate = document.getElementById('transactionDateInput').value;

        if (!assetId || !amount || !buyPrice || !transactionDate) {
            alert('Please fill in all fields');
            return;
        }

        const crypto = this.cryptoData.find(c => c.id === assetId);
        if (!crypto) return;

        const transaction = {
            id: Date.now(),
            type: 'buy',
            assetId: assetId,
            assetName: crypto.name,
            assetSymbol: crypto.symbol,
            amount: amount,
            price: buyPrice,
            total: amount * buyPrice,
            date: transactionDate,
            status: 'completed'
        };

        this.portfolio.transactions.push(transaction);
        this.updatePortfolioHoldings();
        this.updatePortfolioDisplay();
        this.closeModal();
        this.savePortfolio();
    }

    updatePortfolioHoldings() {
        const holdings = {};
        
        this.portfolio.transactions.forEach(transaction => {
            if (transaction.status !== 'completed') return;
            
            if (!holdings[transaction.assetId]) {
                holdings[transaction.assetId] = {
                    assetId: transaction.assetId,
                    assetName: transaction.assetName,
                    assetSymbol: transaction.assetSymbol,
                    totalAmount: 0,
                    totalCost: 0,
                    transactions: []
                };
            }

            if (transaction.type === 'buy') {
                holdings[transaction.assetId].totalAmount += transaction.amount;
                holdings[transaction.assetId].totalCost += transaction.total;
            } else if (transaction.type === 'sell') {
                holdings[transaction.assetId].totalAmount -= transaction.amount;
                holdings[transaction.assetId].totalCost -= transaction.total;
            }

            holdings[transaction.assetId].transactions.push(transaction);
        });

        this.portfolio.holdings = Object.values(holdings).filter(h => h.totalAmount > 0);
    }

    updatePortfolioDisplay() {
        this.updatePortfolioStats();
        this.updatePortfolioTable();
        this.updateTransactionTable();
    }

    updatePortfolioStats() {
        let totalValue = 0;
        let totalCost = 0;
        let bestPerformer = null;
        let bestChange = -Infinity;

        this.portfolio.holdings.forEach(holding => {
            const crypto = this.cryptoData.find(c => c.id === holding.assetId);
            if (!crypto) return;

            const currentValue = holding.totalAmount * crypto.price;
            const pnl = currentValue - holding.totalCost;
            const change = (pnl / holding.totalCost) * 100;

            totalValue += currentValue;
            totalCost += holding.totalCost;

            if (change > bestChange) {
                bestChange = change;
                bestPerformer = holding.assetSymbol;
            }
        });

        const totalPnl = totalValue - totalCost;
        const totalChange = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

        document.getElementById('totalPortfolioValue').textContent = this.formatCurrency(totalValue);
        document.getElementById('portfolioChange').textContent = `${totalChange >= 0 ? '+' : ''}${totalChange.toFixed(2)}%`;
        document.getElementById('portfolioChange').className = `stat-change ${totalChange >= 0 ? 'positive' : 'negative'}`;

        document.getElementById('portfolio24hChange').textContent = this.formatCurrency(totalValue * 0.024);
        document.getElementById('portfolio24hPercent').textContent = '+2.40%';

        document.getElementById('bestPerformer').textContent = bestPerformer || 'N/A';
        document.getElementById('bestPerformerChange').textContent = bestPerformer ? `${bestChange >= 0 ? '+' : ''}${bestChange.toFixed(2)}%` : '+0.00%';

        document.getElementById('assetsCount').textContent = this.portfolio.holdings.length;
    }

    updatePortfolioTable() {
        const tbody = document.getElementById('portfolioTableBody');
        tbody.innerHTML = '';

        this.portfolio.holdings.forEach(holding => {
            const crypto = this.cryptoData.find(c => c.id === holding.assetId);
            if (!crypto) return;

            const currentValue = holding.totalAmount * crypto.price;
            const pnl = currentValue - holding.totalCost;
            const change = (pnl / holding.totalCost) * 100;
            const allocation = (currentValue / this.getTotalPortfolioValue()) * 100;
            const avgBuyPrice = holding.totalCost / holding.totalAmount;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="crypto-symbol">
                        <div class="crypto-icon">${holding.assetSymbol.charAt(0)}</div>
                        <div>
                            <div class="crypto-name">${holding.assetName}</div>
                            <div class="crypto-symbol-text">${holding.assetSymbol}</div>
                        </div>
                    </div>
                </td>
                <td class="price">${holding.totalAmount.toFixed(8)}</td>
                <td class="price">$${avgBuyPrice.toFixed(2)}</td>
                <td class="price">$${this.formatPrice(crypto.price)}</td>
                <td class="price">$${this.formatCurrency(currentValue)}</td>
                <td>
                    <span class="change ${crypto.change24h >= 0 ? 'positive' : 'negative'}">
                        ${crypto.change24h >= 0 ? '+' : ''}${crypto.change24h.toFixed(2)}%
                    </span>
                </td>
                <td>
                    <span class="change ${pnl >= 0 ? 'positive' : 'negative'}">
                        ${pnl >= 0 ? '+' : ''}${change.toFixed(2)}%
                    </span>
                </td>
                <td class="price">${allocation.toFixed(1)}%</td>
                <td>
                    <button class="action-btn small" onclick="portfolioManager.sellAsset('${holding.assetId}')">
                        <i class="fas fa-minus"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    updateTransactionTable() {
        const tbody = document.getElementById('transactionTableBody');
        const filter = document.getElementById('transactionFilter').value;
        
        let transactions = this.portfolio.transactions;
        if (filter !== 'all') {
            transactions = transactions.filter(t => t.type === filter);
        }

        tbody.innerHTML = '';

        transactions.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(transaction => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(transaction.date).toLocaleDateString()}</td>
                <td>
                    <span class="transaction-type ${transaction.type}">${transaction.type.toUpperCase()}</span>
                </td>
                <td>
                    <div class="crypto-symbol">
                        <div class="crypto-icon">${transaction.assetSymbol.charAt(0)}</div>
                        <span>${transaction.assetSymbol}</span>
                    </div>
                </td>
                <td class="price">${transaction.amount.toFixed(8)}</td>
                <td class="price">$${transaction.price.toFixed(2)}</td>
                <td class="price">$${this.formatCurrency(transaction.total)}</td>
                <td>
                    <span class="status ${transaction.status}">${transaction.status}</span>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    sellAsset(assetId) {
        const holding = this.portfolio.holdings.find(h => h.assetId === assetId);
        if (!holding) return;

        const amount = prompt(`How much ${holding.assetSymbol} do you want to sell? (Available: ${holding.totalAmount.toFixed(8)})`);
        if (!amount || isNaN(amount) || parseFloat(amount) <= 0 || parseFloat(amount) > holding.totalAmount) {
            alert('Invalid amount');
            return;
        }

        const crypto = this.cryptoData.find(c => c.id === assetId);
        const sellPrice = crypto ? crypto.price : parseFloat(prompt('Enter sell price:'));

        const transaction = {
            id: Date.now(),
            type: 'sell',
            assetId: assetId,
            assetName: holding.assetName,
            assetSymbol: holding.assetSymbol,
            amount: parseFloat(amount),
            price: sellPrice,
            total: parseFloat(amount) * sellPrice,
            date: new Date().toISOString().split('T')[0],
            status: 'completed'
        };

        this.portfolio.transactions.push(transaction);
        this.updatePortfolioHoldings();
        this.updatePortfolioDisplay();
        this.savePortfolio();
    }

    sortPortfolio(sortBy) {
        this.portfolio.holdings.sort((a, b) => {
            const cryptoA = this.cryptoData.find(c => c.id === a.assetId);
            const cryptoB = this.cryptoData.find(c => c.id === b.assetId);
            
            if (!cryptoA || !cryptoB) return 0;

            const valueA = a.totalAmount * cryptoA.price;
            const valueB = b.totalAmount * cryptoB.price;
            const changeA = cryptoA.change24h;
            const changeB = cryptoB.change24h;
            const allocationA = (valueA / this.getTotalPortfolioValue()) * 100;
            const allocationB = (valueB / this.getTotalPortfolioValue()) * 100;

            switch (sortBy) {
                case 'value':
                    return valueB - valueA;
                case 'change':
                    return changeB - changeA;
                case 'name':
                    return a.assetName.localeCompare(b.assetName);
                case 'percentage':
                    return allocationB - allocationA;
                default:
                    return 0;
            }
        });

        this.updatePortfolioTable();
    }

    filterTransactions(filter) {
        this.updateTransactionTable();
    }

    getTotalPortfolioValue() {
        return this.portfolio.holdings.reduce((total, holding) => {
            const crypto = this.cryptoData.find(c => c.id === holding.assetId);
            return total + (crypto ? holding.totalAmount * crypto.price : 0);
        }, 0);
    }

    initializeChart() {
        const ctx = document.getElementById('allocationChart');
        if (!ctx) return;

        this.chart = ctx.getContext('2d');
        this.drawAllocationChart();
    }

    drawAllocationChart() {
        const canvas = document.getElementById('allocationChart');
        const ctx = this.chart;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 20;

        canvas.width = canvas.offsetWidth * 2;
        canvas.height = canvas.offsetHeight * 2;
        ctx.scale(2, 2);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (this.portfolio.holdings.length === 0) {
            ctx.fillStyle = '#71717a';
            ctx.font = '14px Inter';
            ctx.textAlign = 'center';
            ctx.fillText('No assets in portfolio', centerX, centerY);
            return;
        }

        const totalValue = this.getTotalPortfolioValue();
        let currentAngle = 0;
        const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

        this.portfolio.holdings.forEach((holding, index) => {
            const crypto = this.cryptoData.find(c => c.id === holding.assetId);
            if (!crypto) return;

            const value = holding.totalAmount * crypto.price;
            const percentage = value / totalValue;
            const sliceAngle = percentage * 2 * Math.PI;

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();
            ctx.fillStyle = colors[index % colors.length];
            ctx.fill();

            const labelAngle = currentAngle + sliceAngle / 2;
            const labelX = centerX + Math.cos(labelAngle) * (radius + 30);
            const labelY = centerY + Math.sin(labelAngle) * (radius + 30);

            ctx.fillStyle = '#ffffff';
            ctx.font = '12px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(holding.assetSymbol, labelX, labelY);

            currentAngle += sliceAngle;
        });
    }

    refreshPortfolio() {
        this.loadCryptoData().then(() => {
            this.updatePortfolioDisplay();
            this.drawAllocationChart();
        });
    }

    loadPortfolio() {
        const saved = localStorage.getItem('cryptoPortfolio');
        return saved ? JSON.parse(saved) : { holdings: [], transactions: [] };
    }

    savePortfolio() {
        localStorage.setItem('cryptoPortfolio', JSON.stringify(this.portfolio));
    }

    clearPortfolio() {
        if (confirm('Are you sure you want to clear all portfolio data? This cannot be undone.')) {
            this.portfolio = { holdings: [], transactions: [] };
            this.savePortfolio();
            this.updatePortfolioDisplay();
            this.drawAllocationChart();
        }
    }

    exportPortfolio() {
        const data = {
            portfolio: this.portfolio,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `crypto-portfolio-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
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
}

let portfolioManager;

document.addEventListener('DOMContentLoaded', () => {
    portfolioManager = new PortfolioManager();
    
    window.addEventListener('resize', () => {
        portfolioManager.drawAllocationChart();
    });
});

