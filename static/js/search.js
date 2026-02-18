/**
 * EAF-Shoop — Search Page Logic
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

    const resultsGrid = document.querySelector('.search-results-grid');
    const queryDisplay = document.getElementById('search-query');
    const resultCount = document.getElementById('result-count');
    const liveInput = document.getElementById('live-search-input');
    const liveBtn = document.getElementById('live-search-btn');

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

    const createCard = (product) => {
        const isPromo = product.isPromo && product.original_price;
        const pct = isPromo ? discountPct(product.original_price, product.price) : 0;

        const priceHTML = isPromo
            ? `<span class="original-price">${product.original_price.toFixed(2)} MAD</span>
               <span class="price">${product.price.toFixed(2)} MAD</span>
               <span class="discount-pct">-${pct}%</span>`
            : `<span class="price">${product.price.toFixed(2)} MAD</span>`;

        const specsHTML = (product.specs || []).slice(0, 3)
            .map(s => `<span class="spec-pill">${esc(s)}</span>`).join('');

        // Category label
        const cat = (typeof categoriesDB !== 'undefined')
            ? categoriesDB.find(c => c.id === product.category)
            : null;
        const catLabel = cat ? `<span class="badge badge-type">${cat.icon} ${esc(cat.name)}</span>` : '';

        return `
        <div class="product-card${isPromo ? ' promotion' : ''}" tabindex="0"
             data-id="${esc(product.id)}" data-codebar="${esc(product.codeBar)}">

            <div class="card-badges">
                ${product.isNew ? '<span class="badge badge-new">Nouveau</span>' : ''}
                ${catLabel}
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

    const renderResults = (query) => {
        if (!resultsGrid) return;
        const results = (typeof searchProducts !== 'undefined') ? searchProducts(query) : [];

        if (queryDisplay) queryDisplay.textContent = query;
        if (resultCount) resultCount.textContent = `${results.length} résultat${results.length !== 1 ? 's' : ''}`;

        if (results.length === 0) {
            resultsGrid.innerHTML = `
                <div class="empty-state" style="grid-column:1/-1">
                    <div class="empty-icon">🔍</div>
                    <h3>Aucun produit trouvé</h3>
                    <p>Essayez un autre terme de recherche.</p>
                </div>`;
            return;
        }

        resultsGrid.innerHTML = results.map(createCard).join('');
    };

    // ── Event delegation for quantity + add-to-cart ──────────────
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('quantity-btn')) {
            const input = e.target.closest('.quantity-control')?.querySelector('.quantity-input');
            if (!input) return;
            let val = parseInt(input.value, 10) || 1;
            if (e.target.classList.contains('plus')) val = Math.min(99, val + 1);
            if (e.target.classList.contains('minus')) val = Math.max(1, val - 1);
            input.value = val;
        }

        if (e.target.classList.contains('add-to-cart')) {
            const card = e.target.closest('.product-card');
            if (!card) return;
            const product = (typeof productsDB !== 'undefined')
                ? productsDB.find(p => p.id === card.dataset.id)
                : null;
            if (product) {
                const qty = parseInt(card.querySelector('.quantity-input')?.value, 10) || 1;
                CartService.addToCart(product, qty);
            }
        }
    });

    // ── Live search on the page ──────────────────────────────────
    const doLiveSearch = () => {
        const q = liveInput?.value.trim() || '';
        if (!q) return;
        sessionStorage.setItem('searchQuery', q.toLowerCase());
        renderResults(q);
    };

    liveBtn?.addEventListener('click', doLiveSearch);
    liveInput?.addEventListener('keydown', (e) => { if (e.key === 'Enter') doLiveSearch(); });

    // ── Message modal ────────────────────────────────────────────
    const msgOverlay = document.getElementById('message-modal-overlay');
    const msgText = document.getElementById('message-modal-text');
    const msgOkBtn = document.getElementById('message-modal-ok');

    window.showMessage = (message) => {
        if (msgText && msgOverlay) {
            msgText.textContent = message;
            msgOverlay.classList.add('open');
        } else { alert(message); }
    };
    window.closeMessageModal = () => msgOverlay?.classList.remove('open');
    msgOkBtn?.addEventListener('click', window.closeMessageModal);
    msgOverlay?.addEventListener('click', (e) => { if (e.target === msgOverlay) window.closeMessageModal(); });

    // ── Cart modal (shared) ──────────────────────────────────────
    const cartIcon = document.getElementById('cart-icon');
    const cartModalOverlay = document.getElementById('cart-modal-overlay');
    const closeCartBtn = document.getElementById('close-cart');
    const cartItemsCont = document.getElementById('cart-items');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const checkoutBtn = document.querySelector('.checkout-btn');

    const esc2 = (str) => String(str ?? '').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const renderCart = () => {
        if (!cartItemsCont || !cartTotalPrice) return;
        const cart = CartService.getCart();
        cartItemsCont.innerHTML = '';
        if (cart.length === 0) {
            cartItemsCont.innerHTML = '<p class="empty-cart-msg">Votre panier est vide.</p>';
            cartTotalPrice.textContent = '0.00 MAD';
            return;
        }
        cart.forEach(item => {
            const el = document.createElement('div');
            el.className = 'cart-item';
            el.innerHTML = `
                <img src="../${esc2(item.image)}" alt="${esc2(item.name)}">
                <div class="cart-item-details">
                    <h4>${esc2(item.name)}</h4>
                    <div class="cart-item-price">${item.price.toFixed(2)} MAD</div>
                    <div class="cart-item-controls">
                        <div class="quantity-control">
                            <button class="quantity-btn minus small" data-id="${esc2(item.id)}">−</button>
                            <input type="number" class="quantity-input small" value="${item.quantity}" readonly style="width:36px;padding:2px 4px;text-align:center">
                            <button class="quantity-btn plus small" data-id="${esc2(item.id)}">+</button>
                        </div>
                        <button class="remove-item" data-id="${esc2(item.id)}">Supprimer</button>
                    </div>
                </div>`;
            cartItemsCont.appendChild(el);
        });
        cartTotalPrice.textContent = CartService.calculateTotal() + ' MAD';

        cartItemsCont.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', () => { CartService.removeFromCart(btn.dataset.id); renderCart(); });
        });
        cartItemsCont.querySelectorAll('.quantity-btn').forEach(btn => {
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

    const openCart = () => { renderCart(); cartModalOverlay?.classList.add('open'); document.body.style.overflow = 'hidden'; };
    const closeCart = () => { cartModalOverlay?.classList.remove('open'); document.body.style.overflow = ''; };

    cartIcon?.addEventListener('click', (e) => { e.preventDefault(); openCart(); });
    closeCartBtn?.addEventListener('click', closeCart);
    cartModalOverlay?.addEventListener('click', (e) => { if (e.target === cartModalOverlay) closeCart(); });

    checkoutBtn?.addEventListener('click', () => {
        const cart = CartService.getCart();
        if (cart.length === 0) { window.showMessage('Votre panier est vide.'); return; }
        const name = document.getElementById('buyer-name')?.value.trim() || '';
        const address = document.getElementById('buyer-address')?.value.trim() || '';
        const phone = document.getElementById('buyer-phone')?.value.trim() || '';
        const err = CartService.validateCheckoutForm(name, address, phone);
        if (err) { window.showMessage(err); return; }
        let msg = `*Nouvelle Commande — EAF Shoop*\n\n*Client:* ${name}\n*Adresse:* ${address}\n*Téléphone:* ${phone}\n\n*Commande:*\n`;
        cart.forEach(i => { msg += `• ${i.quantity} × ${i.name} — ${(i.price * i.quantity).toFixed(2)} MAD\n`; });
        msg += `\n*Total: ${CartService.calculateTotal()} MAD*`;
        window.open(`https://wa.me/${getContactNumber()}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
    });

    CartService.updateCartCount();

    // ── Initial render ───────────────────────────────────────────
    const initialQuery = sessionStorage.getItem('searchQuery') || '';
    if (liveInput) liveInput.value = initialQuery;
    renderResults(initialQuery);
});