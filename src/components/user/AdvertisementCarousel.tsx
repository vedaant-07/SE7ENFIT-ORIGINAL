// AdvertisementCarousel - SE7EN FIT User Dashboard
// Swipeable banner carousel for ads, promotions, offers, and announcements.
// Premium dark UI with neon green accent.

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  Dimensions,
  Animated,
  StyleSheet,
} from 'react-native';
import { Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { ExternalLink, ChevronRight } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/constants/theme';
import type {
  Advertisement,
  AdvertisementBadgeVariant,
} from '@/src/types/advertisement';
import { getBadgeFromType, isAdActive } from '@/src/types/advertisement';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CAROUSEL_WIDTH = SCREEN_WIDTH - spacing.lg * 2;
const CARD_HEIGHT = 140;
const AUTO_SLIDE_INTERVAL = 4000; // 4 seconds

// Badge colors by type
const BADGE_COLORS: Record<AdvertisementBadgeVariant, string> = {
  AD: colors.warning,
  OFFER: colors.success,
  PROMO: '#A78BFA',
  ANNOUNCEMENT: '#38BDF8',
};

type Props = {
  advertisements: Advertisement[];
  onImpression: (adId: string) => void;
  onClick: (adId: string) => void;
};

export default function AdvertisementCarousel({
  advertisements,
  onImpression,
  onClick,
}: Props) {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const autoSlideTimer = useRef<NodeJS.Timeout | null>(null);
  const trackedImpressions = useRef<Set<string>>(new Set());
  const scrollX = useRef(new Animated.Value(0)).current;

  // Filter to only active ads
  const activeAds = advertisements.filter(isAdActive);

  // Auto-slide functionality
  useEffect(() => {
    if (activeAds.length <= 1) return;

    autoSlideTimer.current = setInterval(() => {
      setActiveIndex((prev) => {
        const nextIndex = (prev + 1) % activeAds.length;
        scrollViewRef.current?.scrollTo({
          x: nextIndex * CAROUSEL_WIDTH,
          animated: true,
        });
        return nextIndex;
      });
    }, AUTO_SLIDE_INTERVAL);

    return () => {
      if (autoSlideTimer.current) {
        clearInterval(autoSlideTimer.current);
      }
    };
  }, [activeAds.length]);

  // Track impression when ad becomes visible
  useEffect(() => {
    if (activeAds.length === 0) return;
    const currentAd = activeAds[activeIndex];
    if (currentAd && !trackedImpressions.current.has(currentAd.id)) {
      trackedImpressions.current.add(currentAd.id);
      onImpression(currentAd.id);
    }
  }, [activeIndex, activeAds, onImpression]);

  // Handle manual scroll
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const handleScrollEnd = useCallback(
    (event: any) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / CAROUSEL_WIDTH);
      setActiveIndex(index);
    },
    []
  );

  // Handle CTA press
  const handleCTAPress = useCallback(
    (ad: Advertisement) => {
      onClick(ad.id);
      if (!ad.ctaTarget) return;

      if (ad.ctaTargetType === 'internal_route') {
        router.push(ad.ctaTarget as never);
      } else if (ad.ctaTargetType === 'external_url') {
        Linking.openURL(ad.ctaTarget).catch(() => {
          // Silently fail for invalid URLs
        });
      }
    },
    [onClick, router]
  );

  // Render single advertisement card
  const renderCard = (ad: Advertisement) => {
    const badge = getBadgeFromType(ad.type);
    const badgeColor = BADGE_COLORS[badge];

    return (
      <View
        key={ad.id}
        style={{
          width: CAROUSEL_WIDTH,
          height: CARD_HEIGHT,
        }}
      >
        <View style={styles.cardContainer}>
          {/* Background image or gradient */}
          {ad.imageUrl ? (
            <Image
              source={{ uri: ad.imageUrl }}
              style={styles.backgroundImage}
              resizeMode="cover"
            />
          ) : null}

          {/* Gradient overlay */}
          <View style={styles.gradientOverlay} />

          {/* Content */}
          <View style={styles.contentContainer}>
            {/* Badge */}
            <View style={[styles.badge, { backgroundColor: badgeColor }]}>
              <Text style={styles.badgeText}>{ad.badgeText || badge}</Text>
            </View>

            {/* Title and description */}
            <View style={styles.textContainer}>
              <Text style={styles.title} numberOfLines={2}>
                {ad.title}
              </Text>
              <Text style={styles.description} numberOfLines={2}>
                {ad.description}
              </Text>
            </View>

            {/* CTA Button */}
            {ad.ctaText ? (
              <Pressable
                onPress={() => handleCTAPress(ad)}
                style={({ pressed }) => [
                  styles.ctaButton,
                  { opacity: pressed ? 0.85 : 1 },
                ]}
              >
                <Text style={styles.ctaText}>{ad.ctaText}</Text>
                {ad.ctaTargetType === 'external_url' ? (
                  <ExternalLink size={12} color={colors.background} />
                ) : (
                  <ChevronRight size={12} color={colors.background} />
                )}
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>
    );
  };

  if (activeAds.length === 0) {
    return null; // Hide carousel if no ads
  }

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleScrollEnd}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={CAROUSEL_WIDTH}
        contentContainerStyle={styles.scrollContent}
      >
        {activeAds.map(renderCard)}
      </ScrollView>

      {/* Pagination dots */}
      {activeAds.length > 1 ? (
        <View style={styles.pagination}>
          {activeAds.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === activeIndex && styles.activeDot,
              ]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  cardContainer: {
    flex: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.cardElevated,
    borderWidth: 1,
    borderColor: colors.accentBorder,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(5, 5, 5, 0.75)',
  },
  contentContainer: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontFamily: typography.bodySemibold,
    fontSize: 10,
    color: colors.background,
    letterSpacing: 0.5,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  title: {
    fontFamily: typography.headingBold,
    fontSize: 16,
    color: colors.foreground,
    marginBottom: 4,
  },
  description: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.mutedForeground,
    lineHeight: 16,
  },
  ctaButton: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  ctaText: {
    fontFamily: typography.bodySemibold,
    fontSize: 12,
    color: colors.background,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.muted,
  },
  activeDot: {
    width: 20,
    backgroundColor: colors.accent,
  },
});
