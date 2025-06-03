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
    backgroundColor: '#f5f5f5',
  },
  buttonContainer: {
    marginTop: 10,
  },
});

export default HomeScreen;