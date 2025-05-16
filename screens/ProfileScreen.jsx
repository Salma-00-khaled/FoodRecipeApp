import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ReusablePopup from '../components/ReusablePopup';
import NotificationSystem from '../components/NotificationSystem';

const { width } = Dimensions.get('window');

function ProfileScreen({ navigation }) {
  const [recipes, setRecipes] = useState([]);
  const [scrollY] = useState(new Animated.Value(0));
  const [showPopup, setShowPopup] = useState(false);
  const [popupConfig, setPopupConfig] = useState({});
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // Initialize notification system
  const { NotificationIcon, NotificationModal, sendNotification } = NotificationSystem({ navigation });

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadRecipes);
    return unsubscribe;
  }, [navigation]);

  const loadRecipes = async () => {
    try {
      const stored = await AsyncStorage.getItem('myRecipes');
      const data = stored ? JSON.parse(stored) : [];
      setRecipes(data);
    } catch (error) {
      showAlertPopup(
        'Error',
        'Failed to load recipes. Please try again.',
        'error'
      );
    }
  };

  const showAlertPopup = (title, message, type, primaryAction, secondaryAction = null) => {
    setPopupConfig({
      title,
      message,
      type,
      primaryButtonText: 'OK',
      onPrimaryButtonPress: () => {
        setShowPopup(false);
        if (primaryAction) primaryAction();
      },
      secondaryButtonText: secondaryAction ? 'Cancel' : null,
      onSecondaryButtonPress: () => {
        setShowPopup(false);
        if (secondaryAction) secondaryAction();
      }
    });
    setShowPopup(true);
  };

  const animateNavigation = (recipe) => {
    setSelectedRecipe(recipe);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      navigation.navigate('SharedRecipe', { recipe });
      fadeAnim.setValue(0);
    });
  };

  const deleteRecipe = async (id) => {
    showAlertPopup(
      "Confirm Delete", 
      "Are you sure you want to delete this recipe?",
      "warning",
      async () => {
        try {
          const updated = recipes.filter(r => r.id !== id);
          await AsyncStorage.setItem('myRecipes', JSON.stringify(updated));
          setRecipes(updated);
        } catch (error) {
          showAlertPopup(
            'Error',
            'Failed to delete recipe. Please try again.',
            'error'
          );
        }
      },
      () => {} // Cancel action
    );
  };

  const groupByCategory = () => {
    const grouped = {};
    for (const recipe of recipes) {
      if (!grouped[recipe.category]) grouped[recipe.category] = [];
      grouped[recipe.category].push(recipe);
    }
    return grouped;
  };

  const groupedData = groupByCategory();

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [180, 80],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.header, { height: headerHeight }]}> 
        <LinearGradient colors={['#ff8c00', '#ffd8b8']} style={styles.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Animated.Text style={[styles.headerTitle, { opacity: headerOpacity }]}>Your Culinary Creations</Animated.Text>
          <Animated.View style={[styles.headerSubtitle, { opacity: headerOpacity }]}>
            <Text style={styles.headerSubtitleText}>{recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'} shared</Text>
          </Animated.View>
          <View style={{left:160  , bottom:55}}>
          <NotificationIcon />
          </View>
        </LinearGradient>
      </Animated.View>

      <NotificationModal />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <View style={styles.contentContainer}>
          {Object.keys(groupedData).length > 0 ? (
            Object.keys(groupedData).map((cat) => (
              <View key={cat} style={styles.categorySection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionHeaderText}>{cat}</Text>
                  <View style={styles.sectionHeaderLine} />
                </View>
                {groupedData[cat].map((item) => (
                  <TouchableOpacity 
                    key={item.id} 
                    onPress={() => animateNavigation(item)}
                    activeOpacity={0.9}
                  >
                    <Animated.View 
                      style={[
                        styles.recipeCard,
                        {
                          transform: [
                            {
                              scale: selectedRecipe?.id === item.id ? 
                                fadeAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [1, 0.95]
                                }) : 1
                            }
                          ],
                          opacity: selectedRecipe?.id === item.id ? 
                            fadeAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [1, 0.8]
                            }) : 1
                        }
                      ]}
                    >
                      {item.image ? (
                        <Image 
                          source={{ uri: item.image }} 
                          style={styles.recipeImage} 
                          resizeMode="cover"
                        />
                      ) : (
                        <LinearGradient
                          colors={['#ffd8b8', '#ff8c00']}
                          style={styles.recipeImagePlaceholder}
                        >
                          <Ionicons name="restaurant-outline" size={40} color="#fff" />
                        </LinearGradient>
                      )}
                      <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.7)']}
                        style={styles.imageOverlay}
                      >
                        <Text style={styles.recipeTitle}>{item.title}</Text>
                      </LinearGradient>
                      <View style={styles.recipeContent}>
                        <Text style={styles.recipeDescription} numberOfLines={2}>{item.description}</Text>
                        <View style={styles.actions}>
                          <TouchableOpacity 
                            style={styles.actionButton} 
                            onPress={(e) => { 
                              e.stopPropagation(); 
                              navigation.navigate('EditRecipe', { recipe: item }); 
                            }}
                          >
                            <Ionicons name="create-outline" size={20} color="#ff8c00" />
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={styles.actionButton} 
                            onPress={(e) => { 
                              e.stopPropagation(); 
                              deleteRecipe(item.id); 
                            }}
                          >
                            <Ionicons name="trash-outline" size={20} color="#ff5252" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </Animated.View>
                  </TouchableOpacity>
                ))}
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIllustration}>
                <Ionicons name="restaurant-outline" size={80} color="#ffd8b8" />
              </View>
              <Text style={styles.emptyText}>Your recipe book is empty</Text>
              <Text style={styles.emptySubtext}>Start sharing your culinary masterpieces</Text>
              <TouchableOpacity 
                style={styles.emptyButton} 
                onPress={() => navigation.navigate('AddRecipe')}
              >
                <LinearGradient 
                  colors={['#ffd8b8', '#ff8c00']} 
                  style={styles.gradientButton} 
                  start={{ x: 0, y: 0 }} 
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="add" size={20} color="#fff" />
                  <Text style={styles.emptyButtonText}>Create First Recipe</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity 
        style={styles.floatingButton} 
        onPress={() => navigation.navigate('AddRecipe')}
      >
        <LinearGradient 
          colors={['#ffd8b8', '#ff8c00']} 
          style={styles.gradientButton} 
          start={{ x: 0, y: 0 }} 
          end={{ x: 1, y: 0 }}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>

      <ReusablePopup
        visible={showPopup}
        onClose={() => setShowPopup(false)}
        {...popupConfig}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fffaf5' 
  },
  header: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    zIndex: 10 
  },
  gradient: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingTop: 40 
  },
  headerTitle: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    color: '#fff', 
    marginBottom: 8 
  },
  headerSubtitle: { 
    backgroundColor: 'rgba(255,255,255,0.15)', 
    paddingHorizontal: 16, 
    paddingVertical: 6, 
    borderRadius: 20 
  },
  headerSubtitleText: { 
    color: '#fff', 
    fontWeight: '600', 
    fontSize: 14 
  },
  scrollContent: { 
    paddingTop: 180, 
    paddingBottom: 30 
  },
  contentContainer: { 
    paddingBottom: 20 
  },
  categorySection: { 
    marginBottom: 25, 
    paddingHorizontal: 15 
  },
  sectionHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 15 
  },
  sectionHeaderText: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#ff8c00', 
    marginRight: 10 
  },
  sectionHeaderLine: { 
    flex: 1, 
    height: 1, 
    backgroundColor: '#ffd8b8' 
  },
  recipeCard: { 
    backgroundColor: '#fff', 
    borderRadius: 15, 
    marginBottom: 15, 
    overflow: 'hidden', 
    borderWidth: 1, 
    borderColor: '#ffe5cc', 
    elevation: 4,
    shadowColor: '#ff8c00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  recipeImage: { 
    width: '100%', 
    height: 180 
  },
  recipeImagePlaceholder: {
    width: '100%',
    height: 180,
    justifyContent: 'center',
    alignItems: 'center'
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingTop: 40
  },
  recipeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3
  },
  recipeContent: { 
    padding: 16 
  },
  recipeDescription: { 
    fontSize: 14, 
    color: '#666', 
    marginBottom: 12, 
    lineHeight: 20 
  },
  actions: { 
    flexDirection: 'row', 
    justifyContent: 'flex-end' 
  },
  actionButton: { 
    marginLeft: 15 
  },
  emptyState: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 40, 
    marginTop: 50 
  },
  emptyIllustration: { 
    width: 150, 
    height: 150, 
    borderRadius: 75, 
    backgroundColor: 'rgba(255, 216, 184, 0.3)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  emptyText: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#333', 
    marginBottom: 8, 
    textAlign: 'center' 
  },
  emptySubtext: { 
    fontSize: 16, 
    color: '#888', 
    marginBottom: 25, 
    textAlign: 'center' 
  },
  emptyButton: { 
    width: '80%', 
    borderRadius: 25, 
    overflow: 'hidden' 
  },
  gradientButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 14, 
    paddingHorizontal: 20, 
    borderRadius: 30 
  },
  emptyButtonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16, 
    marginLeft: 8 
  },
  floatingButton: { 
    position: 'absolute', 
    bottom: 30, 
    right: 30, 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    shadowColor: '#ff8c00', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 8, 
    elevation: 8, 
    zIndex: 20 
  },
});

export default ProfileScreen;