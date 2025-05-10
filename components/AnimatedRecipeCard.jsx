import React, { useRef } from 'react';
import { Animated, TouchableOpacity, Image, Text, StyleSheet } from 'react-native';

const AnimatedRecipeCard = ({ recipe, onPress }) => {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const fadeValue = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeValue, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start(() => onPress());
  };

  return (
    <Animated.View style={{ opacity: fadeValue }}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View style={[styles.card, { transform: [{ scale: scaleValue }] }]}>
          <Image 
            source={{ uri: recipe.strMealThumb }} 
            style={styles.image} 
          />
          <Text style={styles.title}>{recipe.strMeal}</Text>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 8,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f9f9f9',
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 120,
  },
  title: {
    padding: 8,
    textAlign: 'center',
    color: '#333',
  },
});

export default AnimatedRecipeCard;