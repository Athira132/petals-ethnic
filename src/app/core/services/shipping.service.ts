import { Injectable } from '@angular/core';
import { CartItem } from '../models/cart.model';

export interface ShippingRegionInfo {
  region: 'Kerala' | 'Nearby Kerala' | 'North side';
  tier: 'kerala' | 'outside_kerala';
  timeRange: string;
  minDays: number;
  maxDays: number;
}

export interface DeliveryEstimate {
  region: string;
  timeRange: string;
  minDays: number;
  maxDays: number;
  startDate: string;
  endDate: string;
  dateText: string;
}

export interface ShippingCalculationResult {
  shippingCharge: number;
  totalQuantity: number;
  hasClothing: boolean;
  hasJewellery: boolean;
  isMixedCart: boolean;
  baseRate: number;
  additionalCharge: number;
  regionInfo: ShippingRegionInfo;
}

export const INDIAN_STATES: string[] = [
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

export const NEARBY_KERALA_STATES: string[] = [
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

export const MONTH_NAMES: string[] = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

@Injectable({
  providedIn: 'root'
})
export class ShippingService {
  readonly states = INDIAN_STATES;

  getRegionForState(stateName?: string): ShippingRegionInfo {
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

  isJewelleryItem(item: any): boolean {
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

  calculateShipping(items: CartItem[] | any[] = [], state = 'Kerala'): ShippingCalculationResult {
    const regionInfo = this.getRegionForState(state);
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
      if (this.isJewelleryItem(it)) {
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

  addWorkingDays(fromDate: Date | string | number, workingDays: number): Date {
    const date = new Date(fromDate);
    date.setHours(12, 0, 0, 0);

    let added = 0;
    while (added < workingDays) {
      date.setDate(date.getDate() + 1);
      // 0 is Sunday
      if (date.getDay() !== 0) {
        added++;
      }
    }
    return date;
  }

  formatDeliveryDateRange(startDate: Date, endDate: Date): string {
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

  getDeliveryEstimate(state = 'Kerala', orderDate: Date | string | number = new Date()): DeliveryEstimate {
    const regionInfo = this.getRegionForState(state);
    const startDate = this.addWorkingDays(orderDate, regionInfo.minDays);
    const endDate = this.addWorkingDays(orderDate, regionInfo.maxDays);
    const dateText = this.formatDeliveryDateRange(startDate, endDate);

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

  parseDeliveryDataFromNotes(notes?: string | null): DeliveryEstimate | null {
    if (!notes || typeof notes !== 'string') return null;
    const match = notes.match(/<!--DELIVERY_DATA:([\s\S]*?)-->/);
    if (match && match[1]) {
      try {
        const parsed = JSON.parse(match[1]);
        return {
          region: parsed.shipping_region || 'Kerala',
          timeRange: parsed.delivery_time_range || '3–4 working days',
          minDays: parsed.min_days || 3,
          maxDays: parsed.max_days || 4,
          startDate: parsed.estimated_delivery_start || '',
          endDate: parsed.estimated_delivery_end || '',
          dateText: parsed.estimated_delivery_text || ''
        };
      } catch (_) {
        return null;
      }
    }
    return null;
  }
}
