"""Train the IntelliHire job-role classifier (scikit-learn).

Builds a labeled dataset from the role knowledge base and the live Job table,
trains a TF-IDF + Logistic Regression pipeline, reports held-out accuracy,
then refits on the full dataset and saves the model for serving.

Run:  python train_role_model.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'intellihire_backend.settings')
django.setup()

import joblib
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

from core.models import Job
from core.knowledge_base import ROLE_KB
from core.ai_chat import find_role

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'core', 'ml_models')
MODEL_PATH = os.path.join(MODEL_DIR, 'role_classifier.joblib')


def build_dataset():
    """Returns (texts, labels) where each label is a ROLE_KB key."""
    texts, labels = [], []

    # Knowledge-base documents: several views of each role profile
    for key, profile in ROLE_KB.items():
        docs = [
            f"{profile['title']} {' '.join(profile['aliases'])} {' '.join(profile['core_skills'])}",
            f"{' '.join(profile['core_skills'])} {' '.join(profile['bonus_skills'])}",
            f"{profile['title']} {profile['career_path']} {' '.join(profile.get('certifications', []))}",
        ]
        # Each interview question is its own sample — vocabulary of the role's daily work
        docs.extend(f"{profile['title']} {q}" for q in profile['interview_questions'])
        for doc in docs:
            texts.append(doc)
            labels.append(key)

    # Live job listings, labeled by the role their title matches
    for job in Job.objects.all():
        profile = find_role(job.title.lower())
        if profile is None:
            continue
        key = next(k for k, v in ROLE_KB.items() if v is profile)
        texts.append(f"{job.title} {job.description} {job.requirements}")
        labels.append(key)

    return texts, labels


def main():
    texts, labels = build_dataset()
    n_roles = len(set(labels))
    print(f"Dataset: {len(texts)} documents across {n_roles} roles")

    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(ngram_range=(1, 2), sublinear_tf=True,
                                  stop_words='english', min_df=1)),
        ('clf', LogisticRegression(max_iter=2000, C=5.0)),
    ])

    # Held-out evaluation
    x_train, x_test, y_train, y_test = train_test_split(
        texts, labels, test_size=0.2, random_state=42, stratify=labels)
    pipeline.fit(x_train, y_train)
    acc = accuracy_score(y_test, pipeline.predict(x_test))
    print(f"Held-out accuracy: {acc:.1%} ({len(x_test)} test samples)")

    # Refit on everything for the served model
    pipeline.fit(texts, labels)
    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(pipeline, MODEL_PATH)
    print(f"Saved trained model -> {MODEL_PATH}")


if __name__ == '__main__':
    main()
