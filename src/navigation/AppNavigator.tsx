// import React from 'react';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { RootStackParamList, MainTabParamList } from '../types/navigation';
// import { Ionicons } from '@expo/vector-icons';

// // Screens
// import HomeScreen from '../screens/HomeScreen';
// import AddWasteScreen from '../screens/AddWasteScreen';
// import ProfileScreen from '../screens/ProfileScreen';
// import ScanQRScreen from '../screens/ScanQRScreen';
// import CraftSuggestionsScreen from '../screens/CraftSuggestionsScreen';

// const Tab = createBottomTabNavigator<MainTabParamList>();
// const Stack = createNativeStackNavigator<RootStackParamList>();

// const MainTabs = () => {
//   return (
//     <Tab.Navigator
//       screenOptions={({ route }) => ({
//         tabBarIcon: ({ focused, color, size }) => {
//           let iconName: keyof typeof Ionicons.glyphMap;

//           if (route.name === 'Home') {
//             iconName = focused ? 'home' : 'home-outline';
//           } else if (route.name === 'AddWaste') {
//             iconName = focused ? 'add-circle' : 'add-circle-outline';
//           } else if (route.name === 'ScanQR') {
//             iconName = focused ? 'qr-code' : 'qr-code-outline';
//           } else if (route.name === 'Profile') {
//             iconName = focused ? 'person' : 'person-outline';
//           } else {
//             iconName = 'help-outline';
//           }

//           return <Ionicons name={iconName} size={size} color={color} />;
//         },
//         tabBarActiveTintColor: '#2196F3',
//         tabBarInactiveTintColor: 'gray',
//       })}
//     >
//       <Tab.Screen 
//         name="Home" 
//         component={HomeScreen}
//         options={{ title: 'Home' }}
//       />
//       <Tab.Screen 
//         name="AddWaste" 
//         component={AddWasteScreen}
//         options={{ title: 'Add Waste' }}
//       />
//       <Tab.Screen 
//         name="ScanQR" 
//         component={ScanQRScreen}
//         options={{ title: 'Scan QR' }}
//       />
//       <Tab.Screen 
//         name="Profile" 
//         component={ProfileScreen}
//         options={{ title: 'Profile' }}
//       />
//     </Tab.Navigator>
//   );
// };

// const AppNavigator = () => {
//   return (
//     <Stack.Navigator>
//       <Stack.Screen
//         name="MainTabs"
//         component={MainTabs}
//         options={{ headerShown: false }}
//       />
//       <Stack.Screen
//         name="CraftSuggestions"
//         component={CraftSuggestionsScreen}
//         options={({ route }) => ({
//           title: `Craft Ideas for ${route.params?.wasteType || 'Waste'}`,
//         })}
//       />
//     </Stack.Navigator>
//   );
// };

// export default AppNavigator;
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList, MainTabParamList } from '../types/navigation';
import { Ionicons } from '@expo/vector-icons';

// Screens
import HomeScreen from '../screens/HomeScreen';
import AddWasteScreen from '../screens/AddWasteScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ScanQRScreen from '../screens/ScanQRScreen';
import CraftSuggestionsScreen from '../screens/CraftSuggestionsScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'AddWaste') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'ScanQR') {
            iconName = focused ? 'qr-code' : 'qr-code-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="AddWaste" 
        component={AddWasteScreen}
        options={{ title: 'Add Waste' }}
      />
      <Tab.Screen 
        name="ScanQR" 
        component={ScanQRScreen}
        options={{ title: 'Scan QR' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="TabNavigator"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CraftSuggestions"
        component={CraftSuggestionsScreen}
        options={({ route }) => ({
          title: `Craft Ideas for ${route.params?.wasteType || 'Waste'}`,
        })}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;