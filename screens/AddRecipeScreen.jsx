import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import ReusablePopup from '../components/ReusablePopup';

import * as Notifications from 'expo-notifications';
import NotificationSystem from '../components/NotificationSystem';


const { width } = Dimensions.get('window');

export default function AddRecipeScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [steps, setSteps] = useState('');
  const [image, setImage] = useState(null);
  const [category, setCategory] = useState('Uncategorized');
  const [showPopup, setShowPopup] = useState(false);
  const [popupConfig, setPopupConfig] = useState({});

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

  const { sendNotification } = NotificationSystem({ navigation });

  const handleSubmit = async () => {
    if (!title || !ingredients || !steps) {
      showAlertPopup(
        'Required Fields', 
        'Please fill out at least title, ingredients and steps',
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
      const stored = await AsyncStorage.getItem('myRecipes');
      const parsed = stored ? JSON.parse(stored) : [];
      const updated = [...parsed, newRecipe];
      await AsyncStorage.setItem('myRecipes', JSON.stringify(updated));
      
      // Send notification when recipe is shared
      await sendNotification(
        "Recipe Shared!",
        `You've successfully shared "${title}"`,
        { 
          screen: 'Profile',
          recipeId: newRecipe.id 
        }
      );

      showAlertPopup(
        'Success', 
        'Your recipe has been saved successfully!',
        'success',
        () => navigation.navigate('Profile')
      );
    } catch (err) {
      console.error(err);
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
          <Text style={styles.headerTitle}>New Recipe</Text>
          <View style={{ width: 24 }} />
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
                  <Text style={styles.uploadText}>Add Photo</Text>
                </View>
              </LinearGradient>
            )}
            <View style={styles.imageOverlay}>
              <Text style={styles.imageOverlayText}>{image ? 'Change Photo' : 'Add Photo'}</Text>
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

          <TouchableOpacity 
            style={styles.submitButton} 
            onPress={handleSubmit}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#ff8c00', '#ff6b00']}
              style={styles.gradientButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Icon name="send" size={20} color="#fff" style={styles.submitIcon} />
              <Text style={styles.submitButtonText}>Share Recipe</Text>
            </LinearGradient>
          </TouchableOpacity>
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  imageUpload: {
    marginBottom: 25,
    borderRadius: 12,
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
    borderRadius: 12,
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
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 1,
  },
  picker: {
    height: 50,
    color: '#333',
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 10,
    elevation: 3,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 10,
  },
  submitIcon: {
    marginRight: 5,
  },
   imageUpload: {
    marginBottom: 25,
    borderRadius: 14, // Increased from 12
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ffe0b2',
    borderRadius: 14, // Increased from 12
    padding: 16,
    fontSize: 16,
    color: '#333',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ffe0b2',
    borderRadius: 14, // Increased from 12
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 1,
  },
  submitButton: {
    borderRadius: 14, // Increased from 12
    overflow: 'hidden',
    marginTop: 10,
    elevation: 3,
  },
  backButton: {
    padding: 5,
    borderRadius: 14, // Increased from 12
    backgroundColor: 'rgba(255, 140, 0, 0.1)',
  },
});