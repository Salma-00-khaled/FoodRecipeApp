import React, { useState, useEffect } from 'react';
import {
  View,
  SafeAreaView,
  TouchableOpacity,
  ImageBackground,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';

const { width } = Dimensions.get('window');
const CARD_MARGIN = 12;
const CARD_WIDTH = (width - CARD_MARGIN * 3) / 2;

const LikedRecipesScreen = ({ navigation }) => {
  const [likedRecipes, setLikedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = new Animated.Value(0);

  const loadLikedRecipes = async () => {
    try {
      const recipes = await AsyncStorage.getItem('likedRecipes');
      setLikedRecipes(recipes ? JSON.parse(recipes) : []);
    } catch (error) {
      console.error('Error loading liked recipes:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadLikedRecipes);
    return unsubscribe;
  }, [navigation]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadLikedRecipes();
  };

  const removeFromLiked = async (recipeId) => {
    try {
      const updatedRecipes = likedRecipes.filter((r) => r.idMeal !== recipeId);
      await AsyncStorage.setItem('likedRecipes', JSON.stringify(updatedRecipes));
      setLikedRecipes(updatedRecipes);
    } catch (error) {
      console.error('Error removing liked recipe:', error);
    }
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff8c00" />
        <Text style={styles.loadingText}>Loading your favorites...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <Text style={styles.title}>Your Favorites</Text>
        <Text style={styles.subtitle}>
          {likedRecipes.length} {likedRecipes.length === 1 ? 'recipe' : 'recipes'} saved
        </Text>
      </Animated.View>

      {likedRecipes.length === 0 ? (
      <View style={styles.emptyContainer}>
      <LottieView
        source={require('../assets/animation/Animation - 1746923254211.json')}
        autoPlay
        loop
        style={styles.lottie}
      />
      <Text style={styles.emptyTitle}>No favorites yet</Text>
      <Text style={styles.emptyText}>
        Tap the heart icon on recipes to save them here
      </Text>
    </View>
    
      ) : (
        <Animated.FlatList
          data={likedRecipes}
          keyExtractor={(item) => item.idMeal}
          numColumns={2}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <TouchableOpacity
                style={styles.recipeCard}
                onPress={() => navigation.navigate('Recipe', { recipeId: item.idMeal })}
                activeOpacity={0.85}
              >
                <ImageBackground
                  source={{ uri: item.strMealThumb }}
                  style={styles.recipeImage}
                  resizeMode="cover"
                >
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.6)']}
                    style={styles.gradientOverlay}
                  >
                    <Text style={styles.recipeTitle} numberOfLines={2}>
                      {item.strMeal}
                    </Text>
                  </LinearGradient>
                </ImageBackground>
                <TouchableOpacity
                  style={styles.likeButton}
                  onPress={() => removeFromLiked(item.idMeal)}
                  activeOpacity={0.6}
                >
                  <Ionicons name="heart" size={20} color="red" />
                </TouchableOpacity>
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={styles.listContainer}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffaf5',
  },
  header: {
    paddingTop: 25,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fffaf5',
    borderBottomWidth: 1,
    borderBottomColor: '#ffe0b2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ff8c00',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  cardWrapper: {
    width: '50%',
    alignItems: 'center',
    marginBottom: 16,
  },
  recipeCard: {
    width: CARD_WIDTH,
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    position: 'relative',
  },
  recipeImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  gradientOverlay: {
    padding: 10,
  },
  recipeTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  likeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.85)',
    padding: 6,
    borderRadius: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ff8c00',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fffaf5',
  },
  loadingText: {
    marginTop: 16,
    color: '#ff8c00',
    fontSize: 16,
  },
  listContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  lottie: {
    width: 220,
    height: 220,
    marginBottom: 20,
  },
  
});

export default LikedRecipesScreen;
