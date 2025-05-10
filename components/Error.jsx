import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Error = ({ message }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Error: {message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default Error;