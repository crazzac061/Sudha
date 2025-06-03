import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text, Card, Button, Avatar } from '@rneui/themed';

const ProfileScreen = () => {
  const userInfo = {
    name: 'Ram',
    company: 'Ram Furniture Factory',
    location: 'Bhaktapur',
    totalWasteListed: '250kg',
    impactScore: '85',
    badges: ['Verified Waste Recycler', 'Eco Champion'],
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar
          size={100}
          rounded
          icon={{ name: 'person', type: 'material' }}
          containerStyle={styles.avatar}
        />
        <Text h4>{userInfo.name}</Text>
        <Text>{userInfo.company}</Text>
        <Text>{userInfo.location}</Text>
      </View>

      <Card>
        <Card.Title>Impact Statistics</Card.Title>
        <Card.Divider />
        <Text>Total Waste Listed: {userInfo.totalWasteListed}</Text>
        <Text>Impact Score: {userInfo.impactScore}</Text>
      </Card>

      <Card>
        <Card.Title>Badges</Card.Title>
        <Card.Divider />
        {userInfo.badges.map((badge, index) => (
          <Text key={index} style={styles.badge}>{badge}</Text>
        ))}
      </Card>

      <Card>
        <Card.Title>Active Listings</Card.Title>
        <Card.Divider />
        <Text>50kg/week Sawdust</Text>
        <Text style={styles.subtitle}>Matched with:</Text>
        <Text>- EcoMush Nepal (25kg/week)</Text>
        <Text>- GreenFuel Pvt Ltd (25kg/week)</Text>
      </Card>

      <Button
        title="Edit Profile"
        containerStyle={styles.button}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  avatar: {
    backgroundColor: '#2089dc',
    marginBottom: 10,
  },
  badge: {
    marginVertical: 5,
    fontWeight: '500',
  },
  subtitle: {
    marginTop: 10,
    fontWeight: '500',
  },
  button: {
    margin: 20,
  },
});

export default ProfileScreen;
