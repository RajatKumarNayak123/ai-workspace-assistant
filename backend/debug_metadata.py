from app.database.database import Base
from app.models import *

print("Tables detected by SQLAlchemy:")
print(Base.metadata.tables.keys())