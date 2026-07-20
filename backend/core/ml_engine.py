"""ML serving layer — loads the trained role classifier and predicts best-fit roles.

The model is trained offline by backend/train_role_model.py (TF-IDF +
Logistic Regression) and committed as core/ml_models/role_classifier.joblib,
so the server only ever loads and predicts — no training at runtime.
"""
import os

import joblib

from .knowledge_base import ROLE_KB

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'ml_models', 'role_classifier.joblib')

_model = None


def _get_model():
    global _model
    if _model is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                'Trained model not found. Run "python train_role_model.py" first.')
        _model = joblib.load(MODEL_PATH)
    return _model


def predict_roles(cv_text, top_n=3):
    """Returns the top-N predicted roles for a CV as
    [{role, role_key, confidence, salary, core_skills}] sorted by confidence."""
    model = _get_model()
    probabilities = model.predict_proba([cv_text])[0]
    ranked = sorted(zip(model.classes_, probabilities), key=lambda p: -p[1])[:top_n]

    predictions = []
    for key, prob in ranked:
        profile = ROLE_KB[key]
        predictions.append({
            'role': profile['title'],
            'role_key': key,
            'confidence': round(prob * 100, 1),
            'salary': profile['salary'],
            'core_skills': profile['core_skills'][:6],
        })
    return predictions
