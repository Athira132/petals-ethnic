// Categories Database for Petals Ethnic

// Tasteful neutral SVG placeholder with elegant styling
const createPlaceholderSvg = (text) => {
  const width = 600;
  const height = 800;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="100%" height="100%" fill="#FAF7F5"/>
    <rect x="20" y="20" width="${width - 40}" height="${height - 40}" fill="none" stroke="#EAE3DF" stroke-width="1"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="'Playfair Display', serif" font-size="24px" fill="#6B6263" font-style="italic">${text}</text>
    <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="'Inter', sans-serif" font-size="12px" fill="#A09692" letter-spacing="2px">PETALS ETHNIC</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const categories = [
  {
    id: "cat_1",
    name: "Aline Midi Dress",
    slug: "aline-midi-dress",
    image: createPlaceholderSvg("Aline Midi Dress"),
    description: "Premium midi dresses tailored with soft, breathable fabrics and elegant modern drapes.",
    isActive: true
  },
  {
    id: "cat_2",
    name: "Aline Kurti with Floral Print",
    slug: "aline-kurti-floral-print",
    image: createPlaceholderSvg("Floral Aline Kurti"),
    description: "Beautiful A-line Kurtis adorned with soft watercolor florals and intricate prints.",
    isActive: true
  },
  {
    id: "cat_3",
    name: "Aline Kurti",
    slug: "aline-kurti",
    image: createPlaceholderSvg("Aline Kurti"),
    description: "Classic A-line silhouettes that bring effortless elegance to your daily and festive wear.",
    isActive: true
  },
  {
    id: "cat_4",
    name: "Anarkali",
    slug: "anarkali",
    image: createPlaceholderSvg("Anarkali Suit"),
    description: "Royal flair and majestic silhouettes crafted for celebratory occasions and festivals.",
    isActive: true
  },
  {
    id: "cat_5",
    name: "Codeset",
    slug: "codeset",
    image: createPlaceholderSvg("Codeset"),
    description: "Chic and modern coordinated ethnic sets combining style, premium fit, and unmatched comfort.",
    isActive: true
  },
  {
    id: "cat_6",
    name: "Tissue Silk Kasavu",
    slug: "tissue-silk-kasavu",
    image: createPlaceholderSvg("Tissue Silk Kasavu"),
    description: "Traditional golden Kasavu designs woven in shimmering, premium tissue silk fabrics.",
    isActive: true
  }
];
