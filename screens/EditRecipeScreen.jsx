import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import ReusablePopup from '../components/ReusablePopup';

const { width } = Dimensions.get('window');

export default function EditRecipeScreen({ route, navigation }) {
  const { recipe } = route.params;
  const [title, setTitle] = useState(recipe.title);
  const [description, setDescription] = useState(recipe.description);
  const [ingredients, setIngredients] = useState(recipe.ingredients);
  const [steps, setSteps] = useState(recipe.steps);
  const [image, setImage] = useState(recipe.image);
  const [category, setCategory] = useState(recipe.category);
  const [showPopup, setShowPopup] = useState(false);
  const [popupConfig, setPopupConfig] = useState({});

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

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const handleSave = async () => {
    if (!title || !ingredients || !steps) {
      showAlertPopup(
        'Required Fields', 
        'Please fill out at least title, ingredients and steps',
        'error'
      );
      return;
    }

    const updated = { ...recipe, title, description, ingredients, steps, image, category };

    try {
      const stored = await AsyncStorage.getItem('myRecipes');
      const parsed = stored ? JSON.parse(stored) : [];
      const modified = parsed.map(r => (r.id === recipe.id ? updated : r));
      await AsyncStorage.setItem('myRecipes', JSON.stringify(modified));
      
      showAlertPopup(
        'Success', 
        'Recipe updated successfully!',
        'success',
        () => navigation.goBack()
      );
    } catch (err) {
      showAlertPopup(
        'Error', 
        'Failed to save recipe. Please try again.',
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
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={24} color="#ff8c00" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Recipe</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity 
            style={styles.imageUpload} 
            onPress={pickImage}
            activeOpacity={0.8}
          >
            {image ? (
              <Image 
                source={{ uri: image }} 
                style={styles.imagePreview} 
                resizeMode="cover"
              />
            ) : (
              <LinearGradient
                colors={['#fff', '#ffe6cc']}
                style={styles.uploadPlaceholder}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.uploadIconContainer}>
                  <Icon name="camera" size={32} color="#ff8c00" />
                  <Text style={styles.uploadText}>Change Photo</Text>
                </View>
              </LinearGradient>
            )}
            <View style={styles.imageOverlay}>
              <Text style={styles.imageOverlayText}>Change Photo</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Recipe Title*</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Spaghetti Carbonara"
              placeholderTextColor="#999"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Short description about your recipe"
              placeholderTextColor="#999"
              value={description}
              onChangeText={setDescription}
              multiline
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Ingredients*</Text>
            <TextInput
              style={[styles.input, styles.multilineInput, { height: 120 }]}
              placeholder="List ingredients separated by commas\nExample:\nPasta, Eggs, Bacon, Cheese"
              placeholderTextColor="#999"
              value={ingredients}
              onChangeText={setIngredients}
              multiline
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Steps*</Text>
            <TextInput
              style={[styles.input, styles.multilineInput, { height: 180 }]}
              placeholder="Step-by-step instructions"
              placeholderTextColor="#999"
              value={steps}
              onChangeText={setSteps}
              multiline
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={category}
                onValueChange={setCategory}
                style={styles.picker}
                dropdownIconColor="#ff8c00"
              >
                <Picker.Item label="Uncategorized" value="Uncategorized" />
                <Picker.Item label="Appetizer" value="Appetizer" />
                <Picker.Item label="Main Dish" value="Main Dish" />
                <Picker.Item label="Dessert" value="Dessert" />
                <Picker.Item label="Drink" value="Drink" />
              </Picker>
            </View>
          </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
    backgroundColor: 'transparent',
  },
  backButton: {
    padding: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 140, 0, 0.1)',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ff8c00',
  },
  saveButton: {
    backgroundColor: 'rgba(255, 140, 0, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  saveText: {
    color: '#ff8c00',
    fontWeight: 'bold',
    fontSize: 16,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  imageUpload: {
    marginBottom: 25,
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imagePreview: {
    width: '100%',
    height: 200,
  },
  uploadPlaceholder: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadIconContainer: {
    alignItems: 'center',
  },
  uploadText: {
    marginTop: 10,
    color: '#ff8c00',
    fontWeight: '600',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    alignItems: 'center',
  },
  imageOverlayText: {
    color: '#fff',
    fontWeight: '600',
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
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ffe0b2',
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    color: '#333',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  multilineInput: {
    textAlignVertical: 'top',
    height: 80,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ffe0b2',
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 1,
  },
  picker: {
    height: 50,
    color: '#333',
  },
});