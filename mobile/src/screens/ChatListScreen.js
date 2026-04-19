import React from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Image, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { MessageAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { colors, spacing, radius, typography } from '../theme/colors';

export default function ChatListScreen({ navigation }) {
  const me = useAuthStore((s) => s.user);
  const { data, isFetching, refetch } = useQuery({
    queryKey: ['conversations'],
    queryFn: MessageAPI.conversations,
    refetchInterval: 15000,
  });

  const convs = data?.items || [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.header}>Messages</Text>
      <FlatList
        data={convs}
        keyExtractor={(c) => c.id}
        refreshing={isFetching}
        onRefresh={refetch}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        renderItem={({ item }) => {
          const peer = item.buyerId === me.id ? item.seller : item.buyer;
          const img = item.product?.images?.[0]?.url;
          return (
            <TouchableOpacity
              style={styles.row}
              onPress={() => navigation.navigate('Chat', { convId: item.id, product: item.product, peer })}
            >
              <View style={styles.avatar}>
                {peer.avatarUrl ? (
                  <Image source={{ uri: peer.avatarUrl }} style={styles.avatarImg} />
                ) : (
                  <Text style={styles.avatarText}>{peer.name[0]?.toUpperCase()}</Text>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{peer.name}</Text>
                <Text numberOfLines={1} style={styles.preview}>
                  {item.lastMessage || '— Commence la conversation —'}
                </Text>
                {item.product && (
                  <Text style={styles.product}>📦 {item.product.title}</Text>
                )}
              </View>
              {img && <Image source={{ uri: img }} style={styles.thumb} />}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Aucune conversation pour l'instant</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { ...typography.h2, padding: spacing.lg },
  row: {
    flexDirection: 'row', alignItems: 'center',
    padding: spacing.lg, backgroundColor: colors.surface,
  },
  avatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarImg: { width: 52, height: 52, borderRadius: 26 },
  avatarText: { fontSize: 20, fontWeight: '700' },
  name: { ...typography.body, fontWeight: '600' },
  preview: { ...typography.caption, marginTop: 2 },
  product: { ...typography.caption, color: colors.primary, marginTop: 2 },
  thumb: { width: 40, height: 40, borderRadius: radius.sm, marginLeft: spacing.sm },
  sep: { height: 1, backgroundColor: colors.border, marginLeft: 80 },
  empty: { padding: spacing.xxl, alignItems: 'center' },
  emptyText: { ...typography.body, color: colors.textMuted },
});
