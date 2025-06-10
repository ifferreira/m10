const API_BASE_URL = 'https://deckofcardsapi.com/api/deck';

export async function createNewShuffledDeck() {
  try {
    const response = await fetch(`${API_BASE_URL}/new/shuffle/?deck_count=1`);
    const data = await response.json();
    if (data.success) {
      return data.deck_id;
    }
    throw new Error('Falha ao criar o baralho.');
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function drawCards(deckId, count) {
  try {
    const response = await fetch(`${API_BASE_URL}/${deckId}/draw/?count=${count}`);
    const data = await response.json();
    if (data.success) {
      return data.cards;
    }
    throw new Error('Falha ao comprar cartas.');
  } catch (error) {
    console.error(error);
    return [];
  }
} 
