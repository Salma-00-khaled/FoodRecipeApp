// src/api/recipeService.js
const API_KEY = '1';
const BASE_URL = 'https://www.themealdb.com/api/json/v1';

const fetchWithTimeout = async (resource, options = {}) => {
  const { timeout = 5000 } = options;
  
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  const response = await fetch(resource, {
    ...options,
    signal: controller.signal  
  });
  clearTimeout(id);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response;
};

export const fetchCategories = async () => {
  try {
    const response = await fetchWithTimeout(
      `${BASE_URL}/${API_KEY}/categories.php`,
      { timeout: 3000 }
    );
    const data = await response.json();
    return data.categories || [];
  } catch (error) {
    console.error('fetchCategories error:', error);
    throw new Error('Failed to load categories. Please check your connection.');
  }
};

export const fetchRecipesByCategory = async (category) => {
  try {
    const response = await fetchWithTimeout(
      `${BASE_URL}/${API_KEY}/filter.php?c=${encodeURIComponent(category)}`
    );
    const data = await response.json();
    return data.meals || [];
  } catch (error) {
    console.error('fetchRecipesByCategory error:', error);
    throw new Error(`Failed to load ${category} recipes.`);
  }
};
export const fetchRecipeDetails = async (id) => {
    console.log(`Fetching recipe details for ID: ${id}`);
    try {
      const response = await fetch(
        `https://www.themealdb.com/api/json/v1/${API_KEY}/lookup.php?i=${id}`
      );
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('API response data:', data);
      
      if (!data.meals || data.meals.length === 0) {
        throw new Error('Recipe not found');
      }
      
      return data.meals[0];
    } catch (error) {
      console.error('Error in fetchRecipeDetails:', error);
      throw error;
    }
  };