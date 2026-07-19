"""Seed the ContentSnippet table with the CV content dataset.

Loads the curated banks exported from the frontend (cv_dataset.json) and then
programmatically expands them with template-based variations (different
companies, institutes, durations, metrics, and bullet combinations) so the
database holds a large, varied training dataset for AI CV suggestions.

Run:  python seed_cv_dataset.py
"""
import os
import json
import random
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'intellihire_backend.settings')
django.setup()

from core.models import ContentSnippet

random.seed(42)  # reproducible dataset

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(BASE_DIR, 'cv_dataset.json'), encoding='utf-8') as f:
    BANKS = json.load(f)

ROLES = list(BANKS['SUMMARY_BANK'].keys())

rows = []

def add(section, role, title, preview, payload, source='curated'):
    rows.append(ContentSnippet(
        section=section, role=role, title=title[:255],
        preview=preview, payload=payload, source=source,
    ))

# ────────────────────────────────────────────────────────────────
# 1. Curated rows straight from the frontend banks
# ────────────────────────────────────────────────────────────────
for role, options in BANKS['SUMMARY_BANK'].items():
    for i, s in enumerate(options):
        add('summary', role, f'Summary option {i + 1}', s, s)

for role, sets in BANKS['EXPERIENCE_BANK'].items():
    for entry_set in sets:
        title = '  +  '.join(e['company'] for e in entry_set)
        preview = '\n'.join(f"{e['position']} @ {e['company']} ({e['duration']})" for e in entry_set)
        add('experience', role, title, preview, entry_set)

for role, sets in BANKS['PROJECT_BANK'].items():
    for entry_set in sets:
        title = '  +  '.join(p['name'].split('–')[0].strip() for p in entry_set)
        preview = '\n\n'.join(f"{p['name']}\n{p['tech']}" for p in entry_set)
        add('projects', role, title, preview, entry_set)

for e in BANKS['EDUCATION_BANK']:
    title = (e.split('•')[1] if '•' in e else 'Education').strip()
    add('education', 'any', title, e, e)

for role, sets in BANKS['CERTIFICATION_BANK'].items():
    for i, cert_set in enumerate(sets):
        add('certifications', role, f'Certification set {i + 1}', '\n'.join(cert_set), cert_set)

for i, ach_set in enumerate(BANKS['ACHIEVEMENT_BANK']):
    add('achievements', 'any', f'Achievement set {i + 1}', '\n'.join(ach_set), ach_set)

for role, skill_set in BANKS['SKILLSET_BANK'].items():
    preview = '\n'.join(f'{k.capitalize()}: {v}' for k, v in skill_set.items() if v and v != '—')
    add('skills', role, f'Recommended {role} skill set', preview, skill_set)

curated_count = len(rows)

# ────────────────────────────────────────────────────────────────
# 2. Generated expansion — varied companies, institutes, metrics
# ────────────────────────────────────────────────────────────────
COMPANIES = [
    'Nexora Labs', 'BrightStack Technologies', 'Cloudberry Systems', 'PixelForge Studio',
    'DataHaven Analytics', 'Quantiva Solutions', 'Skyline Softworks', 'CoreLogic Digital',
    'Zenith Apps', 'NovaByte Technologies', 'Trailblaze Tech', 'Infinia Software',
    'Vertex Digital Labs', 'BlueOrbit Systems', 'CodeHarbor', 'Streamline Dynamics',
    'Apex Innovations', 'Lumina Softlabs', 'GridWorks Technologies', 'Everest Digital',
    'Nimbus Computing', 'FusionEdge Solutions', 'Craftware Studios', 'Orbital Analytics',
    'Silverline Technologies', 'Hyperloop Digital', 'Keystone Softworks', 'MetroTech Labs',
]
CITIES = [
    'Bangalore, Karnataka', 'Pune, Maharashtra', 'Hyderabad, Telangana', 'Chennai, Tamil Nadu',
    'Kochi, Kerala', 'Mumbai, Maharashtra', 'Gurugram, Haryana', 'Noida, Uttar Pradesh',
    'Thiruvananthapuram, Kerala', 'Coimbatore, Tamil Nadu', 'Ahmedabad, Gujarat', 'Remote, India',
]
DURATIONS = [
    'Jan 2024 – Present', 'Mar 2024 – Present', 'Jun 2023 – Feb 2024', 'Aug 2023 – May 2024',
    'Jan 2023 – Dec 2023', 'Apr 2024 – Present', 'Sep 2022 – Jul 2023', 'Feb 2023 – Jan 2024',
    'May 2024 – Present', 'Oct 2023 – Jun 2024', 'Jul 2022 – Apr 2023', 'Nov 2023 – Present',
]
POSITIONS = {
    'frontend': ['Frontend Developer', 'UI Engineer', 'React Developer', 'Frontend Engineer'],
    'backend': ['Backend Developer', 'Backend Engineer', 'API Engineer', 'Python Developer'],
    'fullstack': ['Full Stack Developer', 'Software Engineer', 'Product Engineer', 'Full Stack Engineer'],
    'data': ['Data Analyst', 'Machine Learning Engineer', 'Data Engineer', 'Analytics Engineer'],
    'devops': ['DevOps Engineer', 'Platform Engineer', 'Site Reliability Engineer', 'Cloud Engineer'],
    'mobile': ['Mobile Developer', 'Android Developer', 'Flutter Developer', 'iOS Developer'],
    'design': ['Product Designer', 'UI/UX Designer', 'Interaction Designer', 'Visual Designer'],
    'qa': ['QA Engineer', 'SDET', 'Test Automation Engineer', 'Quality Engineer'],
}
DEGREES = [
    'B.Tech Computer Science & Engineering', 'B.E. Information Technology', 'BCA', 'MCA',
    'B.Sc Computer Science', 'M.Tech Software Engineering', 'B.Tech Electronics & Communication',
    'B.E. Computer Engineering', 'Integrated M.Sc Data Science', 'B.Voc Software Development',
]
INSTITUTES = [
    'NIT Calicut', 'Anna University, Chennai', 'Cochin University of Science & Technology',
    'PES University, Bangalore', 'VIT Vellore', 'SRM Institute of Science & Technology',
    'College of Engineering Trivandrum', 'PSG College of Technology, Coimbatore',
    'BMS College of Engineering, Bangalore', 'Manipal Institute of Technology',
    'IIIT Hyderabad', 'Amrita Vishwa Vidyapeetham', 'RV College of Engineering',
    'Model Engineering College, Kochi', 'Government Engineering College, Thrissur',
]
CERT_POOL = {
    'frontend': ['Meta Front-End Developer Professional Certificate', 'React – The Complete Guide (Udemy)',
                 'JavaScript Algorithms & Data Structures (freeCodeCamp)', 'Responsive Web Design (freeCodeCamp)',
                 'TypeScript Deep Dive Certification', 'Next.js App Router Bootcamp', 'Advanced CSS & Sass (Udemy)'],
    'backend': ['Django for Everybody (Coursera)', 'FastAPI – The Complete Course', 'PostgreSQL Administration Essentials',
                'REST API Design Certification', 'Python Professional Certificate (PCEP/PCAP)',
                'Node.js Application Development (OpenJS)', 'Redis Certified Developer'],
    'fullstack': ['Full Stack Open (University of Helsinki)', 'Meta Back-End Developer Certificate',
                  'AWS Certified Cloud Practitioner', 'The Odin Project – Full Stack JavaScript',
                  'IBM Full Stack Software Developer Certificate', 'Docker Foundations Certification'],
    'data': ['Google Data Analytics Professional Certificate', 'Machine Learning Specialization (DeepLearning.AI)',
             'TensorFlow Developer Certificate', 'SQL for Data Science (Coursera)',
             'Microsoft Power BI Data Analyst (PL-300)', 'dbt Analytics Engineering Certification'],
    'devops': ['AWS Certified Solutions Architect – Associate', 'Certified Kubernetes Administrator (CKA)',
               'HashiCorp Terraform Associate', 'Docker Certified Associate',
               'GitHub Actions CI/CD Certification', 'Linux Foundation LFCS'],
    'mobile': ['Flutter & Dart – The Complete Guide', 'Android Developer Certification (Kotlin)',
               'iOS App Development with Swift (Coursera)', 'React Native – The Practical Guide',
               'Google Associate Android Developer', 'Firebase for Mobile Developers'],
    'design': ['Google UX Design Professional Certificate', 'Figma Advanced Certification',
               'Interaction Design Foundation UX Certificate', 'Design Systems with Figma',
               'Accessibility for Designers (WCAG 2.2)', 'Adobe Certified Professional – XD'],
    'qa': ['ISTQB Certified Tester Foundation Level', 'Playwright End-to-End Testing Certification',
           'Selenium WebDriver with Java (Udemy)', 'API Testing with Postman Certification',
           'Cypress Automation Bootcamp', 'Appium Mobile Automation Certification'],
}
ACHIEVEMENT_POOL = [
    'Winner – {org} Hackathon: built and demoed a working {thing} in under 24 hours.',
    'Finalist – Smart India Hackathon: shortlisted among the top {n} teams nationwide.',
    'Open Source: {n}+ merged pull requests across popular GitHub repositories.',
    'Speaker – presented "{topic}" at a local developer meetup with {n}+ attendees.',
    'Mentored {n} junior developers through a structured 8-week upskilling program.',
    'Ranked in the top {n}% on LeetCode with 400+ problems solved.',
    'Published a technical blog series on {topic} read by {n}k+ developers.',
    'Led a {n}-member student team that delivered a production-ready campus app.',
    'Best Capstone Project award for a {thing} judged by industry panel.',
    'Completed {n}+ freelance projects with a 5-star average client rating.',
]
ACH_ORGS = ['TechCrunch Disrupt', 'HackKerala', 'DevFest', 'CodeStorm', 'InnovateX', 'ByteBattle']
ACH_THINGS = ['job-matching platform', 'real-time chat application', 'inventory dashboard',
              'health-tracking PWA', 'campus events portal', 'expense-splitting app']
ACH_TOPICS = ['React performance tuning', 'API design patterns', 'CI/CD pipelines',
              'SQL optimization', 'design tokens', 'test automation strategy']

METRICS = ['25%', '30%', '35%', '40%', '45%', '50%', '60%']
USER_COUNTS = ['10k', '25k', '40k', '60k', '100k']


def jitter_bullet(b):
    """Vary the metrics inside a bullet so recombined sets don't read identical."""
    out = b
    for m in METRICS:
        if m in out and random.random() < 0.7:
            out = out.replace(m, random.choice(METRICS), 1)
            break
    for u in USER_COUNTS:
        if u in out and random.random() < 0.5:
            out = out.replace(u, random.choice(USER_COUNTS), 1)
            break
    return out


# 2a. Experience sets: recombine role bullet pools with fresh companies
for role in ROLES:
    pool = [b for s in BANKS['EXPERIENCE_BANK'].get(role, []) for e in s for b in e['bullets']]
    if not pool:
        continue
    for i in range(40):
        entries = []
        for j in range(2):
            entries.append({
                'company': random.choice(COMPANIES),
                'place': random.choice(CITIES),
                'position': random.choice(POSITIONS[role]) + (' Intern' if j == 1 and random.random() < 0.4 else ''),
                'duration': random.choice(DURATIONS),
                'bullets': [jitter_bullet(b) for b in random.sample(pool, min(5, len(pool)))],
            })
        title = '  +  '.join(e['company'] for e in entries)
        preview = '\n'.join(f"{e['position']} @ {e['company']} ({e['duration']})" for e in entries)
        add('experience', role, title, preview, entries, source='generated')

# 2b. Project sets: recombine project bullets with varied durations/tech
for role in ROLES:
    projs = [p for s in BANKS['PROJECT_BANK'].get(role, []) for p in s]
    if not projs:
        continue
    bullet_pool = [b for p in projs for b in p['bullets']]
    for i in range(35):
        chosen = random.sample(projs, min(2, len(projs)))
        entries = []
        for p in chosen:
            entries.append({
                'name': p['name'],
                'duration': random.choice(DURATIONS),
                'tech': p['tech'],
                'bullets': [jitter_bullet(b) for b in random.sample(bullet_pool, min(4, len(bullet_pool)))],
            })
        title = '  +  '.join(p['name'].split('–')[0].strip() for p in entries)
        preview = '\n\n'.join(f"{p['name']}\n{p['tech']}" for p in entries)
        add('projects', role, title, preview, entries, source='generated')

# 2c. Education: degree × institute × year × grade combinations
for i in range(220):
    degree = random.choice(DEGREES)
    inst = random.choice(INSTITUTES)
    end = random.randint(2019, 2026)
    start = end - (2 if degree in ('MCA', 'M.Tech Software Engineering') else 4)
    grade = f"CGPA {random.choice(['7.8', '8.0', '8.2', '8.4', '8.6', '8.8', '9.0', '9.2'])}"
    text = f"{degree} ({start} – {end}) • {inst} • {grade}"
    add('education', 'any', inst, text, text, source='generated')

# 2d. Certification sets per role
for role in ROLES:
    certs = CERT_POOL[role]
    for i in range(25):
        year = lambda: random.randint(2021, 2026)
        cert_set = [f'{c} ({year()})' for c in random.sample(certs, 3)]
        add('certifications', role, f'{role.capitalize()} certification mix {i + 1}',
            '\n'.join(cert_set), cert_set, source='generated')

# 2e. Achievement sets from templates
for i in range(120):
    templates = random.sample(ACHIEVEMENT_POOL, 3)
    ach_set = []
    for t in templates:
        ach_set.append(t.format(
            org=random.choice(ACH_ORGS), thing=random.choice(ACH_THINGS),
            topic=random.choice(ACH_TOPICS), n=random.choice([3, 5, 8, 10, 12, 20, 25, 50]),
        ))
    add('achievements', 'any', f'Achievement mix {i + 1}', '\n'.join(ach_set), ach_set, source='generated')

# 2f. Summaries: slot-template generation per role
SUMMARY_TEMPLATES = [
    "{title} with {years}+ {unit} of hands-on experience building {domain} using {stack}. "
    "{achievement} Known for writing clean, well-tested code and communicating clearly with designers, "
    "product managers, and stakeholders.",

    "{title} focused on {focus}. Delivered {n}+ production {deliverable} with {stack}, including "
    "{highlight}. Comfortable owning features end to end — from requirements and design discussions "
    "through deployment and monitoring.",

    "Results-driven {title} specializing in {stack}. {achievement} Passionate about {focus}, "
    "continuous learning, and mentoring peers; seeking a role on a product-focused engineering team "
    "where quality and speed both matter.",
]
SUMMARY_SLOTS = {
    'frontend': {
        'title': ['Frontend Developer', 'UI Engineer', 'React Developer'],
        'domain': ['responsive, accessible web interfaces', 'high-performance single-page applications', 'design-system-driven product UIs'],
        'stack': ['React, Next.js, and TypeScript', 'React, Redux Toolkit, and Tailwind CSS', 'Next.js, TypeScript, and CSS-in-JS'],
        'focus': ['web performance and Core Web Vitals', 'component architecture and design systems', 'accessibility and pixel-perfect implementation'],
        'deliverable': ['interfaces', 'dashboards', 'design-system components'],
        'highlight': ['a customer dashboard serving {u} monthly users'.format(u=u) for u in USER_COUNTS],
        'achievement': ['Lifted Lighthouse performance from the 60s to the mid-90s on a revenue-critical flow.',
                        'Cut bundle size by a third through code splitting and dependency pruning.',
                        'Shipped a component library adopted by multiple product squads.'],
    },
    'backend': {
        'title': ['Backend Developer', 'Backend Engineer', 'API Engineer'],
        'domain': ['resilient, well-documented REST APIs', 'data-intensive backend services', 'secure authentication and RBAC systems'],
        'stack': ['Python, Django, and PostgreSQL', 'FastAPI, PostgreSQL, and Redis', 'Node.js, NestJS, and PostgreSQL'],
        'focus': ['API design and typed contracts', 'query optimization and caching strategy', 'test-driven development and observability'],
        'deliverable': ['API endpoints', 'microservices', 'backend modules'],
        'highlight': ['an order-processing service scaled to thousands of requests per minute'],
        'achievement': ['Reduced p95 latency by more than half on a payments API.',
                        'Scaled an order pipeline 10x through caching and async task offloading.',
                        'Built auth infrastructure serving 100k+ users with security reviews covering OWASP Top 10.'],
    },
    'fullstack': {
        'title': ['Full Stack Developer', 'Product Engineer', 'Software Engineer'],
        'domain': ['end-to-end product features', 'multi-tenant SaaS foundations', 'customer-facing web applications'],
        'stack': ['React/Next.js frontends and Django/FastAPI backends', 'TypeScript, Node.js, Prisma, and PostgreSQL', 'React, Python, and PostgreSQL'],
        'focus': ['owning features from wireframe to production monitoring', 'clean interfaces and typed API contracts', 'fast feedback loops and pragmatic architecture'],
        'deliverable': ['applications', 'product features', 'full-stack modules'],
        'highlight': ['a real-time logistics tracker with WebSocket updates', 'a B2B billing portal handling high-volume invoices'],
        'achievement': ['Launched three customer-facing applications in 18 months.',
                        'Built billing, RBAC, and usage metering that onboarded 30+ paying teams.',
                        'Shipped a PWA with offline support and real-time dashboards.'],
    },
    'data': {
        'title': ['Data Analyst', 'Machine Learning Engineer', 'Analytics Engineer'],
        'domain': ['decision-ready analytics and ML systems', 'feature pipelines and model deployment workflows', 'governed metrics layers and self-serve dashboards'],
        'stack': ['Python, Pandas, and SQL', 'PyTorch, Airflow, and FastAPI', 'dbt, BigQuery, and Power BI'],
        'focus': ['experiment design and clear communication of findings', 'the full model lifecycle from features to drift monitoring', 'semantic layers trusted across the business'],
        'deliverable': ['models', 'pipelines', 'dashboards'],
        'highlight': ['churn-prediction models tied directly to recovered revenue'],
        'achievement': ['Automated weekly executive reporting, saving 12 analyst-hours per week.',
                        'Cut inference latency 4x through quantization with negligible accuracy loss.',
                        'Consolidated 14 ad-hoc spreadsheets into one governed metrics layer.'],
    },
    'devops': {
        'title': ['DevOps Engineer', 'Platform Engineer', 'Site Reliability Engineer'],
        'domain': ['production Kubernetes platforms', 'golden-path developer tooling', 'multi-region, highly available infrastructure'],
        'stack': ['Kubernetes, Terraform, and ArgoCD', 'AWS, Docker, and GitHub Actions', 'Prometheus, Grafana, and Linux'],
        'focus': ['GitOps delivery and deployment safety', 'developer experience and self-service environments', 'SLO-based alerting and incident response'],
        'deliverable': ['pipelines', 'Terraform modules', 'environments'],
        'highlight': ['a failover design that survived a real availability-zone outage'],
        'achievement': ['Took deployment frequency from weekly to 15+ per day while halving change-failure rate.',
                        'Reduced cloud spend by roughly a third through right-sizing and lifecycle policies.',
                        'Cut new-service setup from 3 days to under an hour with golden-path templates.'],
    },
    'mobile': {
        'title': ['Mobile Developer', 'Android Engineer', 'Flutter Developer'],
        'domain': ['cross-platform mobile apps', 'offline-first mobile experiences', 'store-ready Android and iOS releases'],
        'stack': ['Flutter and Dart', 'Kotlin and Jetpack Compose', 'React Native and TypeScript'],
        'focus': ['crash-free, performant releases', 'offline sync and conflict resolution', 'store conversion and release ownership'],
        'deliverable': ['app releases', 'mobile features', 'app modules'],
        'highlight': ['apps with 100k+ combined installs'],
        'achievement': ['Rebuilt a checkout flow that raised conversion 18%.',
                        'Cut cold-start time 43% and app size 27%.',
                        'Maintain 99.6% crash-free sessions across releases.'],
    },
    'design': {
        'title': ['Product Designer', 'UI/UX Designer', 'Interaction Designer'],
        'domain': ['research-driven product experiences', 'token-based design systems', 'accessible, conversion-focused interfaces'],
        'stack': ['Figma, prototyping, and usability testing', 'design tokens and production CSS', 'Figma and motion prototyping'],
        'focus': ['discovery research through shipped UI', 'design-to-dev handoff quality', 'measurable UX improvements'],
        'deliverable': ['design systems', 'redesigns', 'prototypes'],
        'highlight': ['an onboarding redesign that lifted activation 26%'],
        'achievement': ['Ran 40+ moderated usability sessions that reshaped a portal IA.',
                        "Built the company's first token-based design system, halving handoff time.",
                        'Cut task-completion time 35% for non-technical users.'],
    },
    'qa': {
        'title': ['QA Engineer', 'SDET', 'Test Automation Engineer'],
        'domain': ['automation suites other engineers trust', 'shift-left quality practices', 'web, API, and mobile test coverage'],
        'stack': ['Playwright, Cypress, and CI pipelines', 'Postman/Newman and contract testing', 'Appium and parallelized suites'],
        'focus': ['flake-free automation at scale', 'testability feedback in requirement reviews', 'release confidence for payment-critical systems'],
        'deliverable': ['test scenarios', 'suites', 'quality gates'],
        'highlight': ['600+ CI scenarios with flake rates under 1%'],
        'achievement': ['Shrunk regression cycles from 3 days to 4 hours.',
                        'Cut escaped defects 40% quarter over quarter with shift-left reviews.',
                        'Own idempotency and ledger-reconciliation suites for a payments product.'],
    },
}
for role in ROLES:
    slots = SUMMARY_SLOTS.get(role)
    if not slots:
        continue
    for i in range(45):
        t = random.choice(SUMMARY_TEMPLATES)
        text = t.format(
            title=random.choice(slots['title']),
            years=random.choice([1, 2, 3, 4, 5]),
            unit=random.choice(['years', 'years']),
            domain=random.choice(slots['domain']),
            stack=random.choice(slots['stack']),
            focus=random.choice(slots['focus']),
            n=random.choice([3, 5, 8, 10, 15, 20]),
            deliverable=random.choice(slots['deliverable']),
            highlight=random.choice(slots['highlight']),
            achievement=random.choice(slots['achievement']),
        )
        add('summary', role, f'{role.capitalize()} summary variant {i + 1}', text, text, source='generated')

# 2g. Skill-set variants: shuffle emphasis inside each curated role set
for role, skill_set in BANKS['SKILLSET_BANK'].items():
    for i in range(6):
        variant = {}
        for k, v in skill_set.items():
            if not v or v == '—':
                variant[k] = v
                continue
            items = [s.strip() for s in v.split(',') if s.strip()]
            random.shuffle(items)
            keep = max(4, len(items) - random.randint(0, 3))
            variant[k] = ', '.join(items[:keep])
        preview = '\n'.join(f'{k.capitalize()}: {v}' for k, v in variant.items() if v and v != '—')
        add('skills', role, f'{role.capitalize()} skill emphasis {i + 1}', preview, variant, source='generated')

# ────────────────────────────────────────────────────────────────
# 3. Write to the database
# ────────────────────────────────────────────────────────────────
ContentSnippet.objects.all().delete()
ContentSnippet.objects.bulk_create(rows, batch_size=500)

total = ContentSnippet.objects.count()
print(f'Seeded {total} content snippets ({curated_count} curated, {total - curated_count} generated)')
for section in ['summary', 'skills', 'experience', 'projects', 'education', 'certifications', 'achievements']:
    print(f'  {section}: {ContentSnippet.objects.filter(section=section).count()}')
