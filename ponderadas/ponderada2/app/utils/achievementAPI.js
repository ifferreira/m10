// Função para registrar conquista no backend
export async function unlockAchievement({ token, achievementCode, apiBaseUrl }) {
  try {
    const res = await fetch(`${apiBaseUrl}/users/me/achievements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ achievement_code: achievementCode })
    });
    return await res.json();
  } catch (e) {
    // É bom manter um log aqui para depuração, mesmo que silencioso para o usuário
    console.error('Falha ao registrar conquista:', e);
    return { error: true, message: e.message };
  }
}

// Função para buscar as conquistas desbloqueadas do usuário
export async function getMyAchievements({ token, apiBaseUrl }) {
  try {
    const res = await fetch(`${apiBaseUrl}/users/me/achievements`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Falha ao buscar conquistas do usuário.');
    return await res.json();
  } catch (e) {
    console.error('Erro em getMyAchievements:', e);
    return []; // Retorna array vazio em caso de erro
  }
}

// Função para buscar todas as conquistas possíveis
export async function getAllAchievements({ apiBaseUrl }) {
  try {
    const res = await fetch(`${apiBaseUrl}/achievements`, {
      method: 'GET',
    });
    if (!res.ok) throw new Error('Falha ao buscar todas as conquistas.');
    return await res.json();
  } catch (e) {
    console.error('Erro em getAllAchievements:', e);
    return []; // Retorna array vazio em caso de erro
  }
} 