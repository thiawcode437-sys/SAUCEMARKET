import React from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Dimensions, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ProductAPI, MessageAPI } from '../services/api';
import { colors, spacing, radius, typography, formatFCFA } from '../theme/colors';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => ProductAPI.detail(id),
  });

  const openChat = useMutation({
    mutationFn: () => MessageAPI.openConv(id),
    onSuccess: (conv) => {
      navigation.navigate('Chat', { convId: conv.id, product, peer: product.seller });
    },
    onError: (e) => Alert.alert('Erreur', e.response?.data?.error?.message || 'Impossible'),
  });

  if (isLoading || !product) {
    return <View style={styles.center}><Text>Chargement…</Text></View>;
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
          {product.images?.map((img) => (
            <Image key={img.id} source={{ uri: img.url }} style={{ width, height: width }} />
          ))}
          {(!product.images || product.images.length === 0) && (
            <View style={[styles.noImg, { width, height: width }]}>
              <Ionicons name="image-outline" size={80} color={colors.textMuted} />
            </View>
          )}
        </ScrollView>

        <View style={styles.body}>
          <Text style={styles.title}>{product.title}</Text>
          <Text style={styles.price}>{formatFCFA(product.price)}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={14} color={colors.textMuted} />
              <Text style={styles.metaText}>{product.city}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="eye-outline" size={14} color={colors.textMuted} />
              <Text style={styles.metaText}>{product.views} vues</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.desc}>{product.description}</Text>

          <Text style={styles.sectionTitle}>Vendeur</Text>
          <View style={styles.sellerCard}>
            <View style={styles.avatar}>
              {product.seller.avatarUrl ? (
                <Image source={{ uri: product.seller.avatarUrl }} style={{ width: 48, height: 48, borderRadius: 24 }} />
              ) : (
                <Text style={{ fontSize: 20 }}>{product.seller.name[0]?.toUpperCase()}</Text>
              )}
            </View>
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.sellerName}>{product.seller.name}</Text>
                {product.seller.isVerified && (
                  <Ionicons name="checkmark-circle" size={16} color={colors.primary} style={{ marginLeft: 4 }} />
                )}
              </View>
              <Text style={styles.sellerMeta}>
                ⭐ {product.seller.ratingAvg?.toFixed(1) || '—'} · {product.seller.ratingCount || 0} avis
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.btnSecondary} onPress={() => openChat.mutate()}>
          <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
          <Text style={styles.btnSecondaryText}>Contacter</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnPrimary}>
          <Ionicons name="cart" size={20} color="white" />
          <Text style={styles.btnPrimaryText}>Acheter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  noImg: { backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  body: { padding: spacing.lg },
  title: { ...typography.h2 },
  price: { ...typography.h1, color: colors.primary, marginTop: spacing.sm },
  metaRow: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.md },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { ...typography.caption },
  sectionTitle: { ...typography.h3, marginTop: spacing.xl, marginBottom: spacing.sm },
  desc: { ...typography.body, lineHeight: 22, color: colors.text },
  sellerCard: {
    flexDirection: 'row', alignItems: 'center',
    padding: spacing.md, borderRadius: radius.md,
    backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border,
  },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center',
  },
  sellerName: { ...typography.body, fontWeight: '600' },
  sellerMeta: { ...typography.caption, marginTop: 2 },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: spacing.md,
    padding: spacing.lg, backgroundColor: colors.surface,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  btnSecondary: {
    flex: 1, flexDirection: 'row', gap: spacing.sm,
    borderRadius: radius.md, padding: spacing.md,
    borderWidth: 2, borderColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  btnSecondaryText: { color: colors.primary, fontWeight: '700' },
  btnPrimary: {
    flex: 1, flexDirection: 'row', gap: spacing.sm,
    borderRadius: radius.md, padding: spacing.md,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  btnPrimaryText: { color: 'white', fontWeight: '700' },
});
