import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

export default function SharedRecipeScreen({ route, navigation }) {
  const { recipe } = route.params;

  return (
    <View style={styles.container}>
      {/* Header with back button */}
      <LinearGradient 
        colors={['#ff8c00', '#ffd8b8']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{recipe.title}</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        {recipe.image ? (
          <Image 
            source={{ uri: recipe.image }} 
            style={styles.image} 
            resizeMode="cover"
          />
        ) : (
          <LinearGradient
            colors={['#ffd8b8', '#ff8c00']}
            style={styles.imagePlaceholder}
          >
            <Icon name="restaurant-outline" size={50} color="#fff" />
          </LinearGradient>
        )}

        <View style={styles.card}>
          <Text style={styles.desc}>{recipe.description}</Text>
          
          <View style={styles.section}>
            <Text style={styles.label}>Ingredients</Text>
            <View style={styles.ingredientsContainer}>
              {recipe.ingredients.split(',').map((ingredient, index) => (
                <View key={index} style={styles.ingredientItem}>
                  <View style={styles.bulletPoint} />
                  <Text style={styles.ingredientText}>{ingredient.trim()}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Steps</Text>
            {recipe.steps.split('\n').map((step, index) => (
              step.trim() && (
                <View key={index} style={styles.stepContainer}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step.trim()}</Text>
                </View>
              )
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffaf5',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
    padding: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  image: {
    width: '100%',
    height: 250,
  },
  imagePlaceholder: {
    width: '100%',
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#ff8c00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  desc: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 20,
  },
  section: {
    marginBottom: 25,
  },
  label: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff8c00',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ffd8b8',
    paddingBottom: 5,
  },
  ingredientsContainer: {
    marginLeft: 10,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ff8c00',
    marginTop: 8,
    marginRight: 10,
  },
  ingredientText: {
    fontSize: 16,
    color: '#555',
    lineHeight: 22,
    flex: 1,
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ff8c00',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  stepNumberText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  stepText: {
    fontSize: 16,
    color: '#555',
    lineHeight: 22,
    flex: 1,
  },
});