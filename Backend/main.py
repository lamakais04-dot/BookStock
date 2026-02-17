from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from routes.books import router as booksRouter
from routes.auth import router as authRoter
from routes.categories import router as categoriesRouter
from routes.favoriteBooks import router as favoritesRouter
from routes.library import router as libyayrRouter
from routes.ages import router as agesRouter
from routes.admin_users import router as admin_users_router
from routes.admin_activity import router as admin_activity_router
from routes.admin_export import router as admin_export_router
from routes.admin_category import router as admin_categories_router
from os import getenv
from dotenv import load_dotenv
import socketio
from socketio_app import sio  # <-- use existing sio, do NOT recreate it

load_dotenv()

fastapi_app = FastAPI()
APIKEY = getenv("APIKEY")

fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@fastapi_app.middleware("http")
async def middleware_apikey(request: Request, call_next):

    if request.method == "OPTIONS":
        return await call_next(request)

    # skip auth routes
    if request.url.path.startswith("/api/auth"):
        return await call_next(request)

    if request.headers.get("apiKey") != APIKEY:
        return JSONResponse(
            status_code=401,
            content={"detail": "Invalid request, unauthorized"},
        )

    return await call_next(request)


@fastapi_app.get("/api")
def read_root():
    return {"message": "Welcome to BookStock API"}

fastapi_app.include_router(booksRouter, prefix="/api/book", tags=["book"])
fastapi_app.include_router(authRoter, prefix="/api/auth", tags=["auth"])
fastapi_app.include_router(agesRouter, prefix="/api/age", tags=["age"])
fastapi_app.include_router(categoriesRouter, prefix="/api/category", tags=["category"])
fastapi_app.include_router(favoritesRouter, prefix="/api/favorites", tags=["favorites"])
fastapi_app.include_router(libyayrRouter, prefix="/api/library", tags=["library"])
fastapi_app.include_router(admin_users_router)
fastapi_app.include_router(admin_activity_router)
fastapi_app.include_router(admin_export_router)
fastapi_app.include_router(admin_categories_router)

# wrap FastAPI with Socket.IO ASGI app
app = socketio.ASGIApp(sio, fastapi_app)

# socket events
@sio.event
async def connect(sid, environ):
    print("Client connected:", sid)

@sio.event
async def disconnect(sid):
    print("Client disconnected:", sid)

@sio.event
async def ping_from_client(sid, data):
    print("Received ping:", data)
    await sio.emit("pong_from_server", {"msg": "pong", "echo": data})
