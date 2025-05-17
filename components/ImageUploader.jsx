import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';

const ImageUploader = ({ image, onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
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
  );
};

const styles = StyleSheet.create({
  container: {
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
});

export default ImageUploader;