import Constants from 'expo-constants';

const host = Constants.expoConfig?.hostUri?.split(':')[0] ?? '10.0.2.2';
console.log(host);
export const API_URL =
  process.env.EXPO_PUBLIC_APP_ENV === 'production'
    ? 'https://whisk-lznv.onrender.com'
    : `http://${host}:3001`;

const handleResponse = async (res) => {
  if (res.ok) return res.status === 204 ? null : res.json();
  const text = await res.text();
  try {
    const json = JSON.parse(text);
    throw new Error(json.message || text || 'API request failed');
  } catch {
    throw new Error(text || 'API request failed');
  }
};

const buildHeaders = (token, contentType = true) => {
  const headers = {};
  if (contentType) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

const fetchJson = async (path, { method = 'GET', token, body } = {}) => {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: buildHeaders(token, !!body),
    body: body ? JSON.stringify(body) : undefined,
  });
  return handleResponse(res);
};

export const getRecipes = (token) => fetchJson('/recipe', { token });
export const createRecipe = (token, payload) => fetchJson('/recipe', { method: 'POST', token, body: payload });
export const getUserRecipes = (token, query = '') =>
  fetchJson(`/recipe/user${query ? `?search=${encodeURIComponent(query)}` : ''}`, { token });
export const getRecipe = (token, id) => fetchJson(`/recipe/${id}`, { token });
export const makeRecipe = (token, recipeId) => fetchJson(`/recipe/${recipeId}/make`, { method: 'POST', token });
export const addRecipeToUser = (token, recipeId) => fetchJson(`/recipe/${recipeId}/users`, { method: 'POST', token });
export const removeRecipeFromUser = (token, recipeId) => fetchJson(`/recipe/${recipeId}/users`, { method: 'DELETE', token });
export const createUserRecord = (token) => fetchJson('/users/register', { method: 'POST', token });

export const getPantryItems = (token, query = '') =>
  fetchJson(`/pantry${query ? `?search=${encodeURIComponent(query)}` : ''}`, { token });

export const deletePantryItem = (token, id) => fetchJson(`/pantry/${id}`, { method: 'DELETE', token });

export const updatePantryItem = (token, id, payload) =>
  fetchJson(`/pantry/${id}`, { method: 'PATCH', token, body: payload });

export const addPantryItem = (token, payload) => fetchJson('/pantry', { method: 'POST', token, body: payload });

export const getShoppingList = (token) => fetchJson('/shopping-list', { token });
export const addShoppingListItem = (token, payload) => fetchJson('/shopping-list', { method: 'POST', token, body: payload });
export const deleteShoppingListItem = (token, id) => fetchJson(`/shopping-list/${id}`, { method: 'DELETE', token });

export const searchIngredients = (token, query = '') =>
  fetchJson(`/ingredient${query ? `?search=${encodeURIComponent(query)}` : ''}`, { token });

export const createIngredient = (token, name) => fetchJson('/ingredient', { method: 'POST', token, body: { name: name.trim() } });

export const lookupBarcode = (token, barcode) => fetchJson(`/product/${barcode}`, { token });

export const getIngredients = (token) => fetchJson('/ingredient', { token });
export const deleteIngredient = (token, id) => fetchJson(`/ingredient/${id}`, { method: 'DELETE', token });
export const updateIngredient = (token, id, name) => fetchJson(`/ingredient/${id}`, { method: 'PATCH', token, body: { name: name.trim() } });

export const searchEdamamRecipes = (token, query, from = 0) =>
  fetchJson(`/recipe/edamam?q=${encodeURIComponent(query)}&from=${from}`, { token });

export const importEdamamRecipe = (token, payload) =>
  fetchJson('/recipe/edamam/import', { method: 'POST', token, body: payload });
