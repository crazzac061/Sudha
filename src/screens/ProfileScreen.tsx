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
    backgroundColor: '#E8F5E9',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 10,
  },
  avatar: {
    backgroundColor: '#43A047',
    marginBottom: 10,
  },
  welcomeText: {
    color: '#2E7D32',
    marginBottom: 5,
  },
  subText: {
    color: '#666',
    fontSize: 16,
  },
  cardContainer: {
    borderRadius: 15,
    marginHorizontal: 10,
    marginVertical: 8,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    color: '#2E7D32',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#43A047',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  buttonContainer: {
    marginTop: 15,
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#43A047',
    paddingVertical: 12,
    borderRadius: 8,
  },
  divider: {
    backgroundColor: '#81C784',
    height: 1.5,
  },
  listItem: {
    paddingVertical: 8,
    fontSize: 16,
    color: '#1B5E20',
  },
  badge: {
    paddingVertical: 5,
    fontSize: 16,
    color: '#43A047',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginVertical: 5,
  }
});
export default ProfileScreen;
