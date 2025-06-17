import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export default function GameOverOverlay({ status, onRestart }) {
  return (
    <View className="absolute inset-0 bg-black/85 justify-center items-center">
      <View className="w-[85%] p-6 bg-[#333] rounded-2xl items-center">
        <Text className="text-3xl text-white font-bold mb-2">Fim de Jogo!</Text>
        <Text className="text-lg text-primary text-center my-4 italic">{status}</Text>
        <TouchableOpacity 
          className="py-4 px-6 rounded-full justify-center items-center min-w-[140px] shadow-lg bg-primary"
          onPress={onRestart}
        >
          <Text className="text-[#333] font-bold text-lg uppercase">Jogar Novamente</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

