from sqlalchemy.orm import Session
from . import models, schemas

# Funções de busca (Read)
def get_achievement_by_code(db: Session, code: str):
    return db.query(models.Achievement).filter(models.Achievement.code == code).first()

def get_all_achievements(db: Session):
    return db.query(models.Achievement).all()

def get_user_achievements(db: Session, user_id: str):
    return db.query(models.UserAchievement).filter(models.UserAchievement.user_id == user_id).all()

def get_all_user_achievements(db: Session):
    return db.query(models.UserAchievement).all()

# Função de criação (Create)
def create_user_achievement(db: Session, user_id: str, achievement_id: int):
    # Primeiro, verifica se a conquista já existe para evitar duplicação
    existing_ua = db.query(models.UserAchievement).filter_by(user_id=user_id, achievement_id=achievement_id).first()
    if existing_ua:
        return existing_ua # Retorna a existente se já foi desbloqueada

    db_user_achievement = models.UserAchievement(user_id=user_id, achievement_id=achievement_id)
    db.add(db_user_achievement)
    db.commit()
    db.refresh(db_user_achievement)
    return db_user_achievement

 