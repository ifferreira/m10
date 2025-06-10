import React from 'react';
import { View, Text } from 'react-native';

export default function StatusContainer({ status }) {
  return (
    <View className="bg-black/80 p-4 rounded-xl mx-6 my-2 items-center justify-center shadow-2xl border-2 border-primary/30 h-[80px]">
      <Text className="text-base text-primary font-bold text-center tracking-wide">
        {status}
      </Text>
    </View>
  );
}

