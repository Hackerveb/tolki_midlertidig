import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import Svg, { Polyline } from 'react-native-svg';
import { Language } from '../types';
import { languages } from '../constants/languages';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { shadows } from '../styles/shadows';
import { radius, spacing } from '../styles/global';

interface LanguageDropdownProps {
  selectedLanguage: Language;
  onLanguageSelect: (language: Language) => void;
  placeholder?: string;
  dropDirection?: 'up' | 'down';
}

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

const DropdownArrow = ({ rotation }: { rotation: Animated.AnimatedInterpolation<string | number> }) => (
  <AnimatedSvg 
    width="12" 
    height="12" 
    viewBox="0 0 24 24" 
    fill="none"
    style={{ transform: [{ rotate: rotation }] }}
  >
    <Polyline 
      points="6 9 12 15 18 9" 
      stroke={colors.foreground} 
      strokeWidth={2}
    />
  </AnimatedSvg>
);

export const LanguageDropdown: React.FC<LanguageDropdownProps> = ({
  selectedLanguage,
  onLanguageSelect,
  dropDirection = 'up', // Default to 'up' for backwards compatibility
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownAnim = useRef(new Animated.Value(0)).current;
  const arrowRotate = useRef(new Animated.Value(0)).current;
  const [dropdownHeight, setDropdownHeight] = useState(0);

  useEffect(() => {
    // Calculate dropdown height based on number of languages (max 10 visible)
    const itemHeight = 45; // padding + text height + border
    const maxVisible = 10;
    const visibleItems = Math.min(languages.length, maxVisible);
    setDropdownHeight(itemHeight * visibleItems);
  }, []);

  const toggleDropdown = () => {
    if (isOpen) {
      // Close animation
      Animated.parallel([
        Animated.timing(dropdownAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(arrowRotate, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsOpen(false);
      });
    } else {
      // Open animation with bounce
      setIsOpen(true);
      Animated.parallel([
        Animated.spring(dropdownAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(arrowRotate, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handleLanguageSelect = (language: Language) => {
    // Add loading state simulation like in HTML
    setTimeout(() => {
      onLanguageSelect(language);
      toggleDropdown();
    }, 300);
  };

  const rotation = arrowRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const dropdownTranslateY = dropdownAnim.interpolate({
    inputRange: [0, 0.6, 1],
    outputRange: dropDirection === 'down'
      ? [-10, 2, 0]  // Drop down animation
      : [10, -2, 0], // Drop up animation
  });

  const dropdownScale = dropdownAnim.interpolate({
    inputRange: [0, 0.6, 1],
    outputRange: [0.95, 1.02, 1],
  });

  return (
    <View style={styles.dropdownWrapper}>
      <Pressable
        onPress={toggleDropdown}
        style={({ pressed }) => [
          styles.dropdownToggle,
          isOpen && styles.dropdownToggleActive,
        ]}
      >
        <Text style={styles.languageName}>{selectedLanguage.name}</Text>
        <DropdownArrow rotation={rotation} />
      </Pressable>

      {isOpen && (
        <Animated.View
          style={[
            styles.dropdownMenu,
            dropDirection === 'down' ? styles.dropdownMenuDown : styles.dropdownMenuUp,
            {
              opacity: dropdownAnim,
              transform: [
                { translateY: dropdownTranslateY },
                { scale: dropdownScale },
              ],
              maxHeight: dropdownHeight,
            },
          ]}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            bounces={false}
            style={styles.dropdownScroll}
          >
            {languages.map((language, index) => (
              <Pressable
                key={language.code}
                onPress={() => handleLanguageSelect(language)}
                style={({ pressed }) => [
                  styles.dropdownItem,
                  pressed && styles.dropdownItemHover,
                ]}
              >
                {({ pressed }) => (
                  <>
                    <Animated.View style={[
                      styles.dropdownItemIndicator,
                      pressed && styles.dropdownItemIndicatorActive,
                    ]} />
                    <Text style={styles.dropdownItemText}>{language.name}</Text>
                  </>
                )}
              </Pressable>
            ))}
          </ScrollView>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  dropdownWrapper: {
    position: 'relative' as 'relative',
    flex: 1,
    zIndex: 9999, // Increased z-index
  },
  dropdownToggle: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.background,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...shadows.subtle,
  },
  dropdownToggleActive: {
    ...shadows.pressed,
  },
  languageName: {
    ...typography.body,
    color: colors.foreground,
    fontSize: 14,
  },
  dropdownMenu: {
    position: 'absolute' as 'absolute',
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    borderRadius: 16,
    overflow: 'hidden',
    ...shadows.elevated,
    ...Platform.select({
      ios: {
        zIndex: 9999, // Increased z-index
      },
      android: {
        elevation: 999, // Increased elevation
      },
    }),
  },
  dropdownMenuUp: {
    bottom: 50,
  },
  dropdownMenuDown: {
    top: 50,
  },
  dropdownScroll: {
    maxHeight: 450,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: colors.silverAlpha(0.2),
  },
  dropdownItemHover: {
    backgroundColor: colors.blueAlpha(0.1),
    paddingLeft: 24,
  },
  dropdownItemIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: colors.blueMunsell,
    transform: [{ translateX: -3 }],
  },
  dropdownItemIndicatorActive: {
    transform: [{ translateX: 0 }],
  },
  dropdownItemText: {
    ...typography.body,
    color: colors.foreground,
    fontSize: 14,
  },
});