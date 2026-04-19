import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography, formatFCFA } from '../theme/colors';

export default function ProductCard({ product, onPress, width }) {
  const img = product.images?.[0]?.url;
  return (
    <TouchableOpacity style={[styles.card, width && { width }]} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.imageWrap}>
        {img ? (
          <Image source={{ uri: img }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <Ionicons name="image-outline" size={32} color={colors.textMuted} />
          </View>
        )}
        {product.isPromoted && <View style={styles.promoBadge}><Text style={styles.promoText}>🔥</Text></View>}
      </View>
      <View style={styles.body}>
        <Text numberOfLines={1} style={styles.title}>{product.title}</Text>
        <Text style={styles.price}>{formatFCFA(product.price)}</Text>
        <View style={styles.meta}>
          <Ionicons name="location-outline" size={12} color={colors.textMuted} />
          <Text style={styles.metaText}>{product.city}</Text>
          {product.seller?.ratingAvg > 0 && (
            <>
              <Text style={styles.dot}> · </Text>
              <Ionicons name="star" size={12} color={colors.accent} />
              <Text style={styles.metaText}>{product.seller.ratingAvg.toFixed(1)}</Text>
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: 'hidden',
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  imageWrap: { position: 'relative' },
  image: { width: '100%', aspectRatio: 1, backgroundColor: colors.border },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  promoBadge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: colors.accent, borderRadius: radius.pill,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  promoText: { fontSize: 12 },
  body: { padding: spacing.md },
  title: { ...typography.body, fontWeight: '600' },
  price: { ...typography.h3, color: colors.primary, marginTop: 2 },
  meta: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  metaText: { ...typography.caption, marginLeft: 2 },
  dot: { ...typography.caption },
});
