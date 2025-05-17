import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as Notifications from 'expo-notifications';
// Screens
import WelcomeScreen from './screens/WelcomeScreen';
import HomeScreen from './screens/HomeScreen';
import CategoryScreen from './screens/CategoryScreen';
import RecipeScreen from './screens/RecipeScreen';
import SharedRecipeScreen from './screens/SharedRecipeScreen';
import LikedRecipesScreen from './screens/LikedRecipesScreen';
import ProfileScreen from './screens/ProfileScreen';
import AddRecipeScreen from './screens/AddRecipeScreen';
import EditRecipeScreen from './screens/EditRecipeScreen';
import  notificationHandler, { configureNotifications, showLocalNotification, scheduleNotification, scheduleWelcomeNotification, setupNotificationChannel } from './services/notificationService';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const RootStack = createStackNavigator();
const HomeStack = createStackNavigator();
const FavoritesStack = createStackNavigator();
const ProfileStack = createStackNavigator();
const Tab = createBottomTabNavigator();

function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeScreen" component={HomeScreen} />
      <HomeStack.Screen name="Category" component={CategoryScreen} />
      <HomeStack.Screen name="Recipe" component={RecipeScreen} />
      <HomeStack.Screen name="SharedRecipe" component={SharedRecipeScreen} />
    </HomeStack.Navigator>
  );
}

function FavoritesStackScreen() {
  return (
    <FavoritesStack.Navigator screenOptions={{ headerShown: false }}>
      <FavoritesStack.Screen name="LikedRecipes" component={LikedRecipesScreen} />
      <FavoritesStack.Screen name="Recipe" component={RecipeScreen} />
    </FavoritesStack.Navigator>
  );
}

function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} />
      <ProfileStack.Screen name="AddRecipe" component={AddRecipeScreen} />
      <ProfileStack.Screen name="EditRecipe" component={EditRecipeScreen} />
      <ProfileStack.Screen name="SharedRecipe" component={SharedRecipeScreen} />
    </ProfileStack.Navigator>
  );
}

function MainTabs() {
   const insets = useSafeAreaInsets();

  // Calculate tab bar height including safe area insets
  const tabBarHeight = Platform.select({
    ios: 60 + (insets.bottom > 0 ? insets.bottom / 2 : 10),
    android: 60 + (insets.bottom > 0 ? insets.bottom : 0)
  });

  const tabBarStyle = {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 30,
    height: tabBarHeight,
    paddingTop: 8,
    paddingBottom: Platform.select({
      ios: insets.bottom > 0 ? insets.bottom / 2 : 10,
      android: insets.bottom > 0 ? insets.bottom : 10
    }),
    backgroundColor: Platform.select({
      ios: 'rgba(255, 255, 255, 0.9)',
      android: '#ffffff'
    }),
    borderTopWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    ...Platform.select({
      ios: {
        backdropFilter: 'blur(10px)',
      },
    }),
  };

  // Add padding to screen content to avoid being hidden by tab bar
  const screenOptions = {
    headerShown: false,
    contentStyle: {
      paddingBottom: tabBarHeight, // This ensures content isn't hidden
    },
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...screenOptions,
        tabBarHideOnKeyboard: true,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          switch (route.name) {
            case 'HomeTab':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'FavoritesTab':
              iconName = focused ? 'heart' : 'heart-outline';
              break;
            case 'ProfileTab':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'ellipse';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#ff8c00',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle,
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      })}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeStackScreen} 
        options={{ title: 'Home' }} 
      />
      <Tab.Screen 
        name="FavoritesTab" 
        component={LikedRecipesScreen} 
        options={{ title: 'Favorites' }} 
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileStackScreen} 
        options={{ title: 'Profile' }} 
      />
    </Tab.Navigator>
  );
}

// Main App
export default function App() {
  const [showWelcome, setShowWelcome] = useState(true);
   useEffect(() => {
    // Handle notification taps
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const { screen, ...params } = response.notification.request.content.data;
      if (screen) {
        navigation.navigate(screen, params);
      }
    });

    return () => subscription.remove();
  }, []);

   useEffect(() => {
    // Setup notifications
    const setupNotifications = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('You need to enable notifications to get the full experience');
        return;
      }

      await setupNotificationChannel();
      
      if (!showWelcome) {
        await scheduleWelcomeNotification();
      }
    };

    setupNotifications();
  }, [showWelcome]);
 

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Configure for Android
if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('default', {
    name: 'default',
    importance: Notifications.AndroidImportance.HIGH,
    sound: true,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF8C00',
  });
}

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {showWelcome ? (
          <RootStack.Screen name="Welcome" component={WelcomeScreen} />
        ) : (
          <RootStack.Screen name="MainTabs" component={MainTabs} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
