import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const CategoryPicker = ({ category, setCategory }) => {
  const categories = [
    { label: 'Uncategorized', value: 'Uncategorized' },
    { label: 'Appetizer', value: 'Appetizer' },
    { label: 'Main Dish', value: 'Main Dish' },
    { label: 'Dessert', value: 'Dessert' },
    { label: 'Drink', value: 'Drink' },
  ];

  return (
    <View style={[
      styles.container,
      Platform.OS === 'ios' && styles.iosContainer
    ]}>
      <Picker
        selectedValue={category}
        onValueChange={setCategory}
        style={styles.picker}
        {...Platform.select({
          ios: {
            itemStyle: styles.iosPickerItem,
            mode: 'dropdown'
          },
          android: {
            dropdownIconColor: '#ff8c00',
            dropdownIconRippleColor: '#ffe0b2',
            mode: 'dropdown'
          }
        })}
      >
        {categories.map((item) => (
          <Picker.Item 
            key={item.value}
            label={item.label}
            value={item.value}
            style={Platform.OS === 'android' ? styles.androidPickerItem : null}
          />
        ))}
      </Picker>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: Platform.OS === 'android' ? 1 : 0,
    borderColor: '#ffe0b2',
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#fff',
    marginVertical: 10,
    elevation: Platform.OS === 'android' ? 1 : 0,
    shadowColor: Platform.OS === 'ios' ? '#000' : undefined,
    shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 2 } : undefined,
    shadowOpacity: Platform.OS === 'ios' ? 0.1 : undefined,
    shadowRadius: Platform.OS === 'ios' ? 4 : undefined,
  },
  iosContainer: {
    backgroundColor: '#fff8e1',
  },
  picker: {
    height: 50,
    color: '#333',
    paddingHorizontal: Platform.OS === 'android' ? 10 : 0,
  },
  androidPickerItem: {
    color: '#5c715e',
    backgroundColor: '#fff8e1',
    fontSize: 16,
  },
  iosPickerItem: {
    color: '#ff8c00',
    fontSize: 16,
  },
});

export default CategoryPicker;