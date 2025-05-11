import React, { useState, useEffect } from 'react';
import { 
  View, 
  ScrollView, 
  ImageBackground, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator, 
  Linking, 
  StyleSheet,
  Alert,
  Animated
} from 'react-native';
import YouTube from 'react-native-youtube-iframe';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchRecipeDetails } from '../api/recipeService';
import { LinearGradient } from 'expo-linear-gradient';

const RecipeScreen = ({ route, navigation }) => {
  const { recipeId } = route.params;
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const scrollY = new Animated.Value(0);

  // Animation values
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [200, 60],
    extrapolate: 'clamp'
  });

  const imageOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: 'clamp'
  });

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        // Check if recipe is liked
        const likedRecipes = await AsyncStorage.getItem('likedRecipes');
        if (isMounted && likedRecipes) {
          const parsedRecipes = JSON.parse(likedRecipes);
          setIsLiked(parsedRecipes.some(r => r.idMeal === recipeId));
        }

        // Fetch recipe details
        const data = await fetchRecipeDetails(recipeId);
        if (isMounted) {
          if (!data) throw new Error('No recipe data received');
          setRecipe(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          Alert.alert('Error', 'Failed to load recipe details. Please try again.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [recipeId]);

  const toggleLike = async () => {
    try {
      let likedRecipes = await AsyncStorage.getItem('likedRecipes');
      likedRecipes = likedRecipes ? JSON.parse(likedRecipes) : [];

      if (isLiked) {
        likedRecipes = likedRecipes.filter(r => r.idMeal !== recipe.idMeal);
      } else {
        likedRecipes.push(recipe);
      }

      await AsyncStorage.setItem('likedRecipes', JSON.stringify(likedRecipes));
      setIsLiked(!isLiked);
    } catch (error) {
      Alert.alert('Error', 'Failed to update favorites. Please try again.');
    }
  };

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
        <Text style={styles.loadingText}>Loading recipe details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            setLoading(true);
            setError(null);
            setTimeout(() => loadData(), 500);
          }}
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
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const youtubeId = extractYoutubeId(recipe.strYoutube);

  return (
    <View style={styles.container}>
      {/* Fixed Header with Image */}
      <Animated.View style={[styles.headerContainer, { height: headerHeight }]}>
        <Animated.Image
          source={{ uri: recipe.strMealThumb }}
          style={[styles.headerImage, { opacity: imageOpacity }]}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['rgba(255,140,0,0.9)', 'rgba(255,140,0,0.5)', 'transparent']}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            
            <Text style={styles.headerTitle} numberOfLines={1}>
              {recipe.strMeal}
            </Text>
            
            <TouchableOpacity 
              style={styles.likeButton}
              onPress={toggleLike}
            >
              <Ionicons 
                name={isLiked ? "heart" : "heart-outline"} 
                size={24} 
                color={isLiked ? "red" : "white"} 
              />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Scrollable Content */}
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingTop: 200 }]}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
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
      </Animated.ScrollView>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f1e3', // Organic cream background
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f1e3',
  },
  loadingText: {
    marginTop: 16,
    color: '##ff8c00', // Calm green
    fontSize: 16,
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    overflow: 'hidden',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    width: '100%',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 10,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    flex: 1,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  likeButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  area: {
    fontSize: 16,
    color: '#rgba(100, 51, 3, 0.86)',
    marginBottom: 10,
    fontSize:24,
    alignItems:'center',
    justifyContent:'center'
    
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
    color: '#rgba(204, 104, 4, 0.87)',
    borderBottomWidth: 1,
    borderColor: '#rgba(100, 51, 3, 0.86)',
    paddingBottom: 4,
  },
  ingredient: {
    fontSize: 15,
    color: '#4d4d4d',
    marginBottom: 4,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: '#rgba(184, 134, 84, 0.86)',
  },
  instruction: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  youtubeLink: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#rgba(139, 5, 5, 0.9)',
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
    backgroundColor: '#f7f1e3',
  },
  errorText: {
    color: '#d62828',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#5c715e',
    padding: 10,
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default RecipeScreen;