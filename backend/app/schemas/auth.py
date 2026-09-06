"""
Authentication Pydantic schemas.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., min_length=5, max_length=100)
    password: str = Field(..., min_length=6)
    role: str = Field(default="citizen")
    ward: Optional[str] = "Ward 1"

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    ward: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

Token.model_rebuild()
