import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Retrieve API key from .env
API_KEY = os.getenv("GROQ_API_KEY")

if API_KEY is None:
    raise ValueError("API key is missing! Make sure you have set GROQ_API_KEY in the .env file.")


# Initialize Groq client
client = Groq(api_key=API_KEY)

# Initialize FastAPI app
app = FastAPI()

# Define request model
class BailRequest(BaseModel):
    case_details: str

# API endpoint to predict bail risk
@app.post("/predict_bail_risk")

def predict_bail_risk(request: BailRequest):
    try:
        # Format input for Groq LLM
        prompt = (
            f"{request.case_details} Based on the provided details, assess the risk level for granting bail. "
            "Only return one of the following labels: 'Risk 1', 'Risk 2', or 'Risk 3'. Do not provide any explanation."
        )

        # Call Groq's LLM
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
        )

        # Extract model response
        risk_level = chat_completion.choices[0].message.content.strip()

        # Return the risk level
        return {"bail_risk_level": risk_level}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))