import React, { useEffect } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';


const WelcomeScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Home');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image 
        source={require('../assets/images/OIP.jpeg')} 
        style={styles.logo} 
      />
      <Text style={styles.title}>Delicious Recipes</Text>
      <Text style={styles.subtitle}>Discover amazing dishes to cook</Text>
    </View>
  );
};


const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#fffaf5',
    },
    logo: {
      width: 150,
      height: 150,
      marginBottom: 20,
      borderRadius: 75,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 10,
      color: '#ff8c00',
    },
    subtitle: {
      fontSize: 16,
      color: '#666',
    },
  });

export default WelcomeScreen;