from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from cryptography.fernet import Fernet, InvalidToken
from base64 import urlsafe_b64encode
from hashlib import sha256

from app.core.config import get_settings

ALGORITHM = "HS256"


def _build_fernet() -> Fernet:
    settings = get_settings()
    key_material = sha256(settings.secret_key.encode("utf-8")).digest()
    return Fernet(urlsafe_b64encode(key_material))


def encrypt_text(plain_text: str) -> str:
    fernet = _build_fernet()
    token = fernet.encrypt(plain_text.encode("utf-8"))
    return token.decode("utf-8")


def decrypt_text(cipher_text: str) -> str:
    fernet = _build_fernet()
    try:
        raw = fernet.decrypt(cipher_text.encode("utf-8"))
        return raw.decode("utf-8")
    except InvalidToken as exc:
        raise ValueError("Could not decrypt token") from exc


def create_access_token(subject: str) -> str:
    settings = get_settings()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expire_minutes)
    payload = {"sub": subject, "exp": expire}
    return jwt.encode(payload, settings.secret_key, algorithm=ALGORITHM)


def decode_access_token(token: str) -> str | None:
    settings = get_settings()
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
        subject = payload.get("sub")
        if not subject:
            return None
        return str(subject)
    except JWTError:
        return None
