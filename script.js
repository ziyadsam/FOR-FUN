// === بيانات المنتجات ===
const products = [
  { id: "skull", name: "جمجمة", price: 80, image: "assets/product-skull.jpg",
    desc: "حساب مشترك مميز بأفضل الميزات والألعاب الحصرية." },
  { id: "troll", name: "ترول فيس", price: 120, image: "assets/product-troll.png",
    desc: "حساب احترافي مع ضمان كامل وتسليم فوري." },
];

const discountCodes = { Z1: 5, SULTAN10: 10, VIP20: 20 };

// === حالة السلة ===
const STORAGE_KEY = "abu-sultan-cart";
const cart = {
  items: [],
  discountCode: "",
  discountPercent: 0,
  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        this.items = d.items || [];
        this.discountCode = d.discountCode || "";
        this.discountPercent = d.discountPercent || 0;
      }
    } catch {}
  },
  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      items: this.items, discountCode: this.discountCode, discountPercent: this.discountPercent
    }));
  },
  add(id) {
    const it = this.items.find(i => i.id === id);
    if (it) it.qty++; else this.items.push({ id, qty: 1 });
    this.save(); render();
    openCart();
  },
  setQty(id, qty) {
    if (qty <= 0) this.items = this.items.filter(i => i.id !== id);
    else { const it = this.items.find(i => i.id === id); if (it) it.qty = qty; }
    this.save(); render();
  },
  remove(id) { this.items = this.items.filter(i => i.id !== id); this.save(); render(); },
  clear() { this.items = []; this.discountCode = ""; this.discountPercent = 0; this.save(); render(); },
  apply(code) {
    const c = code.trim().toUpperCase();
    const msg = document.getElementById("discountMsg");
    if (discountCodes[c]) {
      this.discountCode = c; this.discountPercent = discountCodes[c]; this.save(); render();
      msg.textContent = `✓ تم تطبيق خصم ${discountCodes[c]}%`; msg.className = "discount-msg ok";
    } else {
      msg.textContent = "✗ كود غير صالح"; msg.className = "discount-msg err";
    }
  },
  totals() {
    const sub = this.items.reduce((s, i) => {
      const p = products.find(p => p.id === i.id); return s + (p ? p.price * i.qty : 0);
    }, 0);
    const disc = Math.round((sub * this.discountPercent) / 100);
    return { sub, disc, total: sub - disc, count: this.items.reduce((s,i)=>s+i.qty,0) };
  }
};

// === العرض ===
function productCard(p) {
  return `
    <div class="product">
      <div class="product-img"><img src="${p.image}" alt="${p.name}" loading="lazy"/></div>
      <div class="product-body">
        <h3>${p.name}</h3>
        <p style="color:var(--muted);font-size:14px">${p.desc}</p>
        <div class="row">
          <span class="price">${p.price} ر.س</span>
          <button class="btn btn-primary" onclick="cart.add('${p.id}')">أضف للسلة</button>
        </div>
      </div>
    </div>`;
}

function renderProducts() {
  document.getElementById("featuredGrid").innerHTML = products.map(productCard).join("");
  document.getElementById("productsGrid").innerHTML = products.map(productCard).join("");
}

function renderCart() {
  const wrap = document.getElementById("cartItems");
  if (!cart.items.length) {
    wrap.innerHTML = `<div class="cart-empty">🛒 السلة فارغة</div>`;
  } else {
    wrap.innerHTML = cart.items.map(i => {
      const p = products.find(x => x.id === i.id);
      return `
        <div class="cart-item">
          <img src="${p.image}" alt="${p.name}"/>
          <div class="cart-item-info">
            <div>
              <div class="name">${p.name}</div>
              <div class="price">${p.price * i.qty} ر.س</div>
            </div>
            <div class="qty">
              <button onclick="cart.setQty('${i.id}',${i.qty - 1})">−</button>
              <span>${i.qty}</span>
              <button onclick="cart.setQty('${i.id}',${i.qty + 1})">+</button>
              <button onclick="cart.remove('${i.id}')" style="margin-right:auto;color:#ef4444">🗑</button>
            </div>
          </div>
        </div>`;
    }).join("");
  }
  const t = cart.totals();
  document.getElementById("subtotal").textContent = t.sub + " ر.س";
  document.getElementById("discount").textContent = t.disc + " ر.س";
  document.getElementById("total").textContent = t.total + " ر.س";
  document.getElementById("cartCount").textContent = t.count;
}

function render() { renderCart(); }

// === التنقل ===
function navigate(name) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  const el = document.getElementById("page-" + name);
  if (el) el.classList.add("active");
  closeMenu(); closeCart();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelectorAll("[data-nav]").forEach(a => {
  a.addEventListener("click", e => { e.preventDefault(); navigate(a.dataset.nav); });
});

// === القائمة + السلة ===
const overlay = document.getElementById("overlay");
const sideMenu = document.getElementById("sideMenu");
const cartDrawer = document.getElementById("cartDrawer");

function openMenu(){ sideMenu.classList.add("open"); overlay.classList.add("show"); }
function closeMenu(){ sideMenu.classList.remove("open"); if(!cartDrawer.classList.contains("open")) overlay.classList.remove("show"); }
function openCart(){ cartDrawer.classList.add("open"); overlay.classList.add("show"); }
function closeCart(){ cartDrawer.classList.remove("open"); if(!sideMenu.classList.contains("open")) overlay.classList.remove("show"); }

document.getElementById("menuBtn").onclick = openMenu;
document.getElementById("closeMenu").onclick = closeMenu;
document.getElementById("cartBtn").onclick = openCart;
document.getElementById("closeCart").onclick = closeCart;
overlay.onclick = () => { closeMenu(); closeCart(); };

document.getElementById("applyDiscount").onclick = () => {
  cart.apply(document.getElementById("discountInput").value);
};

// === Toast ===
function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg; t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2200);
}

// === تشغيل ===
cart.load();
renderProducts();
render();
