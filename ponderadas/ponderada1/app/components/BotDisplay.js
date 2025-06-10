import React from 'react';
import { View, Text } from 'react-native';

export default function BotDisplay({ name, cardCount }) {
  return (
    <View className="items-center p-2 min-w-[100px] bg-black/20 rounded-lg py-4 mt-[40px]">
      <Text className="text-text font-bold text-base mb-2">{name}</Text>
      <Text className="text-textSecondary text-sm">{cardCount} cartas</Text>
    </View>
  );
}

