// AdvertisementCarousel - SE7EN FIT User Dashboard
// Safe swipeable banner carousel for ads, promotions, offers, and announcements.

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  Dimensions,
  Animated,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ExternalLink, ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import type { Advertisement, AdvertisementBadgeVariant } from '@/src/types/advertisement';
import { getBadgeFromType, isAdActive } from '@/src/types/advertisement';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_SIDE_PADDING = 24;
const CAROUSEL_WIDTH = SCREEN_WIDTH - CARD_SIDE_PADDING * 2;
const CARD_HEIGHT = 140;
const AUTO_SLIDE_INTERVAL = 4000;

const BADGE_COLORS: Record<AdvertisementBadgeVariant, string> = {
  AD: '#F5A623',
  OFFER: '#29E06B',
  PROMO: '#A78BFA',
  ANNOUNCEMENT: '#38BDF8',
};

type Props = {
  advertisements: Advertisement[];
  onImpression: (adId: string) => void;
  onClick: (adId: string) => void;
};

export default function AdvertisementCarousel({ advertisements, onImpression, onClick }: Props) {
  const { colors, radius, spacing, typography } = useTheme();
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const autoSlideTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const trackedImpressions = useRef<Set<string>>(new Set());
  const scrollX = useRef(new Animated.Value(0)).current;

  const activeAds = advertisements.filter(isAdActive);

  useEffect(() => {
    if (activeAds.length <= 1) return undefined;

    autoSlideTimer.current = setInterval(() => {
      setActiveIndex((prev) => {
        const nextIndex = (prev + 1) % activeAds.length;
        scrollViewRef.current?.scrollTo({ x: nextIndex * CAROUSEL_WIDTH, animated: true });
        return nextIndex;
      });
    }, AUTO_SLIDE_INTERVAL);

    return () => {
      if (autoSlideTimer.current) clearInterval(autoSlideTimer.current);
    };
  }, [activeAds.length]);

  useEffect(() => {
    if (activeAds.length === 0) return;
    const currentAd = activeAds[activeIndex];
    if (currentAd && !trackedImpressions.current.has(currentAd.id)) {
      trackedImpressions.current.add(currentAd.id);
      onImpression(currentAd.id);
    }
  }, [activeIndex, activeAds, onImpression]);

  const handleScroll = Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false });

  const handleScrollEnd = useCallback((event: { nativeEvent: { contentOffset: { x: number } } }) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / CAROUSEL_WIDTH);
    setActiveIndex(index);
  }, []);

  const handleCTAPress = useCallback(
    (ad: Advertisement) => {
      onClick(ad.id);
      if (!ad.ctaTarget) return;
      if (ad.ctaTargetType === 'internal_route') {
        router.push(ad.ctaTarget as never);
      } else if (ad.ctaTargetType === 'external_url') {
        Linking.openURL(ad.ctaTarget).catch(() => undefined);
      }
    },
    [onClick, router],
  );

  if (activeAds.length === 0) return null;

  return (
    <View style={{ marginBottom: spacing.lg }}>
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
        contentContainerStyle={{ paddingHorizontal: CARD_SIDE_PADDING }}
      >
        {activeAds.map((ad) => {
          const badge = getBadgeFromType(ad.type);
          const badgeColor = BADGE_COLORS[badge];

          return (
            <View key={ad.id} style={{ width: CAROUSEL_WIDTH, height: CARD_HEIGHT }}>
              <View
                style={{
                  flex: 1,
                  borderRadius: radius.lg,
                  overflow: 'hidden',
                  backgroundColor: colors.cardElevated,
                  borderWidth: 1,
                  borderColor: colors.accentBorder,
                }}
              >
                {ad.imageUrl ? (
                  <Image source={{ uri: ad.imageUrl }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} resizeMode="cover" />
                ) : null}
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(5, 5, 5, 0.75)' }} />
                <View style={{ flex: 1, padding: spacing.md, justifyContent: 'space-between' }}>
                  <View style={{ alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, backgroundColor: badgeColor }}>
                    <Text style={{ fontFamily: typography.bodySemibold, fontSize: 10, color: colors.background, letterSpacing: 0.5 }}>
                      {ad.badgeText || badge}
                    </Text>
                  </View>

                  <View style={{ flex: 1, justifyContent: 'flex-end', paddingRight: ad.ctaText ? 95 : 0 }}>
                    <Text style={{ fontFamily: typography.headingBold, fontSize: 16, color: colors.foreground, marginBottom: 4 }} numberOfLines={2}>
                      {ad.title}
                    </Text>
                    <Text style={{ fontFamily: typography.body, fontSize: 12, color: colors.mutedForeground, lineHeight: 16 }} numberOfLines={2}>
                      {ad.description}
                    </Text>
                  </View>

                  {ad.ctaText ? (
                    <Pressable
                      onPress={() => handleCTAPress(ad)}
                      style={({ pressed }) => ({
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
                        opacity: pressed ? 0.85 : 1,
                      })}
                    >
                      <Text style={{ fontFamily: typography.bodySemibold, fontSize: 12, color: colors.background }}>{ad.ctaText}</Text>
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
        })}
      </ScrollView>

      {activeAds.length > 1 ? (
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: spacing.sm, gap: 6 }}>
          {activeAds.map((_, index) => (
            <View
              key={index}
              style={{
                width: index === activeIndex ? 20 : 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: index === activeIndex ? colors.accent : colors.muted,
              }}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}
