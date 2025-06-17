import React, { useState, useEffect } from 'react';
import { Text, FlatList, TouchableOpacity, View, Image, Dimensions } from 'react-native';

export default function PlayerHand({ hand, selectedCardIds, onCardPress }) {
  const [imageErrors, setImageErrors] = useState({});
  const [numColumns, setNumColumns] = useState(4);

  useEffect(() => {
    const { width } = Dimensions.get('window');
    if (width < 360) {
      setNumColumns(3);
    } else if (width < 480) {
      setNumColumns(4);
    } else {
      setNumColumns(5);
    }
  }, []);

  const handleImageError = (cardId) => {
    setImageErrors(prev => ({ ...prev, [cardId]: true }));
  };

  return (
    <>
      <Text className="text-text font-bold text-center text-base mb-[0px] mt-[10px]">Sua Mão ({hand.length} cartas)</Text>
      <View className="h-[200px] overflow-hidden mt-[9px]">
        <FlatList
          key={numColumns}
          data={hand}
          numColumns={numColumns}
          contentContainerStyle={{ alignItems: 'center' }}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => onCardPress(item.id)} className="m-1">
              <View className={`w-20 h-28 bg-cardBg rounded-lg justify-center items-center shadow-md ${selectedCardIds.includes(item.id) ? 'border-3 border-primary -translate-y-4' : ''}`}>
                {!imageErrors[item.id] ? (
                  <Image 
                    source={{ uri: item.image }} 
                    className="w-full h-full"
                    resizeMode="contain"
                    onError={() => handleImageError(item.id)}
                  />
                ) : (
                  <Text className="text-xl font-bold text-cardText">{item.value}{item.suit}</Text>
                )}
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text className="text-textSecondary text-center w-full">Sem cartas</Text>}
        />
      </View>
    </>
  );
}
