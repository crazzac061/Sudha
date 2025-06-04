import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

export type RootStackParamList = {
  MainTabs: undefined;
  AddWaste: undefined;
  CraftSuggestions: {
    wasteType: string;
    wasteId: string;
  };
};

export type MainTabParamList = {
  Home: undefined;
  AddWaste: undefined;
  ScanQR: undefined;
  Profile: undefined;
  CraftSuggestions: {
    wasteId: string;
    wasteType: string;
  };
};

export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export type TabNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
