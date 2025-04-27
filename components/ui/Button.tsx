import React from 'react';
import { Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
import Colors from '../../constants/Colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  isLoading = false,
  variant = 'primary',
  disabled = false,
  fullWidth = false,
}) => {
  const getBackgroundColor = () => {
    if (disabled) return Colors.dark.buttonDisabled;
    
    switch (variant) {
      case 'primary':
        return Colors.dark.buttonPrimary;
      case 'secondary':
        return Colors.dark.buttonSecondary;
      case 'outline':
        return 'transparent';
      default:
        return Colors.dark.buttonPrimary;
    }
  };

  const getTextColor = () => {
    if (disabled) return Colors.dark.textSecondary;
    
    switch (variant) {
      case 'outline':
        return Colors.dark.textPrimary;
      default:
        return Colors.dark.textPrimary;
    }
  };

  const getBorderColor = () => {
    return variant === 'outline' ? Colors.dark.border : 'transparent';
  };

  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        { backgroundColor: getBackgroundColor(), borderColor: getBorderColor() },
        fullWidth && styles.fullWidth,
        variant === 'outline' && styles.outlineButton
      ]}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.7}
    >
      {variant === 'outline' && (
        <BlurView intensity={20} style={styles.blurView} />
      )}
      
      {isLoading ? (
        <ActivityIndicator color={Colors.dark.textPrimary} />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  outlineButton: {
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  blurView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  fullWidth: {
    width: '100%',
  },
});

export default Button; 