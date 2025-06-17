const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

const suitMapping = {
  'SPADES': '♠',
  'HEARTS': '♥',
  'DIAMONDS': '♦',
  'CLUBS': '♣',
};

const valueMapping = {
  'ACE': 'A', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', 
  '8': '8', '9': '9', '10': '10', 'JACK': 'J', 'QUEEN': 'Q', 'KING': 'K',
};

export function cardToString(card) {
  return `${card.value}${card.suit}`;
}

export function getNextValue(currentValue) {
  const currentIndex = VALUES.indexOf(currentValue);
  return VALUES[(currentIndex + 1) % VALUES.length];
}

export function mapApiCardToGameCard(apiCard) {
  const suit = suitMapping[apiCard.suit];
  const value = valueMapping[apiCard.value];
  return {
    suit,
    value,
    id: `${value}${suit}`,
    image: apiCard.image,
  };
}

