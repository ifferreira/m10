import React from 'react';
import { View, Text } from 'react-native';

export default function GameTable({ discardPileLength, currentTurnValue }) {
  return (
    <View className="flex-row justify-around items-center my-6">
      <View className="items-center justify-center w-[120px] h-[160px] bg-black/20 rounded-xl border-2 border-dashed border-white/10">
        <Text className="text-textSecondary font-bold">DESCARTE</Text>
        <Text className="text-text text-2xl font-bold mt-2">{discardPileLength}</Text>
      </View>
      <View className="items-center">
        <Text className="text-textSecondary text-sm font-semibold">CARTA DA VEZ</Text>
        <Text className="text-3xl font-bold text-primary">"{currentTurnValue}"</Text>
      </View>
    </View>
  );
}
