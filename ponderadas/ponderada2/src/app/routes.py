from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import List

from . import crud, schemas
from .database import get_db

router = APIRouter()

@router.get("/users/me/achievements", response_model=List[schemas.AchievementSchema])
def get_my_achievements(
    user_id: str = Header(..., alias="X-USER-ID"), 
    db: Session = Depends(get_db)
):
    user_achievements = crud.get_user_achievements(db, user_id=user_id)
    return [ua.achievement for ua in user_achievements]

@router.post("/users/me/achievements", status_code=201)
def unlock_achievement(
    req: schemas.AchievementUnlockRequest,
    user_id: str = Header(..., alias="X-USER-ID"),
    db: Session = Depends(get_db)
):
    achievement = crud.get_achievement_by_code(db, code=req.achievement_code)
    if not achievement:
        raise HTTPException(status_code=404, detail="Conquista não encontrada.")
    
    crud.create_user_achievement(db=db, user_id=user_id, achievement_id=achievement.id)
    return {"message": "Conquista processada."}


@router.get("/achievements", response_model=List[schemas.AchievementSchema])
def list_all_achievements(db: Session = Depends(get_db)):
    return crud.get_all_achievements(db)


@router.get("/admin/all-achievements", response_model=List[schemas.UserAchievementDetail])
def list_all_user_achievements(db: Session = Depends(get_db)):
    all_user_achievements = crud.get_all_user_achievements(db)
    # Formata a resposta para corresponder ao schema
    response = [
        schemas.UserAchievementDetail(
            user_id=ua.user_id,
            achievement_code=ua.achievement.code,
            achievement_name=ua.achievement.name,
            achievement_description=ua.achievement.description
        ) for ua in all_user_achievements
    ]
    return response

@router.get("/")
def read_root():
    return {"message": "API de conquistas do Duvido!"} 