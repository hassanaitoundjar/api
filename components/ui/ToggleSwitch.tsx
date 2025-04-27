import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import Colors from '../../constants/Colors';
import * as Haptics from 'expo-haptics';

interface ToggleSwitchProps {
  options: string[];
  selectedIndex: number;
  onToggle: (index: number) => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  options,
  selectedIndex,
  onToggle,
}) => {
  const handleToggle = (index: number) => {
    try {
      Haptics?.impactAsync?.(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.log('Haptics not available');
    }
    onToggle(index);
  };

  return (
    <View style={styles.container}>
      <View style={styles.toggleContainer}>
        <View style={[
          styles.toggleIndicator, 
          { 
            width: `${100 / options.length}%`,
            left: `${(100 / options.length) * selectedIndex}%`,
          }
        ]} />
        
        {options.map((option, index) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.toggleOption,
              { width: `${100 / options.length}%` },
            ]}
            onPress={() => handleToggle(index)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.toggleText,
                selectedIndex === index && styles.activeToggleText,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 24,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: 8,
    height: 44,
    position: 'relative',
    overflow: 'hidden',
  },
  toggleOption: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    height: '100%',
  },
  toggleIndicator: {
    position: 'absolute',
    height: '100%',
    backgroundColor: Colors.dark.backgroundTertiary,
    borderRadius: 8,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.dark.textSecondary,
  },
  activeToggleText: {
    color: Colors.dark.textPrimary,
    fontWeight: '600',
  },
});

export default ToggleSwitch; 