from fastapi import FastAPI, UploadFile, File, HTTPException
from pymongo import MongoClient
import shutil
import tempfile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from bson import ObjectId
from openai import OpenAI
import os
from dotenv import load_dotenv

app = FastAPI()

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")

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


def get_openai_client() -> OpenAI:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY not set in environment")
    return OpenAI(api_key=api_key)


MAX_FILE_SIZE = 25 * 1024 * 1024


@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    temp_path = None
    try:
        if not file:
            raise HTTPException(
                status_code=400,
                detail="No file uploaded. Please provide an audio file.",
            )
        contents = await file.read()
        if len(contents) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail="File too large. Maximum size is 25MB.",
            )
        suffix = os.path.splitext(file.filename)[1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            temp_path = tmp.name
            tmp.write(contents)
        print(f"Processing file: {file.filename} ({len(contents)} bytes)")

        client = get_openai_client()

        with open(temp_path, "rb") as audio_file:
            response = client.audio.transcriptions.create(
                file=audio_file,
                model="whisper-1",
                response_format="verbose_json",
            )

        print("Transcription complete")
        return JSONResponse(
            {
                "text": response.text,
                "language": response.language,
                "durationSec": response.duration,
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        print("Transcription error:", e)
        return JSONResponse(
            status_code=500,
            content={
                "error": "Transcription failed. Please try again.",
                "details": str(e) if os.getenv("NODE_ENV") == "development" else None,
            },
        )
    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
                print(f"Cleaned up: {temp_path}")
            except Exception as cleanup_error:
                print("Failed to delete temporary file:", cleanup_error)
