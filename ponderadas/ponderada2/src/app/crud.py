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

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

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

def create_user(db: Session, email: str, otp_secret: str = None):
    db_user = models.User(email=email, otp_secret=otp_secret)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user_otp_secret(db: Session, email: str, otp_secret: str):
    user = get_user_by_email(db, email)
    if user:
        user.otp_secret = otp_secret
        db.commit()
        db.refresh(user)
    return user

 