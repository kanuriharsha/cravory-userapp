from fastapi import FastAPI, APIRouter, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path

# Import route modules
from routes import auth_routes, restaurants, orders, cart, addresses, admin

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.getenv('MONGO_URL', 'mongodb+srv://admin:admin@cluster0.31kaszr.mongodb.net/')
db_name = os.getenv('DB_NAME', 'cravory')
client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

# Create the main app
app = FastAPI(title="Cravory Food Delivery API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Dependency to inject database
async def get_db():
    return db


# Health check endpoint
@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "cravory-api"}


# Include all route modules with database dependency
def include_router_with_db(router_module):
    """Helper to include router and inject db dependency"""
    for route in router_module.routes:
        # Inject db dependency into each route
        original_endpoint = route.endpoint
        
        async def endpoint_wrapper(*args, db=Depends(get_db), **kwargs):
            return await original_endpoint(*args, db=db, **kwargs)
        
        route.endpoint = endpoint_wrapper
    
    api_router.include_router(router_module)


# Include all routers
include_router_with_db(auth_routes.router)
include_router_with_db(restaurants.router)
include_router_with_db(orders.router)
include_router_with_db(cart.router)
include_router_with_db(addresses.router)
include_router_with_db(admin.router)

# Include the router in the main app
app.include_router(api_router)


# Startup event
@app.on_event("startup")
async def startup_event():
    logging.info("Starting Cravory API...")
    logging.info(f"Connected to MongoDB: {db_name}")


# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    client.close()
    logging.info("MongoDB connection closed")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
