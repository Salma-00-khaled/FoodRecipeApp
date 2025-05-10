import React, { useState, useEffect } from 'react';
import { View, ScrollView, Image, Text, TouchableOpacity, ActivityIndicator, Linking, StyleSheet } from 'react-native';
import YouTube from 'react-native-youtube-iframe';
import { fetchRecipeDetails } from '../api/recipeService';
import Error from '../components/Error';


const RecipeScreen = ({ route, navigation }) => {
    const { recipeId } = route.params;
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
  
    const loadRecipe = async () => {
      try {
        setLoading(true);
        const data = await fetchRecipeDetails(recipeId);
        
        if (!data) {
          throw new Error('No recipe data received from server');
        }
        
        setRecipe(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        Alert.alert('Error', 'Failed to load recipe details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      loadRecipe();
    }, [recipeId]);
  
    const extractYoutubeId = (url) => {
      if (!url) return null;
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : null;
    };
  
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff8c00" />
          <Text>Loading recipe details...</Text>
        </View>
      );
    }
  
    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={loadRecipe}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
  
    if (!recipe) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Recipe not found</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      );
    }
  
    const youtubeId = extractYoutubeId(recipe.strYoutube);
  
    return (
      <ScrollView style={styles.container}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        
        <Image 
          source={{ uri: recipe.strMealThumb }} 
          style={styles.recipeImage} 
        />
        
        <View style={styles.content}>
          <Text style={styles.title}>{recipe.strMeal}</Text>
          <Text style={styles.area}>{recipe.strArea} • {recipe.strCategory}</Text>
          
          <Text style={styles.sectionTitle}>Ingredients</Text>
          {Array.from({ length: 20 }).map((_, i) => {
            const ingredient = recipe[`strIngredient${i + 1}`];
            const measure = recipe[`strMeasure${i + 1}`];
            return ingredient && ingredient.trim() ? (
              <Text key={i} style={styles.ingredient}>
                • {measure} {ingredient}
              </Text>
            ) : null;
          })}
          
          <Text style={styles.sectionTitle}>Instructions</Text>
          <Text style={styles.instruction}>
            {recipe.strInstructions}
          </Text>
          
          {youtubeId && (
            <>
              <Text style={styles.sectionTitle}>Video Tutorial</Text>
              <YouTube
                videoId={youtubeId}
                height={220}
                play={false}
              />
              <TouchableOpacity
                style={styles.youtubeLink}
                onPress={() => Linking.openURL(recipe.strYoutube)}
              >
                <Text style={styles.youtubeLinkText}>Watch on YouTube</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    );
  };
const styles = StyleSheet.create({  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
    backgroundColor: 'rgba(255,255,255,0.7)',
    padding: 8,
    borderRadius: 20,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff8c00',
  },
  recipeImage: {
    width: '100%',
    height: 250,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  area: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#ff8c00',
  },
  ingredient: {
    fontSize: 16,
    marginBottom: 4,
    color: '#333',
  },
  instruction: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  youtubeLink: {
    marginTop: 8,
    padding: 10,
    backgroundColor: '#ff0000',
    borderRadius: 8,
    alignItems: 'center',
  },
  youtubeLinkText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#ff8c00',
    padding: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

});


export default RecipeScreen;