from fastapi import FastAPI
from pymongo import MongoClient
from fastapi.middleware.cors import CORSMiddleware
from bson import ObjectId
import os

app = FastAPI()

MONGODB_URI = os.getenv(
    "MONGODB_URI",
    "mongodb+srv://<USERNAME>:<PASSWORD>@cluster0.y452mcg.mongodb.net/?retryWrites=true&w=majority",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = MongoClient(MONGODB_URI)
db = client["mydatabase"]
collection = db["courses"]


# Recursive function to convert ObjectId to str
def convert_objectid(doc):
    if isinstance(doc, list):
        return [convert_objectid(item) for item in doc]
    elif isinstance(doc, dict):
        return {k: convert_objectid(v) for k, v in doc.items()}
    elif isinstance(doc, ObjectId):
        return str(doc)
    else:
        return doc


@app.get("/courses")
def get_all_courses():
    courses = list(collection.find({}))
    courses = convert_objectid(courses)
    return courses
