from fastapi import FastAPI, Request
from routes.books import router as booksRouter
from routes.auth import router as authRoter
from routes.categories import router as categoriesRouter
from routes.favoriteBooks import router as favoritesRouter
from routes.library import router as libyayrRouter
from routes.ages import router as agesRouter
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from routes.admin_users import router as admin_users_router
from routes.admin_activity import router as admin_activity_router
from routes.admin_export import router as admin_export_router

from dotenv import load_dotenv


load_dotenv()


app = FastAPI()
apiKey = "123456789apikeysecure"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def middleware_apikey(request: Request, call_next):
    if request.method == "OPTIONS":
        # Let CORSMiddleware handle preflight
        return await call_next(request)

    if request.headers.get("apiKey") != apiKey:
        return JSONResponse(
            status_code=401, content={"detail": "Invalid request, unauthorized"}
        )

    response = await call_next(request)
    return response


@app.get("/api")
def read_root():
    return {"message": "Welcome to BookStock API"}


app.include_router(booksRouter, prefix="/api/book", tags=["book"])
app.include_router(authRoter, prefix="/api/auth", tags=["auth"])
app.include_router(agesRouter, prefix="/api/age", tags=["age"])
app.include_router(categoriesRouter, prefix="/api/category", tags=["category"])
app.include_router(favoritesRouter, prefix="/api/favorites", tags=["favorites"])
app.include_router(libyayrRouter, prefix="/api/library", tags=["library"])
app.include_router(admin_users_router)
app.include_router(admin_activity_router)
app.include_router(admin_export_router)