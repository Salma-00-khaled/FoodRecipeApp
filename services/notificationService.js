// src/services/NotificationService.js
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification appearance
Notifications.setNotificationChannelAsync('recipes', {
  name: 'Recipe Notifications',
  importance: Notifications.AndroidImportance.HIGH,
  sound: 'default',
  vibrationPattern: [0, 250, 250, 250],
  lightColor: '#FF8C00',
  lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  showBadge: true,
  enableVibrate: true,
});

// Custom notification content component for Android
if (Platform.OS === 'android') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowList: true,
      priority: Notifications.AndroidNotificationPriority.HIGH
    }),
  });
}

export const sendStyledNotification = async (title, body, data = {}) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: 'default',
      data,
      color: '#FF8C00', // Accent color
      // Android specific styling
      ...(Platform.OS === 'android' && {
        smallIcon: 'notification_icon', // Make sure this matches your app.json
        largeIcon: 'ic_launcher', // Your app's launcher icon
        style: {
          type: 'bigtext',
          bigText: body,
          summaryText: 'Recipe Master',
          bigLargeIcon: 'ic_launcher',
          bigPictureUrl: data.imageUrl || null,
        },
        backgroundColor: '#FFF9F2', // Your app's background color
      }),
      // iOS specific styling
      ...(Platform.OS === 'ios' && {
        subtitle: "Recipe Master",
        launchImageName: 'splash',
        attachments: data.imageUrl ? [{
          identifier: 'image',
          url: data.imageUrl,
          options: { thumbnailHidden: false }
        }] : [],
        categoryIdentifier: 'RECIPE_ALERT',
      }),
    },
    trigger: data.trigger || null,
  });
};