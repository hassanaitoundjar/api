import React, { useState } from 'react';
import { TextInput, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Colors from '../../constants/Colors';
import { FontAwesome } from '@expo/vector-icons';

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'url';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  error,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoCorrect = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[
        styles.inputContainer,
        isFocused && styles.focusedInput,
        error && styles.errorInput
      ]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.dark.textSecondary}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          selectionColor={Colors.dark.accent}
        />
        {secureTextEntry && (
          <TouchableOpacity 
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.eyeIcon}
          >
            <FontAwesome 
              name={isPasswordVisible ? 'eye' : 'eye-slash'} 
              size={18} 
              color={Colors.dark.textSecondary} 
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    color: Colors.dark.textPrimary,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.inputBackground,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: 6,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: 12,
    color: Colors.dark.textPrimary,
    fontSize: 16,
  },
  focusedInput: {
    borderColor: Colors.dark.accent,
  },
  errorInput: {
    borderColor: Colors.dark.error,
  },
  errorText: {
    color: Colors.dark.error,
    fontSize: 12,
    marginTop: 4,
  },
  eyeIcon: {
    paddingHorizontal: 12,
  },
});

export default Input; 