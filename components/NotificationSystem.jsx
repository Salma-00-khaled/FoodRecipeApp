import React, { useState, useEffect, useRef } from 'react';
import { View, FlatList, TouchableOpacity, Text, Modal, Animated, PanResponder, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';

const NotificationSystem = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  // Set up notifications
  useEffect(() => {
    // Configure notifications handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('recipes', {
        name: 'Recipe Notifications',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF8C00',
      });
    }

    // Notification received listener
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotifications(prev => [notification, ...prev]);
      setNotificationCount(prev => prev + 1);
    });

    // Notification response listener
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      if (data?.screen) {
        navigation.navigate(data.screen, data);
      }
    });

    // Load initial notifications
    const loadInitialNotifications = async () => {
      const initialNotifications = await Notifications.getPresentedNotificationsAsync();
      setNotifications(initialNotifications.map(n => n.notification));
      setNotificationCount(initialNotifications.length);
    };
    loadInitialNotifications();

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, [navigation]);

  const handleNotificationIconPress = () => {
    setNotificationCount(0);
    Notifications.setBadgeCountAsync(0);
    setModalVisible(true);
  };

  const handleSwipeDelete = async (notificationId) => {
    await Notifications.dismissNotificationAsync(notificationId);
    setNotifications(prev => prev.filter(n => n && n.identifier !== notificationId));
    setNotificationCount(prev => Math.max(0, prev - 1));
  };

  const clearNotifications = async () => {
    await Notifications.dismissAllNotificationsAsync();
    await Notifications.setBadgeCountAsync(0);
    setNotifications([]);
    setNotificationCount(0);
    setModalVisible(false);
  };

  const NotificationIcon = ({ count, onPress }) => {
    const bounceAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
      if (count > 0) {
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 1.3,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.spring(bounceAnim, {
            toValue: 1,
            friction: 3,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }, [count]);

    return (
      <TouchableOpacity onPress={onPress} style={styles.notificationIconContainer}>
        <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
          <Ionicons 
            name={count > 0 ? "notifications" : "notifications-outline"} 
            size={26} 
            color={count > 0 ? "#FF8C00" : "#333"} 
          />
          {count > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>{count > 9 ? "9+" : count}</Text>
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const SwipeableNotification = ({ notification, onPress, onDelete }) => {
    const translateX = useRef(new Animated.Value(0)).current;
    const scaleY = useRef(new Animated.Value(1)).current;
    const opacity = useRef(new Animated.Value(1)).current;

    const panResponder = useRef(
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return Math.abs(gestureState.dx) > 5;
        },
        onPanResponderMove: (_, gestureState) => {
          translateX.setValue(gestureState.dx);
        },
        onPanResponderRelease: (_, gestureState) => {
          if (Math.abs(gestureState.dx) > 100) {
            Animated.parallel([
              Animated.timing(translateX, {
                toValue: gestureState.dx > 0 ? 500 : -500,
                duration: 200,
                useNativeDriver: true,
              }),
              Animated.timing(opacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
              }),
              Animated.timing(scaleY, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
              }),
            ]).start(() => {
              if (notification && notification.identifier) {
                onDelete(notification.identifier);
              }
            });
          } else {
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
          }
        },
      })
    ).current;

    return (
      <Animated.View
        style={[
          styles.notificationItem,
          {
            transform: [{ translateX }, { scaleY }],
            opacity,
          },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity 
          onPress={onPress}
          style={{ flex: 1, flexDirection: 'row' }}
        >
          <View style={styles.notificationIcon}>
            <Ionicons name="notifications" size={20} color="#FF8C00" />
          </View>
          <View style={styles.notificationContent}>
            <Text style={styles.notificationTitle}>
              {notification.request.content.title}
            </Text>
            <Text style={styles.notificationBody}>
              {notification.request.content.body}
            </Text>
            <Text style={styles.notificationTime}>
              {new Date(notification.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return {
    NotificationIcon: () => (
      <NotificationIcon 
        count={notificationCount} 
        onPress={handleNotificationIconPress}
      />
    ),
    NotificationModal: () => (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notifications</Text>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            {notifications.length === 0 ? (
              <View style={styles.emptyNotifications}>
                <Ionicons name="notifications-off-outline" size={50} color="#FF8C00" />
                <Text style={styles.emptyText}>No notifications yet</Text>
              </View>
            ) : (
              <FlatList
                data={notifications}
                keyExtractor={(item) => item?.identifier || Math.random().toString()}
                renderItem={({ item }) => (
                  item ? (
                    <SwipeableNotification
                      notification={item}
                      onPress={() => {
                        setModalVisible(false);
                        if (item.request.content.data?.screen) {
                          navigation.navigate(
                            item.request.content.data.screen,
                            item.request.content.data
                          );
                        }
                      }}
                      onDelete={handleSwipeDelete}
                    />
                  ) : null
                )}
              />
            )}
            
            {notifications.length > 0 && (
              <TouchableOpacity 
                onPress={clearNotifications}
                style={styles.clearButton}
              >
                <Text style={styles.clearButtonText}>Clear All Notifications</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    ),
    sendNotification: async (title, body, data = {}) => {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: 'default',
          data,
          color: '#FF8C00',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null,
      });
    }
  };
};

const styles = {
  notificationIconContainer: {
    marginRight: 15,
    position: 'relative',
    
  },
  notificationBadge: {
    position: 'absolute',
    right: -6,
    top: -6,
    backgroundColor: '#FF4757',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFF',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
     backgroundColor: '#fffaf5' ,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  emptyNotifications: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 15,
    color: '#666',
    fontSize: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    overflow: 'hidden',
  },
  notificationIcon: {
    marginRight: 15,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 3,
    color: '#333',
  },
  notificationBody: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  clearButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#FF8C00',
    fontWeight: 'bold',
  },
};

export default NotificationSystem;