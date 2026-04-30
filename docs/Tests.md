# Testing

## Test Types

### Unit Tests

Unit tests verify individual components in isolation. They mock Prisma and all external dependencies, test business logic inside services directly, and do not require a database or Supabase connection.

Examples: `tests/unit/pantryService.test.js`, `tests/unit/ingredientService.test.js`

---

### Integration Tests

Integration tests verify that multiple layers of the application work together. They send real HTTP requests via Supertest through the full route → controller → service → database stack, and authenticate using a real test user via Supabase. **A Supabase connection is required.**

Examples: `tests/integration/pantry.test.js`, `tests/integration/ingredients.test.js`

---

## Test Environment

A dedicated test database has been provisioned for grading purposes. The test suite connects to it automatically via the `.tests.env` file. No additional database setup is required.

Tests run with `NODE_ENV=test`. If a `.tests.env` file has not been provided, create one with the following:

```env
DATABASE_URL=your_db_url
DIRECT_URL=your_direct_db_url
SUPABASE_URL=your_url
SUPABASE_ANON_KEY=your_key
SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
TEST_USER_EMAIL=your_test_email
TEST_USER_PASSWORD=your_test_password
```

---

## Running Tests

Run the full suite:
```bash
npm test
```

Run a specific file:
```bash
# Unit tests
npm test -- pantryService.test.js
npm test -- ingredientService.test.js
npm test -- productService.test.js
npm test -- recommendationService.test.js
npm test -- validate.test.js

# Integration tests
npm test -- pantry.test.js
npm test -- ingredients.test.js
npm test -- shopping-list.test.js
npm test -- product.test.js
npm test -- recommendation.test.js
npm test -- recipe.test.js
```