import React from 'react';
import { View, Image, Text, StyleSheet, SafeAreaView } from 'react-native';

const CategoryItem = ({ category }) => {
  return (
    <SafeAreaView style={styles.container}>
      <Image 
        source={{ uri: category.image }} 
        style={styles.image} 
      />
      <Text style={styles.title}>{category.name}</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    margin: 8,
    width: 150,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#ff8c00',
  },
  title: {
    marginTop: 8,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
});

export default CategoryItem;