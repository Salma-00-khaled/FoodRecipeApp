import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

const FormInput = ({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  multiline = false, 
  height = 80,
  required = false 
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}{required && <Text style={styles.required}>*</Text>}
      </Text>
      <TextInput
        style={[
          styles.input,
          multiline && styles.multilineInput,
          { height: multiline ? height : 50 }
        ]}
        placeholder={placeholder}
        placeholderTextColor="#999"
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#ff8c00',
  },
  required: {
    color: 'red',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ffe0b2',
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    color: '#333',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  multilineInput: {
    textAlignVertical: 'top',
  },
});

export default FormInput;