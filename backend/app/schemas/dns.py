from pydantic import BaseModel


class DNSRequest(BaseModel):
    domain: str