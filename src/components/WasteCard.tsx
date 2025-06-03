import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text as RNEText, Button } from '@rneui/themed';

interface WasteCardProps {
  waste: {
    type: string;
    quantity: string;
    unit: string;
    condition: string;
    location: string;
    availableFrom: string;
  };
  onPress?: () => void;
}

const WasteCard = ({ waste, onPress }: WasteCardProps) => {
  return (
    <Card>
      <Card.Title>{waste.type}</Card.Title>
      <Card.Divider />
      <RNEText style={styles.detail}>Quantity: {waste.quantity} {waste.unit}</RNEText>
      <RNEText style={styles.detail}>Condition: {waste.condition}</RNEText>
      <RNEText style={styles.detail}>Location: {waste.location}</RNEText>
      <RNEText style={styles.detail}>Available from: {waste.availableFrom}</RNEText>
      {onPress && (
        <Button
          title="View Details"
          onPress={onPress}
          containerStyle={styles.button}
        />
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  detail: {
    marginBottom: 5,
  },
  button: {
    marginTop: 10,
  },
});

export default WasteCard;
