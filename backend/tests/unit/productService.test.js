import { parseQuantity } from '../../src/services/productService.js';

describe('parseQuantity', () => {

  // --- Null / empty input ---
  test('returns count unit and null quantity when input is empty string', () => {
    expect(parseQuantity('')).toEqual({ unit: 'count', quantity: null });
  });

  test('returns count unit and null quantity when input is null', () => {
    expect(parseQuantity(null)).toEqual({ unit: 'count', quantity: null });
  });

  test('returns count unit and null quantity when input is undefined', () => {
    expect(parseQuantity(undefined)).toEqual({ unit: 'count', quantity: null });
  });

  // --- Single value formats ---
  test('parses grams: "500g"', () => {
    expect(parseQuantity('500g')).toEqual({ unit: 'gram', quantity: 500 });
  });

  test('parses grams with space: "500 g"', () => {
    expect(parseQuantity('500 g')).toEqual({ unit: 'gram', quantity: 500 });
  });

  test('parses kilograms and converts to grams: "1.5 kg"', () => {
    expect(parseQuantity('1.5 kg')).toEqual({ unit: 'gram', quantity: 1500 });
  });

  test('parses milliliters: "330 ml"', () => {
    expect(parseQuantity('330 ml')).toEqual({ unit: 'milliliter', quantity: 330 });
  });

  test('parses liters: "1 l"', () => {
    expect(parseQuantity('1 l')).toEqual({ unit: 'liter', quantity: 1 });
  });

  test('parses liters written as "litre": "1.5 litre"', () => {
    expect(parseQuantity('1.5 litre')).toEqual({ unit: 'liter', quantity: 1.5 });
  });

  test('parses liters written as "liter": "2 liter"', () => {
    expect(parseQuantity('2 liter')).toEqual({ unit: 'liter', quantity: 2 });
  });

  test('parses ounces: "12 oz"', () => {
    expect(parseQuantity('12 oz')).toEqual({ unit: 'ounce', quantity: 12 });
  });

  test('parses fl oz: "8 fl"', () => {
    expect(parseQuantity('8 fl')).toEqual({ unit: 'ounce', quantity: 8 });
  });

  test('parses pounds: "2 lb"', () => {
    expect(parseQuantity('2 lb')).toEqual({ unit: 'pound', quantity: 2 });
  });

  test('parses pounds written as "pound": "1 pound"', () => {
    expect(parseQuantity('1 pound')).toEqual({ unit: 'pound', quantity: 1 });
  });

  test('returns count and null for unrecognized unit: "3 pieces"', () => {
    expect(parseQuantity('3 pieces')).toEqual({ unit: 'count', quantity: null });
  });

  // --- Multi-pack formats ---
  test('parses multi-pack and returns per-unit value: "6 x 330 ml"', () => {
    expect(parseQuantity('6 x 330 ml')).toEqual({ unit: 'milliliter', quantity: 330 });
  });

  test('parses multi-pack with grams: "4 x 250g"', () => {
    expect(parseQuantity('4 x 250g')).toEqual({ unit: 'gram', quantity: 250 });
  });

  test('parses multi-pack without spaces: "12x355ml"', () => {
    expect(parseQuantity('12x355ml')).toEqual({ unit: 'milliliter', quantity: 355 });
  });

  // --- Case insensitivity ---
  test('handles uppercase input: "500 G"', () => {
    expect(parseQuantity('500 G')).toEqual({ unit: 'gram', quantity: 500 });
  });

  test('handles mixed case input: "330 ML"', () => {
    expect(parseQuantity('330 ML')).toEqual({ unit: 'milliliter', quantity: 330 });
  });

  // --- Decimal values ---
  test('handles decimal quantities: "0.5 l"', () => {
    expect(parseQuantity('0.5 l')).toEqual({ unit: 'liter', quantity: 0.5 });
  });

  test('handles decimal grams: "1.5 kg"', () => {
    expect(parseQuantity('1.5 kg')).toEqual({ unit: 'gram', quantity: 1500 });
  });
});