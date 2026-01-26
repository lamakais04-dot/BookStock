from fastapi import FastAPI,Request
from routes.books import router as booksRouter
from routes.auth import router as authRoter
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

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
        return JSONResponse(status_code=401, content={"detail": "Invalid request, unauthorized"})
    
    response = await call_next(request)
    return response

@app.get("/api")
def read_root():
    return {"message": "Welcome to BookStock API"}  

app.include_router(booksRouter, prefix="/api/book", tags=["book"])
app.include_router(authRoter, prefix="/api/auth", tags=["auth"])
