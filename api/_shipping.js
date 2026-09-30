/**
 * Dynamic Shipping & Delivery Engine for Petals Ethnics and Jewellers
 * 
 * Rules:
 * 1. Clothing / Saree:
 *    - Within Kerala: Base ₹60, +₹20 for each additional product
 *    - Outside Kerala: Base ₹80, +₹20 for each additional product
 * 2. Jewellery:
 *    - Within Kerala: Base ₹70, +₹20 for each additional product
 *    - Outside Kerala: Base ₹90, +₹20 for each additional product
 * 3. Mixed Cart:
 *    - Uses higher base shipping rate (Jewellery base: ₹70 in Kerala / ₹90 outside Kerala)
 *    - +₹20 for each additional product beyond the first item
 * 
 * Regions & Delivery Time:
 * - Kerala: 3–4 working days (excludes Sundays)
 * - Nearby Kerala: 6–8 working days (excludes Sundays)
 * - North side / Other states: 16–18 working days (excludes Sundays)
 */

export const INDIAN_STATES = [
  'Kerala',
  'Tamil Nadu',
  'Karnataka',
  'Andhra Pradesh',
  'Telangana',
  'Puducherry',
  'Goa',
  'Lakshadweep',
  'Maharashtra',
  'Gujarat',
  'Delhi',
  'Uttar Pradesh',
  'Rajasthan',
  'Madhya Pradesh',
  'West Bengal',
  'Punjab',
  'Haryana',
  'Bihar',
  'Odisha',
  'Assam',
  'Jammu and Kashmir',
  'Himachal Pradesh',
  'Uttarakhand',
  'Jharkhand',
  'Chhattisgarh',
  'Chandigarh',
  'Tripura',
  'Meghalaya',
  'Manipur',
  'Nagaland',
  'Mizoram',
  'Arunachal Pradesh',
  'Sikkim',
  'Ladakh',
  'Andaman and Nicobar Islands',
  'Dadra and Nagar Haveli and Daman and Diu'
];

export const NEARBY_KERALA_STATES = [
  'tamil nadu',
  'karnataka',
  'andhra pradesh',
  'telangana',
  'puducherry',
  'pondicherry',
  'goa',
  'lakshadweep'
];

export const SHIPPING_RATES = {
  clothing: {
    kerala_base: 60,
    outside_base: 80,
    additional: 20
  },
  jewellery: {
    kerala_base: 70,
    outside_base: 90,
    additional: 20
  }
};

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Determines whether a state is within Kerala, nearby Kerala, or North side/other
 * @param {string} stateName 
 */
export function getRegionForState(stateName) {
  if (!stateName || typeof stateName !== 'string') {
    return {
      region: 'Kerala',
      tier: 'kerala',
      timeRange: '3–4 working days',
      minDays: 3,
      maxDays: 4
    };
  }

  const s = stateName.trim().toLowerCase();

  if (s === 'kerala') {
    return {
      region: 'Kerala',
      tier: 'kerala',
      timeRange: '3–4 working days',
      minDays: 3,
      maxDays: 4
    };
  }

  if (NEARBY_KERALA_STATES.includes(s)) {
    return {
      region: 'Nearby Kerala',
      tier: 'outside_kerala',
      timeRange: '6–8 working days',
      minDays: 6,
      maxDays: 8
    };
  }

  return {
    region: 'North side',
    tier: 'outside_kerala',
    timeRange: '16–18 working days',
    minDays: 16,
    maxDays: 18
  };
}

/**
 * Detects whether an item or product belongs to the Jewellery category
 * @param {object} item 
 */
export function isJewelleryItem(item) {
  if (!item) return false;

  // 1. Direct department check
  const dept = (item.department || item.product?.department || '').toLowerCase();
  if (dept === 'jewellery' || dept === 'jewelry') return true;
  if (dept === 'ethnic' || dept === 'clothing') return false;

  // 2. Category name & slug check
  const catName = (item.category_name || item.category?.name || item.product?.category?.name || '').toLowerCase();
  const catSlug = (item.category_slug || item.category?.slug || item.product?.category?.slug || '').toLowerCase();
  if (catSlug.includes('jewel') || catSlug.includes('necklace') || catName.includes('jewel') || catName.includes('necklace')) {
    return true;
  }

  // 3. Product name & description check
  const name = (item.product_name || item.name || item.product?.name || '').toLowerCase();
  const jewelleryPattern = /jewel|necklace|earring|bangle|ring|bracelet|chain|pendant|anklet|choker|jhumka|har|choker necklace/i;
  if (jewelleryPattern.test(name)) return true;

  // 4. Default to Clothing / Saree
  return false;
}

/**
 * Calculates dynamic shipping charges based on item categories, quantities, and delivery state
 * @param {Array} items 
 * @param {string} state 
 */
export function calculateShipping(items = [], state = 'Kerala') {
  const regionInfo = getRegionForState(state);
  const isKerala = regionInfo.tier === 'kerala';

  if (!items || !Array.isArray(items) || items.length === 0) {
    return {
      shippingCharge: 0,
      totalQuantity: 0,
      hasClothing: false,
      hasJewellery: false,
      isMixedCart: false,
      baseRate: 0,
      additionalCharge: 0,
      regionInfo
    };
  }

  let totalQuantity = 0;
  let hasClothing = false;
  let hasJewellery = false;

  for (const it of items) {
    const qty = Math.max(1, parseInt(it.quantity || it.qty || 1, 10));
    totalQuantity += qty;
    if (isJewelleryItem(it)) {
      hasJewellery = true;
    } else {
      hasClothing = true;
    }
  }

  if (totalQuantity === 0) {
    return {
      shippingCharge: 0,
      totalQuantity: 0,
      hasClothing,
      hasJewellery,
      isMixedCart: false,
      baseRate: 0,
      additionalCharge: 0,
      regionInfo
    };
  }

  const isMixedCart = hasClothing && hasJewellery;
  let baseRate = 0;

  if (isMixedCart) {
    // Mixed cart rule: use higher base rate (Jewellery base: ₹70 in Kerala, ₹90 outside Kerala)
    baseRate = isKerala ? SHIPPING_RATES.jewellery.kerala_base : SHIPPING_RATES.jewellery.outside_base;
  } else if (hasJewellery) {
    baseRate = isKerala ? SHIPPING_RATES.jewellery.kerala_base : SHIPPING_RATES.jewellery.outside_base;
  } else {
    // Only Clothing / Saree
    baseRate = isKerala ? SHIPPING_RATES.clothing.kerala_base : SHIPPING_RATES.clothing.outside_base;
  }

  const additionalItems = Math.max(0, totalQuantity - 1);
  const additionalCharge = additionalItems * 20;
  const shippingCharge = baseRate + additionalCharge;

  return {
    shippingCharge,
    totalQuantity,
    hasClothing,
    hasJewellery,
    isMixedCart,
    baseRate,
    additionalCharge,
    regionInfo
  };
}

/**
 * Adds working days to a starting date, strictly skipping Sundays
 * @param {Date|string|number} fromDate 
 * @param {number} workingDays 
 * @returns {Date}
 */
export function addWorkingDays(fromDate, workingDays) {
  const date = new Date(fromDate);
  date.setHours(12, 0, 0, 0); // Normalize to midday to prevent timezone day shift

  let added = 0;
  while (added < workingDays) {
    date.setDate(date.getDate() + 1);
    // 0 is Sunday in JavaScript Date
    if (date.getDay() !== 0) {
      added++;
    }
  }
  return date;
}

/**
 * Formats a date range e.g. "3 October – 5 October 2026"
 * @param {Date} startDate 
 * @param {Date} endDate 
 * @returns {string}
 */
export function formatDeliveryDateRange(startDate, endDate) {
  const sDay = startDate.getDate();
  const sMonth = MONTH_NAMES[startDate.getMonth()];
  const sYear = startDate.getFullYear();

  const eDay = endDate.getDate();
  const eMonth = MONTH_NAMES[endDate.getMonth()];
  const eYear = endDate.getFullYear();

  if (sMonth === eMonth && sYear === eYear) {
    return `${sDay} ${sMonth} – ${eDay} ${eMonth} ${eYear}`;
  } else if (sYear === eYear) {
    return `${sDay} ${sMonth} – ${eDay} ${eMonth} ${eYear}`;
  } else {
    return `${sDay} ${sMonth} ${sYear} – ${eDay} ${eMonth} ${eYear}`;
  }
}

/**
 * Calculates estimated delivery dates for an order based on destination state and order date
 * @param {string} state 
 * @param {Date|string|number} orderDate 
 */
export function getDeliveryEstimate(state = 'Kerala', orderDate = new Date()) {
  const regionInfo = getRegionForState(state);
  const startDate = addWorkingDays(orderDate, regionInfo.minDays);
  const endDate = addWorkingDays(orderDate, regionInfo.maxDays);
  const dateText = formatDeliveryDateRange(startDate, endDate);

  return {
    region: regionInfo.region,
    timeRange: regionInfo.timeRange,
    minDays: regionInfo.minDays,
    maxDays: regionInfo.maxDays,
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    dateText
  };
}

/**
 * Encodes delivery metadata into a structured string for persistence in orders.notes
 */
export function serializeDeliveryData(deliveryData) {
  return `<!--DELIVERY_DATA:${JSON.stringify(deliveryData)}-->`;
}

/**
 * Extracts delivery metadata previously saved in orders.notes
 */
export function parseDeliveryDataFromNotes(notes) {
  if (!notes || typeof notes !== 'string') return null;
  const match = notes.match(/<!--DELIVERY_DATA:([\s\S]*?)-->/);
  if (match && match[1]) {
    try {
      return JSON.parse(match[1]);
    } catch (_) {
      return null;
    }
  }
  return null;
}
