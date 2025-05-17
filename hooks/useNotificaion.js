import * as Notifications from 'expo-notifications';

export default function useNotification(navigation) {
  const sendNotification = async (title, body, data) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
        },
        trigger: { seconds: 1 },
      });
    } catch (error) {
      console.error('Notification failed:', error);
    }
  };

  return { sendNotification };
}