"""
IntelliHire dataset seeder.
Generates a large, realistic job dataset: 18 role families x seniority levels x
companies/locations => 270 listings with role-accurate descriptions, skills, and salaries.

Run:  python seed_jobs.py
"""
import os
import random

import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'intellihire_backend.settings')
django.setup()

from core.models import Job

random.seed(42)  # deterministic dataset across reruns

COMPANIES = [
    "Nexus Corp", "PixelPerfect Solutions", "Nova Nexus", "TechStream Systems", "ScaleGuard Security",
    "DeepMind Solutions", "Analytics Lab", "CreativeStudio", "CloudSprint Technologies", "DataForge Labs",
    "Quantum Leap Software", "BrightHive Digital", "IronClad Systems", "SwiftStack Innovations", "BlueOrbit Tech",
    "Zenith Softworks", "CoreLogic India", "AstraByte Solutions", "NimbusWorks", "VertexEdge Technologies",
    "Falcon AI Labs", "UrbanStack", "PayZen Fintech", "MediSync Health Tech", "EduSpark Learning",
    "AgroTech Dynamics", "RetailNova Commerce", "LogiChain Systems", "GreenGrid Energy Tech", "SkyBridge Consulting",
    "Hexaview Digital", "InfraPulse", "CodeHarbor", "ByteBloom Studios", "TrustRail Security",
    "OmniCloud Services", "PulseMetrics Analytics", "Craftware Solutions", "NeoBank Financial", "StreamLyne Media",
    "Arclight Digital", "VertexPay", "Kite Commerce", "NorthStar Fintech", "TrailBlaze Logistics",
    "Lumina Health Tech", "OrbitEdge", "QuantumBit AI", "Solstice Analytics", "CloudRidge Infra",
    "SkyLoom Aerospace", "PixelForge Studios", "MangoLeaf Media", "SilverBirch Consulting", "Zentrix Technologies",
    "Bluepeak Systems", "Cognivia Labs", "Meridian Softworks", "HexaWave Solutions", "Tessellate Software",
]

LOCATIONS = [
    "Remote • India", "Bangalore, Karnataka", "Mumbai, Maharashtra", "Hyderabad, Telangana",
    "Chennai, Tamil Nadu", "Pune, Maharashtra", "Delhi NCR", "Gurgaon, Haryana", "Noida, Uttar Pradesh",
    "Kochi, Kerala", "Trivandrum, Kerala", "Ahmedabad, Gujarat", "Kolkata, West Bengal",
    "Jaipur, Rajasthan", "Indore, Madhya Pradesh", "Remote • Worldwide", "Hybrid • Bangalore", "Hybrid • Pune",
]

# seniority: (title prefix, years, salary band LPA (min, max), weight)
SENIORITY = [
    ("Junior ", "0-2 years", (3, 7), 6),
    ("", "2-5 years", (8, 18), 8),
    ("Senior ", "5-8 years", (18, 38), 6),
    ("Lead ", "8+ years", (35, 65), 2),
]

ROLE_TEMPLATES = [
    {
        "title": "Frontend Developer",
        "skills": ["React.js", "Next.js", "TypeScript", "JavaScript", "HTML5", "CSS3", "Tailwind CSS", "Redux Toolkit", "Jest", "Webpack", "GraphQL", "Responsive Design"],
        "desc": [
            "Build pixel-perfect, high-performance web interfaces using {s0} and {s1}. Collaborate with designers to translate Figma prototypes into responsive, accessible components, and own frontend performance budgets across the product.",
            "Join our product team to craft delightful user experiences with {s0}, {s1}, and {s2}. You will architect reusable component libraries, drive Core Web Vitals improvements, and mentor peers on modern frontend patterns.",
            "Develop and maintain large-scale single-page applications with {s0}. Work closely with backend engineers on API contracts, implement state management with {s3}, and champion automated testing.",
        ],
    },
    {
        "title": "Backend Engineer",
        "skills": ["Python", "Django", "FastAPI", "PostgreSQL", "Redis", "REST APIs", "Docker", "Celery", "AWS", "Microservices", "CI/CD", "SQL Optimization"],
        "desc": [
            "Design and scale backend services using {s0} and {s1}. You will own API design, optimize {s3} queries for high-traffic workloads, and build resilient async pipelines with {s7}.",
            "Architect distributed backend systems handling millions of requests daily. Deep experience with {s0}, {s5}, and {s9} is essential; you'll drive database schema design and service reliability.",
            "Build secure, well-documented REST APIs with {s1}/{s2}. Implement caching layers with {s4}, containerize services with {s6}, and collaborate on cloud deployments to {s8}.",
        ],
    },
    {
        "title": "Full Stack Developer",
        "skills": ["React.js", "Next.js", "TypeScript", "Node.js", "Python", "Django", "PostgreSQL", "MongoDB", "REST APIs", "Docker", "AWS", "Git"],
        "desc": [
            "Own features end-to-end: from {s0} interfaces to {s4}/{s5} backend services and {s6} schemas. Ship fast, test thoroughly, and deploy via automated pipelines.",
            "Bridge frontend and backend across our platform. You'll build with {s1} and {s3}, design clean REST APIs, and optimize both client rendering and server response times.",
            "Versatile engineer needed to build customer-facing products with {s0}, {s2}, and {s5}. Full ownership of features including database design, API development, and cloud deployment on {s10}.",
        ],
    },
    {
        "title": "DevOps Engineer",
        "skills": ["Docker", "Kubernetes", "Terraform", "AWS", "Jenkins", "GitHub Actions", "Linux", "Prometheus", "Grafana", "Ansible", "CI/CD", "Bash"],
        "desc": [
            "Own our cloud infrastructure: {s1} clusters, {s2}-managed {s3} environments, and zero-downtime {s10} pipelines. On-call rotation with a strong blameless culture.",
            "Automate everything. Build self-service deployment platforms with {s0} and {s1}, define infrastructure as code with {s2}, and set up observability with {s7} and {s8}.",
            "Scale and secure our multi-region cloud footprint on {s3}. You'll harden {s6} systems, optimize compute costs, and drive incident response maturity.",
        ],
    },
    {
        "title": "Machine Learning Engineer",
        "skills": ["Python", "PyTorch", "TensorFlow", "Scikit-Learn", "MLOps", "Docker", "AWS", "Hugging Face", "LLM Integration", "RAG Architectures", "SQL", "Spark"],
        "desc": [
            "Train, evaluate, and deploy ML models to production. Work with {s1}, {s7} transformers, and {s4} tooling to ship models that serve millions of predictions daily.",
            "Build our GenAI stack: {s8}, {s9}, and vector search. You'll fine-tune open-source models, design evaluation harnesses, and optimize inference latency.",
            "End-to-end ML ownership: feature pipelines with {s11}, experiment tracking, model serving with {s5}, and monitoring for drift in production.",
        ],
    },
    {
        "title": "Data Scientist",
        "skills": ["Python", "Pandas", "NumPy", "Scikit-Learn", "SQL", "Statistics", "A/B Testing", "Tableau", "Machine Learning", "Feature Engineering", "Matplotlib", "BigQuery"],
        "desc": [
            "Turn raw data into product decisions. Run {s6} experiments, build predictive models with {s3}, and present insights that shape our roadmap.",
            "Partner with product and engineering to define metrics, analyze funnels with {s4} and {s11}, and productionize models for personalization.",
            "Deep-dive statistical analysis on user behavior. Strong {s5} foundations, fluent {s0}/{s1}, and the storytelling skills to move stakeholders.",
        ],
    },
    {
        "title": "Data Analyst",
        "skills": ["SQL", "Excel", "Python", "Power BI", "Tableau", "Statistics", "Data Visualization", "Google Analytics", "dbt", "BigQuery", "Reporting", "Dashboard Design"],
        "desc": [
            "Own reporting for the business: build {s3} and {s4} dashboards, automate data pulls with {s0} and {s2}, and answer ad-hoc questions with rigor.",
            "Transform messy data into clean insight. Advanced {s0}, strong {s5} instincts, and experience presenting to non-technical stakeholders.",
            "Analyze product and marketing performance across {s7} and internal warehouses. Define KPIs, detect anomalies, and drive data literacy across teams.",
        ],
    },
    {
        "title": "Data Engineer",
        "skills": ["Python", "SQL", "Apache Spark", "Airflow", "Kafka", "Snowflake", "dbt", "ETL Pipelines", "AWS", "Data Modeling", "Docker", "Terraform"],
        "desc": [
            "Build and operate batch and streaming pipelines with {s2}, {s3}, and {s4}. You'll model data in {s5}, enforce quality contracts, and keep freshness SLAs green.",
            "Design our lakehouse architecture. Deep {s1} skills, production {s0} experience, and fluency with {s6} transformations expected.",
            "Scale ingestion from dozens of sources into {s5}. Own orchestration with {s3}, optimize warehouse costs, and enable self-serve analytics.",
        ],
    },
    {
        "title": "Mobile Developer",
        "skills": ["Flutter", "React Native", "Kotlin", "Swift", "Firebase", "REST APIs", "SQLite", "Push Notifications", "Play Store Deployment", "App Store Deployment", "State Management", "Git"],
        "desc": [
            "Ship beautiful cross-platform apps with {s0}/{s1}. Integrate {s4} services, own release trains to {s8} and {s9}, and obsess over crash-free rates.",
            "Build native-quality mobile experiences. You'll implement offline-first sync with {s6}, deep-link flows, and performant animations.",
            "Own our consumer app end-to-end: architecture, {s5} integrations, {s7}, and store optimization. 100k+ DAU scale.",
        ],
    },
    {
        "title": "UI/UX Designer",
        "skills": ["Figma", "Wireframing", "Prototyping", "User Research", "Design Systems", "Usability Testing", "Interaction Design", "Adobe XD", "Accessibility", "Journey Mapping", "Visual Design", "Design Thinking"],
        "desc": [
            "Design user journeys, high-fidelity {s0} prototypes, and scalable {s4}. Partner with engineers for pixel-perfect implementation and run {s5} sessions.",
            "Own the design of core product flows. From {s3} synthesis to polished visual design, you'll advocate for the user at every step.",
            "Craft intuitive B2B interfaces. Strong {s6} sensibilities, systems thinking with design tokens, and a portfolio of shipped work required.",
        ],
    },
    {
        "title": "Product Manager",
        "skills": ["Product Strategy", "Roadmap Planning", "Agile/Scrum", "Jira", "PRD Writing", "A/B Testing", "Market Research", "SQL Analytics", "Stakeholder Management", "User Stories", "OKRs", "Wireframing"],
        "desc": [
            "Own the roadmap for a core product line. Write crisp {s4}s, prioritize ruthlessly with data, and align engineering, design, and business stakeholders.",
            "Drive discovery and delivery for our fastest-growing product. You'll run {s5} experiments, define {s10}, and ship outcomes — not just features.",
            "Customer-obsessed PM needed. Do {s6}, translate insight into strategy, and lead cross-functional squads through Agile ceremonies.",
        ],
    },
    {
        "title": "QA Engineer",
        "skills": ["Selenium", "Playwright", "API Testing", "Postman", "Test Automation", "Jira", "SQL", "Regression Testing", "Cypress", "JMeter", "Test Case Design", "Agile Testing"],
        "desc": [
            "Build our automation suite with {s0}/{s1} and integrate it into CI. You'll own {s7} coverage, {s2} with {s3}, and quality gates for every release.",
            "Champion quality across squads. Design test strategies, automate the critical path with {s8}, and load-test with {s9}.",
            "Hybrid manual + automation role: exploratory testing instincts, solid {s6} for data validation, and scripting skills to scale yourself.",
        ],
    },
    {
        "title": "Security Analyst",
        "skills": ["SIEM", "Splunk", "Vulnerability Assessment", "OWASP Top 10", "Network Security", "Incident Response", "Wireshark", "Nmap", "Linux", "Penetration Testing", "Firewalls", "Threat Hunting"],
        "desc": [
            "Monitor and defend our infrastructure: triage {s0} alerts in {s1}, run {s2} programs, and lead {s5} for security events.",
            "Proactive defense role: {s11}, purple-team exercises, and hardening reviews across cloud and on-prem estates.",
            "Assess applications against {s3}, run authorized {s9} engagements, and drive remediation with engineering teams.",
        ],
    },
    {
        "title": "Cloud Architect",
        "skills": ["AWS", "Azure", "Kubernetes", "Terraform", "System Design", "Networking", "Cost Optimization", "Serverless", "Security Compliance", "High Availability", "Microservices", "GCP"],
        "desc": [
            "Define reference architectures on {s0} and {s1}. You'll lead migration programs, set {s8} guardrails, and mentor engineering teams on {s4}.",
            "Design multi-region, highly available platforms with {s2} and {s3}. Balance performance, {s6}, and developer experience.",
            "Trusted advisor role: workshops with stakeholders, {s4} reviews, and hands-on prototyping of {s7} and event-driven patterns.",
        ],
    },
    {
        "title": "Database Engineer",
        "skills": ["PostgreSQL", "MySQL", "Query Optimization", "Replication", "Sharding", "Backup & Recovery", "Performance Tuning", "AWS RDS", "MongoDB", "SQL", "Indexing", "Data Migration"],
        "desc": [
            "Own the reliability and performance of our {s0} fleet: {s2}, {s3} topologies, and disaster recovery drills.",
            "Deep-dive {s6} on multi-terabyte databases. You'll design {s10} strategies, guide schema reviews, and automate operations on {s7}.",
            "Lead {s11} projects with minimal downtime, implement {s4} for scale, and set database standards across engineering.",
        ],
    },
    {
        "title": "Site Reliability Engineer",
        "skills": ["Kubernetes", "Prometheus", "Grafana", "Go", "Python", "Incident Response", "Terraform", "AWS", "Observability", "Linux", "Chaos Engineering", "SLO Management"],
        "desc": [
            "Keep our platform fast and reliable: define {s11}, build {s8} with {s1}/{s2}, and automate toil away with {s3} or {s4}.",
            "Run production at scale. You'll lead {s5}, run blameless postmortems, and practice {s10} to find weaknesses before customers do.",
            "Embed with product teams to design for reliability: capacity planning, graceful degradation, and progressive rollouts on {s0}.",
        ],
    },
    {
        "title": "Business Analyst",
        "skills": ["Requirements Gathering", "SQL", "Process Mapping", "Stakeholder Management", "User Stories", "Excel", "Power BI", "Gap Analysis", "Jira", "Documentation", "UAT", "Agile"],
        "desc": [
            "Bridge business and engineering: elicit requirements, write {s4}, and drive {s10} to successful sign-off.",
            "Analyze workflows with {s2}, quantify opportunities with {s1} and {s6}, and shape solutions with product teams.",
            "Own {s7} for a major transformation program: current-state analysis, target design, and change management support.",
        ],
    },
    {
        "title": "Digital Marketing Specialist",
        "skills": ["SEO", "Google Ads", "Meta Ads", "Google Analytics", "Content Strategy", "Email Marketing", "Social Media Marketing", "Copywriting", "CRO", "Marketing Automation", "A/B Testing", "Keyword Research"],
        "desc": [
            "Own paid acquisition across {s1} and {s2}: budget strategy, creative testing, and ROAS accountability.",
            "Grow organic traffic with technical {s0}, {s11}, and a content engine you'll help design. Report through {s3}.",
            "Full-funnel marketer: landing page {s8}, {s5} nurture flows, and {s10} discipline in everything.",
        ],
    },
]

PERKS = [
    "Health insurance for family, flexible hours, and an annual learning budget.",
    "ESOPs, remote-first culture, and quarterly team retreats.",
    "Gym membership, device allowance, and generous parental leave.",
    "Flexible PTO, mentorship programs, and clear promotion tracks.",
    "Performance bonuses, certification sponsorships, and hackathon Fridays.",
    "",
    "",
]


def build_jobs():
    jobs = []
    for role in ROLE_TEMPLATES:
        for prefix, years, (lo, hi), weight in SENIORITY:
            for _ in range(weight):
                company = random.choice(COMPANIES)
                location = random.choice(LOCATIONS)
                skills = role["skills"]
                desc_tpl = random.choice(role["desc"])
                desc = desc_tpl
                for i, s in enumerate(skills):
                    desc = desc.replace("{s%d}" % i, s)
                perk = random.choice(PERKS)
                description = (
                    f"{desc} Experience required: {years}."
                    + (f" Perks: {perk}" if perk else "")
                )
                # salary with slight jitter per listing
                jitter = random.randint(0, 2)
                salary = f"₹{lo + jitter} – ₹{hi + jitter} LPA"
                # requirement list: 7-10 skills, seniority-flavored
                req_count = random.randint(7, min(10, len(skills)))
                requirements = ", ".join(random.sample(skills, req_count))
                jobs.append({
                    "title": f"{prefix}{role['title']}",
                    "company": company,
                    "location": location,
                    "salary_range": salary,
                    "description": description,
                    "requirements": requirements,
                })
    return jobs


def seed_jobs():
    print("Clearing existing jobs from the database...")
    Job.objects.all().delete()

    jobs = build_jobs()
    print(f"Seeding {len(jobs)} job listings...")
    Job.objects.bulk_create([Job(**data) for data in jobs])

    print(f"Done. Database now holds {Job.objects.count()} jobs "
          f"across {Job.objects.values_list('company', flat=True).distinct().count()} companies.")


if __name__ == "__main__":
    seed_jobs()
