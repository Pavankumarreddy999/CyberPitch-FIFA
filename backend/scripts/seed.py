import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database.database import engine
from app.models.user import User
from app.utils.auth import get_password_hash

def seed_db():
    with Session(engine) as db:
        if db.query(User).filter_by(username="admin").count() == 0:
            db.add(User(username="admin", hashed_password=get_password_hash("admin")))
            db.commit()
            print("Seeded default admin user")

if __name__ == "__main__":
    seed_db()
