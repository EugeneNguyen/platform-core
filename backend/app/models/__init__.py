"""Import every ORM model so `Base.metadata` is fully populated on `import app.models`."""

from app.db.base import Base
from app.models.actor import Actor, AIAgent, User
from app.models.auth import AuthIdentity, LoginAttempt, RefreshToken
from app.models.project import Project
from app.models.rbac import Permission, Role, RoleAssignment, RolePermission
from app.models.tenancy import Invite, Organization, OrgMembership

__all__ = [
    "AIAgent",
    "Actor",
    "AuthIdentity",
    "Base",
    "Invite",
    "LoginAttempt",
    "OrgMembership",
    "Organization",
    "Permission",
    "Project",
    "RefreshToken",
    "Role",
    "RoleAssignment",
    "RolePermission",
    "User",
]
