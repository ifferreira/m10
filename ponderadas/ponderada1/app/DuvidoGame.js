import React from 'react';
import { View, SafeAreaView, Alert } from 'react-native';
import { useGameLogic } from './hooks/useGameLogic';
import { useAudio } from './hooks/useAudio';
import { PLAYER_HUMAN, PLAYER_BOT1, PLAYER_BOT2, PLAYER_NAMES } from './constants/gameConstants';
import BotDisplay from './components/BotDisplay';
import GameTable from './components/GameTable';
import StatusContainer from './components/StatusContainer';
import PlayerHand from './components/PlayerHand';
import GameActions from './components/GameActions';
import GameOverOverlay from './components/GameOverOverlay';

export default function DuvidoGame() {
  const { playDoubtSound, playLieSound, playTruthSound } = useAudio();
  const {
    hands,
    discardPile,
    currentTurnValue,
    currentPlayer,
    selectedCardIds,
    setSelectedCardIds,
    status,
    lastPlay,
    gameOver,
    startNewGame,
    playCards,
    checkDoubt,
  } = useGameLogic(playDoubtSound, playLieSound, playTruthSound);

  function handlePlayerPlay() {
    if (selectedCardIds.length === 0) {
      Alert.alert("Atenção", "Você precisa selecionar pelo menos uma carta para jogar.");
      return;
    }
    const cardsToPlay = hands[PLAYER_HUMAN].filter(card => selectedCardIds.includes(card.id));
    playCards(PLAYER_HUMAN, cardsToPlay, currentTurnValue);
  }

  function handlePlayerDoubt() {
    if (!lastPlay) {
      Alert.alert("Atenção", "Não há nenhuma jogada anterior para duvidar.");
      return;
    }
    checkDoubt(PLAYER_HUMAN);
  }

  function handleCardPress(cardId) {
    setSelectedCardIds(prev =>
      prev.includes(cardId) ? prev.filter(id => id !== cardId) : [...prev, cardId]
    );
  }

  const playerHand = hands[PLAYER_HUMAN];

  return (
    <SafeAreaView className="flex-1 bg-background p-4">
      <View className="flex-row justify-around mt-6 mb-4">
        <BotDisplay name={PLAYER_NAMES[PLAYER_BOT1]} cardCount={hands[PLAYER_BOT1].length} />
        <BotDisplay name={PLAYER_NAMES[PLAYER_BOT2]} cardCount={hands[PLAYER_BOT2].length} />
      </View>

      <GameTable discardPileLength={discardPile.length} currentTurnValue={currentTurnValue} />

      <View className="flex-1">
        <StatusContainer status={status} />
        <PlayerHand
          hand={playerHand}
          selectedCardIds={selectedCardIds}
          onCardPress={handleCardPress}
        />
        <GameActions
          onDoubt={handlePlayerDoubt}
          onPlay={handlePlayerPlay}
          doubtDisabled={currentPlayer !== PLAYER_HUMAN || !lastPlay}
          playDisabled={currentPlayer !== PLAYER_HUMAN}
          selectedCount={selectedCardIds.length}
        />
      </View>

      {gameOver && <GameOverOverlay status={status} onRestart={startNewGame} />}
    </SafeAreaView>
  );
}



