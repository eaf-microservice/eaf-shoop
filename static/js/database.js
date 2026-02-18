/**
 * EAF-Shoop — Unified Product Database
 * Single source of truth for all products and categories.
 * 
 * Security notes:
 *  - Contact info is encoded (reversed + base64) and decoded at runtime.
 *  - Cart data is validated on every read from localStorage.
 *  - All user inputs are sanitized before rendering.
 */

'use strict';

// ─── Encoded contact (WhatsApp number encoded to deter scraping) ──────────────
// Encoded: btoa('212645994904'.split('').reverse().join(''))
const _c = atob('NDA5NDk5NTQ2MjE=').split('').reverse().join('');
const getContactNumber = () => _c;

// ─── Categories ───────────────────────────────────────────────────────────────
// ─── Categories ───────────────────────────────────────────────────────────────
const categoriesDB = [
    { id: 'all', name: 'Tous les produits', icon: '🛒', description: 'Parcourez l\'ensemble de notre catalogue.' },
    { id: 'technology', name: 'Technologie', icon: '💻', description: 'Gadgets, informatique et accessoires high-tech.' },
    { id: 'beauty', name: 'Beauté', icon: '💄', description: 'Soins, maquillage et parfums.' },
    { id: 'automobile', name: 'Automobile', icon: '🚗', description: 'Accessoires et entretien pour votre véhicule.' },
    { id: 'maison', name: 'Maison', icon: '🏠', description: 'Décoration, ameublement et jardin.' },
    { id: 'cuisine', name: 'Cuisine', icon: '🍳', description: 'Ustensiles, robots et accessoires de cuisine.' },
    { id: 'bureautique', name: 'Bureautique', icon: '📎', description: 'Fournitures de bureau et organisation.' },
    { id: 'promo', name: 'Promotions', icon: '🏷️', description: 'Nos meilleures offres et réductions du moment.' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Get all products, optionally filtered by category id.
 * @param {string} categoryId - 'all' or a specific category id
 * @returns {Array}
 */
const getProductsByCategory = (categoryId) => {
    if (!categoryId || categoryId === 'all') return productsDB;
    if (categoryId === 'promo') return productsDB.filter(p => p.isPromo);
    return productsDB.filter(p => p.category === categoryId);
};

/**
 * Search products across all fields.
 * @param {string} query
 * @returns {Array}
 */
const searchProducts = (query) => {
    if (!query) return [];
    const q = query.toLowerCase().trim();
    return productsDB.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.codeBar.includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        (p.specs && p.specs.some(s => s.toLowerCase().includes(q)))
    );
};

/**
 * Get new products.
 * @returns {Array}
 */
const getNewProducts = () => productsDB.filter(p => p.isNew);

/**
 * Get promoted products.
 * @returns {Array}
 */
const getPromoProducts = () => productsDB.filter(p => p.isPromo);

/**
 * Sort products array.
 * @param {Array} products
 * @param {string} sortBy - 'price-asc' | 'price-desc' | 'rating' | 'newest'
 * @returns {Array}
 */
const sortProducts = (products, sortBy) => {
    const arr = [...products];
    switch (sortBy) {
        case 'price-asc': return arr.sort((a, b) => a.price - b.price);
        case 'price-desc': return arr.sort((a, b) => b.price - a.price);
        case 'rating': return arr.sort((a, b) => b.rating - a.rating);
        case 'newest': return arr.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        default: return arr;
    }
};

// ─── Products ─────────────────────────────────────────────────────────────────
const productsDB = [
    // ── Technology ──
    {
        id: 'laptop-pro-x1',
        name: 'Laptop Ultra Pro X1',
        brand: 'EAF Tech',
        category: 'technology',
        price: 8999.00,
        original_price: 9500.00,
        stock: 5,
        rating: 4.8,
        reviewCount: 12,
        isNew: true,
        isPromo: true,
        codeBar: 'TECH-001',
        image: 'static/images/products/store/tech1.jpg',
        specs: ['16GB RAM', '512GB SSD', 'Écran 14" 4K'],
        description: 'Un ordinateur puissant pour les professionnels exigeants.',
        type: 'Ordinateur Portable'
    },
    {
        id: 'wireless-buds',
        name: 'Écouteurs Sans Fil Pro',
        brand: 'SoundMaster',
        category: 'technology',
        price: 249.99,
        original_price: null,
        stock: 25,
        rating: 4.5,
        reviewCount: 89,
        isNew: false,
        isPromo: false,
        codeBar: 'TECH-002',
        image: 'static/images/products/store/tech2.jpg',
        specs: ['Réduction de bruit', '24h Autonomie', 'Bluetooth 5.2'],
        description: 'Qualité sonore exceptionnelle et confort longue durée.',
        type: 'Audio'
    },

    // ── Beauty ──
    {
        id: 'serum-glow',
        name: 'Sérum Éclat Vitamine C',
        brand: 'Lumière',
        category: 'beauty',
        price: 189.00,
        original_price: null,
        stock: 30,
        rating: 4.9,
        reviewCount: 45,
        isNew: true,
        isPromo: false,
        codeBar: 'BEA-001',
        image: 'static/images/products/store/beauty1.jpg',
        specs: ['Végétalien', 'Sans paraben', '30ml'],
        description: 'Illuminez votre teint avec notre sérum riche en vitamine C.',
        type: 'Soin Visage'
    },

    // ── Automobile ──
    {
        id: 'castrol-edge-5w30-ll',
        name: 'Castrol EDGE 5W-30 LL',
        brand: 'Castrol',
        category: 'automobile',
        price: 549.99,
        original_price: null,
        stock: 15,
        rating: 4.8,
        reviewCount: 42,
        isNew: true,
        isPromo: false,
        codeBar: '3374650021613',
        image: 'static/images/products/store/01.jpg',
        specs: ['SAE 5W-30', 'ACEA C3', 'VW 504.00/507.00'],
        description: 'Castrol EDGE 5W-30 LL convient aux véhicules essence, diesel et hybride.',
        type: 'Huile Synthétique'
    },
    {
        id: 'dashcam-4k',
        name: 'Dashcam Ultra 4K',
        brand: 'SafeDrive',
        category: 'automobile',
        price: 649.00,
        original_price: 799.00,
        stock: 12,
        rating: 4.7,
        reviewCount: 34,
        isNew: false,
        isPromo: true,
        codeBar: 'AUTO-001',
        image: 'static/images/products/store/auto1.jpg',
        specs: ['Vision nocturne', 'GPS intégré', 'WiFi'],
        description: 'Enregistrez vos trajets avec une clarté exceptionnelle.',
        type: 'Électronique Auto'
    },

    // ── Maison ──
    {
        id: 'lamp-design',
        name: 'Lampe de Table Moderne',
        brand: 'DecoHome',
        category: 'maison',
        price: 349.00,
        original_price: null,
        stock: 15,
        rating: 4.6,
        reviewCount: 22,
        isNew: true,
        isPromo: false,
        codeBar: 'MAI-001',
        image: 'static/images/products/store/maison1.jpg',
        specs: ['LED', 'Variation d\'intensité', 'Chêne massif'],
        description: 'Une touche d\'élégance pour votre salon.',
        type: 'Luminaire'
    },

    // ── Cuisine ──
    {
        id: 'air-fryer-v2',
        name: 'Friteuse Sans Huile Pro',
        brand: 'KitchenMax',
        category: 'cuisine',
        price: 1299.00,
        original_price: 1499.00,
        stock: 8,
        rating: 4.8,
        reviewCount: 156,
        isNew: false,
        isPromo: true,
        codeBar: 'CUI-001',
        image: 'static/images/products/store/cuisine1.jpg',
        specs: ['5.5 Litres', '1700W', 'Écran Tactile'],
        description: 'Cuisinez sainement avec moins de 85% de matières grasses.',
        type: 'Petit Électroménager'
    },

    // ── Bureautique ──
    {
        id: 'ergonomic-chair',
        name: 'Chaise de Bureau Ergonomique',
        brand: 'OfficeFlow',
        category: 'bureautique',
        price: 2450.00,
        original_price: null,
        stock: 3,
        rating: 4.9,
        reviewCount: 18,
        isNew: true,
        isPromo: false,
        codeBar: 'BUR-001',
        image: 'static/images/products/store/bureau1.jpg',
        specs: ['Soutien lombaire', 'Accoudoirs 3D', 'Appui-tête'],
        description: 'Le confort ultime pour vos longues journées de travail.',
        type: 'Mobilier de Bureau'
    },
];
