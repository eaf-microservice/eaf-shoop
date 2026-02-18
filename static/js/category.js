/**
 * EAF-Shoop — Category Page Logic
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

    // ── State ────────────────────────────────────────────────────
    const urlParams = new URLSearchParams(window.location.search);
    const categoryId = urlParams.get('cat') || 'all';
    let activeSortBy = 'default';

    // ── DOM refs ─────────────────────────────────────────────────
    const productGrid = document.getElementById('category-product-grid');
    const categoryName = document.getElementById('category-name');
    const categoryDesc = document.getElementById('category-description');
    const categoryIcon = document.getElementById('category-icon');
    const sortSelect = document.getElementById('sort-select');
    const pageTitle = document.getElementById('page-title');

    const cartModalOverlay = document.getElementById('cart-modal-overlay');
    const cartIcon = document.getElementById('cart-icon');
    const closeCartBtn = document.getElementById('close-cart');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const checkoutBtn = document.querySelector('.checkout-btn');

    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');

    const msgOverlay = document.getElementById('message-modal-overlay');
    const msgText = document.getElementById('message-modal-text');
    const msgOkBtn = document.getElementById('message-modal-ok');

    const yearSpan = document.getElementById('current-year');

    // ── Helpers ──────────────────────────────────────────────────

    const esc = (str) => String(str ?? '').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const buildStars = (rating) => {
        let html = '<span class="stars">';
        for (let i = 1; i <= 5; i++) {
            if (i <= Math.floor(rating)) html += '<span class="star filled">★</span>';
            else if (i - rating < 1) html += '<span class="star half">★</span>';
            else html += '<span class="star">★</span>';
        }
        return html + '</span>';
    };

    const buildStockBadge = (stock) => {
        if (stock <= 0) return '<span class="badge-stock out-of-stock">Rupture</span>';
        if (stock <= 5) return `<span class="badge-stock low-stock">Stock limité (${stock})</span>`;
        return '<span class="badge-stock in-stock">En stock</span>';
    };

    const discountPct = (orig, curr) => Math.round((1 - curr / orig) * 100);

    // ── Card Rendering ───────────────────────────────────────────

    const createProductCard = (product) => {
        const isPromo = product.isPromo && product.original_price;
        const pct = isPromo ? discountPct(product.original_price, product.price) : 0;

        const priceHTML = isPromo
            ? `<span class="original-price">${product.original_price.toFixed(2)} MAD</span>
               <span class="price">${product.price.toFixed(2)} MAD</span>
               <span class="discount-pct">-${pct}%</span>`
            : `<span class="price">${product.price.toFixed(2)} MAD</span>`;

        const specsHTML = (product.specs || []).slice(0, 3)
            .map(s => `<span class="spec-pill">${esc(s)}</span>`).join('');

        return `
        <div class="product-card${isPromo ? ' promotion' : ''}" tabindex="0"
             data-id="${esc(product.id)}" data-codebar="${esc(product.codeBar)}">

            <div class="card-badges">
                ${product.isNew ? '<span class="badge badge-new">Nouveau</span>' : ''}
                <span class="badge badge-type">${esc(product.type)}</span>
            </div>

            <div class="product-image">
                <img src="../${esc(product.image)}" alt="${esc(product.name)}" loading="lazy">
                ${buildStockBadge(product.stock)}
                <div class="product-overlay">
                    <p class="product-description">${esc(product.description)}</p>
                </div>
            </div>

            <div class="card-body">
                <span class="card-brand">${esc(product.brand)}</span>
                <h3>${esc(product.name)}</h3>
                <div class="card-rating">
                    ${buildStars(product.rating)}
                    <span class="rating-count">(${product.reviewCount})</span>
                </div>
                <div class="card-specs">${specsHTML}</div>
                <div class="card-price">${priceHTML}</div>
            </div>

            <div class="card-footer">
                <div class="quantity-control">
                    <button class="quantity-btn minus" aria-label="Diminuer">−</button>
                    <input type="number" class="quantity-input" value="1" min="1" max="99">
                    <button class="quantity-btn plus" aria-label="Augmenter">+</button>
                </div>
                <button class="add-to-cart" ${product.stock <= 0 ? 'disabled' : ''}>
                    ${product.stock <= 0 ? 'Indisponible' : '🛒 Ajouter au panier'}
                </button>
            </div>
        </div>`;
    };

    // ── Page Init & Rendering ────────────────────────────────────

    const initPage = () => {
        const cat = categoriesDB.find(c => c.id === categoryId) || categoriesDB[0];

        if (categoryName) categoryName.textContent = cat.name;
        if (categoryDesc) categoryDesc.textContent = cat.description;
        if (categoryIcon) categoryIcon.textContent = cat.icon;
        if (pageTitle) pageTitle.textContent = `${cat.name} — EAF Shoop`;
        if (yearSpan) yearSpan.textContent = new Date().getFullYear();

        renderProducts();
        CartService.updateCartCount();
    };

    const renderProducts = () => {
        if (!productGrid) return;

        let products = getProductsByCategory(categoryId);
        products = sortProducts(products, activeSortBy);

        if (products.length === 0) {
            productGrid.innerHTML = `
                <div class="empty-state" style="grid-column:1/-1">
                    <div class="empty-icon">🔍</div>
                    <h3>Aucun produit dans cette catégorie</h3>
                    <p>Revenez plus tard pour de nouveaux arrivages.</p>
                </div>`;
            return;
        }

        productGrid.innerHTML = products.map(createProductCard).join('');
    };

    // ── Sort ─────────────────────────────────────────────────────

    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            activeSortBy = sortSelect.value;
            renderProducts();
        });
    }

    // ── Event Delegation ─────────────────────────────────────────

    document.addEventListener('click', (e) => {
        // Quantity buttons
        if (e.target.classList.contains('quantity-btn')) {
            const btn = e.target;
            const input = btn.closest('.quantity-control')?.querySelector('.quantity-input');
            if (!input) return;
            let val = parseInt(input.value, 10) || 1;
            if (btn.classList.contains('plus')) val = Math.min(99, val + 1);
            if (btn.classList.contains('minus')) val = Math.max(1, val - 1);
            input.value = val;
        }

        // Add to cart
        if (e.target.classList.contains('add-to-cart')) {
            const card = e.target.closest('.product-card');
            if (!card) return;
            const productId = card.dataset.id;
            const qty = parseInt(card.querySelector('.quantity-input')?.value, 10) || 1;

            const product = productsDB.find(p => p.id === productId);
            if (product) {
                CartService.addToCart(product, qty);
            }
        }
    });

    // ── Cart Modal (shared logic) ────────────────────────────────

    const renderCart = () => {
        if (!cartItemsContainer || !cartTotalPrice) return;
        const cart = CartService.getCart();
        cartItemsContainer.innerHTML = '';

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Votre panier est vide.</p>';
            cartTotalPrice.textContent = '0.00 MAD';
            return;
        }

        cart.forEach(item => {
            const el = document.createElement('div');
            el.className = 'cart-item';
            el.innerHTML = `
                <img src="../${esc(item.image)}" alt="${esc(item.name)}">
                <div class="cart-item-details">
                    <h4>${esc(item.name)}</h4>
                    <div class="cart-item-price">${item.price.toFixed(2)} MAD</div>
                    <div class="cart-item-controls">
                        <div class="quantity-control">
                            <button class="quantity-btn minus small" data-id="${esc(item.id)}">−</button>
                            <input type="number" class="quantity-input small" value="${item.quantity}" readonly style="width:36px;padding:2px 4px;text-align:center">
                            <button class="quantity-btn plus small" data-id="${esc(item.id)}">+</button>
                        </div>
                        <button class="remove-item" data-id="${esc(item.id)}">Supprimer</button>
                    </div>
                </div>`;
            cartItemsContainer.appendChild(el);
        });

        cartTotalPrice.textContent = CartService.calculateTotal() + ' MAD';

        cartItemsContainer.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', () => {
                CartService.removeFromCart(btn.dataset.id);
                renderCart();
            });
        });

        cartItemsContainer.querySelectorAll('.quantity-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const item = CartService.getCart().find(i => i.id === id);
                if (!item) return;
                let qty = item.quantity;
                if (btn.classList.contains('plus')) qty++;
                if (btn.classList.contains('minus')) qty--;
                CartService.updateQuantity(id, qty);
                renderCart();
            });
        });
    };

    const openCart = () => {
        renderCart();
        cartModalOverlay?.classList.add('open');
        document.body.style.overflow = 'hidden';
    };

    const closeCart = () => {
        cartModalOverlay?.classList.remove('open');
        document.body.style.overflow = '';
    };

    cartIcon?.addEventListener('click', (e) => { e.preventDefault(); openCart(); });
    closeCartBtn?.addEventListener('click', closeCart);
    cartModalOverlay?.addEventListener('click', (e) => { if (e.target === cartModalOverlay) closeCart(); });

    // ── Checkout ─────────────────────────────────────────────────

    checkoutBtn?.addEventListener('click', () => {
        const cart = CartService.getCart();
        if (cart.length === 0) { window.showMessage('Votre panier est vide.'); return; }

        const name = document.getElementById('buyer-name')?.value.trim() || '';
        const address = document.getElementById('buyer-address')?.value.trim() || '';
        const phone = document.getElementById('buyer-phone')?.value.trim() || '';

        const err = CartService.validateCheckoutForm(name, address, phone);
        if (err) { window.showMessage(err); return; }

        let msg = `*Nouvelle Commande — EAF Shoop*\n\n`;
        msg += `*Client:* ${name}\n`;
        msg += `*Adresse:* ${address}\n`;
        msg += `*Téléphone:* ${phone}\n\n`;
        msg += `*Commande:*\n`;
        cart.forEach(item => {
            msg += `• ${item.quantity} × ${item.name} — ${(item.price * item.quantity).toFixed(2)} MAD\n`;
        });
        msg += `\n*Total: ${CartService.calculateTotal()} MAD*`;

        const url = `https://wa.me/${getContactNumber()}?text=${encodeURIComponent(msg)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    });

    // ── Message Modal ────────────────────────────────────────────

    window.showMessage = (message) => {
        if (msgText && msgOverlay) {
            msgText.textContent = message;
            msgOverlay.classList.add('open');
        } else {
            alert(message);
        }
    };

    msgOkBtn?.addEventListener('click', () => msgOverlay?.classList.remove('open'));

    // ── Search ───────────────────────────────────────────────────

    const doSearch = () => {
        const query = searchInput?.value.trim();
        if (!query) return;
        sessionStorage.setItem('searchQuery', query.toLowerCase());
        window.location.href = 'search.html';
    };

    searchButton?.addEventListener('click', doSearch);
    searchInput?.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSearch(); });

    // ── Start ────────────────────────────────────────────────────

    initPage();
});
