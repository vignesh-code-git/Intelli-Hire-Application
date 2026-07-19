"""
IntelliHire AI Knowledge Base
Large curated dataset powering the AI Career Assistant:
role profiles, interview question banks, salary insights (India),
career roadmaps, resume/ATS guidance, and HR interview preparation.
"""

# ─────────────────────────────────────────────────────────────
# ROLE KNOWLEDGE BASE — 18 role profiles
# ─────────────────────────────────────────────────────────────
ROLE_KB = {
    "frontend developer": {
        "aliases": ["frontend", "front-end", "front end", "react developer", "ui developer", "angular developer", "vue developer"],
        "title": "Frontend Developer",
        "core_skills": ["React", "Next.js", "TypeScript", "JavaScript (ES6+)", "HTML5", "CSS3", "Tailwind CSS", "Redux Toolkit", "Responsive Design", "Web Performance"],
        "bonus_skills": ["Framer Motion", "Storybook", "Jest", "Playwright", "GraphQL", "Accessibility (a11y)", "PWA"],
        "salary": {"fresher": "₹3.5 – 6 LPA", "mid": "₹8 – 18 LPA", "senior": "₹20 – 45 LPA"},
        "career_path": "Junior Frontend Dev → Frontend Dev → Senior Frontend Dev → Frontend Lead / Staff Engineer → Engineering Manager or Principal Engineer",
        "certifications": ["Meta Front-End Developer (Coursera)", "freeCodeCamp Responsive Web Design", "AWS Certified Cloud Practitioner"],
        "interview_questions": [
            "Explain the Virtual DOM and how React's reconciliation works.",
            "What is the difference between `useMemo` and `useCallback`? When would you use each?",
            "How does the browser render a page? Explain the Critical Rendering Path.",
            "What are the differences between CSS Grid and Flexbox? When do you choose each?",
            "Explain event delegation and event bubbling in JavaScript.",
            "How would you optimize a React app that renders a list of 10,000 items?",
            "What is hydration in Next.js and what causes hydration mismatch errors?",
            "Explain closures in JavaScript with a practical example.",
        ],
    },
    "backend developer": {
        "aliases": ["backend", "back-end", "back end", "backend engineer", "python developer", "django developer", "node developer", "api developer", "java developer"],
        "title": "Backend Developer",
        "core_skills": ["Python", "Django / FastAPI", "Node.js / Express", "PostgreSQL", "Redis", "REST APIs", "JWT Authentication", "Docker", "System Design", "SQL Optimization"],
        "bonus_skills": ["GraphQL", "Kafka", "RabbitMQ", "Microservices", "gRPC", "AWS Lambda", "Celery"],
        "salary": {"fresher": "₹4 – 7 LPA", "mid": "₹10 – 20 LPA", "senior": "₹22 – 50 LPA"},
        "career_path": "Junior Backend Dev → Backend Dev → Senior Backend Dev → Tech Lead → Architect / Engineering Manager",
        "certifications": ["AWS Certified Developer – Associate", "PCEP / PCAP Python Certification", "MongoDB Developer Certification"],
        "interview_questions": [
            "How do you design a rate limiter for an API?",
            "Explain database indexing. When can an index make queries slower?",
            "What is the N+1 query problem and how do you solve it in Django ORM?",
            "Compare SQL vs NoSQL — when would you choose each?",
            "How does JWT authentication work? What are its security trade-offs vs sessions?",
            "Explain ACID properties with real-world examples.",
            "How would you scale a backend that suddenly gets 100x traffic?",
            "What are idempotent APIs and why do they matter for payments?",
        ],
    },
    "full stack developer": {
        "aliases": ["full stack", "fullstack", "full-stack", "mern", "mean stack"],
        "title": "Full Stack Developer",
        "core_skills": ["React / Next.js", "TypeScript", "Node.js or Python (Django/FastAPI)", "PostgreSQL / MongoDB", "REST & GraphQL APIs", "Docker", "Git", "CI/CD", "Cloud Deployment (AWS/Vercel)"],
        "bonus_skills": ["Redis", "WebSockets", "Stripe/Razorpay Integration", "Testing (Jest/Pytest)", "Kubernetes basics"],
        "salary": {"fresher": "₹4 – 8 LPA", "mid": "₹10 – 22 LPA", "senior": "₹25 – 55 LPA"},
        "career_path": "Junior Full Stack Dev → Full Stack Dev → Senior Full Stack Dev → Tech Lead → Solution Architect / CTO track",
        "certifications": ["Meta Full-Stack Certificate", "AWS Solutions Architect Associate", "freeCodeCamp Full Stack"],
        "interview_questions": [
            "Walk me through what happens when a user types a URL and hits Enter.",
            "How do you structure authentication across a React frontend and Django/Node backend?",
            "Server-side rendering vs client-side rendering — trade-offs?",
            "How do you handle file uploads end-to-end (frontend → backend → cloud storage)?",
            "Describe your approach to designing a database schema for an e-commerce app.",
            "How do you keep frontend and backend types in sync in a TypeScript project?",
            "Explain CORS. Why does it exist and how do you configure it correctly?",
        ],
    },
    "devops engineer": {
        "aliases": ["devops", "sre", "site reliability", "platform engineer", "cloud engineer", "infrastructure engineer"],
        "title": "DevOps Engineer",
        "core_skills": ["Docker", "Kubernetes", "Terraform", "AWS / Azure / GCP", "CI/CD (Jenkins, GitHub Actions)", "Linux", "Bash/Python scripting", "Prometheus & Grafana", "Networking fundamentals"],
        "bonus_skills": ["Helm", "ArgoCD", "Istio", "Ansible", "ELK Stack", "Chaos Engineering"],
        "salary": {"fresher": "₹4.5 – 8 LPA", "mid": "₹12 – 25 LPA", "senior": "₹28 – 60 LPA"},
        "career_path": "Junior DevOps → DevOps Engineer → Senior DevOps / SRE → Platform Lead → Head of Infrastructure",
        "certifications": ["AWS Solutions Architect Associate", "CKA (Certified Kubernetes Administrator)", "HashiCorp Terraform Associate"],
        "interview_questions": [
            "Explain the difference between a Deployment, StatefulSet, and DaemonSet in Kubernetes.",
            "How would you design a zero-downtime deployment pipeline?",
            "What happens when a pod exceeds its memory limit?",
            "Explain blue-green vs canary deployments.",
            "How do you manage secrets in a CI/CD pipeline?",
            "A service is responding slowly in production — walk me through your debugging process.",
            "What is Infrastructure as Code and why is state management hard in Terraform?",
        ],
    },
    "data scientist": {
        "aliases": ["data science", "ml scientist", "ai scientist"],
        "title": "Data Scientist",
        "core_skills": ["Python", "Pandas", "NumPy", "Scikit-Learn", "SQL", "Statistics & Probability", "Feature Engineering", "Data Visualization (Matplotlib/Seaborn)", "A/B Testing"],
        "bonus_skills": ["PyTorch/TensorFlow", "Spark", "MLflow", "Tableau/Power BI", "Causal Inference", "NLP"],
        "salary": {"fresher": "₹5 – 9 LPA", "mid": "₹12 – 26 LPA", "senior": "₹30 – 65 LPA"},
        "career_path": "Data Analyst → Junior Data Scientist → Data Scientist → Senior DS → Lead DS / ML Manager → Head of Data Science",
        "certifications": ["Google Data Analytics Professional", "IBM Data Science Professional", "AWS Machine Learning Specialty"],
        "interview_questions": [
            "Explain the bias-variance trade-off with examples.",
            "How do you handle imbalanced datasets?",
            "Precision vs Recall — when does each matter more? Give a business example.",
            "How would you design an A/B test for a new recommendation feature?",
            "Explain regularization (L1 vs L2) and why it prevents overfitting.",
            "You have missing data in 30% of a critical column — what do you do?",
            "How do you explain a complex model's prediction to a non-technical stakeholder?",
        ],
    },
    "machine learning engineer": {
        "aliases": ["ml engineer", "machine learning", "mlops engineer", "ai engineer", "deep learning engineer"],
        "title": "Machine Learning Engineer",
        "core_skills": ["Python", "PyTorch / TensorFlow", "Scikit-Learn", "MLOps (MLflow, Kubeflow)", "Docker", "Model Deployment", "SQL", "Feature Stores", "Distributed Training"],
        "bonus_skills": ["LLMs & Fine-tuning", "LangChain / RAG", "Vector Databases", "Spark", "Kubernetes", "ONNX / Model Optimization"],
        "salary": {"fresher": "₹6 – 10 LPA", "mid": "₹15 – 30 LPA", "senior": "₹35 – 80 LPA"},
        "career_path": "ML Intern → ML Engineer → Senior ML Engineer → Staff ML Engineer → ML Architect / Head of AI",
        "certifications": ["AWS ML Specialty", "TensorFlow Developer Certificate", "Databricks ML Associate"],
        "interview_questions": [
            "How do you deploy a model that must serve 10,000 predictions per second?",
            "Explain the difference between online and batch inference.",
            "What is model drift and how do you detect and handle it in production?",
            "How does backpropagation work? Walk through the math intuition.",
            "Explain transformers and self-attention at a high level.",
            "What is RAG and when is it better than fine-tuning?",
            "How would you reduce the latency of a large model without retraining?",
        ],
    },
    "data analyst": {
        "aliases": ["business analyst", "analytics", "bi analyst", "reporting analyst"],
        "title": "Data Analyst",
        "core_skills": ["SQL", "Excel (advanced)", "Python (Pandas)", "Tableau / Power BI", "Statistics", "Data Cleaning", "Dashboard Design", "Stakeholder Communication"],
        "bonus_skills": ["dbt", "BigQuery/Snowflake", "A/B Testing", "Google Analytics", "Looker"],
        "salary": {"fresher": "₹3.5 – 6 LPA", "mid": "₹7 – 15 LPA", "senior": "₹16 – 30 LPA"},
        "career_path": "Data Analyst → Senior Analyst → Analytics Lead → Data Science / Analytics Manager → Head of Analytics",
        "certifications": ["Google Data Analytics Certificate", "Microsoft PL-300 (Power BI)", "Tableau Desktop Specialist"],
        "interview_questions": [
            "Write a SQL query to find the second-highest salary per department.",
            "Explain the difference between INNER, LEFT, and FULL OUTER JOIN.",
            "A metric dropped 20% overnight — walk me through your investigation.",
            "What is a window function? Give an example using RANK() or LAG().",
            "How do you decide which chart type fits which data story?",
            "Explain p-value in plain language a manager would understand.",
        ],
    },
    "data engineer": {
        "aliases": ["etl developer", "big data engineer", "pipeline engineer"],
        "title": "Data Engineer",
        "core_skills": ["Python", "SQL", "Apache Spark", "Airflow", "ETL/ELT Pipelines", "Data Warehousing (Snowflake/BigQuery)", "Kafka", "Data Modeling", "AWS/GCP data stack"],
        "bonus_skills": ["dbt", "Databricks", "Terraform", "Streaming (Flink)", "Iceberg/Delta Lake"],
        "salary": {"fresher": "₹5 – 8 LPA", "mid": "₹12 – 25 LPA", "senior": "₹28 – 60 LPA"},
        "career_path": "Junior Data Engineer → Data Engineer → Senior DE → Staff DE / Data Platform Lead → Data Architect",
        "certifications": ["Google Professional Data Engineer", "AWS Data Analytics Specialty", "Databricks Data Engineer Associate"],
        "interview_questions": [
            "Design a daily ETL pipeline that ingests 100GB of clickstream data.",
            "Explain partitioning and bucketing in Spark.",
            "Star schema vs Snowflake schema — trade-offs?",
            "How do you handle late-arriving data in a streaming pipeline?",
            "What is idempotency in data pipelines and why is it critical?",
            "Batch vs streaming — how do you choose?",
        ],
    },
    "mobile developer": {
        "aliases": ["android developer", "ios developer", "flutter developer", "react native developer", "app developer"],
        "title": "Mobile Developer",
        "core_skills": ["Flutter / React Native", "Kotlin or Swift", "REST API Integration", "State Management", "SQLite / Local Storage", "Push Notifications", "App Store / Play Store Deployment"],
        "bonus_skills": ["Firebase", "CI/CD for mobile (Fastlane)", "Offline-first architecture", "In-app purchases", "Jetpack Compose / SwiftUI"],
        "salary": {"fresher": "₹3.5 – 6.5 LPA", "mid": "₹8 – 18 LPA", "senior": "₹20 – 45 LPA"},
        "career_path": "Junior Mobile Dev → Mobile Dev → Senior Mobile Dev → Mobile Lead → Head of Mobile Engineering",
        "certifications": ["Google Associate Android Developer", "Meta React Native Certificate"],
        "interview_questions": [
            "How does Flutter render UI differently from React Native?",
            "Explain the Activity/Fragment lifecycle in Android.",
            "How do you handle offline data sync in a mobile app?",
            "What strategies do you use to reduce app size and startup time?",
            "How do push notifications work end-to-end?",
        ],
    },
    "ui/ux designer": {
        "aliases": ["ux designer", "ui designer", "product designer", "ux", "interaction designer", "designer"],
        "title": "UI/UX Designer",
        "core_skills": ["Figma", "Wireframing", "Prototyping", "User Research", "Usability Testing", "Design Systems", "Interaction Design", "Visual Hierarchy", "Accessibility"],
        "bonus_skills": ["Motion Design", "HTML/CSS basics", "Design Tokens", "A/B Testing", "Journey Mapping"],
        "salary": {"fresher": "₹3 – 6 LPA", "mid": "₹8 – 16 LPA", "senior": "₹18 – 40 LPA"},
        "career_path": "Junior Designer → Product Designer → Senior Designer → Design Lead → Head of Design",
        "certifications": ["Google UX Design Certificate", "NN/g UX Certification", "Interaction Design Foundation"],
        "interview_questions": [
            "Walk me through your design process from brief to handoff.",
            "How do you conduct user research when you have no budget?",
            "Tell me about a time user testing changed your design decision.",
            "How do you design for accessibility?",
            "How do you handle disagreement with a PM or engineer about a design?",
        ],
    },
    "product manager": {
        "aliases": ["product owner", "pm", "product management", "apm"],
        "title": "Product Manager",
        "core_skills": ["Product Strategy", "Roadmap Planning", "User Stories & PRDs", "Agile/Scrum", "Stakeholder Management", "Data-Driven Decisions (SQL basics)", "A/B Testing", "Market Research"],
        "bonus_skills": ["Figma basics", "Analytics tools (Mixpanel/Amplitude)", "Pricing Strategy", "Go-To-Market"],
        "salary": {"fresher": "₹8 – 14 LPA", "mid": "₹18 – 35 LPA", "senior": "₹40 – 90 LPA"},
        "career_path": "APM → PM → Senior PM → Group PM / Director of Product → VP Product → CPO",
        "certifications": ["Certified Scrum Product Owner (CSPO)", "Pragmatic Institute PMC", "Google PM Certificate"],
        "interview_questions": [
            "How would you improve our product? (Practice this for any company you apply to.)",
            "Design a product for elderly users to manage medications.",
            "A key metric dropped 15% — how do you investigate?",
            "How do you prioritize when engineering capacity is halved?",
            "Estimate the market size for food delivery in your city.",
            "Tell me about a product decision you got wrong and what you learned.",
        ],
    },
    "qa engineer": {
        "aliases": ["qa", "test engineer", "sdet", "quality assurance", "automation tester", "tester"],
        "title": "QA Engineer",
        "core_skills": ["Manual Testing", "Test Case Design", "Selenium / Playwright", "API Testing (Postman)", "SQL", "Bug Tracking (Jira)", "Regression Testing", "Agile Testing"],
        "bonus_skills": ["Cypress", "Performance Testing (JMeter)", "CI/CD Integration", "Mobile Testing (Appium)", "Security Testing basics"],
        "salary": {"fresher": "₹3 – 5.5 LPA", "mid": "₹7 – 14 LPA", "senior": "₹15 – 30 LPA"},
        "career_path": "QA Tester → QA Engineer → Senior QA / SDET → QA Lead → QA Manager / Head of Quality",
        "certifications": ["ISTQB Foundation Level", "Certified Selenium Professional"],
        "interview_questions": [
            "What is the difference between smoke, sanity, and regression testing?",
            "How do you write test cases for a login page?",
            "Explain the bug life cycle.",
            "How do you decide what to automate vs test manually?",
            "How do you test an API without documentation?",
        ],
    },
    "security analyst": {
        "aliases": ["cybersecurity", "cyber security", "security engineer", "soc analyst", "penetration tester", "infosec"],
        "title": "Security Analyst",
        "core_skills": ["Network Security", "SIEM (Splunk)", "Vulnerability Assessment", "OWASP Top 10", "Incident Response", "Linux", "Wireshark", "Firewalls & IDS/IPS"],
        "bonus_skills": ["Penetration Testing (Metasploit, Burp Suite)", "Cloud Security", "Python scripting", "Threat Hunting", "Forensics"],
        "salary": {"fresher": "₹4 – 7 LPA", "mid": "₹10 – 20 LPA", "senior": "₹22 – 50 LPA"},
        "career_path": "SOC Analyst L1 → L2/L3 Analyst → Security Engineer → Security Architect → CISO track",
        "certifications": ["CompTIA Security+", "CEH (Certified Ethical Hacker)", "OSCP", "CISSP (senior)"],
        "interview_questions": [
            "Explain the CIA triad with examples.",
            "What is the difference between symmetric and asymmetric encryption?",
            "Walk me through how you'd respond to a ransomware alert.",
            "What is SQL injection and how do you prevent it?",
            "Explain how TLS handshake works.",
        ],
    },
    "cloud architect": {
        "aliases": ["solutions architect", "cloud solutions", "aws architect", "azure architect"],
        "title": "Cloud Architect",
        "core_skills": ["AWS / Azure / GCP (deep in one)", "System Design", "Networking (VPC, DNS, CDN)", "Terraform", "Kubernetes", "Cost Optimization", "Security & Compliance", "High Availability Design"],
        "bonus_skills": ["Multi-cloud strategy", "Serverless architectures", "Event-driven design", "Migration planning"],
        "salary": {"fresher": "₹8 – 14 LPA (rare entry)", "mid": "₹20 – 40 LPA", "senior": "₹45 – 95 LPA"},
        "career_path": "Cloud Engineer → Senior Cloud Engineer → Cloud Architect → Principal Architect → CTO track",
        "certifications": ["AWS Solutions Architect Professional", "Azure Solutions Architect Expert", "Google Professional Cloud Architect"],
        "interview_questions": [
            "Design a multi-region architecture for a global e-commerce platform.",
            "How do you design for 99.99% availability?",
            "Explain when you'd choose serverless vs containers vs VMs.",
            "How do you approach a lift-and-shift vs re-architecture migration?",
            "A client's cloud bill doubled — how do you audit and reduce it?",
        ],
    },
    "database engineer": {
        "aliases": ["dba", "database administrator", "database developer"],
        "title": "Database Engineer",
        "core_skills": ["PostgreSQL / MySQL internals", "Query Optimization", "Indexing Strategies", "Replication & Sharding", "Backup & Recovery", "SQL & PL/SQL", "Performance Tuning"],
        "bonus_skills": ["NoSQL (MongoDB, Cassandra)", "Cloud databases (RDS, Aurora)", "Data migration", "Monitoring"],
        "salary": {"fresher": "₹4 – 7 LPA", "mid": "₹10 – 20 LPA", "senior": "₹22 – 45 LPA"},
        "career_path": "Junior DBA → Database Engineer → Senior DBE → Database Architect → Data Platform Head",
        "certifications": ["Oracle Certified Professional", "AWS Database Specialty", "PostgreSQL Associate"],
        "interview_questions": [
            "How does a B-tree index work and when does it fail to help?",
            "Explain MVCC in PostgreSQL.",
            "How do you migrate a 500GB production database with minimal downtime?",
            "What is replication lag and how do you handle it?",
            "Explain isolation levels and the anomalies each prevents.",
        ],
    },
    "hr manager": {
        "aliases": ["hr", "human resources", "recruiter", "talent acquisition", "hr executive"],
        "title": "HR Manager",
        "core_skills": ["Talent Acquisition", "Employee Relations", "HRMS Tools", "Performance Management", "Payroll & Compliance", "Onboarding", "Stakeholder Communication"],
        "bonus_skills": ["HR Analytics", "Employer Branding", "L&D Programs", "Compensation Design"],
        "salary": {"fresher": "₹3 – 5 LPA", "mid": "₹7 – 15 LPA", "senior": "₹18 – 40 LPA"},
        "career_path": "HR Executive → HR Generalist → HR Manager → Senior HR Manager → HR Director / CHRO",
        "certifications": ["SHRM-CP", "PHR", "LinkedIn Talent Solutions Certification"],
        "interview_questions": [
            "How do you handle a conflict between an employee and their manager?",
            "What metrics do you use to measure recruitment effectiveness?",
            "How do you improve employee retention?",
            "Describe your approach to a sensitive termination.",
        ],
    },
    "digital marketing": {
        "aliases": ["marketing", "seo specialist", "growth marketer", "performance marketing", "social media"],
        "title": "Digital Marketing Specialist",
        "core_skills": ["SEO", "Google Ads", "Meta Ads", "Google Analytics (GA4)", "Content Strategy", "Email Marketing", "Social Media Marketing", "Copywriting"],
        "bonus_skills": ["Marketing Automation (HubSpot)", "CRO", "Influencer Marketing", "Basic HTML/CSS"],
        "salary": {"fresher": "₹2.5 – 5 LPA", "mid": "₹6 – 14 LPA", "senior": "₹15 – 35 LPA"},
        "career_path": "Marketing Executive → Specialist → Marketing Manager → Head of Growth → CMO",
        "certifications": ["Google Ads Certification", "HubSpot Content Marketing", "Meta Blueprint"],
        "interview_questions": [
            "How would you improve organic traffic for a site with declining rankings?",
            "Explain how you'd structure a ₹1 lakh/month ad budget for a new D2C brand.",
            "What KPIs matter most for a SaaS marketing funnel?",
            "How do you measure content marketing ROI?",
        ],
    },
    "business analyst": {
        "aliases": ["ba", "business analysis", "functional analyst", "product analyst"],
        "title": "Business Analyst",
        "core_skills": ["Requirements Gathering", "SQL", "Process Mapping (BPMN)", "Stakeholder Management", "User Stories", "Excel & Power BI", "Gap Analysis", "Documentation"],
        "bonus_skills": ["Agile/Scrum", "Jira/Confluence", "Python basics", "UAT coordination"],
        "salary": {"fresher": "₹4 – 7 LPA", "mid": "₹8 – 16 LPA", "senior": "₹18 – 35 LPA"},
        "career_path": "Junior BA → Business Analyst → Senior BA → Lead BA / Product Owner → Product Manager / Program Manager",
        "certifications": ["ECBA / CCBA (IIBA)", "CBAP (senior)", "Agile Analysis Certification"],
        "interview_questions": [
            "How do you handle conflicting requirements from two senior stakeholders?",
            "Explain the difference between BRD, FRD, and user stories.",
            "Walk me through eliciting requirements for a system replacing manual work.",
            "How do you validate that a delivered feature meets the requirement?",
        ],
    },
}

# ─────────────────────────────────────────────────────────────
# RESUME / ATS GUIDANCE
# ─────────────────────────────────────────────────────────────
RESUME_TIPS = [
    "**Use strong action verbs** — start bullets with 'Engineered', 'Architected', 'Led', 'Optimized' instead of 'Worked on' or 'Helped with'.",
    "**Quantify everything** — 'Reduced API latency by 40%' beats 'Improved API performance'. Numbers make recruiters stop scrolling.",
    "**Mirror the job description** — ATS systems rank you by keyword match. If the JD says 'React.js', write 'React.js', not just 'frontend frameworks'.",
    "**Keep it to 1 page** (2 max for 10+ years experience). Recruiters spend ~7 seconds on the first scan.",
    "**Skills section near the top** — group by category: Languages, Frameworks, Databases, Tools. ATS parsers love this.",
    "**No tables, columns, images, or fancy fonts** — many ATS parsers fail on them. Clean single-column layout wins.",
    "**Use standard section headers** — 'Work Experience', 'Education', 'Technical Skills'. Creative headers confuse parsers.",
    "**Tailor for every application** — a generic CV scores 40-60% on ATS; a tailored one scores 80%+.",
    "**Show impact, not duties** — 'Responsible for testing' → 'Cut regression cycle from 3 days to 4 hours by automating 200+ test cases'.",
    "**Save as PDF** (unless the portal asks for DOCX) with a professional filename: Firstname_Lastname_Role.pdf.",
]

ATS_EXPLANATION = (
    "**How ATS scoring works:**\n"
    "1. The system extracts text from your CV and identifies skills, titles, and years of experience.\n"
    "2. It compares them against the job description's keywords.\n"
    "3. You get ranked against other applicants — typically only the top 20-25% get human eyes.\n\n"
    "IntelliHire's optimizer does this comparison for you: upload your CV, pick a target job, "
    "and we highlight missing keywords, weak verbs, and unquantified bullets — then generate an optimized version."
)

# ─────────────────────────────────────────────────────────────
# HR / BEHAVIORAL INTERVIEW BANK
# ─────────────────────────────────────────────────────────────
HR_QUESTIONS = [
    {
        "q": "Tell me about yourself.",
        "tip": "Use the Present–Past–Future formula: what you do now, key achievements that got you here, and why this role is the natural next step. Keep it under 2 minutes.",
    },
    {
        "q": "What is your greatest weakness?",
        "tip": "Pick a real but non-critical weakness, then show active improvement: 'I used to over-engineer solutions; now I timebox design phases and validate with stakeholders early.'",
    },
    {
        "q": "Why do you want to work here?",
        "tip": "Research the company. Connect one specific thing (product, tech stack, mission) to your own goals. Generic answers are instant red flags.",
    },
    {
        "q": "Tell me about a conflict with a teammate.",
        "tip": "Use STAR (Situation, Task, Action, Result). Focus on how you listened, found common ground, and what the relationship looked like after.",
    },
    {
        "q": "Where do you see yourself in 5 years?",
        "tip": "Show ambition aligned with the company: growing into a senior/lead role, deepening expertise, mentoring others. Avoid 'running my own startup'.",
    },
    {
        "q": "Why are you leaving your current job?",
        "tip": "Never badmouth. Frame it as moving toward growth: bigger challenges, new technology, more ownership.",
    },
    {
        "q": "What are your salary expectations?",
        "tip": "Give a researched range, not a number: 'Based on my experience and market rates for this role, I'm looking at X–Y LPA, flexible for the right opportunity.'",
    },
    {
        "q": "Do you have any questions for us?",
        "tip": "Always ask 2-3. Good ones: 'What does success look like in the first 90 days?', 'What's the team's biggest current challenge?', 'How is engineering performance evaluated?'",
    },
]

INTERVIEW_GENERAL_TIPS = [
    "**Research the company** — product, recent news, tech stack, competitors. 10 minutes of research puts you ahead of 80% of candidates.",
    "**Practice out loud** — answers that sound great in your head fall apart when spoken. Record yourself or use a mirror.",
    "**Prepare 5 STAR stories** — conflict, failure, leadership, tight deadline, proudest achievement. They cover 90% of behavioral questions.",
    "**Think aloud in technical rounds** — interviewers grade your reasoning process, not just the final answer.",
    "**Ask clarifying questions** before solving — jumping straight into code/solutions without confirming requirements is the #1 technical interview mistake.",
    "**Have questions ready** — 'No questions' signals low interest.",
    "**Follow up within 24 hours** — a short thank-you email referencing something specific from the conversation.",
]

# ─────────────────────────────────────────────────────────────
# PLATFORM HELP
# ─────────────────────────────────────────────────────────────
PLATFORM_GUIDE = (
    "**Here's what I can do for you:**\n"
    "• **Build a CV from scratch** — type your name and target role (e.g. *'Priya Sharma, Frontend Developer'*) and I'll generate a professional ATS-ready CV instantly.\n"
    "• **Optimize an existing CV** — click **Upload CV** (PDF/DOCX/TXT) and I'll parse it, score it against jobs, and rewrite weak sections.\n"
    "• **Find matching jobs** — ask *'show me remote Python jobs'* or *'frontend jobs in Bangalore'*.\n"
    "• **Interview prep** — ask *'interview questions for data scientist'* or *'HR interview tips'*.\n"
    "• **Career guidance** — ask *'salary for DevOps engineer'*, *'career path for QA'*, or *'skills needed for ML engineer'*.\n"
    "• **Resume advice** — ask *'how do I improve my resume?'* or *'how does ATS work?'*"
)
