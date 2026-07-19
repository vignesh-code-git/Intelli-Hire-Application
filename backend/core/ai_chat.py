"""
IntelliHire AI Career Assistant engine.
Intent detection + response generation over the knowledge base and the live job database.
"""
import random
import re

from .knowledge_base import (
    ROLE_KB,
    RESUME_TIPS,
    ATS_EXPLANATION,
    HR_QUESTIONS,
    INTERVIEW_GENERAL_TIPS,
    PLATFORM_GUIDE,
)
from .models import Job
from .nlp_engine import NLPParser

GREETING_PATTERNS = r"^(hi|hii+|hello|hey|heyy+|yo|hola|namaste|good (morning|afternoon|evening)|greetings)\b"
THANKS_PATTERNS = r"\b(thank(s| you)|thx|tysm|appreciated?)\b"

DEFAULT_SUGGESTIONS = [
    "Show me remote jobs",
    "Interview tips",
    "How does ATS scoring work?",
    "Skills for full stack developer",
]


def find_role(text):
    """Match a role profile from the knowledge base by name or alias (longest alias wins)."""
    text = text.lower()
    best, best_len = None, 0
    for key, profile in ROLE_KB.items():
        for alias in [key] + profile["aliases"]:
            if alias in text and len(alias) > best_len:
                best, best_len = profile, len(alias)
    return best


def search_jobs(text, limit=5):
    """Search the live job database using keywords from the user's message."""
    text_lower = text.lower()
    qs = Job.objects.all()

    remote_only = "remote" in text_lower or "work from home" in text_lower or "wfh" in text_lower

    # Location filter (skip 'remote' — handled separately)
    known_cities = ["bangalore", "bengaluru", "mumbai", "delhi", "hyderabad", "chennai", "pune",
                    "kochi", "trivandrum", "gurgaon", "noida", "ahmedabad", "kolkata", "jaipur", "indore"]
    city = next((c for c in known_cities if c in text_lower), None)

    role = find_role(text)
    matched = []
    for job in qs:
        haystack = f"{job.title} {job.description} {job.requirements} {job.location}".lower()
        score = 0
        if role:
            title_words = role["title"].lower().split()
            if any(w in job.title.lower() for w in title_words if len(w) > 3):
                score += 3
            score += sum(1 for s in role["core_skills"][:6] if s.split(" ")[0].lower() in haystack)
        else:
            # keyword overlap with message skills
            msg_skills = [s.lower() for s in NLPParser.extract_skills(text)]
            score += sum(2 for s in msg_skills if s in haystack)
        if remote_only and "remote" not in job.location.lower():
            continue
        if city and city not in job.location.lower():
            continue
        if score > 0 or (not role and (remote_only or city)):
            matched.append((score, job))

    matched.sort(key=lambda x: -x[0])
    return [j for _, j in matched[:limit]]


def _job_payload(jobs):
    return [{
        "id": j.id,
        "title": j.title,
        "company": j.company,
        "location": j.location,
        "salary_range": j.salary_range or "Not specified",
    } for j in jobs]


def generate_reply(message):
    """
    Returns dict: { reply: str (markdown-lite), suggestions: [str], jobs: [..]? }
    """
    msg = message.strip()
    low = msg.lower()

    # ── Greeting ──
    if re.search(GREETING_PATTERNS, low) and len(low.split()) <= 4:
        return {
            "reply": (
                "Hello! 👋 I'm the **IntelliHire AI Career Assistant** — trained on "
                f"**{Job.objects.count()} live job listings**, 450+ skills, and interview banks for {len(ROLE_KB)} roles.\n\n"
                "I can build or optimize your CV, find matching jobs, prep you for interviews, and answer career questions. "
                "What would you like to do first?"
            ),
            "suggestions": ["Build my CV", "Find jobs for me", "Interview preparation", "Resume tips"],
        }

    # ── Thanks ──
    if re.search(THANKS_PATTERNS, low):
        return {
            "reply": "You're welcome! 😊 I'm here whenever you need career help. Anything else — jobs, interview prep, or CV polish?",
            "suggestions": DEFAULT_SUGGESTIONS,
        }

    # ── Help / capabilities ──
    if re.search(r"\b(help|what can you do|how (do|does) (this|it|you) work|features|guide|how to use)\b", low):
        return {"reply": PLATFORM_GUIDE, "suggestions": ["Build my CV", "Show me remote jobs", "Interview tips", "Salary insights"]}

    # ── ATS explanation ──
    if "ats" in low:
        return {"reply": ATS_EXPLANATION, "suggestions": ["Resume tips", "Optimize my CV", "Show matching jobs"]}

    role = find_role(low)

    # ── Salary queries ──
    if re.search(r"\b(salary|salaries|pay|package|ctc|compensation|lpa|earn)\b", low):
        if role:
            s = role["salary"]
            return {
                "reply": (
                    f"💰 **{role['title']} — Salary Insights (India, 2026)**\n\n"
                    f"• **Fresher (0–2 yrs):** {s['fresher']}\n"
                    f"• **Mid-level (2–6 yrs):** {s['mid']}\n"
                    f"• **Senior (6+ yrs):** {s['senior']}\n\n"
                    f"📈 **Career path:** {role['career_path']}\n\n"
                    "Top-paying companies (product firms, fintech, global captives) typically pay 30–60% above these ranges. "
                    "Strong negotiation + an ATS-optimized CV can add 15–20% to your offer."
                ),
                "suggestions": [f"Skills for {role['title']}", f"Interview questions for {role['title']}", "Show matching jobs"],
            }
        return {
            "reply": (
                "I have salary data for 18 roles — which one interests you?\n\n"
                "For example: *'salary for data scientist'*, *'DevOps engineer package'*, or *'how much does a PM earn?'*"
            ),
            "suggestions": ["Salary for full stack developer", "Salary for data scientist", "Salary for DevOps engineer"],
        }

    # ── Interview prep ──
    if re.search(r"\b(interview|hr round|behavioral|behavioural|technical round|prepare|preparation)\b", low):
        if re.search(r"\b(hr|behavioral|behavioural)\b", low) or not role:
            picked = random.sample(HR_QUESTIONS, 3)
            qa_text = "\n\n".join([f"**Q: {item['q']}**\n💡 {item['tip']}" for item in picked])
            tips = "\n".join([f"• {t}" for t in random.sample(INTERVIEW_GENERAL_TIPS, 3)])
            return {
                "reply": (
                    "🎯 **Interview Preparation**\n\n" + qa_text +
                    "\n\n**General tips:**\n" + tips +
                    "\n\nWant **technical questions** for a specific role? Just ask — e.g. *'interview questions for backend developer'*."
                ),
                "suggestions": ["Interview questions for frontend developer", "More HR questions", "Resume tips"],
            }
        questions = random.sample(role["interview_questions"], min(5, len(role["interview_questions"])))
        q_text = "\n".join([f"{i+1}. {q}" for i, q in enumerate(questions)])
        return {
            "reply": (
                f"🎯 **Top Interview Questions — {role['title']}**\n\n{q_text}\n\n"
                f"📜 **Recommended certifications:** {', '.join(role['certifications'])}\n\n"
                "Ask again for a fresh set, or say *'HR interview tips'* for the behavioral round."
            ),
            "suggestions": [f"Skills for {role['title']}", "HR interview tips", f"Salary for {role['title']}"],
        }

    # ── Skills / roadmap / career path ──
    if re.search(r"\b(skills?|learn|roadmap|career path|become|how to be|grow|switch to|requirements? for)\b", low):
        if role:
            core = "\n".join([f"• {s}" for s in role["core_skills"]])
            bonus = ", ".join(role["bonus_skills"])
            return {
                "reply": (
                    f"🚀 **{role['title']} — Skill Roadmap**\n\n"
                    f"**Core skills (master these first):**\n{core}\n\n"
                    f"**Stand-out extras:** {bonus}\n\n"
                    f"📈 **Career path:** {role['career_path']}\n\n"
                    f"📜 **Certifications worth doing:** {', '.join(role['certifications'])}"
                ),
                "suggestions": [f"Interview questions for {role['title']}", f"Salary for {role['title']}", "Show matching jobs"],
            }
        return {
            "reply": (
                "Tell me which role you're targeting and I'll give you the full skill roadmap, "
                "career path, and certifications.\n\nFor example: *'skills for cloud architect'* or *'how to become a data engineer'*."
            ),
            "suggestions": ["Skills for full stack developer", "Skills for data scientist", "Skills for UI/UX designer"],
        }

    # ── Resume tips ──
    if re.search(r"\b(resume|cv)\b", low) and re.search(r"\b(tip|improve|better|advice|score|mistake|good|write|format)\b", low):
        tips = "\n\n".join(random.sample(RESUME_TIPS, 4))
        return {
            "reply": (
                "📄 **Resume Tips from the IntelliHire playbook:**\n\n" + tips +
                "\n\n💡 Want me to apply these automatically? **Upload your CV** and I'll optimize it against any job in our database."
            ),
            "suggestions": ["How does ATS scoring work?", "More resume tips", "Upload CV help"],
        }

    # ── Job search ──
    if re.search(r"\b(job|jobs|opening|openings|vacancy|vacancies|hiring|position|opportunities|remote|work from home|wfh)\b", low):
        jobs = search_jobs(low)
        if jobs:
            lines = "\n".join([
                f"• **{j.title}** at {j.company} — {j.location} ({j.salary_range})"
                for j in jobs
            ])
            return {
                "reply": (
                    f"🔎 I found **{len(jobs)} strong matches** in our database:\n\n{lines}\n\n"
                    "Upload your CV and I'll calculate your exact **match score** for each of these!"
                ),
                "suggestions": ["Upload CV help", "More jobs", "Interview tips"],
                "jobs": _job_payload(jobs),
            }
        total = Job.objects.count()
        return {
            "reply": (
                f"I searched our **{total} live listings** but didn't find a precise match for that. "
                "Try a role + location, e.g. *'Python jobs in Bangalore'* or *'remote frontend jobs'* — "
                "or use the search bar above to browse everything."
            ),
            "suggestions": ["Show me remote jobs", "Frontend jobs in Bangalore", "Data science jobs"],
        }

    # ── Role mentioned alone → give overview ──
    if role:
        return {
            "reply": (
                f"**{role['title']}** — great choice! Here's a quick overview:\n\n"
                f"💰 **Salary:** {role['salary']['fresher']} (fresher) → {role['salary']['senior']} (senior)\n"
                f"🛠️ **Top skills:** {', '.join(role['core_skills'][:6])}\n"
                f"📈 **Path:** {role['career_path']}\n\n"
                "What would you like to dive into?"
            ),
            "suggestions": [f"Skills for {role['title']}", f"Interview questions for {role['title']}", f"Salary for {role['title']}", "Show matching jobs"],
        }

    # ── Fallback ──
    return {
        "reply": (
            "I can help with **CV building, job search, interview prep, salaries, and career roadmaps**.\n\n"
            "Try one of these:\n"
            "• Type your **name, target role** (e.g. *'Arjun Nair, Backend Developer'*) to instantly generate a CV\n"
            "• *'Show me remote React jobs'*\n"
            "• *'Interview questions for data analyst'*\n"
            "• *'Salary for cloud architect'*"
        ),
        "suggestions": DEFAULT_SUGGESTIONS,
    }
