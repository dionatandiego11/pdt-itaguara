from importlib import import_module
from typing import List, Tuple

from fastapi import APIRouter

from app.api.v1.endpoints import auth
from app.core.logging import get_logger

logger = get_logger("api.router")
api_router = APIRouter()

# Endpoints disponíveis
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])

# Endpoints opcionais (carregados apenas se existirem)
optional_endpoints: List[Tuple[str, str, str]] = [
    ("app.api.v1.endpoints.users", "/users", "users"),
    ("app.api.v1.endpoints.repositories", "/repositories", "repositories"),
    ("app.api.v1.endpoints.proposals", "/proposals", "proposals"),
    ("app.api.v1.endpoints.issues", "/issues", "issues"),
    ("app.api.v1.endpoints.voting", "/voting", "voting"),
    ("app.api.v1.endpoints.votes", "/votes", "votes"),
    ("app.api.v1.endpoints.admin", "/admin", "admin"),
]

for module_path, prefix, tag in optional_endpoints:
    try:
        module = import_module(module_path)
        router = getattr(module, "router", None)
        if router is None:
            raise AttributeError("router not found")
        api_router.include_router(router, prefix=prefix, tags=[tag])
    except (ModuleNotFoundError, AttributeError) as exc:
        logger.warning("Optional router '%s' not loaded: %s", module_path, exc)
