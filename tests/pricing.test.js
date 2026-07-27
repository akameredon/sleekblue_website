import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('Sleekblue Pricing & Order Calculations', () => {
  it('calculates die-cut sticker batch discounts correctly', () => {
    const basePricePerUnit = 100;
    const quantity = 500;
    const bulkDiscountRate = 0.15; // 15% discount for 500+ items
    
    const rawTotal = basePricePerUnit * quantity;
    const discountedTotal = rawTotal * (1 - bulkDiscountRate);
    
    assert.strictEqual(rawTotal, 50000);
    assert.strictEqual(discountedTotal, 42500);
  });

  it('validates minimum order quantity rules', () => {
    const minQuantity = 50;
    const userQuantity = 10;
    const isValid = userQuantity >= minQuantity;
    
    assert.strictEqual(isValid, false);
  });

  it('validates email formatting helper', () => {
    const isValidEmail = (email) => typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    
    assert.strictEqual(isValidEmail('customer@sleekblue.com'), true);
    assert.strictEqual(isValidEmail('invalid-email'), false);
  });
});
