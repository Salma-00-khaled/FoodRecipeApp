import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import React, { useState, useEffect } from 'react';

// Import your screens
import HomeScreen from './screens/HomeScreen';
import LikedRecipesScreen from './screens/LikedRecipesScreen';
import CategoryScreen from './screens/CategoryScreen';
import RecipeScreen from './screens/RecipeScreen';
import WelcomeScreen from './screens/WelcomeScreen'; // Create this new component

const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();
const FavoritesStack = createStackNavigator();
const RootStack = createStackNavigator();

function HomeStackScreen() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ headerShown: false }} 
      />
      <HomeStack.Screen 
        name="Category" 
        component={CategoryScreen} 
        options={{ headerShown: false }}
      />
      <HomeStack.Screen 
        name="Recipe" 
        component={RecipeScreen} 
        options={{ headerShown: false }}
      />
    </HomeStack.Navigator>
  );
}

function FavoritesStackScreen() {
  return (
    <FavoritesStack.Navigator>
      <FavoritesStack.Screen 
        name="LikedRecipes" 
        component={LikedRecipesScreen} 
        options={{ headerShown: false }} 
      />
      <FavoritesStack.Screen 
        name="Recipe" 
        component={RecipeScreen} 
        options={{ headerShown: false }}
      />
    </FavoritesStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Favorites') {
            iconName = focused ? 'heart' : 'heart-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#ff8c00',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          paddingBottom: 5,
          height: 60,
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStackScreen} 
        options={{ headerShown: false }} 
      />
      <Tab.Screen 
        name="Favorites" 
        component={FavoritesStackScreen} 
        options={{ headerShown: false }} 
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 3000); // Show welcome screen for 3 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <NavigationContainer>
      <RootStack.Navigator>
        {showWelcome ? (
          <RootStack.Screen
            name="Welcome"
            component={WelcomeScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <RootStack.Screen
            name="Main"
            component={MainTabs}
            options={{ headerShown: false }}
          />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}