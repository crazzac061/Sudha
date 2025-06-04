// import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';

export type RootStackParamList = {
  MainTabs: undefined;
  TabNavigator: undefined;
  AddWaste: undefined;
  CraftSuggestions: {
    wasteType: string;
    wasteId: string;
  };
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  AddWaste: undefined;
  ScanQR: undefined;
  Profile: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export type TabNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

export type AuthNavigationProp = NativeStackNavigationProp<AuthStackParamList>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}