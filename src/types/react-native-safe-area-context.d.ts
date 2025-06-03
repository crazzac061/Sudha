declare module 'react-native-safe-area-context' {
  import * as React from 'react';
  import { ViewStyle, StyleProp } from 'react-native';
  import { SafeAreaProvider } from 'react-native-safe-area-context';

export type Edge = 'top' | 'right' | 'bottom' | 'left';

  export interface SafeAreaViewProps {
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    edges?: Edge[];
  }

  export const SafeAreaProvider: React.ComponentType<{ children: React.ReactNode }>;
  export const SafeAreaView: React.ComponentType<SafeAreaViewProps>;

  export function useSafeAreaInsets(): {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}
