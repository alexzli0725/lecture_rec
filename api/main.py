from fastapi import FastAPI, HTTPException
from pymongo import MongoClient
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from bson import ObjectId
import os

app = FastAPI()

MONGODB_URI = os.getenv(
    "MONGODB_URI",
    "mongodb+srv://alexzli0725:alexzli0725@cluster0.y452mcg.mongodb.net/?retryWrites=true&w=majority",
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


class TranscriptUpdate(BaseModel):
    transcript: str


@app.get("/courses")
def get_all_courses():
    courses = list(collection.find({}))
    courses = convert_objectid(courses)
    return courses


@app.post("/lecture/{transcript_id}/append")
def append_transcript_content(transcript_id: str, body: TranscriptUpdate):
    try:
        transcript_oid = ObjectId(transcript_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid transcript ID")

    # Find the course document that contains this transcript
    course = collection.find_one({"transcripts._id": transcript_oid})
    if not course:
        raise HTTPException(status_code=404, detail="Transcript not found")

    # Find the transcript inside the array
    for t in course["transcripts"]:
        if t["_id"] == transcript_oid:
            new_content = (t.get("content") or "") + " " + body.transcript
            t["content"] = new_content
            break

    # Write back the entire transcripts array
    collection.update_one(
        {"_id": course["_id"]}, {"$set": {"transcripts": course["transcripts"]}}
    )

    return {
        "message": "Transcript content appended successfully",
        "content": new_content,
    }
