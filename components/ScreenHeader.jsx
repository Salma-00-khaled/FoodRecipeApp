import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity,Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const ScreenHeader = ({ title, onBack, backIconColor = '#000' }) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity 
        onPress={onBack}
        style={styles.backButton}
      >
        <Icon name="arrow-back" size={24} color={backIconColor} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={{ width: 24 }} /> {/* Spacer for alignment */}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    backgroundColor: 'transparent',
  },
  backButton: {
    padding: 5,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 140, 0, 0.1)',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ff8c00',
  },
});

export default ScreenHeader;