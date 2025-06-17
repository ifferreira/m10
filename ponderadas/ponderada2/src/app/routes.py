from fastapi import APIRouter, Depends, HTTPException, Header, Request
from sqlalchemy.orm import Session
from typing import List
import pyotp
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
import datetime

from . import crud, schemas, models
from .database import get_db
from .email_utils import send_otp_email

router = APIRouter()

# Dicionário simples para armazenar segredos OTP temporários (apenas para exemplo)
user_otps = {}

SECRET_KEY = "supersecretkey"  # Troque em produção
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

def create_access_token(data: dict, expires_delta: int = None):
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=expires_delta or ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login-otp")

def get_current_user_email(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Token inválido")
        return email
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")

@router.get("/users/me/achievements", response_model=List[schemas.AchievementSchema])
def get_my_achievements(
    db: Session = Depends(get_db),
    email: str = Depends(get_current_user_email)
):
    user_achievements = crud.get_user_achievements(db, user_id=email)
    return [ua.achievement for ua in user_achievements]

@router.post("/users/me/achievements", status_code=201)
def unlock_achievement(
    req: schemas.AchievementUnlockRequest,
    email: str = Depends(get_current_user_email),
    db: Session = Depends(get_db)
):
    achievement = crud.get_achievement_by_code(db, code=req.achievement_code)
    if not achievement:
        raise HTTPException(status_code=404, detail="Conquista não encontrada.")
    
    crud.create_user_achievement(db=db, user_id=email, achievement_id=achievement.id)
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

@router.post("/auth/register-otp")
def register_otp(req: schemas.UserRegisterRequest, db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, req.email)
    if user:
        raise HTTPException(status_code=400, detail="Usuário já existe. Use a opção de login.")
    secret = pyotp.random_base32()
    crud.create_user(db, email=req.email, otp_secret=secret)
    otp = pyotp.TOTP(secret).now()
    send_otp_email(req.email, otp)
    return {"message": "OTP enviado para o e-mail."}

@router.post("/auth/request-otp")
def request_otp(req: schemas.UserRegisterRequest, db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, req.email)
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado. Use a opção de registro.")
    secret = user.otp_secret or pyotp.random_base32()
    if not user.otp_secret:
        crud.update_user_otp_secret(db, req.email, secret)
    otp = pyotp.TOTP(secret).now()
    send_otp_email(req.email, otp)
    return {"message": "OTP enviado para o e-mail."}

@router.post("/auth/login-otp", response_model=schemas.AuthResponse)
def login_otp(req: schemas.UserLoginRequest, db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, req.email)
    if not user or not user.otp_secret:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    totp = pyotp.TOTP(user.otp_secret)
    if not totp.verify(req.otp, valid_window=1):
        raise HTTPException(status_code=401, detail="OTP inválido")
    
    access_token = create_access_token({"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

    