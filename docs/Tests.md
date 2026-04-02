
---
### Environment Setup

If not provided, create a `.tests.env` file for testing.

Example:

```

DATABASE_URL=your_db_url
DIRECT_URL=your_direct_db_url
SUPABASE_URL=your_url
SUPABASE_ANON_KEY=your_key
SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=

#an existing and valid user credentials
TEST_USER_EMAIL=your_test_email
TEST_USER_PASSWORD=your_test_password
```

---

# Testing


---

## Test Types

### Unit Tests

Unit tests verify individual components in isolation.

**Examples:**

* `tests/unit/pantryService.test.js`
* `tests/unit/ingredientService.test.js`

These tests:

* mock Prisma and external dependencies
* test business logic inside services
* do not require a database or Supabase

---

### Integration Tests

Integration tests verify that multiple layers of the application work together.

**Examples:**

* `tests/pantry.test.js`
* `tests/ingredients.test.js`

These tests:

* send real HTTP requests using Supertest
* go through routes → controllers → services → database
* use a real test user via Supabase authentication
* Requiere a **Supabase** connection!

---

## Running Tests

### Run all tests

```bash
npm test
```

---

### Run a specific test file

```bash
npm test -- pantryService.test.js
npm test -- ingredientService.test.js
npm test -- pantry.test.js
npm test -- ingredients.test.js
npm test -- app.test.js 
```

---

## Test Environment

Tests run with:

```
NODE_ENV=test
```

and use a dedicated environment file:

```
.tests.env
```

---

## Notes for Developers

* Integration tests require:

  * a valid test user in the database (provided in the .tests.env file)
  * a working supabase connection (provided in the .tests.env file)

* Unit tests:

  * do not require external services
  * fully isolated



---

## Example Use Case Covered by Tests

The pantry integration tests cover the following flow:

1. Create an ingredient
2. Add ingredient to pantry
3. Retrieve pantry items
4. Update pantry item
5. Delete pantry item

---

