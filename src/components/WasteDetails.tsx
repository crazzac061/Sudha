import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Button, Icon } from '@rneui/themed';
import { WasteQRData } from '../utils/wasteUtils';

interface WasteDetailsProps {
  waste: WasteQRData;
  onClose: () => void;
}

export const WasteDetails: React.FC<WasteDetailsProps> = ({ waste, onClose }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Card containerStyle={styles.card}>
      <Card.Title h4>Waste Details</Card.Title>
      <Card.Divider />
      
      <View style={styles.row}>
        <Text style={styles.label}>ID:</Text>
        <Text style={styles.value}>{waste.wasteId}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Type:</Text>
        <Text style={styles.value}>{waste.type}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Quantity:</Text>
        <Text style={styles.value}>{waste.quantity} {waste.unit}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Condition:</Text>
        <Text style={styles.value}>{waste.condition}</Text>
      </View>

      {waste.location && (
        <View style={styles.row}>
          <Text style={styles.label}>Location:</Text>
          <Text style={styles.value}>
            {waste.location.latitude.toFixed(6)}, {waste.location.longitude.toFixed(6)}
          </Text>
        </View>
      )}

      <View style={styles.row}>
        <Text style={styles.label}>Added:</Text>
        <Text style={styles.value}>{formatDate(waste.timestamp)}</Text>
      </View>

      <Button
        title="Close"
        onPress={onClose}
        type="outline"
        containerStyle={styles.buttonContainer}
        icon={<Icon name="close" type="material" color="#2089dc" />}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    padding: 15,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'center',
  },
  label: {
    fontWeight: 'bold',
    width: 80,
    color: '#666',
  },
  value: {
    flex: 1,
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 15,
  },
});
