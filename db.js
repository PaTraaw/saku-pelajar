const DB_NAME = 'SakuPelajarDB';
const STORE_NAME = 'transactions';

async function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject("IndexedDB Error");
    });
}

async function addTransaction(data) {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).add({ ...data, createdAt: new Date() });
    return new Promise(r => tx.oncomplete = r);
}

async function getAllTransactions() {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    return new Promise(r => {
        tx.objectStore(STORE_NAME).getAll().onsuccess = (e) => r(e.target.result.reverse());
    });
}

async function deleteTransaction(id) {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    return new Promise(r => tx.oncomplete = r);
}

async function clearDatabase() {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).clear();
    return new Promise(r => tx.oncomplete = r);
}