import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from .models import Job, CandidateCV, CVOptimization, ContentSnippet
from .nlp_engine import NLPParser, TFIDFVectorizer, LLMOptimizer, SKILLS_TAXONOMY
from .ai_chat import generate_reply
from .knowledge_base import ROLE_KB
from .ml_engine import predict_roles
from .llm_chat import generate_llm_reply

# Document extraction helpers
from pypdf import PdfReader
import docx

def parse_uploaded_file(uploaded_file):
    """Parses text from TXT, PDF, and DOCX uploaded files."""
    name = uploaded_file.name.lower()
    
    try:
        uploaded_file.seek(0)
    except Exception as e:
        print("Error seeking file:", str(e))
    
    if name.endswith('.txt'):
        try:
            return uploaded_file.read().decode('utf-8').strip()
        except Exception:
            try:
                uploaded_file.seek(0)
                return uploaded_file.read().decode('latin-1').strip()
            except Exception:
                return ""
                
    elif name.endswith('.pdf'):
        try:
            reader = PdfReader(uploaded_file)
            text = ""
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
            return text.strip()
        except Exception as e:
            import traceback
            traceback.print_exc()
            raise RuntimeError(f"PDF extraction failed: {str(e)}")
            
    elif name.endswith('.docx'):
        try:
            doc = docx.Document(uploaded_file)
            text = []
            for para in doc.paragraphs:
                text.append(para.text)
            return "\n".join(text).strip()
        except Exception as e:
            import traceback
            traceback.print_exc()
            raise RuntimeError(f"DOCX extraction failed: {str(e)}")
            
    return ""


@csrf_exempt
def job_list(request):
    """Returns a list of all jobs in the database."""
    if request.method == 'GET':
        jobs = Job.objects.all().order_by('-posted_at')
        jobs_data = []
        for job in jobs:
            jobs_data.append({
                'id': job.id,
                'title': job.title,
                'company': job.company,
                'location': job.location,
                'description': job.description,
                'requirements': [r.strip() for r in job.requirements.split(',') if r.strip()],
                'salary_range': job.salary_range or "Not specified",
                'posted_at': job.posted_at.strftime('%Y-%m-%d')
            })
        return JsonResponse({'jobs': jobs_data})
    
    elif request.method == 'POST':
        # Admin or developer endpoint to create a job easily
        try:
            data = json.loads(request.body)
            job = Job.objects.create(
                title=data['title'],
                company=data['company'],
                location=data['location'],
                description=data['description'],
                requirements=data['requirements'],
                salary_range=data.get('salary_range', '')
            )
            return JsonResponse({'success': True, 'job_id': job.id}, status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
            
    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def parse_cv(request):
    """Parses text and skills from an uploaded CV file without running optimization."""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    try:
        cv_file = request.FILES.get('cv_file')
        cv_text = request.POST.get('cv_text', '')
        
        if cv_file:
            cv_text = parse_uploaded_file(cv_file)
            
        if cv_file and (not cv_text or not cv_text.strip()):
            return JsonResponse({'error': f'The uploaded file "{cv_file.name}" (size: {cv_file.size} bytes) has no extractable text. Please upload a text-based document or use the chat to create your CV.'}, status=400)
            
        if not cv_text or not cv_text.strip():
            return JsonResponse({'error': 'No CV text or file provided.'}, status=400)
            
        skills = NLPParser.extract_skills(cv_text)
        return JsonResponse({
            'success': True,
            'text': cv_text,
            'skills': skills
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def optimize_cv(request):
    """Optimizes an uploaded/pasted CV for a specific target job."""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
        
    try:
        # Extract job_id
        job_id = request.POST.get('job_id')
        cv_text = request.POST.get('cv_text', '')
        
        # Check if file uploaded
        cv_file = request.FILES.get('cv_file')
        
        if cv_file:
            cv_text = parse_uploaded_file(cv_file)
            
        if not cv_text or not cv_text.strip():
            # Try to read raw JSON if sent that way
            if request.body:
                try:
                    data = json.loads(request.body)
                    job_id = data.get('job_id')
                    cv_text = data.get('cv_text', '')
                except Exception:
                    pass
                    
        if cv_file and (not cv_text or not cv_text.strip()):
            return JsonResponse({'error': f'The uploaded file "{cv_file.name}" (size: {cv_file.size} bytes) has no extractable text. Please upload a text-based document or use the chat to create your CV.'}, status=400)
            
        if not cv_text or not cv_text.strip():
            return JsonResponse({'error': 'No CV text or file provided.'}, status=400)
            
        if not job_id:
            return JsonResponse({'error': 'No target job selected.'}, status=400)
            
        try:
            job = Job.objects.get(id=job_id)
        except Job.DoesNotExist:
            return JsonResponse({'error': f'Job with ID {job_id} not found in the database.'}, status=404)
        
        # Extract skills of original resume
        original_skills = NLPParser.extract_skills(cv_text)
        
        # Save original CV
        cv = CandidateCV.objects.create(
            original_text=cv_text,
            parsed_skills=original_skills
        )
        
        # Optimize CV using LLMOptimizer
        optimized_text, original_score, optimized_score, insights = LLMOptimizer.optimize(
            cv_text=cv_text,
            job_title=job.title,
            job_requirements=job.requirements,
            job_description=job.description
        )
        
        # Save optimization results
        optimization = CVOptimization.objects.create(
            cv=cv,
            job=job,
            original_score=original_score,
            optimized_score=optimized_score,
            optimized_text=optimized_text,
            optimized_skills=insights['skills_count_optimized'],  # represented by number or list
            diff_insights=insights
        )
        
        return JsonResponse({
            'success': True,
            'optimization_id': optimization.id,
            'original_text': cv_text,
            'original_skills': original_skills,
            'original_score': original_score,
            'optimized_text': optimized_text,
            'optimized_skills': insights['matching_skills'] + insights['missing_skills'],
            'optimized_score': optimized_score,
            'insights': insights
        })
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def chat_assistant(request):
    """AI Career Assistant — answers career, salary, interview, and job-search questions."""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    try:
        data = json.loads(request.body) if request.body else {}
        message = (data.get('message') or '').strip()
        if not message:
            return JsonResponse({'error': 'Empty message.'}, status=400)
        # LLM-first when the local model is enabled; rule engine otherwise/on failure
        result = generate_llm_reply(message)
        if result is None:
            result = generate_reply(message)
            result.setdefault('source', 'rules')
        result['success'] = True
        return JsonResponse(result)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def predict_role(request):
    """ML endpoint — predicts the best-fit job roles for a CV using the trained
    scikit-learn classifier (TF-IDF + Logistic Regression)."""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    try:
        cv_text = request.POST.get('cv_text', '')
        cv_file = request.FILES.get('cv_file')

        if cv_file:
            cv_text = parse_uploaded_file(cv_file)

        if not cv_text or not cv_text.strip():
            if request.body:
                try:
                    data = json.loads(request.body)
                    cv_text = data.get('cv_text', '')
                except Exception:
                    pass

        if not cv_text or not cv_text.strip():
            return JsonResponse({'error': 'No CV text or file provided.'}, status=400)

        predictions = predict_roles(cv_text)
        return JsonResponse({'success': True, 'predictions': predictions})
    except FileNotFoundError as e:
        return JsonResponse({'error': str(e)}, status=503)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({'error': str(e)}, status=500)


def platform_stats(request):
    """Dataset statistics for the dashboard."""
    if request.method != 'GET':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    jobs = Job.objects.all()
    companies = jobs.values_list('company', flat=True).distinct().count()
    locations = jobs.values_list('location', flat=True).distinct().count()
    return JsonResponse({
        'total_jobs': jobs.count(),
        'total_companies': companies,
        'total_locations': locations,
        'skills_in_taxonomy': len(SKILLS_TAXONOMY),
        'roles_in_knowledge_base': len(ROLE_KB),
        'cvs_optimized': CVOptimization.objects.count(),
        'content_snippets': ContentSnippet.objects.count(),
    })


def cv_content(request):
    """Returns random AI-suggestion options for a CV section from the dataset.

    GET /api/cv-content/?section=summary&role=frontend&count=3
    Rows tagged role='any' apply to every role. Falls back to fullstack, then
    to any role, so the endpoint always returns options when the section exists.
    """
    if request.method != 'GET':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    section = (request.GET.get('section') or '').strip()
    role = (request.GET.get('role') or 'fullstack').strip()
    try:
        count = max(1, min(int(request.GET.get('count', 3)), 10))
    except ValueError:
        count = 3
    if not section:
        return JsonResponse({'error': 'section is required'}, status=400)

    qs = ContentSnippet.objects.filter(section=section, role__in=[role, 'any'])
    if not qs.exists():
        qs = ContentSnippet.objects.filter(section=section, role__in=['fullstack', 'any'])
    if not qs.exists():
        qs = ContentSnippet.objects.filter(section=section)

    options = [
        {'title': s.title, 'preview': s.preview, 'payload': s.payload, 'source': s.source}
        for s in qs.order_by('?')[:count]
    ]
    return JsonResponse({'section': section, 'role': role, 'options': options})


@csrf_exempt
def recommend_jobs(request):
    """Calculates cosine similarity matching between CV and database jobs."""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
        
    try:
        cv_text = request.POST.get('cv_text', '')
        cv_file = request.FILES.get('cv_file')
        
        if cv_file:
            cv_text = parse_uploaded_file(cv_file)
            
        if not cv_text or not cv_text.strip():
            if request.body:
                try:
                    data = json.loads(request.body)
                    cv_text = data.get('cv_text', '')
                except Exception:
                    pass
                    
        if not cv_text or not cv_text.strip():
            return JsonResponse({'error': 'No CV text or file provided.'}, status=400)
            
        # Get all jobs
        jobs = list(Job.objects.all())
        if not jobs:
            return JsonResponse({'recommendations': []})
            
        # Fit TF-IDF on CV and all job profiles combined
        docs = [cv_text]
        for job in jobs:
            job_doc = f"{job.title} {job.description} {job.requirements}"
            docs.append(job_doc)
            
        vectorizer = TFIDFVectorizer()
        vectorizer.fit(docs)
        
        # Transform CV
        cv_vector = vectorizer.transform(cv_text)
        
        recommendations = []
        for index, job in enumerate(jobs):
            job_doc = f"{job.title} {job.description} {job.requirements}"
            job_vector = vectorizer.transform(job_doc)
            
            # Compute similarity
            sim = vectorizer.cosine_similarity(cv_vector, job_vector)
            match_score = int(sim * 100)
            
            # Add some baseline matching if they overlap in direct skills to make it feel natural
            cv_skills = set(NLPParser.extract_skills(cv_text))
            job_skills = set(NLPParser.extract_skills(job_doc))
            overlap = cv_skills.intersection(job_skills)
            
            if len(job_skills) > 0:
                skill_sim = len(overlap) / len(job_skills)
                # blend tf-idf and raw keyword matching
                match_score = int((sim * 0.6 + skill_sim * 0.4) * 100)
                
            # Bound the score realistically
            match_score = max(min(match_score, 98), 5)
            
            recommendations.append({
                'id': job.id,
                'title': job.title,
                'company': job.company,
                'location': job.location,
                'salary_range': job.salary_range or "Not specified",
                'match_score': match_score,
                'matching_skills': list(overlap),
                'description': job.description
            })
            
        # Sort recommendations by match score descending
        recommendations.sort(key=lambda x: x['match_score'], reverse=True)
        
        return JsonResponse({
            'success': True,
            'recommendations': recommendations
        })
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({'error': str(e)}, status=500)
