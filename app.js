// --- INITIALIZATION ---
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const menuBtn = document.getElementById('menuBtn');
const appContent = document.getElementById('appContent');
const pageTitle = document.getElementById('pageTitle');
const toast = document.getElementById('toast');
const darkModeToggle = document.getElementById('darkModeToggle');

const footerBranding = `<div class="page-footer">SakuPelajar &copy; 2026 Crafted by Putra Maryu (PaTraawID)</div>`;

// --- DARK MODE LOGIC ---
if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    darkModeToggle.checked = true;
}

darkModeToggle.addEventListener('change', () => {
    if (darkModeToggle.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
    }
});

// --- CORE FUNCTIONS ---
function toggleSidebar() {
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

function showToast(msg) {
    toast.innerText = msg;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 3000);
}

function formatRupiah(num) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
}

function calculateSummary(data) {
    let income = 0, expense = 0, savings = 0, outToday = 0, inToday = 0;
    const today = new Date().toDateString();
    data.forEach(item => {
        const val = Math.round(Number(item.amount)) || 0; // PaTraaw
        if (item.type === 'pemasukan') {
            income += val;
            if (new Date(item.createdAt).toDateString() === today) inToday += val;
        } else if (item.type === 'pengeluaran') {
            expense += val;
            if (new Date(item.createdAt).toDateString() === today) outToday += val;
        } else if (item.type === 'tabungan') savings += val;
    });
    return { 
        saldo: income - expense - savings, 
        outToday, inToday, savings, 
        totalIncome: income, totalExpense: expense 
    };
}

// --- RENDER LOGIC ---
async function renderPage(page) {
    const data = await getAllTransactions();
    const summary = calculateSummary(data);
    
    document.querySelectorAll('.nav-links li').forEach(li => li.classList.toggle('active', li.dataset.target === page));

    switch(page) {
        case 'dashboard':
            pageTitle.innerText = "Dashboard";
            appContent.innerHTML = `
                <div class="card accordion" style="margin-bottom: 1rem; border: 2px dashed var(--primary); background: rgba(37, 99, 235, 0.05); cursor: pointer;" onclick="this.classList.toggle('active')">
                    <div class="accordion-header">
                        <div>
                            <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.2rem;">Panduan Aplikasi</p>
                            <h2 style="color: var(--primary); margin: 0; font-size: 1.5rem;">Tutorial Pemasangan</h2>
                        </div>
                        <span class="accordion-icon" style="font-size: 1.5rem;">▼</span>
                    </div>
                    <div class="accordion-content">
                        <div style="font-size: 0.85rem; color: var(--text-main); margin-top: 1rem; border-top: 1px solid var(--border); padding-top: 1rem;">
                            <p style="margin-bottom: 0.5rem; font-weight:600;">Pengguna Android (Chrome):</p>
                            <ol style="margin-left: 1.2rem; margin-bottom: 1rem; display: flex; flex-direction: column; gap: 0.3rem;">
                                <li>Ketuk ikon <b>titik tiga</b> (<span style="letter-spacing:2px">⋮</span>) di pojok kanan atas.</li>
                                <li>Pilih menu <b>"Tambahkan ke Layar Utama"</b>.</li>
                                <li>Ketuk <b>"Instal"</b> pada pop-up yang muncul.</li>
                            </ol>
                            <p style="margin-bottom: 0.5rem; font-weight:600;">Pengguna iPhone (Safari):</p>
                            <ol style="margin-left: 1.2rem; display: flex; flex-direction: column; gap: 0.3rem;">
                                <li>Ketuk ikon <b>Share/Bagikan</b> di bagian bawah layar.</li>
                                <li>Pilih menu <b>"Tambah ke Layar Utama"</b> (ikon +).</li>
                                <li>Ketuk <b>"Tambah"</b> di pojok kanan atas.</li>
                            </ol>
                        </div>
                    </div>
                </div>
                <div class="card card-balance"><p>Saldo Tersedia</p><h2>${formatRupiah(summary.saldo)}</h2></div>
                <div class="card">
                    <h4 style="margin-bottom:1rem">Alokasi Dana</h4>
                    <div class="chart-container"><canvas id="summaryChart"></canvas></div>
                </div>
                <div class="grid-2">
                    <div class="card"><small>Masuk Hari Ini</small><p style="color:var(--success);font-weight:bold">${formatRupiah(summary.inToday)}</p></div>
                    <div class="card"><small>Keluar Hari Ini</small><p style="color:var(--danger);font-weight:bold">${formatRupiah(summary.outToday)}</p></div>
                    <div class="card"><small>Total Tabungan</small><p style="color:var(--warning);font-weight:bold">${formatRupiah(summary.savings)}</p></div>
                </div>
                <h3 style="margin:1.5rem 0 0.8rem">Aktivitas Terakhir</h3>
                <div class="card" style="padding:0">${renderList(data.slice(0, 5))}</div>
                <div class="card" style="text-align:center">
                    <h4>Informasi Developer</h4>
                    <p>SakuPelajar v1.0 dikembangkan oleh <b>Putra Maryu (PaTraawID)</b></p>
                    <p style="font-size:0.8rem; color:var(--text-muted)">SMK PGRI Telagasari 2026</p>
                </div>
                ${footerBranding}
            `;
            renderChart(summary);
            break;

        case 'tambah':
            pageTitle.innerText = "Tambah Transaksi";
            appContent.innerHTML = `
                <div class="card">
                    <form id="txForm">
                        <div class="form-group"><label>Keterangan</label><input type="text" id="title" required placeholder="Contoh: Bekal"></div>
                        <div class="form-group"><label>Nominal (Rp)</label><input type="text" inputmode="numeric" pattern="[0-9]*" id="amount" required placeholder="Contoh: 50000"></div>
                        <div class="form-group"><label>Jenis</label><select id="type">
                            <option value="pengeluaran">Pengeluaran</option>
                            <option value="pemasukan">Pemasukan</option>
                            <option value="tabungan">Tabungan Cash</option>
                        </select></div>
                        <div class="form-group"><label>Catatan</label><textarea id="note"></textarea></div>
                        <button type="submit" class="btn">Simpan</button>
                    </form>
                </div>
            `;
            document.getElementById('txForm').onsubmit = handleFormSubmit;
            break;

        case 'riwayat':
            pageTitle.innerText = "Riwayat";
            appContent.innerHTML = `<div class="card" style="padding:0">${renderList(data, true)}</div>
            <div class="card" style="text-align:center">
                    <h4>Informasi Developer</h4>
                    <p>SakuPelajar v1.0 dikembangkan oleh <b>Putra Maryu (PaTraawID)</b></p>
                    <p style="font-size:0.8rem; color:var(--text-muted)">SMK PGRI Telagasari 2026</p>
            </div>
            ${footerBranding}`;
            break;

        case 'target':
            const targets = JSON.parse(localStorage.getItem('savingTargets') || '[]');
            let targetCards = '';
            targets.forEach((t, i) => {
                const progress = t.nominal > 0 ? Math.min((summary.savings / t.nominal) * 100, 100) : 0;
                const kurang = Math.max(t.nominal - summary.savings, 0);
                targetCards += `
                    <div class="card">
                        <h4>Target ${i+1}: ${t.name}</h4>
                        <h2 style="color:var(--primary); margin:0.5rem 0">${formatRupiah(t.nominal)}</h2>
                        <div style="display:flex; justify-content:space-between; margin-bottom: 0.5rem">
                            <p><small>Terkumpul: <b style="color:var(--success)">${formatRupiah(summary.savings)}</b></small></p>
                            <p><small>Kurang: <b style="color:var(--danger)">${formatRupiah(kurang)}</b></small></p>
                        </div>
                        <div class="progress-container"><div class="progress-bar" style="width:${progress}%"></div></div>
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-top: 0.5rem">
                            <p><small>${progress.toFixed(1)}% Tercapai</small></p>
                            <button class="btn" style="background:var(--danger); padding:0.4rem; width:auto; font-size:0.8rem" onclick="deleteTarget(${i})">Hapus</button>
                        </div>
                    </div>
                `;
            });

            pageTitle.innerText = "Target Tabungan";
            appContent.innerHTML = `
                ${targetCards}
                <div class="card">
                    <h4>Atur Target Baru</h4>
                    <div class="form-group"><input type="text" id="newTargetName" placeholder="Nama Barang (contoh: HP Baru)"></div>
                    <div class="form-group"><input type="text" inputmode="numeric" pattern="[0-9]*" id="newTarget" placeholder="Contoh: 10000"></div>
                    <button class="btn" onclick="saveTarget()">Tambah Target</button>
                </div>
                <div class="card" style="text-align:center">
                    <h4>Informasi Developer</h4>
                    <p>SakuPelajar v1.0 dikembangkan oleh <b>Putra Maryu (PaTraawID)</b></p>
                    <p style="font-size:0.8rem; color:var(--text-muted)">SMK PGRI Telagasari 2026</p>
                </div>
            `;
            break;

        case 'pengaturan':
            pageTitle.innerText = "Pengaturan";
            appContent.innerHTML = `
                <div class="card">
                    <button class="btn" id="exportBtn" style="margin-bottom:1rem">Export Data (JSON)</button>
                    <button class="btn" id="resetBtn" style="background:var(--danger)">Hapus Seluruh Data</button>
                </div>
                <div class="card" style="text-align:center">
                    <h4>Informasi Developer</h4>
                    <p>SakuPelajar v1.0 dikembangkan oleh <b>Putra Maryu (PaTraawID)</b></p>
                    <p style="font-size:0.8rem; color:var(--text-muted)">SMK PGRI Telagasari 2026</p>
                </div>
            `;
            document.getElementById('exportBtn').onclick = () => {
                const blob = new Blob([JSON.stringify(data)], {type:'application/json'});
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `SakuPelajar_Backup_${new Date().toISOString().slice(0,10)}.json`;
                a.click();
            };
            document.getElementById('resetBtn').onclick = async () => {
                if(confirm("Hapus seluruh data secara permanen?")) { await clearDatabase(); location.reload(); }
            };
            break;
            
        case 'panduan':
            pageTitle.innerText = "Cara Pakai";
            appContent.innerHTML = `<div class="card">
                    <h4 style="color:var(--primary); margin-bottom:0.5rem">1. Input Transaksi</h4>
                    <p>Gunakan menu Tambah Transaksi untuk mengatur pemasukan dan pengeluaran. Saldo akan otomatis terpotong jika Anda memilih Pengeluaran atau Tabungan.</p><br>
                    <h4 style="color:var(--primary); margin-bottom:0.5rem">2. Proteksi Saldo</h4>
                    <p>SakuPelajar akan menolak pengeluaran jika saldo Anda tidak cukup. Ini melatih disiplin finansial.</p><br>
                    <h4 style="color:var(--primary); margin-bottom:0.5rem">3. PWA (Aplikasi HP)</h4>
                    <p>Klik "Tambahkan ke Layar Utama" di browser Chrome untuk menginstal aplikasi ini secara permanen di HP Anda.</p>
                </div>
                <div class="card" style="text-align:center">
                    <h4>Informasi Developer</h4>
                    <p>SakuPelajar v1.0 dikembangkan oleh <b>Putra Maryu (PaTraawID)</b></p>
                    <p style="font-size:0.8rem; color:var(--text-muted)">SMK PGRI Telagasari 2026</p>
                </div>`;
            break;

        case 'keamanan':
            pageTitle.innerText = "Keamanan Data";
            appContent.innerHTML = `<div class="card" style="border-left: 5px solid var(--warning)">
                    <h4 style="color:var(--warning)">Data Tersimpan Lokal</h4>
                    <p>Data Anda 100% aman di dalam memori internal browser Anda. SakuPelajar <b>tidak menggunakan server</b> atau mengirim data ke internet.</p><br>
                    <h4 style="color:var(--danger)">Peringatan Cache</h4>
                    <p>Jika Anda melakukan "Hapus Data Browser", data SakuPelajar akan hilang. Selalu lakukan Export Data secara rutin sebagai backup.</p>
                </div>
                <div class="card" style="text-align:center">
                    <h4>Informasi Developer</h4>
                    <p>SakuPelajar v1.0 dikembangkan oleh <b>Putra Maryu (PaTraawID)</b></p>
                    <p style="font-size:0.8rem; color:var(--text-muted)">SMK PGRI Telagasari 2026</p>
                </div>`;
            break;
    }
}

let summaryChartInstance = null;
function renderChart(summary) {
    if (typeof Chart === 'undefined') return;
    const ctx = document.getElementById('summaryChart');
    if(!ctx) return;
    if (summaryChartInstance) {
        summaryChartInstance.destroy();
    }
    summaryChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Keluar', 'Simpan'],
            datasets: [{
                data: [summary.totalExpense, summary.savings],
                backgroundColor: ['#ef4444', '#f59e0b'],
                borderWidth: 0
            }]
        },
        options: {
            cutout: '70%',
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-main') } } }
        }
    });
}

window.saveTarget = () => {
    const targets = JSON.parse(localStorage.getItem('savingTargets') || '[]');
    if(targets.length >= 3) {
        showToast("Maksimal 3 target tabungan!");
        return;
    }
    const val = document.getElementById('newTarget').value;
    const name = document.getElementById('newTargetName').value || 'Tabungan';
    const numVal = Math.round(Number(val));
    if(numVal > 0) {
        targets.push({ name: name, nominal: numVal });
        localStorage.setItem('savingTargets', JSON.stringify(targets));
        showToast("Target ditambahkan!");
        renderPage('target');
    } else {
        showToast("Nominal harus lebih dari 0!");
    }
}

window.deleteTarget = (index) => {
    if(confirm("Apakah Anda yakin ingin menghapus target tabungan ini?")) {
        const targets = JSON.parse(localStorage.getItem('savingTargets') || '[]');
        targets.splice(index, 1);
        localStorage.setItem('savingTargets', JSON.stringify(targets));
        showToast("Target dihapus!");
        renderPage('target');
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    const amount = Math.round(Number(document.getElementById('amount').value)) || 0;
    
    if (amount <= 0) {
        showToast("Nominal harus lebih dari 0!");
        return;
    }

    const type = document.getElementById('type').value;
    
    const currentData = await getAllTransactions();
    const currentSummary = calculateSummary(currentData);
    
    if (['pengeluaran', 'tabungan'].includes(type) && amount > currentSummary.saldo) {
        showToast(`Saldo tidak cukup! Sisa: ${formatRupiah(currentSummary.saldo)}`);
        return;
    }

    await addTransaction({
        title: document.getElementById('title').value,
        amount: amount,
        type: type,
        note: document.getElementById('note').value
    });
    
    if(navigator.vibrate) navigator.vibrate(50);
    renderPage('dashboard');
}

function renderList(items, withDel = false) {
    if(!items.length) return `<p style="padding:2rem;text-align:center;color:var(--text-muted)">Belum ada transaksi.</p>`;
    return items.map(item => {
        const dateObj = new Date(item.createdAt);
        const time = dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        return `
        <div class="item-card" style="display:flex;justify-content:space-between;padding:1rem;border-bottom:1px solid var(--border)">
            <div>
                <p><b>${item.title}</b></p>
                <span class="badge type-${item.type}">${item.type}</span>
                <small style="display:block; color:var(--text-muted); margin-top:4px">${time}</small>
                ${item.note ? `<p style="font-size:0.85rem; color:var(--text-muted); margin-top:0.5rem; font-style:italic">Catatan: ${item.note}</p>` : ''}
            </div>
            <div style="text-align:right">
                <p><b>${formatRupiah(item.amount)}</b></p>
                ${withDel ? `<small style="color:var(--danger);cursor:pointer;font-weight:bold" onclick="handleDelete(${item.id})">Hapus</small>` : ''}
            </div>
        </div>
    `}).join('');
}

window.handleDelete = async (id) => {
    if(confirm("Hapus data ini?")) { await deleteTransaction(id); renderPage('riwayat'); }
};

menuBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleSidebar(); });
overlay.addEventListener('click', toggleSidebar);
document.querySelectorAll('.nav-links li').forEach(li => {
    li.addEventListener('click', () => {
        renderPage(li.getAttribute('data-target'));
        toggleSidebar();
    });
});

renderPage('dashboard');

// Auto-clean database for any floating point anomalies from older versions
async function cleanDatabase() {
    try {
        const data = await getAllTransactions();
        let changed = false;
        data.forEach(async (item) => {
            const rounded = Math.round(Number(item.amount));
            if (item.amount !== rounded) {
                item.amount = rounded;
                const db = await initDB();
                const tx = db.transaction('transactions', 'readwrite');
                tx.objectStore('transactions').put(item);
                changed = true;
            }
        });
        if(changed) {
            setTimeout(() => location.reload(), 500);
        }
    } catch(e) {}
}
cleanDatabase();
