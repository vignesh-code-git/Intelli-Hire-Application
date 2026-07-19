from django.db import models

class Job(models.Model):
    title = models.CharField(max_length=255)
    company = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    description = models.TextField()
    requirements = models.TextField()  # Comma-separated or line-separated skills/keywords
    salary_range = models.CharField(max_length=100, blank=True, null=True)
    posted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} at {self.company}"

class CandidateCV(models.Model):
    original_text = models.TextField()
    parsed_skills = models.JSONField(default=list)  # List of identified tech skills
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"CV Uploaded on {self.uploaded_at.strftime('%Y-%m-%d %H:%M')}"

class ContentSnippet(models.Model):
    """One AI-suggestion option for a CV section, tailored to a role.

    payload holds the exact JSON structure the frontend applies to the CV draft:
    summary/education -> string, skills -> {frontend, backend, ...} dict,
    experience/projects -> list of entry dicts, certifications/achievements -> list of strings.
    """
    section = models.CharField(max_length=40, db_index=True)
    role = models.CharField(max_length=40, db_index=True, default='any')
    title = models.CharField(max_length=255)
    preview = models.TextField()
    payload = models.JSONField()
    source = models.CharField(max_length=20, default='curated')  # curated | generated
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.section}/{self.role}: {self.title}"

class CVOptimization(models.Model):
    cv = models.ForeignKey(CandidateCV, on_delete=models.CASCADE, related_name='optimizations')
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='optimizations')
    original_score = models.IntegerField()
    optimized_score = models.IntegerField()
    optimized_text = models.TextField()
    optimized_skills = models.JSONField(default=list)
    diff_insights = models.JSONField(default=dict)  # Detailed metrics: missing skills, changes made, recommendations
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Optimization for {self.job.title} ({self.original_score}% -> {self.optimized_score}%)"
