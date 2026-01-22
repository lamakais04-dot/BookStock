from fastapi import FastAPI,Request
from routes.books import router as bookaRouter
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
apiKey = "123456789apikeysecure"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def middleware_apikey(request: Request, call_next):
    if request.method == "OPTIONS":
        return await call_next(request)
    if request.headers.get("apiKey") != apiKey:
        return JSONResponse(status_code=401, content="Invalid request, unauthorised")
    response = await call_next(request)
    return response


app.include_router(bookaRouter, prefix="/api/book", tags=["book"])
