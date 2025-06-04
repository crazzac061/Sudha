import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button } from '@rneui/themed';
import { useNavigation } from '@react-navigation/native';
import { TabNavigationProp } from '../types/navigation';
import { RootStackParamList } from '../types/navigation';

const HomeScreen = () => {
  const navigation = useNavigation<TabNavigationProp>();
  
  return (
    <ScrollView style={styles.container}>
      <Card>
        <Card.Title>Your Active Listings</Card.Title>
        <Card.Divider />
        <Text>No active listings</Text>
        <Button
          title="Add New Waste Listing"
          onPress={() => navigation.navigate('AddWaste')}
          containerStyle={styles.buttonContainer}
        />
      </Card>
      
      <Card>
        <Card.Title>Recommended Matches</Card.Title>
        <Card.Divider />
        <Text>No matches found</Text>
      </Card>
      
      <Card>
        <Card.Title>Impact Dashboard</Card.Title>
        <Card.Divider />
        <Text>Total Waste Recycled: 0 kg</Text>
        <Text>CO2 Emissions Saved: 0 tons</Text>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5E9', // Light green background
    padding: 10,
  },
  cardContainer: {
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 15,
  },
  cardTitle: {
    color: '#2E7D32', // Dark green text
    fontSize: 20,
    fontWeight: 'bold',
  },
  cardText: {
    color: '#1B5E20', // Darker green text
    fontSize: 16,
    marginVertical: 5,
  },
  buttonContainer: {
    marginTop: 15,
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#43A047', // Green button
    paddingVertical: 12,
    borderRadius: 8,
  },
  divider: {
    backgroundColor: '#81C784', // Light green divider
    height: 1.5,
  },
});


export default HomeScreen;