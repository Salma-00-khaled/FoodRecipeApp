import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert,
  StyleSheet,
  SafeAreaView,
Platform
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';
import CategoryItem from '../components/CategoryItem';
import { fetchCategories } from '../api/recipeService';
import NotificationSystem from '../components/NotificationSystem';

const HomeScreen = ({ navigation }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Initialize notification system
  const { NotificationIcon, NotificationModal, sendNotification } = NotificationSystem({ navigation });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchCategories();
      setCategories(data);
      setError(null);

      await sendNotification(
        "Welcome to RecipeMaster! 👨‍🍳",
        "Discover delicious recipes waiting for you!",
        { screen: 'Featured' }
      );

    } catch (err) {
      setError(err.message);
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryPress = (category) => {
    sendNotification(
      `New ${category.strCategory} Recipes`,
      `Check out our latest ${category.strCategory} creations!`,
      {
        screen: 'Category',
        categoryName: category.strCategory,
      }
    );

    navigation.navigate('Category', {
      categoryName: category.strCategory,
      categoryThumb: category.strCategoryThumb
    });
  };

  if (loading && categories.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF8C00" />
        <Text style={styles.loadingText}>Loading delicious recipes...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="sad-outline" size={50} color="#FF8C00" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          onPress={loadData}
          style={styles.retryButton}
        >
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recipe Categories</Text>
        <NotificationIcon />
      </View>

      <NotificationModal />

      <Animatable.View animation="fadeInUp" style={styles.subheader}>
        <Text style={styles.subheaderText}>
          Browse our collection of {categories.length} delicious categories
        </Text>
      </Animatable.View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.idCategory}
        numColumns={2}
        renderItem={({ item }) => (
          <Animatable.View 
            animation="fadeInUp"
            duration={800}
            delay={100 * (categories.indexOf(item) % 2)}
          >
            <TouchableOpacity 
              onPress={() => handleCategoryPress(item)}
              activeOpacity={0.8}
            >
              <CategoryItem 
                category={{
                  name: item.strCategory,
                  image: item.strCategoryThumb
                }} 
              />
            </TouchableOpacity>
          </Animatable.View>
        )}
        contentContainerStyle={styles.listContainer}
        refreshing={loading}
        onRefresh={loadData}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9F2',
    paddingHorizontal: 16,
    paddingVertical:16
  },
  header: {
    marginTop: 20,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF7043',
  },
  subheader: {
    backgroundColor: '#FFE0B2',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  subheaderText: {
    color: '#5A5A5A',
    textAlign: 'center',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF9F2',
  },
  loadingText: {
    marginTop: 15,
    color: '#FF8C00',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF9F2',
  },
  errorText: {
    marginTop: 20,
    color: '#FF4757',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 25,
  },
  retryButton: {
    backgroundColor: '#FF8C00',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listContainer: {
    paddingBottom: 30,
  },
});

export default HomeScreen;