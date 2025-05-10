import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, Image, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { fetchRecipesByCategory, searchRecipes } from '../api/recipeService';
import Error from '../components/Error';

const CategoryScreen = ({ route, navigation }) => {
  const { categoryName, searchQuery, categoryThumb } = route.params;
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecipesData = async () => {
      try {
        setLoading(true);
        const data = searchQuery 
          ? await searchRecipes(searchQuery)
          : await fetchRecipesByCategory(categoryName);
        setRecipes(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipesData();
  }, [categoryName, searchQuery]);

  const handleRecipePress = (recipe) => {
    navigation.navigate('Recipe', { recipeId: recipe.idMeal });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff8c00" />
      </View>
    );
  }

  if (error) {
    return <Error message={error} />;
  }

  return (
    <View style={styles.container}>
      {categoryThumb && (
        <Image 
          source={{ uri: categoryThumb }} 
          style={styles.categoryImage}
        />
      )}
      <Text style={styles.categoryTitle}>{categoryName}</Text>
      
      <FlatList
        data={recipes}
        keyExtractor={(item) => item.idMeal}
        numColumns={2}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.recipeCard}
            onPress={() => handleRecipePress(item)}
          >
            <Image 
              source={{ uri: item.strMealThumb }} 
              style={styles.recipeImage} 
            />
            <Text style={styles.recipeTitle}>{item.strMeal}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};
const styles = StyleSheet.create({ 
 container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  categoryTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    padding: 16,
    color: '#333',
    textAlign: 'center',
  },
  recipeCard: {
    flex: 1,
    margin: 8,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f9f9f9',
    elevation: 2,
  },
  recipeImage: {
    width: '100%',
    height: 120,
  },
  recipeTitle: {
    padding: 8,
    textAlign: 'center',
    color: '#333',
  },
  listContainer: {
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
});

export default CategoryScreen;