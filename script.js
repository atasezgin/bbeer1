// --- VERİTABANI & KONFİGÜRASYON ---
const products = [
    { 
        id: 1, name: "Efes Malt", kegLevel: 85, price: 70, 
        img: "https://via.placeholder.com/150x250/f39c12/000?text=EFES", 
        sizes: [{label: "33 cl", val: 33}, {label: "50 cl", val: 50}],
        tags: ["chill", "light"],
        snackPair: { name: "Baharatlı Patates", img: "https://via.placeholder.com/150x150/f39c12/fff?text=Patates", price: 30 }
    },
    { 
        id: 2, name: "Tuborg Gold", kegLevel: 42, price: 75, 
        img: "https://via.placeholder.com/150x250/c0392b/fff?text=TUBORG", 
        sizes: [{label: "33 cl", val: 33}, {label: "50 cl", val: 50}],
        tags: ["chill", "strong"],
        snackPair: { name: "Tuzlu Fıstık", img: "https://via.placeholder.com/150x150/d35400/fff?text=Fistik", price: 25 }
    },
    { 
        id: 3, name: "Bomonti Filtresiz", kegLevel: 10, price: 80, 
        img: "https://via.placeholder.com/150x250/d35400/fff?text=BOMONTI", 
        sizes: [{label: "50 cl", val: 50}],
        tags: ["party", "light"],
        snackPair: { name: "Mısır Cipsi", img: "https://via.placeholder.com/150x150/f1c40f/000?text=Cips", price: 35 }
    },
    { 
        id: 4, name: "Guinness", kegLevel: 60, price: 135, 
        img: "https://via.placeholder.com/150x250/000/fff?text=GUINNESS", 
        sizes: [{label: "44 cl", val: 44}],
        tags: ["chill", "strong"],
        snackPair: { name: "Bitter Çikolata", img: "https://via.placeholder.com/150x150/3e2723/fff?text=Cikolata", price: 40 }
    },
    { 
        id: 5, name: "Amsterdam", kegLevel: 90, price: 120, 
        img: "https://via.placeholder.com/150x250/000/e74c3c?text=AMSTERDAM", 
        sizes: [{label: "50 cl", val: 50}],
        tags: ["party", "strong"],
        snackPair: { name: "Kuru Et", img: "https://via.placeholder.com/150x150/c0392b/fff?text=Et", price: 50 }
    },
    { 
        id: 6, name: "Corona", kegLevel: 5, price: 105, 
        img: "https://via.placeholder.com/150x250/f1c40f/000?text=CORONA", 
        sizes: [{label: "33 cl", val: 33}],
        tags: ["party", "light"],
        snackPair: { name: "Limon & Tuz", img: "https://via.placeholder.com/150x150/27ae60/fff?text=Limon", price: 10 }
    }
];

let cart = [];
let adminClickCount = 0;
let dailyRevenue = 0;
let idleTimer;
let userPreferences = { mood: '', taste: '' };
let recommendedProduct = null;
let tempSelection = null;

// --- INITIALIZE ---
document.addEventListener('DOMContentLoaded', () => {
    renderGrid();
    updateClock();
    simulateTemp();
    resetIdleTimer();
    updateAdminStats();
    
    // Screensaver event listenerları
    document.body.addEventListener('click', wakeUp);
    document.body.addEventListener('mousemove', resetIdleTimer);
});

// --- RENDER GRID (SİHİRBAZ + ÜRÜNLER) ---
function renderGrid() {
    const container = document.getElementById('product-container');
    
    // 1. Sihirbaz Kartı
    let html = `
        <div class="wizard-card-btn" onclick="openWizard()">
            <div class="sparkle"></div>
            <i class="fa-solid fa-wand-magic-sparkles"></i>
            <h3>NE İÇSEM?</h3>
            <p>Sihirbaz Seçsin</p>
        </div>
    `;

    // 2. Ürünler
    html += products.map(p => {
        const isOutOfStock = p.kegLevel <= 0;
        return `
        <div class="product-card" id="card-${p.id}" style="${isOutOfStock ? 'opacity:0.5; pointer-events:none' : ''}" onclick="openSizeModal(${p.id})">
            ${p.kegLevel < 15 && !isOutOfStock ? '<div class="card-badge">BİTİYOR!</div>' : ''}
            ${isOutOfStock ? '<div class="card-badge" style="background:gray">TÜKENDİ</div>' : ''}
            <img src="${p.img}" alt="${p.name}" class="product-img">
            <div class="product-info">
                <div class="product-name">${p.name}</div>
                <div class="product-tech"><i class="fa-solid fa-beer-mug-empty"></i> Stok: %${p.kegLevel}</div>
            </div>
        </div>
    `}).join('');
    
    container.innerHTML = html;
    add3DTiltEffect();
}

// --- 3D TILT EFFECT ---
function add3DTiltEffect() {
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -10;
            const rotateY = ((x - centerX) / centerX) * 10;
            card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = `rotateX(0) rotateY(0)`;
        });
    });
}

// --- SİHİRBAZ (WIZARD) FONKSİYONLARI ---
function openWizard() {
    document.getElementById('wizard-modal').style.display = 'flex';
    wizardShowStep(1);
    userPreferences = { mood: '', taste: '' };
}

function wizardNext(step, choice) {
    if (step === 1) userPreferences.mood = choice;
    if (step === 2) userPreferences.taste = choice;

    if (step < 2) {
        wizardShowStep(step + 1);
    } else {
        runAlgorithm();
    }
}

function wizardShowStep(stepId) {
    document.querySelectorAll('.wizard-step').forEach(el => el.classList.remove('active'));
    if(typeof stepId === 'number') document.getElementById(`wizard-step-${stepId}`).classList.add('active');
    else document.getElementById(stepId).classList.add('active');
}

function runAlgorithm() {
    wizardShowStep('wizard-step-loading');
    setTimeout(() => {
        // Algoritma: Etiket Eşleştirme
        const matches = products.filter(p => 
            p.tags.includes(userPreferences.mood) && 
            p.tags.includes(userPreferences.taste) &&
            p.kegLevel > 0
        );
        recommendedProduct = matches.length > 0 ? matches[0] : products[0];

        // Sonucu Göster
        const resultContainer = document.getElementById('wizard-recommendation');
        resultContainer.innerHTML = `
            <div class="product-card" style="border-color:var(--primary); transform:none; height:auto; padding:10px">
                <img src="${recommendedProduct.img}" class="product-img" style="height:120px">
                <div class="product-name">${recommendedProduct.name}</div>
                <div class="product-tech">Sana Özel Seçim!</div>
            </div>
        `;
        wizardShowStep('wizard-result');
    }, 1500);
}

function resetWizard() { wizardShowStep(1); }
function acceptRecommendation() { closeModal('wizard-modal'); openSizeModal(recommendedProduct.id); }

// --- SEPET & SMART CROSS-SELL ---
function openSizeModal(id) {
    const p = products.find(x => x.id === id);
    document.getElementById('modal-img').src = p.img;
    document.getElementById('modal-title').innerText = p.name;
    const container = document.getElementById('size-options-container');
    
    container.innerHTML = p.sizes.map(s => `
        <button class="size-btn" onclick="offerSmartSnack(${p.id}, '${s.label}', ${p.price})">
            <span>${s.label}</span>
            <span>${p.price.toFixed(2)} ₺</span>
        </button>
    `).join('');
    
    document.getElementById('size-modal').style.display = 'flex';
}

function offerSmartSnack(productId, sizeLabel, price) {
    const product = products.find(p => p.id === productId);
    tempSelection = { name: product.name, sizeLabel, price, id: product.id, snack: product.snackPair };
    closeModal('size-modal');

    // Perfect Match Modal
    document.getElementById('match-beer-img').src = product.img;
    document.getElementById('match-snack-img').src = product.snackPair.img;
    document.getElementById('match-title').innerText = product.snackPair.name + " İster misin?";
    document.getElementById('match-desc').innerText = `${product.name} ile harika gidiyor!`;
    document.getElementById('snack-price').innerText = product.snackPair.price;
    document.getElementById('snack-modal').style.display = 'flex';
}

function addSnack() {
    const s = tempSelection;
    cart.push({ name: s.name, size: s.sizeLabel, price: s.price, id: s.id });
    cart.push({ name: s.snack.name, size: "Eşlikçi", price: s.snack.price, id: 999 }); // 999: Snack ID
    finalizeAddToCart();
}

function finalizeAddToCart() {
    // Snack istenmediyse sadece birayı ekle (eğer listede yoksa)
    if (tempSelection && !cart.some(i => i.name === tempSelection.name && i.size === tempSelection.sizeLabel)) {
        cart.push({ name: tempSelection.name, size: tempSelection.sizeLabel, price: tempSelection.price, id: tempSelection.id });
    }
    tempSelection = null;
    closeModal('snack-modal');
    updateCartUI();
}

function updateCartUI() {
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('total-price');
    
    if (cart.length === 0) {
        container.innerHTML = `<div style="text-align:center;color:#666;margin-top:20px">Sepet Boş</div>`;
        totalEl.innerText = "0.00 ₺";
        return;
    }
    let total = 0;
    container.innerHTML = cart.map((item, i) => {
        total += item.price;
        return `
            <div class="cart-item">
                <div><b>${item.name}</b> <small>${item.size}</small></div>
                <div>${item.price}₺ <i class="fa-solid fa-times" onclick="cart.splice(${i},1);updateCartUI()" style="cursor:pointer;color:red;margin-left:5px"></i></div>
            </div>`;
    }).join('');
    totalEl.innerText = total.toFixed(2) + " ₺";
}

// --- ÖDEME, STOK DÜŞÜRME & DOLUM ---
function checkAge() {
    if(cart.length === 0) return;
    document.getElementById('age-modal').style.display = 'flex';
}

function startPouring() {
    closeModal('age-modal');
    const overlay = document.getElementById('pouring-overlay');
    overlay.style.display = 'flex';
    
    // Stok Düşürme ve Ciro
    cart.forEach(item => {
        if(item.id !== 999) {
            const p = products.find(prod => prod.id === item.id);
            if(p) { p.kegLevel = Math.max(0, p.kegLevel - 5); }
        }
        dailyRevenue += item.price;
    });

    // Animasyon
    const liquid = document.getElementById('liquid');
    const foam = document.getElementById('foam');
    liquid.style.height = '0%'; foam.style.height = '0px'; foam.style.bottom = '0%';
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += 0.8;
        liquid.style.height = progress + '%';
        foam.style.bottom = progress + '%';
        if(progress > 10 && progress < 90) foam.style.height = '20px';
        
        if(progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                overlay.style.display = 'none';
                cart = [];
                updateCartUI();
                renderGrid(); // Stokları güncelle
                updateAdminStats();
            }, 3000);
        }
    }, 30);
}

// --- ADMIN & SİSTEM ---
function triggerAdmin() {
    adminClickCount++;
    if(adminClickCount === 5) {
        document.getElementById('admin-modal').style.display = 'flex';
        adminClickCount = 0;
    }
    setTimeout(() => { adminClickCount = 0; }, 2000);
}

function updateAdminStats() {
    const list = document.getElementById('keg-list');
    list.innerHTML = products.map(p => `
        <div class="keg-row">
            <div class="keg-info"><img src="${p.img}" class="keg-img"><span>${p.name}</span></div>
            <div class="keg-bar-container"><div class="keg-bar ${p.kegLevel<15?'critical':''}" style="width:${p.kegLevel}%"></div></div>
            <span>%${p.kegLevel}</span>
        </div>
    `).join('');
    document.getElementById('daily-revenue').innerText = dailyRevenue.toFixed(2) + " ₺";
}

function resetKegs() {
    products.forEach(p => p.kegLevel = 100);
    renderGrid(); updateAdminStats();
    alert("Fıçılar yenilendi!");
}

// --- YARDIMCILAR ---
function closeModal(id) { document.getElementById(id).style.display = 'none'; }
function updateClock() { document.getElementById('clock').innerText = new Date().toLocaleTimeString('tr-TR', {hour:'2-digit',minute:'2-digit'}); setTimeout(updateClock,1000); }
function simulateTemp() {
    const t = (3.2 + Math.random() * 0.4).toFixed(1);
    document.getElementById('admin-temp').innerText = t + " °C";
    document.getElementById('saver-temp').innerText = t;
    setTimeout(simulateTemp, 4000);
}
function resetIdleTimer() {
    clearTimeout(idleTimer);
    document.getElementById('screensaver').classList.remove('active');
    idleTimer = setTimeout(() => { document.getElementById('screensaver').classList.add('active'); }, 30000);
}
function wakeUp() { resetIdleTimer(); }