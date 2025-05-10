import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, Text, ActivityIndicator, Alert, StyleSheet, SafeAreaView } from 'react-native';
import SearchBar from '../components/SearchBar';
import CategoryItem from '../components/CategoryItem';
import { fetchCategories } from '../api/recipeService';
//import * as Animatable from 'react-native-animatable';


const HomeScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchCategories();
      setCategories(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    loadData();
  };

  if (loading && categories.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff8c00" />
        <Text>Loading recipes...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={handleRefresh}>
          <Text style={styles.retryText}>Tap to retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* <SearchBar 
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={() => navigation.navigate('Category', { 
          categoryName: 'Search Results',
          searchQuery 
        })}
        placeholder="Search recipes..."
      /> */}
      
      <Text style={styles.sectionTitle}>Categories</Text>
      <Text style={styles.summaryText}>
      Browse our collection of recipe categories. Tap any category to explore delicious recipes.
    </Text>


      
      <FlatList
        data={categories}
        keyExtractor={(item) => item.idCategory}
        numColumns={2}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => 
            navigation.navigate('Category', { 
              categoryName: item.strCategory,
              categoryThumb: item.strCategoryThumb
            })
          }>
            <CategoryItem 
              category={{
                name: item.strCategory,
                image: item.strCategoryThumb
              }} 
            />
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContainer}
        refreshing={loading}
        onRefresh={handleRefresh}
      />
    </SafeAreaView>
  );
};

// const styles = StyleSheet.create({ 
//   container: {
//     flex: 1,
//     padding: 16,
//     backgroundColor: '#fff',
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginVertical: 16,
//     color: '#333',
//     textAlign: 'left', // This ensures the text is aligned to the left
//     alignSelf: 'flex-start', // This ensures the text container stays left
//     width: '100%', // Takes full width
//     paddingLeft: 8, // Optional: Add some padding if needed
//   },
//   summaryText: {
//     fontSize: 15,
//     color: '#444',
//     paddingLeft: 14,
//     marginBottom: 24,
//     borderLeftWidth: 4,
//     borderLeftColor: '#ffa500',
//     lineHeight: 22,
//     backgroundColor: '#fff8f0',
//     paddingVertical: 10,
//     paddingRight: 10,
//     borderRadius: 8,
//     fontStyle: 'italic',
//     fontWeight: '500',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//     elevation: 2,
//   }
  
// ,  
//   listContainer: {
//     paddingBottom: 20,
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   errorText: {
//     color: 'red',
//     marginBottom: 10,
//   },
//   retryText: {
//     color: '#ff8c00',
//     fontWeight: 'bold',
//   },
// });
const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: '#fffaf5',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#fffaf5',
    },
    sectionTitle: {
      fontSize: 26,
      fontWeight: 'bold',
      color: '#ff7043',
      margin: 15,
      textAlign: 'center',
      letterSpacing: 1,
    },
    summaryText: {
      fontSize: 15,
      color: '#5a5a5a',
      backgroundColor: '#ffe0b2',
      padding: 12,
      borderRadius: 10,
      lineHeight: 22,
      marginBottom: 20,
      textAlign: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    listContainer: {
      paddingBottom: 20,
      gap: 12,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      backgroundColor: '#fffaf5',
    },
    errorText: {
      color: 'red',
      fontSize: 16,
      marginBottom: 10,
      fontWeight: '500',
    },
    retryText: {
      color: '#ff7043',
      fontWeight: 'bold',
      fontSize: 16,
    },
  });
  
export default HomeScreen;