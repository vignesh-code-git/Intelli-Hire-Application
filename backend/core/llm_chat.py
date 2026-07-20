"""Local LLM chat layer — generates grounded replies with a small transformer
model running entirely on this machine (no external APIs).

Enabled only when ENABLE_LOCAL_LLM=true (set it in backend/.env). Production
deployments leave it off: transformers/torch are never imported, memory stays
small, and chat falls back to the rule-based engine in ai_chat.py.

The first enabled run downloads the model weights (~1 GB) from the Hugging
Face hub into the local cache; after that it works fully offline.
"""
import os
import re

from .ai_chat import GREETING_PATTERNS, THANKS_PATTERNS, DEFAULT_SUGGESTIONS, find_role, search_jobs

MODEL_NAME = os.getenv('LOCAL_LLM_MODEL', 'Qwen/Qwen2.5-0.5B-Instruct')
MAX_NEW_TOKENS = 260

_pipeline = None  # (tokenizer, model) once loaded


def is_enabled():
    return os.getenv('ENABLE_LOCAL_LLM', '').lower() in ('1', 'true', 'yes')


def _get_pipeline():
    global _pipeline
    if _pipeline is None:
        # Heavy imports deferred so the server never pays for them unless enabled
        from transformers import AutoModelForCausalLM, AutoTokenizer
        tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
        model = AutoModelForCausalLM.from_pretrained(MODEL_NAME)
        _pipeline = (tokenizer, model)
    return _pipeline


def _build_context(message):
    """Retrieve grounding data (role profile + matching jobs) for the prompt."""
    parts = []
    role = find_role(message.lower())
    if role:
        parts.append(
            f"Role data for {role['title']}: core skills: {', '.join(role['core_skills'])}. "
            f"Salary (India): fresher {role['salary']['fresher']}, mid {role['salary']['mid']}, "
            f"senior {role['salary']['senior']}. Career path: {role['career_path']}."
        )
    jobs = search_jobs(message.lower(), limit=3)
    if jobs:
        listings = "; ".join(
            f"{j.title} at {j.company}, {j.location} ({j.salary_range or 'salary not specified'})"
            for j in jobs
        )
        parts.append(f"Matching live jobs on IntelliHire: {listings}.")
    return "\n".join(parts)


def generate_llm_reply(message):
    """Returns {reply, suggestions, source} or None if the LLM should not /
    could not answer (caller then falls back to the rule engine)."""
    if not is_enabled():
        return None

    low = message.strip().lower()
    # Greetings and thanks stay on the instant rule-based path
    if re.search(GREETING_PATTERNS, low) or re.search(THANKS_PATTERNS, low):
        return None

    try:
        tokenizer, model = _get_pipeline()

        system_prompt = (
            "You are the IntelliHire AI Career Assistant, helping job seekers in India "
            "with careers, skills, salaries, interviews, and job search. Be concise, "
            "friendly, and practical. Use the platform data below when it is relevant; "
            "if it isn't, answer from general career knowledge. Never invent specific "
            "job listings or salary figures beyond the data given."
        )
        context = _build_context(message)
        if context:
            system_prompt += "\n\nPlatform data:\n" + context

        chat = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": message},
        ]
        prompt = tokenizer.apply_chat_template(chat, tokenize=False, add_generation_prompt=True)
        inputs = tokenizer(prompt, return_tensors="pt")
        outputs = model.generate(
            **inputs,
            max_new_tokens=MAX_NEW_TOKENS,
            do_sample=True,
            temperature=0.7,
            top_p=0.9,
            pad_token_id=tokenizer.eos_token_id,
        )
        reply = tokenizer.decode(
            outputs[0][inputs["input_ids"].shape[1]:], skip_special_tokens=True
        ).strip()

        if not reply:
            return None
        return {"reply": reply, "suggestions": DEFAULT_SUGGESTIONS, "source": "llm"}
    except Exception:
        import traceback
        traceback.print_exc()
        return None
