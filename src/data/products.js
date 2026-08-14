// Products Database for Petals Ethnic

// Custom SVG data URI placeholder for products
const createProductPlaceholder = (name, index) => {
  const width = 600;
  const height = 800;
  const colors = [
    { bg: "#FAF7F5", text: "#6B6263", stroke: "#EAE3DF" },
    { bg: "#FDF2F4", text: "#8A7679", stroke: "#F5DFE3" },
    { bg: "#F5F2EF", text: "#5C5654", stroke: "#E4DDD9" },
    { bg: "#FAF6F0", text: "#7A6E67", stroke: "#EDE2D7" }
  ];
  const choice = colors[index % colors.length];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="100%" height="100%" fill="${choice.bg}"/>
    <rect x="25" y="25" width="${width - 50}" height="${height - 50}" fill="none" stroke="${choice.stroke}" stroke-width="1.5"/>
    <path d="M ${width/2 - 30} ${height/2 - 40} L ${width/2 + 30} ${height/2 - 40} L ${width/2 + 20} ${height/2 + 60} L ${width/2 - 20} ${height/2 + 60} Z" fill="none" stroke="${choice.text}" stroke-width="1.5"/>
    <circle cx="${width/2}" cy="${height/2 - 55}" r="10" fill="none" stroke="${choice.text}" stroke-width="1.5"/>
    <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="'Playfair Display', serif" font-size="20px" fill="${choice.text}" font-style="italic">${name}</text>
    <text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle" font-family="'Inter', sans-serif" font-size="10px" fill="#A09692" letter-spacing="3px">PETALS ETHNIC</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const products = [
  // Aline Midi Dress (cat_1)
  {
    id: "prod_1",
    name: "Aura Premium Linen Midi",
    categorySlug: "aline-midi-dress",
    price: 2899,
    salePrice: 2299,
    images: [
      createProductPlaceholder("Aura Linen Midi (View 1)", 0),
      createProductPlaceholder("Aura Linen Midi (View 2)", 1),
      createProductPlaceholder("Aura Linen Midi (Detail)", 2)
    ],
    description: "Indulge in pure elegance with our Aura Linen Midi Dress. Tailored with a flared A-line silhouette, this dress features premium breathable linen fabric, dynamic side pockets, and an elegant round neck. Perfect for casual summer outings and evening brunches.",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Blush Pink", "Warm Cream", "Soft Indigo"],
    stockCount: 12,
    isFeatured: true,
    isNewArrival: true,
    isActive: true
  },
  {
    id: "prod_2",
    name: "Scarlet Cotton Flare Midi",
    categorySlug: "aline-midi-dress",
    price: 2599,
    salePrice: null,
    images: [
      createProductPlaceholder("Scarlet Cotton Midi (View 1)", 3),
      createProductPlaceholder("Scarlet Cotton Midi (View 2)", 0)
    ],
    description: "Crafted in breathable premium cotton, this scarlet midi features subtle lace highlights, a comfortable flared tier, and an option to style with a matching fabric belt. Embrace comfort and high-end boutique ethnic aesthetics.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Cherry Red", "Ivory"],
    stockCount: 8,
    isFeatured: false,
    isNewArrival: true,
    isActive: true
  },

  // Aline Kurti with Floral Print (cat_2)
  {
    id: "prod_3",
    name: "Bloom Watercolor Floral Kurti",
    categorySlug: "aline-kurti-floral-print",
    price: 1899,
    salePrice: 1499,
    images: [
      createProductPlaceholder("Bloom Floral Kurti (Front)", 1),
      createProductPlaceholder("Bloom Floral Kurti (Back)", 2)
    ],
    description: "Adorned with pastel watercolor floral prints, this A-line Kurti is made from high-grade cotton-silk blend. It boasts elegant gather detailing at the waist, 3/4 sleeves, and delicate hand-embroidery around the keyhole neckline.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Peach Pink", "Mint Green"],
    stockCount: 20,
    isFeatured: true,
    isNewArrival: true,
    isActive: true
  },
  {
    id: "prod_4",
    name: "Mystique Blossom Georgette Kurti",
    categorySlug: "aline-kurti-floral-print",
    price: 2199,
    salePrice: 1799,
    images: [
      createProductPlaceholder("Mystique Floral Kurti (Front)", 2),
      createProductPlaceholder("Mystique Floral Kurti (Detail)", 3)
    ],
    description: "A gorgeous flowing Georgette Kurti with an all-over floral print, premium butter-crepe lining, and subtle sequin accents. Its lightweight feel makes it ideal for festive daytime wear.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Lavender Blush", "Powder Blue"],
    stockCount: 5,
    isFeatured: false,
    isNewArrival: false,
    isActive: true
  },

  // Aline Kurti (cat_3)
  {
    id: "prod_5",
    name: "Elegant Solid Rayon Aline Kurti",
    categorySlug: "aline-kurti",
    price: 1599,
    salePrice: 1299,
    images: [
      createProductPlaceholder("Solid Rayon Kurti (Front)", 0),
      createProductPlaceholder("Solid Rayon Kurti (Back)", 1)
    ],
    description: "A minimalist classic for your ethnic wardrobe. Made from premium, heavy-weight rayon fabric, this solid A-line Kurti is designed with a V-neck, wooden buttons, and a clean structured drape.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Baby Pink", "Olive Green", "Charcoal"],
    stockCount: 15,
    isFeatured: false,
    isNewArrival: false,
    isActive: true
  },
  {
    id: "prod_6",
    name: "Earthy Chanderi Aline Kurti",
    categorySlug: "aline-kurti",
    price: 2499,
    salePrice: null,
    images: [
      createProductPlaceholder("Chanderi Kurti (Front)", 3),
      createProductPlaceholder("Chanderi Kurti (Back)", 0)
    ],
    description: "Woven in premium Chanderi cotton-silk, this Kurti features a subtle golden border, a button-down front, and a soft matching lining. It represents a elegant fusion of heritage craftsmanship and modern silhouette.",
    sizes: ["M", "L", "XL"],
    colors: ["Mustard Gold", "Warm Ivory"],
    stockCount: 6,
    isFeatured: true,
    isNewArrival: false,
    isActive: true
  },

  // Anarkali (cat_4)
  {
    id: "prod_7",
    name: "Royal Ivory Embroidered Anarkali",
    categorySlug: "anarkali",
    price: 4999,
    salePrice: 3999,
    images: [
      createProductPlaceholder("Ivory Anarkali (Full View)", 2),
      createProductPlaceholder("Ivory Anarkali (Neck Detail)", 3),
      createProductPlaceholder("Ivory Anarkali (Back Detail)", 0)
    ],
    description: "Make a grand entrance with this premium Royal Ivory Anarkali suit. Crafted from fine georgette, this set features detailed hand-woven zari embroidery on the yoke, a 24-kali heavy flare, a matching churidar pants, and an organza dupatta with scalloped borders.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Ivory Gold", "Rose Gold"],
    stockCount: 4,
    isFeatured: true,
    isNewArrival: true,
    isActive: true
  },
  {
    id: "prod_8",
    name: "Festive Crimson Anarkali Set",
    categorySlug: "anarkali",
    price: 4299,
    salePrice: null,
    images: [
      createProductPlaceholder("Crimson Anarkali (Front)", 1),
      createProductPlaceholder("Crimson Anarkali (Back)", 2)
    ],
    description: "Drape yourself in festive luxury. This crimson red silk-blend Anarkali offers a elegant flare, gold foil print borders, and a beautiful georgette dupatta. Designed with comfortable elastic waist adjustments.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Crimson Red"],
    stockCount: 0, // Mocking out of stock scenario
    isFeatured: false,
    isNewArrival: false,
    isActive: true
  },

  // Codeset (cat_5)
  {
    id: "prod_9",
    name: "Modern Pastel Co-ord Set",
    categorySlug: "codeset",
    price: 2999,
    salePrice: 2499,
    images: [
      createProductPlaceholder("Pastel Co-ord (Full Set)", 0),
      createProductPlaceholder("Pastel Co-ord (Tunic)", 1),
      createProductPlaceholder("Pastel Co-ord (Pants)", 2)
    ],
    description: "An elegant two-piece coordinate set that redefines daily ethnic chic. Crafted from ultra-soft cotton modal, the set features a high-low tunic shirt with delicate pintuck detailing and straight comfort pants.",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Sage Green", "Soft Peach"],
    stockCount: 14,
    isFeatured: true,
    isNewArrival: true,
    isActive: true
  },
  {
    id: "prod_10",
    name: "Indigo Ikkat Modal Codeset",
    categorySlug: "codeset",
    price: 3200,
    salePrice: 2800,
    images: [
      createProductPlaceholder("Indigo Codeset (Full View)", 3),
      createProductPlaceholder("Indigo Codeset (Details)", 0)
    ],
    description: "Make a contemporary statement with our hand-block printed indigo Ikkat codeset. Crafted in rich cotton modal fabric, it features a collared top with pockets and comfortable wide-leg trousers.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Indigo White"],
    stockCount: 9,
    isFeatured: false,
    isNewArrival: false,
    isActive: true
  },

  // Tissue Silk Kasavu (cat_6)
  {
    id: "prod_11",
    name: "Golden Tissue Silk Kasavu Saree",
    categorySlug: "tissue-silk-kasavu",
    price: 5499,
    salePrice: 4799,
    images: [
      createProductPlaceholder("Kasavu Saree (Pallu View)", 2),
      createProductPlaceholder("Kasavu Saree (Folded)", 3),
      createProductPlaceholder("Kasavu Saree (Blouse Piece)", 1)
    ],
    description: "A heritage masterpiece for your collection. Woven by master weavers, this premium Tissue Silk Kasavu saree features a gorgeous shimmering texture, a broad 10cm pure zari golden border, and intricate temple border patterns. Perfect for weddings and traditional celebrations.",
    sizes: ["One Size"],
    colors: ["Traditional Cream & Gold"],
    stockCount: 3,
    isFeatured: true,
    isNewArrival: true,
    isActive: true
  },
  {
    id: "prod_12",
    name: "Premium Rose Gold Tissue Saree",
    categorySlug: "tissue-silk-kasavu",
    price: 5999,
    salePrice: null,
    images: [
      createProductPlaceholder("Rose Gold Saree (Pallu)", 0),
      createProductPlaceholder("Rose Gold Saree (Full drape)", 1)
    ],
    description: "A modern variation of the classic Kasavu. Crafted in fine tissue silk with rose-gold metallic warp threads, this saree offers an unmatched drape and a soft, feminine luster that shimmers beautifully under evening lighting.",
    sizes: ["One Size"],
    colors: ["Rose Gold Cream"],
    stockCount: 6,
    isFeatured: false,
    isNewArrival: true,
    isActive: true
  }
];
