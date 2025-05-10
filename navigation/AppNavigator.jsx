import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import WelcomeScreen from '../screens/WelcomeScreen';
import HomeScreen from '../screens/HomeScreen';
import CategoryScreen from '../screens/CategoryScreen';
import RecipeScreen from '../screens/RecipeScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Welcome">
      <Stack.Screen 
        name="Welcome" 
        component={WelcomeScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Category" 
        component={CategoryScreen} 
        options={({ route }) => ({ title: route.params.categoryName })}
      />
      <Stack.Screen 
        name="Recipe" 
        component={RecipeScreen} 
        options={{ title: 'Recipe Details' }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;