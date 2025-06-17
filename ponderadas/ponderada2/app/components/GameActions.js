import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export default function GameActions({ onDoubt, onPlay, doubtDisabled, playDisabled, selectedCount }) {
  return (
    <View className="flex-row justify-around w-full mt-[28px]">
      <TouchableOpacity
        className={`py-4 px-6 rounded-full justify-center items-center min-w-[140px] shadow-lg ${doubtDisabled ? 'bg-disabled opacity-70' : 'bg-doubt'}`}
        onPress={onDoubt}
        disabled={doubtDisabled}
      >
        <Text className="text-white font-bold text-lg uppercase">DUVIDO!</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className={`py-4 px-6 rounded-full justify-center items-center min-w-[140px] shadow-lg ${playDisabled ? 'bg-disabled opacity-70' : 'bg-play'}`}
        onPress={onPlay}
        disabled={playDisabled}
      >
        <Text className="text-white font-bold text-lg uppercase">
          {selectedCount > 0 ? `JOGAR (${selectedCount})` : 'JOGAR'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}


