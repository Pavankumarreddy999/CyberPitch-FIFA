from pydantic import BaseModel


class SSLRequest(BaseModel):
    domain: str