import { describe, it, expect } from 'vitest';
import product from './products';

describe('Product Data', () => {
  it('should have the correct base price and product structure', () => {
    expect(product.id).toBe('sayf-beard-oil');
    expect(product.basePrice).toBeGreaterThan(0);
    expect(product.quantityOptions).toBeInstanceOf(Array);
  });

  it('should have quantity options that match the base price', () => {
    product.quantityOptions.forEach((option) => {
      expect(option.price).toBe(product.basePrice * option.qty);
    });
  });
});
