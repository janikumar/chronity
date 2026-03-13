class Base:
    metadata = type('obj', (object,), {'create_all': lambda bind: None})

def Column(*args, **kwargs): return None
def Integer(*args, **kwargs): return None
def String(*args, **kwargs): return None
def Text(*args, **kwargs): return None
def ForeignKey(*args, **kwargs): return None
def DateTime(*args, **kwargs): return None

import datetime
# Models preserved for reference, no longer used as SQLAlchemy ORM

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255))
    email = Column(String(255), unique=True, index=True)
    resume_path = Column(String(511), nullable=True)
    skills = Column(Text, nullable=True) # JSON or comma-separated

    description = Column(Text)
    status = Column(String(50), default="Detected") # Detected, Applied, Interviewing, Offer, Rejected
    priority = Column(String(20), default="Medium") # High, Medium, Low
    extracted_at = Column(DateTime, default=datetime.datetime.utcnow)


class WorkPlan(Base):
    __tablename__ = "work_plans"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    opportunity_id = Column(Integer, ForeignKey("opportunities.id"))
    preparation_plan = Column(Text)
    schedule = Column(Text)
