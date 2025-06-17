from pydantic import BaseModel
from typing import List

# Schema para exibir uma conquista
class AchievementSchema(BaseModel):
    id: int
    code: str
    name: str
    description: str

    class Config:
        from_attributes = True

# Schema para a requisição de desbloqueio
class AchievementUnlockRequest(BaseModel):
    achievement_code: str

# Schema para a resposta do admin
class UserAchievementDetail(BaseModel):
    user_id: str
    achievement_code: str
    achievement_name: str
    achievement_description: str 