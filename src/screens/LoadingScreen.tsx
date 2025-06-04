import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import colors from '../theme/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5', // Fallback color
  },
});

export const LoadingScreen: React.FC = () => {
  // Defensive check for colors
  const backgroundColor = colors?.background || '#F5F5F5';
  const indicatorColor = colors?.primary || '#4CAF50';

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ActivityIndicator size="large" color={indicatorColor} />
    </View>
  );
};
