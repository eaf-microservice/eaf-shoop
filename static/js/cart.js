/**
 * EAF-Shoop — CartService
 * Handles all cart operations with input validation and XSS protection.
 */

'use strict';

const CartService = {
  _key: 'eaf_shop_cart_v2',

  // ── Schema validation ────────────────────────────────────────
  _isValidItem(item) {
    return (
      item &&
      typeof item.id === 'string' && item.id.trim() !== '' &&
      typeof item.name === 'string' && item.name.trim() !== '' &&
      typeof item.price === 'number' && isFinite(item.price) && item.price >= 0 &&
      typeof item.quantity === 'number' && Number.isInteger(item.quantity) && item.quantity > 0
    );
  },

  // ── Sanitize string for safe DOM insertion ───────────────────
  _sanitize(str) {
    const div = document.createElement('div');
    div.textContent = String(str ?? '');
    return div.innerHTML;
  },

  // ── Read cart (with validation) ──────────────────────────────
  getCart() {
    try {
      const raw = localStorage.getItem(this._key);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      // Filter out any tampered/invalid items
      return parsed.filter(item => this._isValidItem(item)).map(item => ({
        id: String(item.id),
        name: String(item.name),
        price: parseFloat(item.price),
        image: String(item.image || ''),
        codeBar: String(item.codeBar || ''),
        quantity: parseInt(item.quantity, 10),
      }));
    } catch {
      return [];
    }
  },

  // ── Save cart ────────────────────────────────────────────────
  _saveCart(cart) {
    try {
      localStorage.setItem(this._key, JSON.stringify(cart));
    } catch {
      console.warn('CartService: could not save to localStorage');
    }
    this.updateCartCount();
  },

  // ── Add to cart ──────────────────────────────────────────────
  addToCart(product, quantity = 1) {
    const qty = Math.max(1, parseInt(quantity, 10) || 1);
    const price = parseFloat(product.price);
    if (!product.id || !product.name || isNaN(price)) {
      window.showMessage && window.showMessage('Produit invalide.');
      return;
    }

    const cart = this.getCart();
    const idx = cart.findIndex(i => i.id === product.id);

    if (idx > -1) {
      cart[idx].quantity += qty;
    } else {
      cart.push({
        id: String(product.id),
        name: String(product.name),
        price: price,
        image: String(product.image || ''),
        codeBar: String(product.codeBar || ''),
        quantity: qty,
      });
    }

    this._saveCart(cart);
    window.showMessage && window.showMessage(`✅ "${product.name}" ajouté au panier !`);
  },

  // ── Remove from cart ─────────────────────────────────────────
  removeFromCart(productId) {
    const cart = this.getCart().filter(i => i.id !== productId);
    this._saveCart(cart);
  },

  // ── Update quantity ──────────────────────────────────────────
  updateQuantity(productId, quantity) {
    const qty = parseInt(quantity, 10);
    if (qty <= 0) { this.removeFromCart(productId); return; }
    const cart = this.getCart();
    const item = cart.find(i => i.id === productId);
    if (item) { item.quantity = qty; this._saveCart(cart); }
  },

  // ── Clear cart ───────────────────────────────────────────────
  clearCart() {
    localStorage.removeItem(this._key);
    this.updateCartCount();
  },

  // ── Calculate total ──────────────────────────────────────────
  calculateTotal() {
    return this.getCart()
      .reduce((sum, item) => sum + item.price * item.quantity, 0)
      .toFixed(2);
  },

  // ── Update badge ─────────────────────────────────────────────
  updateCartCount() {
    const count = this.getCart().reduce((acc, i) => acc + i.quantity, 0);
    const badge = document.getElementById('cart-count');
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
  },

  // ── Validate checkout form ───────────────────────────────────
  validateCheckoutForm(name, address, phone) {
    if (!name || name.trim().length < 2) return 'Veuillez entrer un nom complet valide.';
    if (!address || address.trim().length < 5) return 'Veuillez entrer une adresse valide.';
    // Moroccan phone: 06/07/05 + 8 digits, or +212...
    const phoneClean = phone.replace(/\s+/g, '');
    const phoneRx = /^(\+212|00212|0)(5|6|7)\d{8}$/;
    if (!phoneRx.test(phoneClean)) return 'Numéro de téléphone invalide (ex: 0612345678).';
    return null; // valid
  },
};