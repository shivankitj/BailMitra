import os
import re
from pathlib import Path
from typing import Dict

import pandas as pd
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

try:
    from groq import Groq
except Exception:  # pragma: no cover
    Groq = None

load_dotenv()

app = FastAPI(title="BailMitra ML Service", version="1.0.0")


class BailRiskRequest(BaseModel):
    case_details: str


BASE_DIR = Path(__file__).resolve().parent
INPUT_DIR = BASE_DIR / "input"
FINAL_RISK_PATH = INPUT_DIR / "final_risk_assessment.csv"
ILDC_PATH = INPUT_DIR / "ildc_dataset.csv"

LEARNED_WEIGHTS = {
    "criminal_history": 0.35,
    "flight_risk": 0.25,
    "violent_offenses": 0.25,
    "prison_conduct": 0.15,
}


def _load_dataset_context() -> Dict[str, float]:
    default_context = {
        "low_ratio": 0.5,
        "medium_ratio": 0.3,
        "high_ratio": 0.2,
        "median_text_length": 220.0,
    }

    if FINAL_RISK_PATH.exists():
        df = pd.read_csv(FINAL_RISK_PATH)
        if "final_risk_level" in df.columns and len(df) > 0:
            counts = df["final_risk_level"].value_counts(normalize=True)
            default_context["low_ratio"] = float(counts.get("Low", default_context["low_ratio"]))
            default_context["medium_ratio"] = float(
                counts.get("Medium", default_context["medium_ratio"])
            )
            default_context["high_ratio"] = float(counts.get("High", default_context["high_ratio"]))

    if ILDC_PATH.exists():
        ildc_df = pd.read_csv(ILDC_PATH)
        if "case_text" in ildc_df.columns and len(ildc_df) > 0:
            default_context["median_text_length"] = float(ildc_df["case_text"].str.len().median())

    return default_context


DATASET_CONTEXT = _load_dataset_context()


def _build_groq_client():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key or Groq is None:
        return None
    try:
        return Groq(api_key=api_key)
    except Exception:
        return None


GROQ_CLIENT = _build_groq_client()


def _clamp_score(value: int) -> int:
    return max(0, min(5, int(value)))


def _keyword_score(case_text: str, low_terms, high_terms, medium_base: int = 2) -> int:
    text = case_text.lower()
    high_hits = sum(1 for t in high_terms if re.search(t, text))
    low_hits = sum(1 for t in low_terms if re.search(t, text))

    if high_hits >= 2:
        return 5
    if high_hits == 1:
        return 4
    if low_hits >= 2:
        return 1
    if low_hits == 1:
        return 2
    return medium_base


def _extract_with_keywords(case_details: str) -> Dict[str, int]:
    criminal_history = _keyword_score(
        case_details,
        low_terms=[r"first[-\s]?time", r"no prior", r"clean record"],
        high_terms=[r"repeat offender", r"prior conviction", r"multiple prior", r"history of crime"],
    )

    flight_risk = _keyword_score(
        case_details,
        low_terms=[r"stable job", r"family ties", r"local resident", r"cooperated"],
        high_terms=[r"attempting to flee", r"abscond", r"flight risk", r"no fixed address"],
    )

    violent_offenses = _keyword_score(
        case_details,
        low_terms=[r"petty theft", r"minor", r"non[-\s]?violent"],
        high_terms=[r"murder", r"attempt to murder", r"violent", r"weapon", r"threatening witnesses"],
    )

    prison_conduct = _keyword_score(
        case_details,
        low_terms=[r"good conduct", r"cooperat", r"compliant"],
        high_terms=[r"obstruction", r"threat", r"misconduct", r"disciplinary"],
        medium_base=3,
    )

    return {
        "criminal_history": _clamp_score(criminal_history),
        "flight_risk": _clamp_score(flight_risk),
        "violent_offenses": _clamp_score(violent_offenses),
        "prison_conduct": _clamp_score(prison_conduct),
    }


def _extract_with_llm(case_details: str):
    if GROQ_CLIENT is None:
        return None

    prompt = (
        f"{case_details}\n"
        "Assess bail-risk factors with integer scores between 0 and 5. "
        "Return exactly this format: {criminal_history: x, flight_risk: y, "
        "violent_offenses: z, prison_conduct: w}."
    )

    try:
        completion = GROQ_CLIENT.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
        )
        response_text = completion.choices[0].message.content.strip().lower()

        extracted = {
            "criminal_history": re.search(r"criminal_history\s*:\s*(\d+)", response_text),
            "flight_risk": re.search(r"flight_risk\s*:\s*(\d+)", response_text),
            "violent_offenses": re.search(r"violent_offenses\s*:\s*(\d+)", response_text),
            "prison_conduct": re.search(r"prison_conduct\s*:\s*(\d+)", response_text),
        }

        if any(match is None for match in extracted.values()):
            return None

        return {
            key: _clamp_score(int(match.group(1)))
            for key, match in extracted.items()
        }
    except Exception:
        return None


def extract_risk_factors(case_details: str) -> Dict[str, int]:
    llm_risk_factors = _extract_with_llm(case_details)
    if llm_risk_factors is not None:
        return llm_risk_factors
    return _extract_with_keywords(case_details)


def compute_risk_score(risk_factors: Dict[str, int], case_details: str):
    weighted_scores = {
        factor: round(risk_factors[factor] * LEARNED_WEIGHTS[factor], 4)
        for factor in LEARNED_WEIGHTS
    }
    total_score = round(sum(weighted_scores.values()), 4)

    low_ratio = DATASET_CONTEXT["low_ratio"]
    medium_ratio = DATASET_CONTEXT["medium_ratio"]
    high_ratio = DATASET_CONTEXT["high_ratio"]

    medium_threshold = 1.3 + (medium_ratio - 0.3) * 0.8
    high_threshold = 2.2 + (high_ratio - 0.2) * 1.2

    # Longer case descriptions usually include more contextual detail,
    # so adjust risk slightly down to avoid over-penalizing sparse keyword hits.
    length_adjustment = 0.0
    median_len = DATASET_CONTEXT["median_text_length"]
    if median_len > 0 and len(case_details) > median_len * 1.3:
        length_adjustment = -0.1

    adjusted_score = total_score + length_adjustment

    if adjusted_score >= high_threshold:
        risk_level = "High Risk"
    elif adjusted_score >= medium_threshold:
        risk_level = "Moderate Risk"
    else:
        risk_level = "Low Risk"

    return {
        "weighted_scores": weighted_scores,
        "total_score": max(0.0, round(adjusted_score, 4)),
        "risk_level": risk_level,
        "dataset_calibration": {
            "low_ratio": low_ratio,
            "medium_ratio": medium_ratio,
            "high_ratio": high_ratio,
        },
    }


@app.post("/predict_bail_risk")
def predict_bail_risk(request: BailRiskRequest):
    try:
        risk_factors = extract_risk_factors(request.case_details)
        result = compute_risk_score(risk_factors, request.case_details)

        return {
            "risk_factors": risk_factors,
            "weighted_scores": result["weighted_scores"],
            "total_score": result["total_score"],
            "risk_level": result["risk_level"],
            "dataset_calibration": result["dataset_calibration"],
            "model_mode": "groq+dataset" if GROQ_CLIENT is not None else "dataset-fallback",
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
