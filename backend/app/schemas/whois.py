from pydantic import BaseModel, Field


class DomainRequest(BaseModel):
    domain: str = Field(..., example="google.com")


class WhoisResponse(BaseModel):
    success: bool
    message: str
    data: dict