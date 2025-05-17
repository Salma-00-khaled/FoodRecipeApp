import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

// Reusable components
import ImageUploader from '../components/ImageUploader';
import CategoryPicker from '../components/CategoryPicker';
import FormInput from '../components/FormInput';
import SubmitButton from '../components/SubmitButton';
import ScreenHeader from '../components/ScreenHeader';
import ReusablePopup from '../components/ReusablePopup';
import useNotification from '../hooks/useNotification';

function AddRecipeScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [steps, setSteps] = useState('');
  const [image, setImage] = useState(null);
  const [category, setCategory] = useState('Uncategorized');
  const [showPopup, setShowPopup] = useState(false);
  const [popupConfig, setPopupConfig] = useState({});

  const { sendNotification } = useNotification();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const showAlertPopup = (title, message, type, primaryAction, secondaryAction = null) => {
    setPopupConfig({
      title,
      message,
      type,
      primaryButtonText: 'OK',
      onPrimaryButtonPress: () => {
        setShowPopup(false);
        primaryAction?.();
      },
      secondaryButtonText: secondaryAction ? 'Cancel' : null,
      onSecondaryButtonPress: () => {
        setShowPopup(false);
        secondaryAction?.();
      }
    });
    setShowPopup(true);
  };

  const handleSubmit = async () => {
    if (!title || !ingredients || !steps) {
      showAlertPopup(
        'Required Fields',
        'Please fill out title, ingredients and steps',
        'error'
      );
      return;
    }

    const newRecipe = {
      id: Date.now().toString(),
      title,
      description,
      ingredients,
      steps,
      image,
      category,
      createdAt: new Date().toISOString(),
    };

    try {
      const storedRecipes = await AsyncStorage.getItem('myRecipes');
      const recipes = storedRecipes ? JSON.parse(storedRecipes) : [];
      await AsyncStorage.setItem('myRecipes', JSON.stringify([...recipes, newRecipe]));

      await sendNotification(
        "Recipe Shared!",
        `You've shared "${title}"`,
        { screen: 'Profile', recipeId: newRecipe.id }
      );

      showAlertPopup(
        'Success',
        'Recipe saved successfully!',
        'success',
        () => navigation.navigate('Profile')
      );
    } catch (error) {
      console.error('Save failed:', error);
      showAlertPopup(
        'Error',
        'Failed to save recipe',
        'error'
      );
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#fffaf5', '#fff1e6']}
        style={styles.gradientBackground}
      >
        <ScreenHeader
          title="New Recipe"
          onBack={() => navigation.goBack()}
          backIconColor="#ff8c00"
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ImageUploader image={image} onPress={pickImage} />

          <FormInput
            label="Recipe Title"
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Spaghetti Carbonara"
            required
          />

          <FormInput
            label="Description (Optional)"
            value={description}
            onChangeText={setDescription}
            placeholder="Short description about your recipe"
            multiline
          />

          <FormInput
            label="Ingredients"
            value={ingredients}
            onChangeText={setIngredients}
            placeholder="List ingredients separated by commas"
            multiline
            height={120}
            required
          />

          <FormInput
            label="Steps"
            value={steps}
            onChangeText={setSteps}
            placeholder="Step-by-step instructions"
            multiline
            height={180}
            required
          />

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Category</Text>
            <CategoryPicker
              category={category}
              setCategory={setCategory}
            />
          </View>

          <SubmitButton
            onPress={handleSubmit}
            text="Share Recipe"
            iconName="send"
          />
        </ScrollView>
      </LinearGradient>

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
    backgroundColor: '#fffaf5',
  },
  gradientBackground: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#ff8c00',
  },
});

export default AddRecipeScreen;
