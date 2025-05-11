import React, { useState, useEffect } from 'react';
import { 
  View, 
  FlatList, 
  TouchableOpacity, 
  ImageBackground, 
  Text, 
  ActivityIndicator, 
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Animated
} from 'react-native';
import { fetchRecipesByCategory, searchRecipes } from '../api/recipeService';
import Error from '../components/Error';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const HEADER_HEIGHT = 60;
const IMAGE_HEIGHT = 200;
const HEADER_MAX_HEIGHT = IMAGE_HEIGHT + HEADER_HEIGHT;

const CategoryScreen = ({ route, navigation }) => {
  const { categoryName, searchQuery, categoryThumb } = route.params;
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollY = new Animated.Value(0);

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

  const headerHeight = scrollY.interpolate({
    inputRange: [0, IMAGE_HEIGHT],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_HEIGHT],
    extrapolate: 'clamp'
  });

  const imageOpacity = scrollY.interpolate({
    inputRange: [0, IMAGE_HEIGHT/2, IMAGE_HEIGHT],
    outputRange: [1, 1, 0],
    extrapolate: 'clamp'
  });

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
      {/* Fixed Header */}
      <Animated.View style={[styles.headerContainer, { height: headerHeight }]}>
        {categoryThumb && (
          <Animated.Image
            source={{ uri: categoryThumb }}
            style={[
              styles.headerImage,
              { opacity: imageOpacity }
            ]}
            resizeMode="cover"
          />
        )}
        <LinearGradient
          colors={['rgba(255, 140, 0, 0.36)', 'rgba(227, 189, 142, 0.5)', 'transparent']}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.headerContent}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              
              <Text style={styles.headerTitle} numberOfLines={1}>
                {searchQuery ? `Search: ${searchQuery}` : categoryName}
              </Text>
              
              <View style={styles.rightIconPlaceholder} />
            </View>
          </SafeAreaView>
        </LinearGradient>
      </Animated.View>

      {/* Recipe List */}
      <Animated.FlatList
        data={recipes}
        keyExtractor={(item) => item.idMeal}
        numColumns={2}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.recipeCard}
            onPress={() => handleRecipePress(item)}
          >
            <ImageBackground
              source={{ uri: item.strMealThumb }}
              style={styles.recipeImage}
              resizeMode="cover"
            >
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={styles.recipeGradient}
              >
                <Text style={styles.recipeTitle}>{item.strMeal}</Text>
              </LinearGradient>
            </ImageBackground>
          </TouchableOpacity>
        )}
        contentContainerStyle={[
          styles.listContainer,
          { paddingTop: HEADER_MAX_HEIGHT + 16 }
        ]}
        ListHeaderComponent={
          <Text style={styles.resultsCount}>
            {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'} found
          </Text>
        }
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffaf5',
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    overflow: 'hidden',
  },
  headerImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: IMAGE_HEIGHT,
    width: '100%',
  },
  headerGradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  safeArea: {
    width: '100%',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: '100%',
  },
  backButton: {
    padding: 8,
    backgroundColor:'rgba(222, 140, 8, 0.73)' ,
    borderRadius:24
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    flex: 1,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  rightIconPlaceholder: {
    width: 40,
  },
  recipeCard: {
    flex: 1,
    margin: 8,
    borderRadius: 12,
    overflow: 'hidden',
    height: 160,
    elevation: 3,
  },
  recipeImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  recipeGradient: {
    padding: 12,
  },
  recipeTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  listContainer: {
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fffaf5',
  },
  resultsCount: {
    textAlign: 'center',
    marginVertical: 16,
    color: '#666',
    fontSize: 16,
  },
});

export default CategoryScreen;