import { useState, useEffect } from 'react';
import { getNextValue, mapApiCardToGameCard } from '../utils/cardUtils';
import { PLAYER_HUMAN, PLAYERS, PLAYER_NAMES } from '../constants/gameConstants';
import { createNewShuffledDeck, drawCards } from '../utils/deckOfCardsAPI';
import { ACHIEVEMENTS } from '../constants/achievementConstants';
import { unlockAchievement } from '../utils/achievementAPI';
import { ENV } from '../env';

export function useGameLogic(playDoubtSound, playLieSound, playTruthSound, userId, token, apiBaseUrl) {
  const [hands, setHands] = useState([[], [], []]);
  const [discardPile, setDiscardPile] = useState([]);
  const [currentTurnValue, setCurrentTurnValue] = useState('A');
  const [currentPlayer, setCurrentPlayer] = useState(PLAYER_HUMAN);
  const [selectedCardIds, setSelectedCardIds] = useState([]);
  const [status, setStatus] = useState('');
  const [lastPlay, setLastPlay] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [turnCount, setTurnCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLied, setHasLied] = useState(false);
  const [liedAllGame, setLiedAllGame] = useState(true);
  const [neverLied, setNeverLied] = useState(true);
  const [firstLieUnlocked, setFirstLieUnlocked] = useState(false);
  const [caraDePauUnlocked, setCaraDePauUnlocked] = useState(false);

  useEffect(() => {
    startNewGame();
  }, []);

  useEffect(() => {
    if (currentPlayer !== PLAYER_HUMAN && !gameOver) {
      const botTurnTimeout = setTimeout(handleBotTurn, 2000);
      return () => clearTimeout(botTurnTimeout);
    }
  }, [currentPlayer, gameOver, turnCount]);

  const distributeCards = (cards) => {
    const newHands = [[], [], []];
    cards.forEach((card, index) => {
      newHands[index % PLAYERS.length].push(card);
    });
    return newHands;
  };

  const resetGameState = () => {
    setDiscardPile([]);
    setCurrentTurnValue('A');
    setCurrentPlayer(PLAYER_HUMAN);
    setSelectedCardIds([]);
    setLastPlay(null);
    setGameOver(false);
    setTurnCount(0);
    setStatus('Jogo iniciado! Jogue seus "Ases" (A).');
    setHasLied(false);
    setLiedAllGame(true);
    setNeverLied(true);
    setFirstLieUnlocked(false);
    setCaraDePauUnlocked(false);
  };

  async function startNewGame() {
    setIsLoading(true);
    try {
      const deckId = await createNewShuffledDeck();
      if (deckId) {
        const apiCards = await drawCards(deckId, 52);
        const gameCards = apiCards.map(mapApiCardToGameCard);
        setHands(distributeCards(gameCards));
        resetGameState();
      }
    } catch (error) {
      console.error('Erro ao iniciar o jogo:', error);
      setStatus('Erro ao iniciar o jogo. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }

  function playCards(playerIndex, cards, claimedValue) {
    const newHand = hands[playerIndex].filter(card => !cards.find(playedCard => playedCard.id === card.id));
    const newHands = [...hands];
    newHands[playerIndex] = newHand;
    setHands(newHands);
    setDiscardPile(prevPile => [...prevPile, ...cards]);
    setLastPlay({ player: playerIndex, cards, claimedValue });
    setSelectedCardIds([]);

    const isLie = cards.some(card => card.value !== claimedValue);
    if (playerIndex === PLAYER_HUMAN) {
      if (isLie) {
        setHasLied(true);
        setNeverLied(false);
        if (!firstLieUnlocked) {
          unlockAchievement({
            token,
            achievementCode: ACHIEVEMENTS.PRIMEIRA_MENTIRA,
            apiBaseUrl
          });
          setFirstLieUnlocked(true);
        }
        if (cards.length >= 4 && !caraDePauUnlocked) {
          unlockAchievement({
            token,
            achievementCode: ACHIEVEMENTS.CARA_DE_PAU,
            apiBaseUrl
          });
          setCaraDePauUnlocked(true);
        }
      } else {
        setLiedAllGame(false);
      }
    }

    if (newHand.length === 0) {
      setGameOver(true);
      setStatus(`${PLAYER_NAMES[playerIndex]} venceu o jogo!`);
      if (playerIndex === PLAYER_HUMAN) {
        if (hands[PLAYER_HUMAN].length === 1) {
          unlockAchievement({
            token,
            achievementCode: ACHIEVEMENTS.POR_UM_FIO,
            apiBaseUrl
          });
        }
        if (neverLied) {
          unlockAchievement({
            token,
            achievementCode: ACHIEVEMENTS.HONESTIDADE_BRUTAL,
            apiBaseUrl
          });
        }
        if (liedAllGame) {
          unlockAchievement({
            token,
            achievementCode: ACHIEVEMENTS.MESTRE_DO_BLEFE,
            apiBaseUrl
          });
        }
      }
      return;
    }

    const nextPlayer = (playerIndex + 1) % PLAYERS.length;
    setCurrentPlayer(nextPlayer);
    setCurrentTurnValue(getNextValue(claimedValue));
    setStatus(`${PLAYER_NAMES[playerIndex]} jogou ${cards.length} carta(s). Vez de ${PLAYER_NAMES[nextPlayer]} jogar.`);
    setTurnCount(c => c + 1);
  }

  async function checkDoubt(doubtingPlayerIndex) {
    await playDoubtSound();
    const lastPlayerIndex = lastPlay.player;
    const wasLying = lastPlay.cards.some(card => card.value !== lastPlay.claimedValue);
    const loserIndex = wasLying ? lastPlayerIndex : doubtingPlayerIndex;

    setStatus(`${PLAYER_NAMES[doubtingPlayerIndex]} duvidou!`);

    await new Promise(resolve => setTimeout(resolve, 4000));

    if (wasLying) {
      await playLieSound();
      setStatus(`${PLAYER_NAMES[lastPlayerIndex]} mentiu!`);
    } else {
      await playTruthSound();
      setStatus(`${PLAYER_NAMES[lastPlayerIndex]} falou a verdade!`);
    }

    await new Promise(resolve => setTimeout(resolve, 3000));

    const newHands = [...hands];
    newHands[loserIndex] = [...newHands[loserIndex], ...discardPile];
    setHands(newHands);
    setDiscardPile([]);
    setLastPlay(null);
    setStatus(`${PLAYER_NAMES[loserIndex]} pegou o monte!`);
    setCurrentPlayer(loserIndex);
    setCurrentTurnValue('A');
    setTurnCount(c => c + 1);

    if (
      doubtingPlayerIndex === PLAYER_HUMAN &&
      lastPlay &&
      lastPlay.player !== PLAYER_HUMAN &&
      wasLying &&
      lastPlay.cards.length >= 3
    ) {
      unlockAchievement({
        token,
        achievementCode: ACHIEVEMENTS.DETETIVE,
        apiBaseUrl
      });
    }
  }

  function handleBotTurn() {
    const botIndex = currentPlayer;
    const botHand = hands[botIndex];
    const cardsOfCurrentValue = botHand.filter(card => card.value === currentTurnValue);
    
    if (lastPlay) {
      const lastPlayerIndex = lastPlay.player;
      const lastPlayerCards = lastPlay.cards;
      const claimedValue = lastPlay.claimedValue;
      
      let doubtProbability = 0.3;
      
      if (lastPlayerCards.length > 2) {
        doubtProbability += 0.2;
      }
      
      if (lastPlayerCards.lenght > 4) {
        doubtProbability += 1.0;
      }

      const lastPlayerHandSize = hands[lastPlayerIndex].length;
      if (lastPlayerHandSize <= 3) {
        doubtProbability += 0.15;
      }
      
      const botHasClaimedCards = botHand.filter(card => card.value === claimedValue).length;
      if (botHasClaimedCards > 0) {
        doubtProbability += 0.25;
      }
      
      if (botHand.length <= 3) {
        doubtProbability -= 0.1;
      }
      
      if (Math.random() < doubtProbability) {
        checkDoubt(botIndex);
        return;
      }
    }

    let cardsToPlay = [];
    
    if (cardsOfCurrentValue.length > 0) {
      if (botHand.length <= 4) {
        cardsToPlay = cardsOfCurrentValue;
      } else {
        const maxCards = Math.min(cardsOfCurrentValue.length, Math.ceil(botHand.length / 4));
        const numCards = Math.floor(Math.random() * maxCards) + 1;
        cardsToPlay = cardsOfCurrentValue.slice(0, numCards);
      }
    } else {
      const maxCards = Math.min(botHand.length, Math.ceil(botHand.length / 3));
      const numCards = Math.floor(Math.random() * maxCards) + 1;
      cardsToPlay = botHand.slice(0, numCards);
    }

    playCards(botIndex, cardsToPlay, currentTurnValue);
  }

  return {
    hands,
    discardPile,
    currentTurnValue,
    currentPlayer,
    selectedCardIds,
    setSelectedCardIds,
    status,
    lastPlay,
    gameOver,
    turnCount,
    startNewGame,
    playCards,
    checkDoubt,
    isLoading,
  };
}

