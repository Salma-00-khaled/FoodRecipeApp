import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const ReusablePopup = ({
  visible,
  onClose,
  title,
  message,
  primaryButtonText = 'OK',
  onPrimaryButtonPress,
  secondaryButtonText,
  onSecondaryButtonPress,
  type = 'info'
}) => {
  

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.popupContainer}>
          <View style={styles.popupContent}>
            <Text style={styles.popupTitle}>{title}</Text>
            <Text style={styles.popupMessage}>{message}</Text>

            <View style={styles.buttonContainer}>
              {secondaryButtonText && (
                <TouchableOpacity
                  style={[styles.button, styles.secondaryButton]}
                  onPress={onSecondaryButtonPress || onClose}
                >
                  <Text style={styles.secondaryButtonText}>{secondaryButtonText}</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={onPrimaryButtonPress || onClose}
              >
                <Text style={styles.primaryButtonText}>{primaryButtonText}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  popupContainer: {
    width: width - 80, // More narrow like system alert
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 5,
  },
  popupContent: {
    padding: 24,
  },
  popupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  popupMessage: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    lineHeight: 22,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  primaryButton: {
    backgroundColor: '#ff8c00',
  },
  secondaryButton: {
    backgroundColor: '#f0f0f0',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButtonText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default ReusablePopup;