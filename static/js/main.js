/**
 * EAF-Shoop — Main Application Logic
 * Handles: category tabs, product rendering, sorting, cart modal, checkout, search, auto-scroll.
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

    // ── State ────────────────────────────────────────────────────
    let activeCategory = 'all';
    let activeSortBy = 'default';

    // ── DOM refs ─────────────────────────────────────────────────
    const allProductGrid = document.querySelector('.all-product-grid');
    const newProductGrid = document.querySelector('.new-product-grid');
    const categoryNavInner = document.querySelector('.category-nav-inner');
    const sortSelect = document.getElementById('sort-select');
    const sectionTitle = document.getElementById('section-title');

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

    /** Safely set text content (XSS-safe) */
    const setText = (el, text) => { if (el) el.textContent = text; };

    /** Build star rating HTML */
    const buildStars = (rating) => {
        let html = '<span class="stars">';
        for (let i = 1; i <= 5; i++) {
            if (i <= Math.floor(rating)) html += '<span class="star filled">★</span>';
            else if (i - rating < 1) html += '<span class="star half">★</span>';
            else html += '<span class="star">★</span>';
        }
        html += '</span>';
        return html;
    };

    /** Build stock badge */
    const buildStockBadge = (stock) => {
        if (stock <= 0) return '<span class="badge-stock out-of-stock">Rupture</span>';
        if (stock <= 5) return `<span class="badge-stock low-stock">Stock limité (${stock})</span>`;
        return '<span class="badge-stock in-stock">En stock</span>';
    };

    /** Calculate discount percentage */
    const discountPct = (orig, curr) => Math.round((1 - curr / orig) * 100);

    /** Escape HTML for safe attribute insertion */
    const esc = (str) => String(str ?? '').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

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
                <img src="${esc(product.image)}" alt="${esc(product.name)}" loading="lazy">
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
                    <input type="number" class="quantity-input" value="1" min="1" max="99" aria-label="Quantité">
                    <button class="quantity-btn plus" aria-label="Augmenter">+</button>
                </div>
                <button class="add-to-cart" ${product.stock <= 0 ? 'disabled' : ''}>
                    ${product.stock <= 0 ? 'Indisponible' : '🛒 Ajouter au panier'}
                </button>
            </div>
        </div>`;
    };

    // ── Category Tabs ────────────────────────────────────────────

    const renderCategoryTabs = () => {
        if (!categoryNavInner || !categoriesDB) return;
        categoryNavInner.innerHTML = '';
        categoriesDB.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = 'cat-tab' + (cat.id === activeCategory ? ' active' : '');
            btn.dataset.catId = cat.id;
            btn.innerHTML = `<span class="cat-icon">${cat.icon}</span>${cat.name}`;
            btn.addEventListener('click', () => {
                activeCategory = cat.id;
                renderCategoryTabs();
                renderProducts();
            });
            categoryNavInner.appendChild(btn);
        });
    };

    // ── Product Grid ─────────────────────────────────────────────

    const renderProducts = () => {
        if (!allProductGrid) return;

        let products = getProductsByCategory(activeCategory);
        products = sortProducts(products, activeSortBy);

        // Update section title
        const cat = categoriesDB.find(c => c.id === activeCategory);
        if (sectionTitle && cat) {
            sectionTitle.textContent = cat.name;
        }

        if (products.length === 0) {
            allProductGrid.innerHTML = `
                <div class="empty-state" style="grid-column:1/-1">
                    <div class="empty-icon">🔍</div>
                    <h3>Aucun produit trouvé</h3>
                    <p>Essayez une autre catégorie.</p>
                </div>`;
            return;
        }

        allProductGrid.innerHTML = products.map(createProductCard).join('');
    };

    // ── New Products Carousel ────────────────────────────────────

    const renderNewProducts = () => {
        if (!newProductGrid) return;
        const newProds = getNewProducts();
        newProductGrid.innerHTML = newProds.map(createProductCard).join('');
        if (newProds.length > 0) {
            setTimeout(() => initAutoScroll(newProductGrid), 150);
        }
    };

    // ── Sort ─────────────────────────────────────────────────────

    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            activeSortBy = sortSelect.value;
            renderProducts();
        });
    }

    // ── Event Delegation (quantity + add-to-cart) ─────────────────

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

    // ── Cart Modal ───────────────────────────────────────────────

    const openCart = () => {
        renderCart();
        cartModalOverlay?.classList.add('open');
        document.body.style.overflow = 'hidden';
    };

    const closeCart = () => {
        cartModalOverlay?.classList.remove('open');
        document.body.style.overflow = '';
    };

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
                <img src="${esc(item.image)}" alt="${esc(item.name)}">
                <div class="cart-item-details">
                    <h4>${esc(item.name)}</h4>
                    <div class="cart-item-price">${item.price.toFixed(2)} MAD</div>
                    <div class="cart-item-controls">
                        <div class="quantity-control">
                            <button class="quantity-btn minus small" data-id="${esc(item.id)}">−</button>
                            <input type="number" class="quantity-input small" value="${item.quantity}"
                                   readonly style="width:36px;padding:2px 4px;text-align:center">
                            <button class="quantity-btn plus small" data-id="${esc(item.id)}">+</button>
                        </div>
                        <button class="remove-item" data-id="${esc(item.id)}">Supprimer</button>
                    </div>
                </div>`;
            cartItemsContainer.appendChild(el);
        });

        cartTotalPrice.textContent = CartService.calculateTotal() + ' MAD';

        // Remove buttons
        cartItemsContainer.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', () => {
                CartService.removeFromCart(btn.dataset.id);
                renderCart();
            });
        });

        // Quantity buttons inside cart
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
            msg += `• ${item.quantity} × ${item.name} (Réf: ${item.codeBar || 'N/A'}) — ${(item.price * item.quantity).toFixed(2)} MAD\n`;
        });
        msg += `\n*Total: ${CartService.calculateTotal()} MAD*`;

        const url = `https://wa.me/${getContactNumber()}?text=${encodeURIComponent(msg)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    });

    // ── Generic Message Modal ────────────────────────────────────

    window.showMessage = (message) => {
        if (msgText && msgOverlay) {
            msgText.textContent = message;
            msgOverlay.classList.add('open');
        } else {
            alert(message);
        }
    };

    window.closeMessageModal = () => msgOverlay?.classList.remove('open');

    msgOkBtn?.addEventListener('click', window.closeMessageModal);
    msgOverlay?.addEventListener('click', (e) => { if (e.target === msgOverlay) window.closeMessageModal(); });

    // ── Search ───────────────────────────────────────────────────

    const doSearch = () => {
        const query = searchInput?.value.trim() || '';
        if (!query) {
            searchInput?.focus();
            return;
        }
        sessionStorage.setItem('searchQuery', query.toLowerCase());
        const base = window.location.pathname.replace(/\/.[^\/]*$/, '').replace(/\/$/, '') || '';
        window.location.href = base ? `${base}/pages/search.html` : 'pages/search.html';
    };

    searchButton?.addEventListener('click', doSearch);
    searchInput?.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSearch(); });

    // Hero Search Button
    const heroSearchBtn = document.querySelector('.hero .btn-outline');
    if (heroSearchBtn) {
        heroSearchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            searchInput?.focus();
            // Optional: scroll to top if needed
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ── Infinite Auto-Scroll ─────────────────────────────────────

    const initAutoScroll = (container) => {
        if (!container || container.children.length === 0) return;

        // Clone items for seamless loop
        Array.from(container.children).forEach(child => {
            const clone = child.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            container.appendChild(clone);
        });

        const getStep = () => {
            const card = container.querySelector('.product-card');
            if (!card) return 0;
            const gap = parseFloat(getComputedStyle(container).gap) || 0;
            return card.offsetWidth + gap;
        };

        const scrollNext = () => {
            if (container.scrollLeft >= container.scrollWidth / 2) {
                container.scrollLeft -= container.scrollWidth / 2;
            }
            container.scrollBy({ left: getStep(), behavior: 'smooth' });
        };

        container.addEventListener('scroll', () => {
            if (container.scrollLeft >= container.scrollWidth / 2) {
                container.scrollLeft -= container.scrollWidth / 2;
            }
        });

        let interval = setInterval(scrollNext, 3000);
        container.addEventListener('mouseenter', () => clearInterval(interval));
        container.addEventListener('touchstart', () => clearInterval(interval), { passive: true });
        container.addEventListener('mouseleave', () => { interval = setInterval(scrollNext, 3000); });
        container.addEventListener('touchend', () => { interval = setInterval(scrollNext, 3000); });
    };

    // ── Footer year ──────────────────────────────────────────────

    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    // ── Init ─────────────────────────────────────────────────────

    renderCategoryTabs();
    renderProducts();
    renderNewProducts();
    CartService.updateCartCount();
});