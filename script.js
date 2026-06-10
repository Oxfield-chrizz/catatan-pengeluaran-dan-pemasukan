// Data transaksi
let transactions = [];
let currentFilter = 'all'; // all, income, expense

// DOM Elements
const totalBalanceEl = document.getElementById('totalBalance');
const totalIncomeEl = document.getElementById('totalIncome');
const totalExpenseEl = document.getElementById('totalExpense');
const transactionsListEl = document.getElementById('transactionsList');
const clearAllBtn = document.getElementById('clearAllBtn');
const topIncomeCategoryEl = document.getElementById('topIncomeCategory');
const topExpenseCategoryEl = document.getElementById('topExpenseCategory');

// Form Elements
const incomeForm = document.getElementById('incomeForm');
const expenseForm = document.getElementById('expenseForm');
const incomeDesc = document.getElementById('incomeDesc');
const incomeAmount = document.getElementById('incomeAmount');
const incomeCategory = document.getElementById('incomeCategory');
const expenseDesc = document.getElementById('expenseDesc');
const expenseAmount = document.getElementById('expenseAmount');
const expenseCategory = document.getElementById('expenseCategory');

// Tab Elements
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const filterBtns = document.querySelectorAll('.filter-btn');

// Load data dari localStorage
function loadData() {
    const savedTransactions = localStorage.getItem('finance_app_transactions_v2');
    if (savedTransactions) {
        transactions = JSON.parse(savedTransactions);
    } else {
        // Data contoh
        transactions = [
            {
                id: Date.now() + 1,
                description: 'Gaji Bulanan',
                amount: 5000000,
                type: 'income',
                category: 'Gaji',
                date: new Date().toLocaleDateString('id-ID')
            },
            {
                id: Date.now() + 2,
                description: 'Makan Siang',
                amount: 35000,
                type: 'expense',
                category: 'Makanan',
                date: new Date().toLocaleDateString('id-ID')
            },
            {
                id: Date.now() + 3,
                description: 'Bonus Project',
                amount: 1000000,
                type: 'income',
                category: 'Bonus',
                date: new Date().toLocaleDateString('id-ID')
            },
            {
                id: Date.now() + 4,
                description: 'Transportasi',
                amount: 20000,
                type: 'expense',
                category: 'Transportasi',
                date: new Date().toLocaleDateString('id-ID')
            },
            {
                id: Date.now() + 5,
                description: 'Belanja Bulanan',
                amount: 500000,
                type: 'expense',
                category: 'Belanja',
                date: new Date().toLocaleDateString('id-ID')
            }
        ];
        saveData();
    }
    updateUI();
}

// Save data ke localStorage
function saveData() {
    localStorage.setItem('finance_app_transactions_v2', JSON.stringify(transactions));
}

// Format Rupiah
function formatRupiah(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Hitung total pemasukan
function calculateTotalIncome() {
    return transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
}

// Hitung total pengeluaran
function calculateTotalExpense() {
    return transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
}

// Hitung saldo
function calculateBalance() {
    return calculateTotalIncome() - calculateTotalExpense();
}

// Update tampilan saldo
function updateBalanceDisplay() {
    const balance = calculateBalance();
    const totalIncome = calculateTotalIncome();
    const totalExpense = calculateTotalExpense();
    
    totalBalanceEl.textContent = formatRupiah(balance);
    totalIncomeEl.textContent = formatRupiah(totalIncome);
    totalExpenseEl.textContent = formatRupiah(totalExpense);
    
    if (balance < 0) {
        totalBalanceEl.style.color = '#e74c3c';
    } else {
        totalBalanceEl.style.color = 'white';
    }
}

// Hitung statistik kategori
function updateCategoryStats() {
    // Hitung total per kategori untuk pemasukan
    const incomeByCategory = {};
    const expenseByCategory = {};
    
    transactions.forEach(t => {
        if (t.type === 'income') {
            incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + t.amount;
        } else {
            expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
        }
    });
    
    // Cari kategori terbesar
    let topIncome = { category: '-', amount: 0 };
    let topExpense = { category: '-', amount: 0 };
    
    for (const [category, amount] of Object.entries(incomeByCategory)) {
        if (amount > topIncome.amount) {
            topIncome = { category, amount };
        }
    }
    
    for (const [category, amount] of Object.entries(expenseByCategory)) {
        if (amount > topExpense.amount) {
            topExpense = { category, amount };
        }
    }
    
    topIncomeCategoryEl.innerHTML = topIncome.amount > 0 
        ? `${topIncome.category}<br><small>${formatRupiah(topIncome.amount)}</small>`
        : '-';
    
    topExpenseCategoryEl.innerHTML = topExpense.amount > 0
        ? `${topExpense.category}<br><small>${formatRupiah(topExpense.amount)}</small>`
        : '-';
}

// Render daftar transaksi berdasarkan filter
function renderTransactions() {
    let filteredTransactions = transactions;
    
    if (currentFilter === 'income') {
        filteredTransactions = transactions.filter(t => t.type === 'income');
    } else if (currentFilter === 'expense') {
        filteredTransactions = transactions.filter(t => t.type === 'expense');
    }
    
    if (filteredTransactions.length === 0) {
        let emptyMessage = '';
        if (currentFilter === 'income') {
            emptyMessage = 'Belum ada pemasukan';
        } else if (currentFilter === 'expense') {
            emptyMessage = 'Belum ada pengeluaran';
        } else {
            emptyMessage = 'Belum ada transaksi';
        }
        transactionsListEl.innerHTML = `
            <div class="empty-state">
                <p>✨ ${emptyMessage}</p>
                <p class="empty-sub">Tambahkan transaksi baru</p>
            </div>
        `;
        return;
    }
    
    const sortedTransactions = [...filteredTransactions].reverse();
    
    transactionsListEl.innerHTML = sortedTransactions.map(transaction => `
        <div class="transaction-item" data-id="${transaction.id}">
            <div class="transaction-info">
                <div class="transaction-desc">${escapeHtml(transaction.description)}</div>
                <div class="transaction-category">📁 ${transaction.category}</div>
                <div class="transaction-date">📅 ${transaction.date}</div>
            </div>
            <div class="transaction-amount ${transaction.type}">
                ${transaction.type === 'income' ? '+' : '-'} ${formatRupiah(transaction.amount)}
            </div>
            <button class="delete-btn" onclick="deleteTransaction(${transaction.id})" aria-label="Hapus">🗑️</button>
        </div>
    `).join('');
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Hapus transaksi
window.deleteTransaction = function(id) {
    const transaction = transactions.find(t => t.id === id);
    if (transaction) {
        const typeText = transaction.type === 'income' ? 'pemasukan' : 'pengeluaran';
        if (confirm(`Hapus ${typeText} "${transaction.description}"?`)) {
            transactions = transactions.filter(t => t.id !== id);
            saveData();
            updateUI();
            
            if (window.navigator && window.navigator.vibrate) {
                window.navigator.vibrate(50);
            }
        }
    }
}

// Tambah pemasukan
function addIncome(description, amount, category) {
    if (!description.trim()) {
        alert('Harap isi deskripsi pemasukan');
        return false;
    }
    
    if (amount <= 0) {
        alert('Jumlah pemasukan harus lebih dari 0');
        return false;
    }
    
    const newTransaction = {
        id: Date.now(),
        description: description.trim(),
        amount: amount,
        type: 'income',
        category: category,
        date: new Date().toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    };
    
    transactions.push(newTransaction);
    saveData();
    return true;
}

// Tambah pengeluaran
function addExpense(description, amount, category) {
    if (!description.trim()) {
        alert('Harap isi deskripsi pengeluaran');
        return false;
    }
    
    if (amount <= 0) {
        alert('Jumlah pengeluaran harus lebih dari 0');
        return false;
    }
    
    const newTransaction = {
        id: Date.now(),
        description: description.trim(),
        amount: amount,
        type: 'expense',
        category: category,
        date: new Date().toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    };
    
    transactions.push(newTransaction);
    saveData();
    return true;
}

// Update seluruh UI
function updateUI() {
    updateBalanceDisplay();
    updateCategoryStats();
    renderTransactions();
}

// Handle submit pemasukan
function handleIncomeSubmit(e) {
    e.preventDefault();
    
    const description = incomeDesc.value;
    const amount = parseInt(incomeAmount.value);
    const category = incomeCategory.value;
    
    if (addIncome(description, amount, category)) {
        incomeDesc.value = '';
        incomeAmount.value = '';
        incomeCategory.value = 'Gaji';
        incomeDesc.focus();
        updateUI();
        
        if (window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate(30);
        }
    }
}

// Handle submit pengeluaran
function handleExpenseSubmit(e) {
    e.preventDefault();
    
    const description = expenseDesc.value;
    const amount = parseInt(expenseAmount.value);
    const category = expenseCategory.value;
    
    if (addExpense(description, amount, category)) {
        expenseDesc.value = '';
        expenseAmount.value = '';
        expenseCategory.value = 'Makanan';
        expenseDesc.focus();
        updateUI();
        
        if (window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate(30);
        }
    }
}

// Hapus semua transaksi
function clearAllTransactions() {
    if (transactions.length === 0) {
        alert('Tidak ada transaksi untuk dihapus');
        return;
    }
    
    if (confirm('⚠️ Yakin ingin menghapus SEMUA transaksi? Tindakan ini tidak dapat dibatalkan.')) {
        transactions = [];
        saveData();
        updateUI();
        
        if (window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate(50);
        }
    }
}

// Switch tab
function switchTab(tabId) {
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabId).classList.add('active');
    
    tabBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabId) {
            btn.classList.add('active');
        }
    });
}

// Switch filter
function switchFilter(filter) {
    currentFilter = filter;
    
    filterBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        }
    });
    
    renderTransactions();
}

// Swipe to delete
let touchStartX = 0;
let touchEndX = 0;

function handleTouchStart(e) {
    touchStartX = e.changedTouches[0].screenX;
}

function handleTouchEnd(e) {
    touchEndX = e.changedTouches[0].screenX;
    const swipeDistance = touchEndX - touchStartX;
    
    if (swipeDistance < -50) {
        const transactionItem = e.target.closest('.transaction-item');
        if (transactionItem) {
            const id = parseInt(transactionItem.dataset.id);
            if (id && !isNaN(id)) {
                window.deleteTransaction(id);
            }
        }
    }
}

// Event Listeners
incomeForm.addEventListener('submit', handleIncomeSubmit);
expenseForm.addEventListener('submit', handleExpenseSubmit);
clearAllBtn.addEventListener('click', clearAllTransactions);

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => switchFilter(btn.dataset.filter));
});

document.addEventListener('touchstart', handleTouchStart, false);
document.addEventListener('touchend', handleTouchEnd, false);

// Inisialisasi
loadData();