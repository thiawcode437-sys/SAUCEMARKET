import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useAuthStore } from '../store/authStore';
import { colors } from '../theme/colors';

import LoginScreen from '../screens/LoginScreen';
import OtpScreen from '../screens/OtpScreen';
import HomeScreen from '../screens/HomeScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import PublishProductScreen from '../screens/PublishProductScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SubscriptionScreen from '../screens/SubscriptionScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { height: 60, paddingBottom: 8, paddingTop: 6 },
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Home: 'home-outline',
            Publish: 'add-circle',
            Chats: 'chatbubbles-outline',
            Profile: 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={route.name === 'Publish' ? 40 : size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Accueil' }} />
      <Tab.Screen name="Publish" component={PublishProductScreen} options={{ title: 'Publier' }} />
      <Tab.Screen name="Chats" component={ChatListScreen} options={{ title: 'Messages' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Otp" component={OtpScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Tabs" component={Tabs} />
          <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ headerShown: true, title: '' }} />
          <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: true }} />
          <Stack.Screen name="Subscription" component={SubscriptionScreen} options={{ headerShown: true, title: 'Devenir vendeur' }} />
        </>
      )}
    </Stack.Navigator>
  );
}
