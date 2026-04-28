import {
  sanitizeUnit,
  normalizeIngredient,
  normalizeRecommendation,
} from '../../src/services/recommendationService.js';

// ── sanitizeUnit ──────────────────────────────────────────────────────────────

describe('sanitizeUnit', () => {
  test('returns count for null input', () => {
    expect(sanitizeUnit(null)).toBe('count');
  });

  test('returns count for undefined input', () => {
    expect(sanitizeUnit(undefined)).toBe('count');
  });

  test('returns count for empty string', () => {
    expect(sanitizeUnit('')).toBe('count');
  });

  test('resolves alias tsp to teaspoon', () => {
    expect(sanitizeUnit('tsp')).toBe('teaspoon');
  });

  test('resolves alias tsps to teaspoon', () => {
    expect(sanitizeUnit('tsps')).toBe('teaspoon');
  });

  test('resolves alias tbsp to tablespoon', () => {
    expect(sanitizeUnit('tbsp')).toBe('tablespoon');
  });

  test('resolves alias servings to count', () => {
    expect(sanitizeUnit('servings')).toBe('count');
  });

  test('resolves alias serving to count', () => {
    expect(sanitizeUnit('serving')).toBe('count');
  });

  test('resolves alias cups to cup', () => {
    expect(sanitizeUnit('cups')).toBe('cup');
  });

  test('is case-insensitive', () => {
    expect(sanitizeUnit('CUPS')).toBe('cup');
    expect(sanitizeUnit('Grams')).toBe('gram');
  });

  test('trims surrounding whitespace', () => {
    expect(sanitizeUnit('  cup  ')).toBe('cup');
  });

  test('accepts a valid unit as-is', () => {
    expect(sanitizeUnit('gram')).toBe('gram');
    expect(sanitizeUnit('liter')).toBe('liter');
  });

  test('returns count for unrecognized unit', () => {
    expect(sanitizeUnit('pinch')).toBe('count');
    expect(sanitizeUnit('bag')).toBe('count');
  });
});

// ── normalizeIngredient ───────────────────────────────────────────────────────

describe('normalizeIngredient', () => {
  test('normalizes a plain string ingredient', () => {
    expect(normalizeIngredient('salt')).toEqual({
      name: 'salt',
      amount: null,
      unit: 'count',
      display: 'salt',
    });
  });

  test('trims whitespace from a string ingredient', () => {
    const result = normalizeIngredient('  rice  ');
    expect(result.name).toBe('rice');
    expect(result.display).toBe('rice');
  });

  test('normalizes a full ingredient object', () => {
    const result = normalizeIngredient({ name: 'Flour', amount: 2, unit: 'cups', display: '2 cup flour' });
    expect(result.name).toBe('Flour');
    expect(result.amount).toBe(2);
    expect(result.unit).toBe('cup');
    expect(result.display).toBe('2 cup flour');
  });

  test('falls back to count for unknown unit', () => {
    const result = normalizeIngredient({ name: 'sugar', amount: 1, unit: 'bag' });
    expect(result.unit).toBe('count');
  });

  test('sets amount to null when missing', () => {
    const result = normalizeIngredient({ name: 'pepper' });
    expect(result.amount).toBeNull();
  });

  test('sets amount to null for empty string amount', () => {
    const result = normalizeIngredient({ name: 'pepper', amount: '' });
    expect(result.amount).toBeNull();
  });

  test('sets amount to null for non-finite values', () => {
    const result = normalizeIngredient({ name: 'oil', amount: NaN });
    expect(result.amount).toBeNull();
  });

  test('builds display from fields when display is not provided', () => {
    const result = normalizeIngredient({ name: 'milk', amount: 1, unit: 'cup' });
    expect(result.display).toBe('1 cup milk');
  });

  test('omits unit from display when unit is count', () => {
    const result = normalizeIngredient({ name: 'egg', amount: 2, unit: 'count' });
    expect(result.display).toBe('2 egg');
  });

  test('returns empty name when name is missing from object', () => {
    const result = normalizeIngredient({});
    expect(result.name).toBe('');
  });
});

// ── normalizeRecommendation ───────────────────────────────────────────────────

describe('normalizeRecommendation', () => {
  test('returns Untitled recipe when title is missing', () => {
    expect(normalizeRecommendation({})).toMatchObject({ title: 'Untitled recipe' });
  });

  test('trims whitespace from title', () => {
    const result = normalizeRecommendation({ title: '  Pasta  ' });
    expect(result.title).toBe('Pasta');
  });

  test('normalizes a valid recipe object', () => {
    const result = normalizeRecommendation({
      title: 'Omelette',
      yield_amount: 1,
      yield_unit: 'count',
      ingredients: [{ name: 'egg', amount: 2, unit: 'count', display: '2 egg' }],
      instructions: 'Beat eggs and cook.',
    });

    expect(result.title).toBe('Omelette');
    expect(result.yield_amount).toBe(1);
    expect(result.yield_unit).toBe('count');
    expect(result.ingredients).toHaveLength(1);
    expect(result.instructions).toBe('Beat eggs and cook.');
  });

  test('filters out ingredients with empty name', () => {
    const result =normalizeRecommendation({
      title: 'Test',
      ingredients: [{ name: '' }, { name: 'egg' }],
    });
    expect(result.ingredients).toHaveLength(1);
    expect(result.ingredients[0].name).toBe('egg');
  });

  test('returns empty ingredients array when none provided', () => {
    const result = normalizeRecommendation({ title: 'Test' });
    expect(result.ingredients).toEqual([]);
  });

  test('sets yield_unit to null when yield_amount is absent', () => {
    const result = normalizeRecommendation({ title: 'Test', yield_unit: 'cup' });
    expect(result.yield_unit).toBeNull();
  });

  test('sets yield_amount to null for non-finite value', () => {
    const result = normalizeRecommendation({ title: 'Test', yield_amount: 'lots' });
    expect(result.yield_amount).toBeNull();
  });

  test('sets instructions to null when missing', () => {
    const result = normalizeRecommendation({ title: 'Test' });
    expect(result.instructions).toBeNull();
  });

  test('trims whitespace from instructions', () => {
    const result = normalizeRecommendation({ title: 'Test', instructions: '  Cook it.  ' });
    expect(result.instructions).toBe('Cook it.');
  });
});