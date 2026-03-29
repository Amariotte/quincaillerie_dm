import { useAppTheme } from '@/hooks/use-app-theme';
import React, { useEffect } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  marginBottom?: number;
  marginRight?: number;
  style?: any;
}

export function SkeletonLoader({
  width = '100%',
  height = 16,
  borderRadius = 8,
  marginBottom = 0,
  marginRight = 0,
  style
}: SkeletonProps) {
  const { cardColor, mutedColor } = useAppTheme();
  const shimmerAnim = new Animated.Value(0);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          backgroundColor: cardColor,
          borderRadius,
          marginBottom,
          marginRight,
          opacity,
        },
        style,
      ]}
    />
  );
}

interface SkeletonCardProps {
  width?: number | string;
  height?: number | string;
  lines?: number;
  style?: any;
}

export function SkeletonCard({ width = '100%', height = 120, lines = 2, style }: SkeletonCardProps) {
  const { cardColor } = useAppTheme();

  return (
    <View style={[styles.skeletonCard, { backgroundColor: cardColor }, style]}>
      {Array.from({ length: lines }).map((_, index) => (
        <SkeletonLoader
          key={index}
          width="100%"
          height={index === 0 ? 16 : 12}
          marginBottom={index < lines - 1 ? 10 : 0}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  skeletonCard: {
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
});
