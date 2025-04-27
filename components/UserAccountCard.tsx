import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { UserAccount } from '../types';

interface UserAccountCardProps {
  account: UserAccount;
  onSelect: (account: UserAccount) => void;
  onDelete: (accountId: string) => void;
}

const UserAccountCard: React.FC<UserAccountCardProps> = ({
  account,
  onSelect,
  onDelete,
}) => {
  const handleDelete = () => {
    Alert.alert(
      'Delete Account',
      `Are you sure you want to delete ${account.playlistName}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => onDelete(account.id),
          style: 'destructive',
        },
      ],
    );
  };

  const getAccountTypeIcon = () => {
    switch (account.type) {
      case 'xtream':
        return <FontAwesome5 name="server" size={16} color={Colors.dark.textPrimary} />;
      case 'm3u':
        return <FontAwesome5 name="link" size={16} color={Colors.dark.textPrimary} />;
      default:
        return null;
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onSelect(account)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        {getAccountTypeIcon()}
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{account.playlistName}</Text>
        <Text style={styles.details} numberOfLines={1} ellipsizeMode="middle">
          {account.type === 'xtream' 
            ? `${account.serverUrl?.slice(0, 30)}...` 
            : `${account.m3uUrl?.slice(0, 30)}...`}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={handleDelete}
        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
      >
        <MaterialIcons name="delete-outline" size={22} color={Colors.dark.textSecondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.dark.backgroundTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.textPrimary,
    marginBottom: 4,
  },
  details: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  deleteButton: {
    padding: 4,
  },
});

export default UserAccountCard; 