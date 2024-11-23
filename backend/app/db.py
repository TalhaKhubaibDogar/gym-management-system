import pymongo
from pymongo import mongo_client

from app.config import settings

try:

    client = mongo_client.MongoClient(settings.DATABASE_URL)
    client.admin.command('ping')
    print("Successfully connected to MongoDB")

    db = client[settings.MONGO_DATABASE]
    Users = db.users
    Tokens = db.tokens
    Otps = db.otps

    # Creating indexes for more smooth retrival
    Users.create_index([("email", pymongo.ASCENDING)], unique=True)
    Users.create_index([("created_at", pymongo.ASCENDING)], unique=False)
    Tokens.create_index([("token", pymongo.ASCENDING)], unique=True)
    Tokens.create_index([("user_id", pymongo.ASCENDING)])
    Tokens.create_index([
        ("token", pymongo.ASCENDING),
        ("token_type", pymongo.ASCENDING)
    ])
    Otps.create_index([("otp", pymongo.ASCENDING)], unique=True)

except pymongo.errors.ConfigurationError as config_error:
    print(f"MongoDB Configuration Error: {config_error}")
except pymongo.errors.ConnectionFailure as conn_error:
    print(f"MongoDB Connection Error: {conn_error}")
except Exception as e:
    print(f"An unexpected error occurred: {e}")
