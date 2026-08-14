// Products Database for Petals Ethnic

const img1 = "https://i.ibb.co/1fFmfKNH/Whats-App-Image-2026-08-13-at-12-31-10-PM-1.jpg";
const img2 = "https://i.ibb.co/v4qWB2YQ/IMG-20260805-WA0017.jpg";
const img3 = "https://i.ibb.co/RkKyZV0d/IMG-20260805-WA0011.jpg";
const img4 = "https://i.ibb.co/XZF0w4jR/Whats-App-Image-2026-08-13-at-12-31-10-PM-2.jpg";
const img5 = "https://i.ibb.co/HpfR01b2/Whats-App-Image-2026-08-13-at-12-31-11-PM-1.jpg";
const img6 = "https://i.ibb.co/xt96ws2F/Whats-App-Image-2026-08-13-at-12-30-50-PM.jpg";

export const products = [
  // Aline Midi Dress (cat_1)
  {
    id: "prod_1",
    name: "Aura Premium Linen Midi",
    categorySlug: "aline-midi-dress",
    price: 2899,
    salePrice: 2299,
    images: [img1, img2, img3],
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
    images: [img2, img1, img3],
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
    images: [img3, img4, img5],
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
    images: [img4, img3, img5],
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
    images: [img5, img6, img1],
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
    images: [img6, img5, img1],
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
    images: [img1, img2, img4],
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
    images: [img2, img1, img4],
    description: "Drape yourself in festive luxury. This crimson red silk-blend Anarkali offers a elegant flare, gold foil print borders, and a beautiful georgette dupatta. Designed with comfortable elastic waist adjustments.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Crimson Red"],
    stockCount: 0,
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
    images: [img3, img5, img4],
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
    images: [img4, img5, img3],
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
    images: [img5, img6, img2],
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
    images: [img6, img5, img2],
    description: "A modern variation of the classic Kasavu. Crafted in fine tissue silk with rose-gold metallic warp threads, this saree offers an unmatched drape and a soft, feminine luster that shimmers beautifully under evening lighting.",
    sizes: ["One Size"],
    colors: ["Rose Gold Cream"],
    stockCount: 6,
    isFeatured: false,
    isNewArrival: true,
    isActive: true
  }
];
