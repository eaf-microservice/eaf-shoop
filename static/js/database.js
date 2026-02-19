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
const _c = atob('NDA5NDk5NTQ2MjEy').split('').reverse().join('');
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
        id: 'tech-001',
        name: 'RAM DDR3 4GB',
        brand: 'EAF Tech',
        category: 'technology',
        price: 100.00,
        original_price: null,
        stock: 2,
        rating: 4.8,
        reviewCount: 12,
        isNew: false,
        isPromo: false,
        codeBar: 'ram-pc',
        image: 'static/images/products/technology/ram.png',
        specs: ['4GB RAM', 'DDR3', '1600MHz'],
        description: 'Une RAM DDR3 de 4GB et 1600MHz pour PC portable .',
        type: 'RAM-DDR3'
    },
    {
        id: 'tech-002',
        name: 'Chargeur Sans Fil rapide',
        brand: 'EAF Tech',
        category: 'technology',
        price: 49.99,
        original_price: null,
        stock: 1,
        rating: 4.5,
        reviewCount: 15,
        isNew: false,
        isPromo: false,
        codeBar: 'wireless-charger',
        image: 'static/images/products/technology/chargeur.jpg',
        specs: ['Chargeur sans fil', 'Chargeur rapide', 'Chargeur sans fil rapide'],
        description: 'Chargeur sans fil rapide pour téléphone portable.',
        type: 'Chargeur sans fil'
    },
    {
        id: 'tech-003',
        name: 'Adaptateur bluetooth',
        brand: 'EAF Tech',
        category: 'technology',
        price: 49.99,
        original_price: null,
        stock: 1,
        rating: 4.5,
        reviewCount: 36,
        isNew: false,
        isPromo: false,
        codeBar: 'bluetooth',
        image: 'static/images/products/technology/bluetooth.jpg',
        specs: ['Adaptateur bluetooth', 'Gamer tool', 'USB', 'PS4'],
        description: 'Adaptateur bluetooth pour manette ps4.',
        type: 'Adaptateur bluetooth'
    },
    {
        id: 'tech-004',
        name: 'RAM DDR3 1GB',
        brand: 'EAF Tech',
        category: 'technology',
        price: 49.99,
        original_price: null,
        stock: 1,
        rating: 4.0,
        reviewCount: 13,
        isNew: false,
        isPromo: false,
        codeBar: 'ram-pc',
        image: 'static/images/products/technology/ram1G.jpg',
        specs: ['RAM', 'PC', '1GB', '10600S'],
        description: 'RAM DDR3 de 1GB 10600S pour PC portable.',
        type: 'RAM-DDR3'
    },
    {
        id: 'tech-005',
        name: 'Cable magnetic',
        brand: 'EAF Tech',
        category: 'technology',
        price: 29.99,
        original_price: null,
        stock: 1,
        rating: 4.0,
        reviewCount: 16,
        isNew: false,
        isPromo: false,
        codeBar: 'ram-pc',
        image: 'static/images/products/technology/cable-magnetic.jpg',
        specs: ['Cable magnetic', 'USB', 'Type-C', 'Lightning'],
        description: 'Cable magnetic pour téléphone portable.',
        type: 'Cable magnetic'
    },
    {
        id: 'tech-006',
        name: 'Souris USB',
        brand: 'EAF Tech',
        category: 'technology',
        price: 19.99,
        original_price: null,
        stock: 1,
        rating: 4.2,
        reviewCount: 10,
        isNew: false,
        isPromo: false,
        codeBar: 'ram-pc',
        image: 'static/images/products/technology/souris.png',
        specs: ['Souris', 'USB'],
        description: 'Souris USB pour PC.',
        type: 'Souris USB'
    },
    {
        id: 'tech-007',
        name: 'Mi camera 360',
        brand: 'Xiaomi',
        category: 'technology',
        price: 349.99,
        original_price: 450.00,
        stock: 1,
        rating: 4.2,
        reviewCount: 10,
        isNew: false,
        isPromo: true,
        codeBar: 'mi-camera-360',
        image: 'static/images/products/technology/mi-camera.jpg',
        specs: ['Camera', '360', 'Xiaomi'],
        description: "La caméra Mi 360° (1080p/2K) est une caméra de sécurité intérieure intelligente offrant une surveillance panoramique à 360 degrés, une détection humaine alimentée par l'IA et une vision nocturne infrarouge améliorée. Elle offre une résolution HD 1080p ou 2K, un contrôle panoramique/inclinaison/zoom à 360°, un système audio bidirectionnel.",
        type: 'Camera 360'
    },
    {
        id: 'tech-008',
        name: 'E-book reader',
        brand: 'Rosetta',
        category: 'technology',
        price: 200.00,
        original_price: null,
        stock: 1,
        rating: 4.3,
        reviewCount: 10,
        isNew: false,
        isPromo: false,
        codeBar: 'e-book',
        image: 'static/images/products/technology/ebook-rosetta.png',
        specs: ['E-book', 'Rosetta', "PDF", "EPUB"],
        description: "L'E-book Rosetta est un liseuse électronique portable conçue pour les amateurs de lecture. Avec son écran de 6 pouces et sa résolution HD, il offre une expérience de lecture confortable et immersive. Il prend en charge les formats PDF et EPUB, et dispose d'une batterie longue durée.",
        type: 'E-book'
    },
    {
        id: 'tech-009',
        name: 'Clavier kensington',
        brand: 'Kensington',
        category: 'technology',
        price: 200.00,
        original_price: null,
        stock: 1,
        rating: 4.8,
        reviewCount: 30,
        isNew: false,
        isPromo: false,
        codeBar: 'e-book',
        image: 'static/images/products/technology/clavier-kensington.png',
        specs: ['Clavier', 'Kensington', "Bluetooth", "sans fil"],
        description: "Le clavier Kensington est un clavier bluetooth sans fil pour connecter avec mobile, tablette ou TV, et dispose d'une batterie longue durée.",
        type: 'Clavier bluetooth'
    },
    {
        id: 'tech-010',
        name: 'Clavier desktop',
        brand: 'Clavier Maroc',
        category: 'technology',
        price: 80.00,
        original_price: null,
        stock: 1,
        rating: 4.6,
        reviewCount: 10,
        isNew: false,
        isPromo: false,
        codeBar: 'clavier-desktop',
        image: 'static/images/products/technology/clavier-xp.png',
        specs: ['Clavier', 'Kensington', "Bluetooth", "sans fil"],
        description: "Le clavier desktop est un clavier avec son souris sans fil de plus un chargeur des billes rechargable",
        type: 'Clavier XP Maroc'
    },
    {
        id: 'tech-011',
        name: 'Carte satellite',
        brand: 'Digital satellite TV tuner',
        category: 'technology',
        price: 300.00,
        original_price: 450.00,
        stock: 1,
        rating: 4.5,
        reviewCount: 26,
        isNew: false,
        isPromo: true,
        codeBar: 'carte-satellite',
        image: 'static/images/products/technology/carte-satellite.png',
        specs: ['Carte satellite', 'Carte externe', 'Digital satellite TV tuner', "HD", "DVB-S2"],
        description: "La carte satellite externe est un tuner TV numérique pour PC portable et Desktop pour regarder la télévision par satellite les chaines avec liberte.",
        type: 'Digital satellite TV tuner'
    },
    {
        id: 'tech-012',
        name: 'NFC card reader',
        brand: 'NFC',
        category: 'technology',
        price: 70.00,
        original_price: null,
        stock: 1,
        rating: 4.1,
        reviewCount: 12,
        isNew: false,
        isPromo: false,
        codeBar: 'nfc-card-reader',
        image: 'static/images/products/technology/nfc-reader.png',
        specs: ['NFC', 'Card reader', 'NFC card reader', "USB"],
        description: "Le NFC card reader est un lecteur de carte NFC pour PC portable et Desktop pour lire les cartes NFC.",
        type: 'NFC card reader'
    },
    {
        id: 'tech-013',
        name: 'Adaptateur IDE vers USB',
        brand: 'IDE to USB',
        category: 'technology',
        price: 70.00,
        original_price: null,
        stock: 1,
        rating: 4.1,
        reviewCount: 12,
        isNew: false,
        isPromo: false,
        codeBar: 'ide-usb',
        image: 'static/images/products/technology/ide-usb.jpg',
        specs: ['IDE', 'USB', 'Adapter', "SATA"],
        description: "L'adaptateur IDE vers USB est un adaptateur qui permet de connecter un disque dur IDE ou SATA à un port USB.",
        type: 'IDE to USB'
    },
    {
        id: 'tech-014',
        name: 'Cable reseau RJ45',
        brand: 'RJ45',
        category: 'technology',
        price: 30.00,
        original_price: null,
        stock: 6,
        rating: 4.7,
        reviewCount: 17,
        isNew: false,
        isPromo: false,
        codeBar: 'cable-rj45',
        image: 'static/images/products/technology/cable-rj45.png',
        specs: ['Cable', 'RJ45', 'Cable reseau', "Ethernet"],
        description: "Le cable reseau RJ45 est un cable qui permet de connecter un appareil à un réseau Ethernet.",
        type: 'Cable reseau RJ45'
    },
    {
        id: 'tech-015',
        name: 'Samsung Ace',
        brand: 'Samsung',
        category: 'technology',
        price: 70.00,
        original_price: null,
        stock: 1,
        rating: 4.0,
        reviewCount: 9,
        isNew: false,
        isPromo: false,
        codeBar: 'samsung-ace',
        image: 'static/images/products/technology/samsung-ace.png',
        specs: ['Samsung', 'Ace', 'Samsung Ace'],
        description: "Le Samsung Ace est un smart téléphone avec un écran tactile et un appareil photo.",
        type: 'Samsung Ace'
    },

    // ── Beauty ──
    // {
    //     id: 'beauty-001',
    //     name: 'Sérum Éclat Vitamine C',
    //     brand: 'Lumière',
    //     category: 'beauty',
    //     price: 189.00,
    //     original_price: null,
    //     stock: 30,
    //     rating: 4.9,
    //     reviewCount: 45,
    //     isNew: false,
    //     isPromo: false,
    //     codeBar: 'BEA-001',
    //     image: 'static/images/products/beauty/beauty1.jpg',
    //     specs: ['Végétalien', 'Sans paraben', '30ml'],
    //     description: 'Illuminez votre teint avec notre sérum riche en vitamine C.',
    //     type: 'Soin Visage'
    // },

    // ── Automobile ──
    {
        id: 'auto-001',
        name: 'Castrol EDGE 5W-30 LL',
        brand: 'Castrol',
        category: 'automobile',
        price: 549.99,
        original_price: null,
        stock: 15,
        rating: 4.8,
        reviewCount: 42,
        isNew: false,
        isPromo: false,
        codeBar: '3374650021613',
        image: 'static/images/products/automobile/01.jpg',
        specs: ['SAE 5W-30', 'ACEA C3', 'VW 504.00/507.00'],
        description: "Castrol EDGE 5W-30 LL convient aux véhicules essence, diesel et hybride et est conçue pour répondre aux dernières spécificaitons des moteurs modernes lorsque le constructeur recommande un lubrifiant de grade SAE 5W-30 ACEA C3",
        type: 'Huile 5W-30 LL'
    },
    {
        id: 'auto-002',
        name: 'Castrol EDGE 5W-40 A3/B4',
        brand: 'Castrol',
        category: 'automobile',
        price: 499.99,
        original_price: null,
        stock: 15,
        rating: 4.8,
        reviewCount: 42,
        isNew: false,
        isPromo: false,
        codeBar: '337467897821613',
        image: 'static/images/products/automobile/02.jpg',
        specs: ['SAE 5W-30', 'ACEA C3', 'VW 504.00/507.00'],
        description: "Castrol EDGE 5W-40 A3/B4 convient aux véhicules essence et diesel et est conçue pour répondre aux dernières exigences des moteurs modernes lorsque le constructeur recommande un lubrifiant de grade SAE 5W-40 ACEA A3/B4, API SP ou antérieur.",
        type: 'Huile 5W-40 A3/B4'
    },
    {
        id: 'auto-003',
        name: 'Castrol GTX 10W40',
        brand: 'Castrol',
        category: 'automobile',
        price: 299.99,
        original_price: null,
        stock: 15,
        rating: 4.8,
        reviewCount: 42,
        isNew: false,
        isPromo: false,
        codeBar: '337467897821613',
        image: 'static/images/products/automobile/03.jpg',
        specs: ['SAE 5W-30', 'ACEA C3', 'VW 504.00/507.00'],
        description: "Castrol GTX 10W-40 A3/B4 est recommandée pour les moteurs essence et diesel lorsque le constructeur prescrit l’utilisation d’un lubrifiant de viscosité SAE 10W-40 répondant aux normes de performances ACEA A3/B3, A3/B4 ou API SL/CF.",
        type: 'Huile GTX 10W40'
    },
    {
        id: 'auto-004',
        name: 'Dos de moto',
        brand: 'article',
        category: 'automobile',
        price: 99.99,
        original_price: null,
        stock: 1,
        rating: 4.0,
        reviewCount: 8,
        isNew: false,
        isPromo: false,
        codeBar: '337467878721613',
        image: 'static/images/products/automobile/takaya.png',
        specs: ['Moteur', 'Dos', 'Tool', 'Article'],
        description: "Dos de moto Rymco piece originale",
        type: 'Dos de moto'
    },


    // ── Maison ──
    {
        id: 'mai-001',
        name: 'Jeu d\'échecs en verre',
        brand: 'DecoHome',
        category: 'maison',
        price: 220.00,
        original_price: 250.00,
        stock: 1,
        rating: 4.6,
        reviewCount: 22,
        isNew: false,
        isPromo: true,
        codeBar: 'CHE-001',
        image: 'static/images/products/maison/chess.png',
        specs: ['Chess', 'Jeu d\'échecs', 'Game', '20x20cm'],
        description: 'Jeu d\'échecs en verre sofistiqué pour les amateurs et pro de jeux d\'échecs.',
        type: 'Chess'
    },
    {
        id: 'mai-002',
        name: 'Wireless remote control lamp holder',
        brand: 'DecoHome',
        category: 'maison',
        price: 80.00,
        original_price: 120.00,
        stock: 6,
        rating: 4.8,
        reviewCount: 22,
        isNew: true,
        isPromo: true,
        codeBar: 'lamp-001',
        image: 'static/images/products/maison/lampe.png',
        specs: ['lampe', 'holder', 'wireless'],
        description: 'Une controler wireless avec telecommande de lamp avec munitage de 5min au 120min.',
        type: 'Wireless remote'
    },

    // ── Cuisine ──
    // {
    //     id: 'air-fryer-v2',
    //     name: 'Friteuse Sans Huile Pro',
    //     brand: 'KitchenMax',
    //     category: 'cuisine',
    //     price: 1299.00,
    //     original_price: 1499.00,
    //     stock: 8,
    //     rating: 4.8,
    //     reviewCount: 156,
    //     isNew: false,
    //     isPromo: true,
    //     codeBar: 'CUI-001',
    //     image: 'static/images/products/cuisine/cuisine1.jpg',
    //     specs: ['5.5 Litres', '1700W', 'Écran Tactile'],
    //     description: 'Cuisinez sainement avec moins de 85% de matières grasses.',
    //     type: 'Petit Électroménager'
    // },

    // ── Bureautique ──
    {
        id: 'desk-001',
        name: 'Mecanisme de chaise',
        brand: 'OfficeFlow',
        category: 'bureautique',
        price: 120.00,
        original_price: null,
        stock: 1,
        rating: 4.0,
        reviewCount: 2,
        isNew: false,
        isPromo: false,
        codeBar: 'BUR-001',
        image: 'static/images/products/bureautique/mecanisme-chaise.jpg',
        specs: ['Mecanisme', 'Chaise', 'Bureau'],
        description: 'Mecanisme et mains de chaise bureau',
        type: 'Mecanisme de chaise'
    },
];
