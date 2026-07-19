// ═══════════════════════════════════════════════════════════════
// IntelliHire Deep AI Training Dataset
// Varied, role-specific content banks for AI-assisted CV editing.
// Every suggestion uses distinct companies, institutes, and phrasing —
// no repeated boilerplate.
// ═══════════════════════════════════════════════════════════════

// Map a free-text position to a dataset role key
export const getRoleType = (position = "") => {
  const p = position.toLowerCase();
  if (/(front|react|angular|vue|ui developer)/.test(p)) return "frontend";
  if (/(back|django|fastapi|node|python|java|api)/.test(p)) return "backend";
  if (/(data sci|machine|ml|ai engineer|analyst|data engineer|analytics)/.test(p)) return "data";
  if (/(devops|cloud|sre|site reliab|platform|infra)/.test(p)) return "devops";
  if (/(mobile|android|ios|flutter|react native)/.test(p)) return "mobile";
  if (/(design|ux|ui\/ux|product designer)/.test(p)) return "design";
  if (/(qa|test|quality|sdet)/.test(p)) return "qa";
  return "fullstack";
};

// ── PROFESSIONAL SUMMARIES ─────────────────────────────────────
export const SUMMARY_BANK = {
  frontend: [
    "Frontend Developer specializing in React 19, Next.js App Router, and TypeScript, with a track record of shipping accessible, high-performance interfaces. Rebuilt a customer dashboard used by 40k monthly users, lifting Lighthouse performance from 61 to 96 and cutting bundle size by 38%. Passionate about design systems, motion, and measurable UX wins.",
    "UI Engineer with deep expertise in component architecture, state management (Redux Toolkit, Zustand), and CSS engineering. Delivered three production design systems adopted across 12 product squads, reducing UI defect rates by 45%. Strong collaborator with designers — fluent in Figma handoff, tokens, and accessibility (WCAG 2.2 AA).",
    "Product-minded Frontend Developer who owns features from Figma frame to production telemetry. Skilled in Next.js SSR/ISR, React Query, and edge deployment on Vercel. Instrumented Core Web Vitals monitoring that surfaced regressions before release, protecting conversion rates on a revenue-critical checkout flow.",
  ],
  backend: [
    "Backend Engineer focused on designing resilient, well-documented APIs with Python (Django, FastAPI) and PostgreSQL. Scaled an order-processing service from 200 to 6,000 requests/minute through query optimization, Redis caching, and async task offloading with Celery. Strong advocate of test-driven development and typed contracts.",
    "API-first Backend Developer experienced in Node.js (NestJS) and Python microservices, event-driven messaging with Kafka, and zero-downtime deployment patterns. Reduced p95 latency by 58% on a payments API and led the migration of a monolith into six independently deployable services.",
    "Backend Engineer specializing in data-intensive systems: schema design, indexing strategy, replication, and query planning on PostgreSQL. Built authentication and RBAC infrastructure serving 100k+ users, with security reviews covering OWASP Top 10 and automated dependency auditing in CI.",
  ],
  fullstack: [
    "Full Stack Developer delivering end-to-end product features across React/Next.js frontends and Django/FastAPI backends. Shipped a B2B billing portal handling ₹2Cr+ in monthly invoices — schema design, REST APIs, dashboard UI, and CI/CD included. Comfortable owning ambiguity from wireframe to production monitoring.",
    "Product Engineer with balanced strengths in TypeScript frontends and Python backends. Launched three customer-facing applications in 18 months, including a real-time logistics tracker with WebSocket updates and offline-capable PWA support. Values clean interfaces, typed API contracts, and fast feedback loops.",
    "Full Stack Developer experienced with the modern JavaScript ecosystem (React, Node.js, Prisma, PostgreSQL) and cloud deployment on AWS. Built multi-tenant SaaS foundations — organization models, role-based permissions, usage metering, and Stripe billing — that onboarded 30+ paying teams in the first quarter.",
  ],
  data: [
    "Data professional skilled in Python (Pandas, Scikit-Learn), SQL, and experiment design. Built churn-prediction models that recovered an estimated ₹40L in annual revenue and automated weekly executive reporting, saving 12 analyst-hours per week. Communicates findings in clear, decision-ready narratives.",
    "Machine Learning Engineer with production experience across the model lifecycle: feature pipelines with Airflow, training with PyTorch, deployment behind FastAPI, and drift monitoring. Cut inference latency 4x through ONNX quantization while holding accuracy within 0.5% of baseline.",
    "Analytics Engineer bridging data engineering and business insight — dbt models on BigQuery, semantic layers, and self-serve dashboards in Power BI. Consolidated 14 ad-hoc spreadsheets into a governed metrics layer trusted by finance, product, and leadership.",
  ],
  devops: [
    "DevOps Engineer running production Kubernetes (EKS) with GitOps delivery via ArgoCD. Took deployment frequency from weekly to 15+ per day while cutting change-failure rate in half, and reduced AWS spend 32% through right-sizing, spot fleets, and storage lifecycle policies.",
    "Platform Engineer focused on developer experience: golden-path templates, Terraform modules, and self-service environments that cut new-service setup from 3 days to 40 minutes. Built observability standards on Prometheus/Grafana with SLO-based alerting that ended alert fatigue.",
    "Site Reliability Engineer with strong Linux internals and incident-management experience. Led response for 30+ production incidents, drove postmortem culture, and hardened a multi-region failover that survived a real AZ outage with zero customer impact.",
  ],
  mobile: [
    "Mobile Developer shipping cross-platform apps with Flutter and React Native to 100k+ combined installs. Rebuilt a checkout flow that raised conversion 18%, integrated offline-first sync with conflict resolution, and maintain 99.6% crash-free sessions across Android and iOS releases.",
    "Android Engineer (Kotlin, Jetpack Compose) with Play Store release ownership: staged rollouts, crash triage, and performance profiling. Cut cold-start time 43% and app size 27%, directly improving store conversion and uninstall rates.",
    "Cross-platform Mobile Developer pairing Flutter expertise with solid REST/GraphQL integration patterns, push-notification pipelines, and in-app purchase flows. Led a two-person team that delivered a fintech companion app from concept to store approval in 14 weeks.",
  ],
  design: [
    "Product Designer covering the full arc from discovery research to shipped UI. Redesigned onboarding for a B2B SaaS product, lifting activation 26%, and built the company's first token-based design system in Figma, halving design-to-dev handoff time.",
    "UI/UX Designer with strengths in interaction design, prototyping, and usability testing. Ran 40+ moderated sessions that reshaped a healthcare portal's information architecture, cutting task-completion time 35% for non-technical users.",
    "Designer-developer hybrid fluent in Figma and production CSS. Partners deeply with engineering — writes token specs, reviews implementation PRs, and prototypes motion in code — so shipped interfaces match design intent pixel for pixel.",
  ],
  qa: [
    "QA Engineer blending exploratory testing instincts with automation at scale: 600+ Playwright scenarios in CI, contract tests on critical APIs, and flake rates under 1%. Shrunk regression cycles from 3 days to 4 hours and became the release-confidence signal the team trusts.",
    "SDET experienced in building test infrastructure other engineers enjoy using — fixtures, seeded environments, and parallelized suites. Championed shift-left quality: requirement reviews and testability feedback that cut escaped defects 40% quarter over quarter.",
    "Quality Engineer covering web, API, and mobile surfaces with Cypress, Postman/Newman, and Appium. Owns test strategy for a payments product where correctness is non-negotiable — idempotency checks, ledger reconciliation suites, and chaos-day participation.",
  ],
};

// ── WORK EXPERIENCE SETS (each set = 2 varied entries) ─────────
export const EXPERIENCE_BANK = {
  frontend: [
    [
      {
        company: "Arclight Digital", place: "Bangalore, Karnataka", position: "Frontend Developer",
        duration: "Mar 2024 – Present",
        bullets: [
          "Own the customer-facing dashboard (React 19, Next.js 15, TypeScript) serving 40k monthly active users.",
          "Raised Lighthouse performance score from 61 to 96 via route-level code splitting, image optimization, and font subsetting.",
          "Built 30+ reusable components into the design system with Storybook docs, adopted by 4 product squads.",
          "Introduced React Query for server state, deleting 2,100 lines of hand-rolled fetching logic and fixing stale-data bugs.",
          "Paired with designers weekly on Figma reviews; drove accessibility fixes to reach WCAG 2.2 AA on core flows.",
        ],
      },
      {
        company: "MangoLeaf Media", place: "Kochi, Kerala", position: "Junior Web Developer",
        duration: "Jul 2022 – Feb 2024",
        bullets: [
          "Developed marketing sites and campaign microsites with Next.js and Tailwind CSS for 12 client brands.",
          "Built an internal CMS-driven landing-page builder that cut campaign launch time from 5 days to 1.",
          "Implemented analytics event tracking (GA4) and A/B experiments that informed creative decisions.",
          "Maintained cross-browser compatibility and responsive behavior across 320px–4K viewports.",
        ],
      },
    ],
    [
      {
        company: "VertexPay", place: "Hyderabad, Telangana", position: "UI Engineer",
        duration: "Jan 2024 – Present",
        bullets: [
          "Build and maintain the merchant onboarding flow (React, TypeScript, Redux Toolkit) processing 3k signups/month.",
          "Cut checkout-widget bundle from 480kB to 190kB, directly improving embed performance on partner sites.",
          "Implemented real-time payment status via WebSockets with graceful reconnection and optimistic UI.",
          "Wrote 250+ component and integration tests (Jest, React Testing Library), holding coverage above 85%.",
          "Mentor two interns through structured code reviews and weekly frontend guild sessions.",
        ],
      },
      {
        company: "PixelForge Studios", place: "Remote", position: "Frontend Developer (Contract)",
        duration: "Apr 2023 – Dec 2023",
        bullets: [
          "Delivered a video-editing SaaS timeline UI with virtualized rendering handling 1,000+ clips smoothly.",
          "Built keyboard-first interactions and undo/redo command stack praised in customer feedback.",
          "Integrated Stripe billing portal and usage-based upgrade prompts, supporting the launch of paid tiers.",
        ],
      },
    ],
  ],
  backend: [
    [
      {
        company: "NorthStar Fintech", place: "Mumbai, Maharashtra", position: "Backend Engineer",
        duration: "Feb 2024 – Present",
        bullets: [
          "Design and operate payment-ledger APIs (Python, FastAPI, PostgreSQL) processing ₹8Cr+ monthly volume.",
          "Scaled order processing from 200 to 6,000 req/min via query tuning, connection pooling, and Redis caching.",
          "Implemented idempotency keys and outbox-pattern event publishing, eliminating duplicate-payment incidents.",
          "Own database migrations and schema reviews; introduced partitioning that kept p95 queries under 40ms at 10x data growth.",
          "Write ADRs and runbooks; on-call rotation member with two blameless postmortems authored.",
        ],
      },
      {
        company: "Kite Commerce", place: "Chennai, Tamil Nadu", position: "Software Engineer (Backend)",
        duration: "Jun 2022 – Jan 2024",
        bullets: [
          "Built catalog and inventory services (Django REST Framework) powering 200+ storefronts.",
          "Reduced nightly sync job from 4 hours to 25 minutes with bulk operations and select_related/prefetch tuning.",
          "Added JWT auth with refresh rotation and per-tenant RBAC covering 14 permission scopes.",
          "Containerized services with Docker and wrote GitHub Actions pipelines running tests, linting, and deploys.",
        ],
      },
    ],
    [
      {
        company: "TrailBlaze Logistics", place: "Pune, Maharashtra", position: "Backend Developer",
        duration: "Nov 2023 – Present",
        bullets: [
          "Develop shipment-tracking microservices (NestJS, TypeScript, PostgreSQL, Kafka) handling 1.2M events/day.",
          "Designed the geofence-alert engine with Redis streams, delivering notifications within 3 seconds of breach.",
          "Cut p95 API latency 58% by introducing read replicas and materialized views for heavy dashboard queries.",
          "Built gRPC contracts between five internal services with backward-compatible versioning discipline.",
          "Led the quarterly load-testing exercise (k6), documenting capacity headroom for peak season.",
        ],
      },
      {
        company: "SilverBirch Consulting", place: "Gurgaon, Haryana", position: "Associate Software Engineer",
        duration: "Aug 2021 – Oct 2023",
        bullets: [
          "Delivered REST APIs and integrations for three enterprise clients across insurance and retail domains.",
          "Automated a manual reconciliation workflow with scheduled Python jobs, saving the client 20 hours/week.",
          "Wrote comprehensive Pytest suites and fixtures; raised service coverage from 40% to 88%.",
        ],
      },
    ],
  ],
  fullstack: [
    [
      {
        company: "Lumina Health Tech", place: "Bangalore, Karnataka", position: "Full Stack Developer",
        duration: "Jan 2024 – Present",
        bullets: [
          "Ship patient-portal features end-to-end: React/Next.js UI, Django REST APIs, and PostgreSQL schema design.",
          "Built the appointment-scheduling module (calendar UI, conflict detection, SMS reminders) used 9k times/month.",
          "Implemented role-based access for doctors, staff, and patients across 20+ protected API resources.",
          "Set up CI/CD with GitHub Actions and preview environments, cutting review turnaround from days to hours.",
          "Reduced page-load times 47% through API response shaping, HTTP caching, and image CDN adoption.",
        ],
      },
      {
        company: "OrbitEdge", place: "Trivandrum, Kerala", position: "Software Developer",
        duration: "May 2022 – Dec 2023",
        bullets: [
          "Built an internal analytics suite (React, FastAPI, PostgreSQL) replacing spreadsheet-based reporting.",
          "Designed REST endpoints with typed Pydantic contracts consumed by web and mobile clients.",
          "Introduced Docker-based local environments, standardizing setup across an eight-person team.",
          "Created real-time charts (Recharts + WebSockets) for operations monitoring dashboards.",
        ],
      },
    ],
    [
      {
        company: "QuantumBit AI", place: "Remote", position: "Product Engineer (Full Stack)",
        duration: "Sep 2023 – Present",
        bullets: [
          "Own the customer workspace product across a Next.js frontend and Node.js (NestJS) backend on AWS.",
          "Launched multi-tenant foundations — org models, invitations, RBAC, and Stripe metered billing — onboarding 30+ teams.",
          "Built collaborative document editing with CRDT sync, supporting 50 concurrent editors per workspace.",
          "Instrumented product analytics and error tracking (Sentry), cutting mean time-to-detection to under 10 minutes.",
          "Interview loop member; wrote the team's take-home exercise and rubric used for 20+ candidates.",
        ],
      },
      {
        company: "GreenGrid Energy Tech", place: "Ahmedabad, Gujarat", position: "Junior Full Stack Developer",
        duration: "Jan 2022 – Aug 2023",
        bullets: [
          "Developed solar-plant monitoring dashboards (React, Django) visualizing telemetry from 400+ sites.",
          "Wrote ingestion jobs normalizing vendor CSV/API feeds into a unified PostgreSQL schema.",
          "Added report exports (PDF/Excel) that became the most-used feature among plant operators.",
        ],
      },
    ],
  ],
  data: [
    [
      {
        company: "Solstice Analytics", place: "Bangalore, Karnataka", position: "Data Scientist",
        duration: "Mar 2024 – Present",
        bullets: [
          "Built churn-prediction models (XGBoost, Scikit-Learn) recovering an estimated ₹40L in annual recurring revenue.",
          "Design and analyze A/B experiments for pricing and onboarding; authored the team's experimentation playbook.",
          "Productionized feature pipelines with Airflow and dbt on BigQuery, cutting model-refresh time from days to 2 hours.",
          "Present monthly insight reviews to leadership; three recommendations became roadmap commitments.",
        ],
      },
      {
        company: "RetailNova Commerce", place: "Mumbai, Maharashtra", position: "Data Analyst",
        duration: "Jun 2022 – Feb 2024",
        bullets: [
          "Owned demand-forecasting dashboards (SQL, Power BI) used by 30 category managers for weekly buying calls.",
          "Automated executive reporting with Python, replacing 12 hours of weekly manual spreadsheet work.",
          "Built cohort and funnel analyses that identified a checkout drop-off worth 6% of monthly GMV.",
        ],
      },
    ],
    [
      {
        company: "MediSync Health Tech", place: "Hyderabad, Telangana", position: "Machine Learning Engineer",
        duration: "Oct 2023 – Present",
        bullets: [
          "Deployed a document-extraction service (PyTorch, FastAPI) processing 50k medical records monthly at 97% field accuracy.",
          "Cut inference latency 4x via ONNX quantization and batching while holding accuracy within 0.5% of baseline.",
          "Built drift monitoring with weekly evaluation jobs and alerting; caught two silent data-quality regressions.",
          "Fine-tuned domain LLM prompts and retrieval (RAG with pgvector) powering a clinician-facing Q&A assistant.",
          "Partner with compliance on model documentation, audit trails, and PHI-safe training data handling.",
        ],
      },
      {
        company: "ByteBloom Studios", place: "Remote", position: "Data Engineer (Contract)",
        duration: "Jan 2023 – Sep 2023",
        bullets: [
          "Built ELT pipelines (Airflow, Python, Snowflake) consolidating six game-telemetry sources.",
          "Modeled a star-schema warehouse enabling self-serve analysis of player retention and monetization.",
          "Implemented data-quality checks (Great Expectations) gating every pipeline promotion.",
        ],
      },
    ],
  ],
  devops: [
    [
      {
        company: "CloudRidge Infra", place: "Pune, Maharashtra", position: "DevOps Engineer",
        duration: "Feb 2024 – Present",
        bullets: [
          "Operate production Kubernetes (EKS) for 40+ services with GitOps delivery via ArgoCD and Helm.",
          "Took deployment frequency from weekly to 15+/day while halving change-failure rate with progressive rollouts.",
          "Reduced AWS spend 32% through right-sizing, spot node groups, and S3 lifecycle policies — ₹18L annual savings.",
          "Authored Terraform modules for VPC, RDS, and service scaffolding reused across three product teams.",
          "Built SLO dashboards and burn-rate alerts (Prometheus/Grafana), eliminating noisy threshold paging.",
        ],
      },
      {
        company: "IronGate Security", place: "Noida, Uttar Pradesh", position: "Systems Engineer",
        duration: "Jul 2022 – Jan 2024",
        bullets: [
          "Managed Linux fleets (Ubuntu, RHEL) and hardened baseline images aligned to CIS benchmarks.",
          "Migrated legacy Jenkins jobs to GitHub Actions with reusable workflows, cutting build times 40%.",
          "Ran certificate, secrets (Vault), and patching automation across staging and production estates.",
        ],
      },
    ],
    [
      {
        company: "SkyLoom Aerospace", place: "Bangalore, Karnataka", position: "Site Reliability Engineer",
        duration: "Nov 2023 – Present",
        bullets: [
          "Own reliability for telemetry ingestion (2M messages/min): capacity planning, load shedding, and failover design.",
          "Led incident response for 30+ production events; authored postmortems that drove 12 permanent fixes.",
          "Designed multi-region failover that survived a real AZ outage with zero customer-visible impact.",
          "Built chaos-testing days and runbook drills that cut median incident resolution time from 90 to 35 minutes.",
        ],
      },
      {
        company: "Hexaview Digital", place: "Remote", position: "Cloud Engineer",
        duration: "Mar 2022 – Oct 2023",
        bullets: [
          "Provisioned client environments on AWS and Azure with Terraform and Ansible playbooks.",
          "Implemented centralized logging (ELK) and tracing (OpenTelemetry) adopted by five client teams.",
          "Automated DR drills with documented RTO/RPO evidence for compliance audits.",
        ],
      },
    ],
  ],
  mobile: [
    [
      {
        company: "NeoBank Financial", place: "Mumbai, Maharashtra", position: "Mobile Developer",
        duration: "Jan 2024 – Present",
        bullets: [
          "Ship the consumer banking app (Flutter) with 100k+ installs and 99.6% crash-free sessions.",
          "Rebuilt onboarding with step-level analytics, raising completion 18% and cutting drop-off at KYC.",
          "Implemented offline-first transaction history with background sync and conflict resolution.",
          "Own release trains: staged rollouts, crash triage (Crashlytics), and Play Store/App Store submissions.",
          "Built biometric auth and secure storage layers passing an external penetration-test review.",
        ],
      },
      {
        company: "StreamLyne Media", place: "Chennai, Tamil Nadu", position: "Junior Android Developer",
        duration: "Jun 2022 – Dec 2023",
        bullets: [
          "Developed video playback and download features (Kotlin, ExoPlayer) for an OTT app with 50k DAU.",
          "Cut cold-start time 43% via baseline profiles, lazy initialization, and startup tracing.",
          "Integrated push-notification campaigns (FCM) with deep links into content pages.",
        ],
      },
    ],
  ],
  design: [
    [
      {
        company: "Craftware Solutions", place: "Bangalore, Karnataka", position: "Product Designer",
        duration: "Feb 2024 – Present",
        bullets: [
          "Redesigned onboarding for a B2B SaaS product, lifting activation 26% (measured over 8 weeks).",
          "Built the company's first token-based design system in Figma, halving design-to-dev handoff time.",
          "Run monthly moderated usability sessions; synthesized findings into prioritized UX debt backlog.",
          "Partner with PM and engineering in discovery — journey maps, prototypes, and experiment design.",
        ],
      },
      {
        company: "EduSpark Learning", place: "Remote", position: "UI/UX Designer",
        duration: "May 2022 – Jan 2024",
        bullets: [
          "Designed learner and instructor flows for a course platform serving 200k students.",
          "Ran 40+ usability tests that reshaped navigation, cutting task-completion time 35%.",
          "Created an illustration and iconography language that unified web and mobile surfaces.",
        ],
      },
    ],
  ],
  qa: [
    [
      {
        company: "PayZen Fintech", place: "Hyderabad, Telangana", position: "QA Automation Engineer",
        duration: "Mar 2024 – Present",
        bullets: [
          "Own automation strategy for a payments product: 600+ Playwright scenarios running in CI under 12 minutes.",
          "Shrunk regression cycles from 3 days to 4 hours; release confidence signal for weekly deploys.",
          "Built API contract tests (Postman/Newman) and ledger-reconciliation suites where correctness is critical.",
          "Keep flake rate under 1% via network mocking, deterministic fixtures, and quarantine triage process.",
        ],
      },
      {
        company: "UrbanStack", place: "Pune, Maharashtra", position: "QA Engineer",
        duration: "Jul 2022 – Feb 2024",
        bullets: [
          "Tested web and mobile releases for a property-management platform across 6 major releases.",
          "Wrote 300+ structured test cases and led exploratory bug bashes before each launch.",
          "Automated smoke suites with Cypress, catching 9 critical regressions pre-release.",
        ],
      },
    ],
  ],
};

// ── EDUCATION OPTIONS ──────────────────────────────────────────
export const EDUCATION_BANK = [
  "B.Tech in Computer Science & Engineering (2020 – 2024) • National Institute of Technology, Calicut • CGPA 8.6/10",
  "B.E. in Information Technology (2019 – 2023) • PSG College of Technology, Coimbatore • CGPA 8.2/10",
  "B.Tech in Computer Science (2020 – 2024) • Cochin University of Science and Technology (CUSAT) • CGPA 8.4/10",
  "B.Sc Computer Science (2021 – 2024) • University of Calicut • First Class with Distinction",
  "B.Tech in Electronics & Communication (2018 – 2022) • VIT Vellore • CGPA 8.1/10 — transitioned to software via self-driven projects",
  "MCA – Master of Computer Applications (2022 – 2024) • Anna University, Chennai • CGPA 8.7/10",
  "B.Tech in Computer Science (2019 – 2023) • APJ Abdul Kalam Technological University, Kerala • CGPA 8.3/10",
  "B.E. in Computer Engineering (2019 – 2023) • Savitribai Phule Pune University • First Class with Distinction",
  "B.Sc in Statistics (2019 – 2022) + PG Diploma in Data Science (2023) • Christ University, Bangalore",
  "B.Tech in Information Technology (2020 – 2024) • Manipal Institute of Technology • CGPA 8.0/10",
  "Bachelor of Computer Applications (2020 – 2023) • Amrita Vishwa Vidyapeetham, Kochi • CGPA 8.8/10",
  "M.Tech in Software Engineering (2021 – 2023) • BITS Pilani (WILP) • CGPA 8.5/10",
];

// ── PROJECT SETS (per role, each set = 2 projects) ─────────────
export const PROJECT_BANK = {
  frontend: [
    [
      {
        name: "Spectra – Design System & Component Library",
        duration: "2025", tech: "React • TypeScript • Storybook • Radix UI • CSS Tokens • Vitest",
        bullets: [
          "Built 45+ accessible components with keyboard navigation, focus management, and ARIA compliance.",
          "Published versioned releases with automated visual-regression tests (Chromatic) on every PR.",
          "Adopted by three internal apps, cutting duplicated UI code by an estimated 8,000 lines.",
        ],
      },
      {
        name: "Atlas – Real-Time Analytics Dashboard",
        duration: "2024", tech: "Next.js • React Query • WebSockets • Recharts • Tailwind CSS",
        bullets: [
          "Live metrics dashboard rendering 20 concurrent chart streams with virtualized updates.",
          "Implemented saved views, sharable URLs, and CSV export used daily by operations staff.",
        ],
      },
    ],
  ],
  backend: [
    [
      {
        name: "Ledgerline – Double-Entry Billing Engine",
        duration: "2025", tech: "Python • FastAPI • PostgreSQL • Redis • Celery • Docker",
        bullets: [
          "Designed an append-only double-entry ledger with idempotent posting APIs and audit trails.",
          "Handled 2,000 transactions/minute in load tests with p95 under 45ms.",
          "Automated invoice PDF generation and email dispatch through Celery task queues.",
        ],
      },
      {
        name: "Relay – Webhook Delivery Service",
        duration: "2024", tech: "NestJS • TypeScript • PostgreSQL • BullMQ • Docker",
        bullets: [
          "Built at-least-once webhook delivery with exponential backoff, signing, and replay tooling.",
          "Dashboard for delivery inspection cut integration-support tickets by half.",
        ],
      },
    ],
  ],
  fullstack: [
    [
      {
        name: "Foundry – Multi-Tenant SaaS Starter",
        duration: "2025", tech: "Next.js • TypeScript • Django REST Framework • PostgreSQL • Stripe • Docker",
        bullets: [
          "Complete SaaS foundation: organizations, invitations, RBAC, metered billing, and audit logs.",
          "Typed API client generated from OpenAPI schema keeps frontend and backend contracts in sync.",
          "Deployed with preview environments per PR; onboarding a new developer takes under 30 minutes.",
        ],
      },
      {
        name: "Meridian – Field Operations Tracker (PWA)",
        duration: "2024", tech: "React • FastAPI • PostgreSQL • Service Workers • Mapbox",
        bullets: [
          "Offline-first progressive web app for field teams with background sync and conflict handling.",
          "Live map view of 200+ field agents with geofenced check-ins and route summaries.",
        ],
      },
    ],
  ],
  data: [
    [
      {
        name: "Signal – Churn Early-Warning System",
        duration: "2025", tech: "Python • XGBoost • Airflow • dbt • BigQuery • Streamlit",
        bullets: [
          "End-to-end churn pipeline: feature store, weekly retraining, and calibrated risk scores.",
          "Streamlit review app lets customer-success staff act on top-risk accounts with context.",
          "Back-tested uplift showed 22% retention improvement on the intervened cohort.",
        ],
      },
      {
        name: "Corpus – Document Q&A with RAG",
        duration: "2024", tech: "Python • LangChain • pgvector • FastAPI • React",
        bullets: [
          "Retrieval-augmented Q&A over 10k internal documents with source citations.",
          "Evaluation harness (RAGAS) tracks answer faithfulness across prompt iterations.",
        ],
      },
    ],
  ],
  devops: [
    [
      {
        name: "Bedrock – Terraform Platform Modules",
        duration: "2025", tech: "Terraform • AWS • EKS • ArgoCD • Helm • GitHub Actions",
        bullets: [
          "Opinionated modules for VPC, EKS, RDS, and observability provisioning a full environment in 25 minutes.",
          "Policy checks (OPA) and cost estimation (Infracost) gate every infrastructure PR.",
          "Documented golden paths reduced platform support questions by 60%.",
        ],
      },
      {
        name: "Pulse – SLO Dashboard & Alerting Kit",
        duration: "2024", tech: "Prometheus • Grafana • Alertmanager • Python",
        bullets: [
          "Burn-rate alerting templates and SLO dashboards adopted across 15 services.",
          "Replaced static threshold pages, cutting non-actionable alerts by 70%.",
        ],
      },
    ],
  ],
  mobile: [
    [
      {
        name: "Trailmark – Offline-First Hiking Companion",
        duration: "2025", tech: "Flutter • SQLite • Mapbox • Firebase • Riverpod",
        bullets: [
          "Offline maps, route recording, and photo journals with background sync when connectivity returns.",
          "4.6★ rating across 12k installs; featured in a regional Play Store collection.",
        ],
      },
      {
        name: "Splitwisely – Group Expense Manager",
        duration: "2024", tech: "React Native • TypeScript • Node.js • PostgreSQL",
        bullets: [
          "Real-time balance updates, UPI deep links for settlements, and receipt scanning via OCR.",
          "Implemented optimistic UI with rollback handling for offline expense entry.",
        ],
      },
    ],
  ],
  design: [
    [
      {
        name: "Kindred – Healthcare Portal Redesign (Case Study)",
        duration: "2025", tech: "Figma • Maze • Design Tokens • Prototyping",
        bullets: [
          "End-to-end redesign from research synthesis to high-fidelity prototype and dev handoff.",
          "Unmoderated Maze tests showed task success rising from 64% to 91% post-redesign.",
        ],
      },
      {
        name: "Tessel – Open-Source Icon System",
        duration: "2024", tech: "Figma • SVG • npm • GitHub Actions",
        bullets: [
          "Designed 240 pixel-consistent icons with automated SVG optimization and npm publishing.",
          "Adopted by 800+ projects; maintained contribution guidelines and review standards.",
        ],
      },
    ],
  ],
  qa: [
    [
      {
        name: "Sentinel – E2E Test Infrastructure",
        duration: "2025", tech: "Playwright • TypeScript • Docker • GitHub Actions • Allure",
        bullets: [
          "Parallelized 600-scenario suite finishing in 12 minutes with seeded test environments per run.",
          "Flake-quarantine workflow and Allure reporting made failures actionable within minutes.",
        ],
      },
      {
        name: "Probe – API Contract Testing Kit",
        duration: "2024", tech: "Postman • Newman • OpenAPI • CI Integration",
        bullets: [
          "Contract suites generated from OpenAPI specs catch breaking changes before merge.",
          "Adopted across six services; prevented three production-bound breaking releases.",
        ],
      },
    ],
  ],
};

// ── CERTIFICATION SETS ─────────────────────────────────────────
export const CERTIFICATION_BANK = {
  frontend: [
    ["Meta Front-End Developer Professional Certificate – Coursera (2024)", "TypeScript Deep Dive – Frontend Masters (2024)", "Testing JavaScript Applications – Kent C. Dodds (2023)", "Web Accessibility (WCAG 2.2) – Deque University (2023)"],
  ],
  backend: [
    ["AWS Certified Developer – Associate (2024)", "Django REST Framework Mastery – TestDriven.io (2024)", "PostgreSQL Performance Tuning – Percona Training (2023)", "API Security Fundamentals – APIsec University (2023)"],
  ],
  fullstack: [
    ["AWS Certified Solutions Architect – Associate (2024)", "Meta Back-End Developer Certificate – Coursera (2023)", "Next.js & Production React – Frontend Masters (2024)", "Docker & Kubernetes Essentials – KodeKloud (2023)"],
  ],
  data: [
    ["Google Professional Data Engineer (2024)", "Machine Learning Specialization – DeepLearning.AI (2023)", "dbt Analytics Engineering Certification (2024)", "Statistics for Data Science – MITx (2022)"],
  ],
  devops: [
    ["Certified Kubernetes Administrator – CKA (2024)", "HashiCorp Certified: Terraform Associate (2024)", "AWS Certified SysOps Administrator (2023)", "Site Reliability Engineering – Google/Coursera (2023)"],
  ],
  mobile: [
    ["Google Associate Android Developer (2024)", "Flutter Development Bootcamp – App Brewery (2023)", "iOS App Development with Swift – Coursera (2023)"],
  ],
  design: [
    ["Google UX Design Professional Certificate (2024)", "Interaction Design Specialization – UC San Diego (2023)", "Design Systems – Figma Advanced Certification (2024)"],
  ],
  qa: [
    ["ISTQB Certified Tester – Foundation Level (2023)", "Playwright Test Automation – Test Automation University (2024)", "API Testing with Postman – Postman Academy (2023)"],
  ],
};

// ── ACHIEVEMENT SETS ───────────────────────────────────────────
export const ACHIEVEMENT_BANK = [
  [
    "Winner – Smart India Hackathon 2024: led a 6-member team building a grievance-routing platform adopted by a state department pilot.",
    "Speaker – local developer meetup (300+ attendees): 'Shipping Faster with Preview Environments'.",
    "Open-source contributor: 15 merged PRs across established GitHub projects including documentation and bug fixes.",
  ],
  [
    "Reduced cloud costs ₹18L/year through a self-initiated infrastructure audit — recognized with a quarterly excellence award.",
    "Mentored 4 junior engineers through a structured 12-week onboarding program; all reached independent delivery.",
    "Published a technical blog series (10k+ cumulative reads) on production debugging patterns.",
  ],
  [
    "Runner-up – national-level capture-the-flag security competition among 400 teams.",
    "Led migration affecting 100k users with zero downtime — wrote the playbook now used as the team standard.",
    "Top 5% ranking on LeetCode (500+ problems solved); regular contest participant.",
  ],
  [
    "Filed one product patent application for a workflow-automation technique developed on the job.",
    "Organized the company's first internal hackathon (12 teams); two winning prototypes reached production.",
    "Awarded 'Rising Star of the Year' among a 60-person engineering organization.",
  ],
];

// ── SKILL SET PRESETS (per role, used by AI skills suggestions) ─
export const SKILLSET_BANK = {
  frontend: {
    frontend: "React 19, Next.js 15, TypeScript, JavaScript (ES6+), HTML5, CSS3, Tailwind CSS, Redux Toolkit, React Query, Framer Motion",
    backend: "Node.js (basics), REST API Integration, GraphQL, JWT Handling",
    database: "PostgreSQL (basics), Supabase, Firebase",
    tools: "Git, GitHub Actions, Vite, Webpack, Storybook, Figma, Vercel, Sentry",
    concepts: "Design Systems, Web Performance, Accessibility (WCAG 2.2), Responsive Design, SSR/ISR, Testing (Jest, Playwright)",
    ai: "OpenAI API, Vercel AI SDK, Prompt Engineering",
  },
  backend: {
    frontend: "React (working knowledge), HTML5, CSS3",
    backend: "Python, Django, Django REST Framework, FastAPI, Node.js, NestJS, Celery, REST APIs, gRPC, WebSockets",
    database: "PostgreSQL, Redis, MongoDB, Query Optimization, Schema Design, Migrations",
    tools: "Docker, Kubernetes (basics), Git, GitHub Actions, AWS (EC2, S3, RDS), Nginx, Postman",
    concepts: "Microservices, Event-Driven Architecture, System Design, TDD, JWT/OAuth2, RBAC, CI/CD",
    ai: "OpenAI API, LangChain, RAG Architectures, pgvector",
  },
  fullstack: {
    frontend: "React 19, Next.js, TypeScript, JavaScript (ES6+), Tailwind CSS, Redux Toolkit, HTML5, CSS3",
    backend: "Python, Django, Django REST Framework, FastAPI, Node.js, Express.js, REST APIs, JWT Authentication, RBAC",
    database: "PostgreSQL, MySQL, MongoDB, Redis, Supabase, ORM (Django/Prisma), Schema Design",
    tools: "Git, GitHub Actions, Docker, AWS, Vercel, Render, Postman, Figma",
    concepts: "Full Stack Architecture, Agile/Scrum, PWA, Testing, CI/CD, System Design Basics",
    ai: "OpenAI API, Claude API, LangChain, Prompt Engineering, RAG Architectures",
  },
  data: {
    frontend: "Streamlit, Dash, Data Visualization (Matplotlib, Seaborn, Plotly)",
    backend: "Python, FastAPI (model serving), SQL, PySpark",
    database: "PostgreSQL, BigQuery, Snowflake, dbt, Data Modeling, pgvector",
    tools: "Airflow, MLflow, Docker, Git, Jupyter, Power BI, Tableau",
    concepts: "Machine Learning, Statistics, A/B Testing, Feature Engineering, MLOps, Experiment Design",
    ai: "PyTorch, Scikit-Learn, XGBoost, Hugging Face, LangChain, RAG, LLM Fine-Tuning",
  },
  devops: {
    frontend: "—",
    backend: "Python, Go (basics), Bash, REST APIs",
    database: "PostgreSQL (operations), Redis, Backup & DR Strategy",
    tools: "Kubernetes, Docker, Terraform, Ansible, ArgoCD, Helm, Jenkins, GitHub Actions, Prometheus, Grafana, ELK",
    concepts: "GitOps, SLO/SLI Management, Incident Response, Infrastructure as Code, Cost Optimization, Networking, Linux",
    ai: "LLM-assisted runbooks, AIOps monitoring basics",
  },
  mobile: {
    frontend: "Flutter, Dart, React Native, Kotlin, Jetpack Compose, Swift (basics)",
    backend: "REST/GraphQL Integration, Firebase Functions, Node.js (basics)",
    database: "SQLite, Hive, Firestore, Room, Offline-First Sync",
    tools: "Android Studio, Xcode, Fastlane, Firebase (FCM, Crashlytics), Git, Figma",
    concepts: "State Management (Riverpod/Bloc), App Store Optimization, Release Management, Performance Profiling",
    ai: "On-device ML (ML Kit), OpenAI API integration",
  },
  design: {
    frontend: "HTML5, CSS3, Tailwind (prototyping), Framer",
    backend: "—",
    database: "—",
    tools: "Figma, FigJam, Maze, Adobe Illustrator, Photoshop, Zeplin, Notion",
    concepts: "Design Systems, Design Tokens, Interaction Design, User Research, Usability Testing, Accessibility, Journey Mapping, Information Architecture",
    ai: "AI-assisted prototyping (Figma AI), Midjourney for moodboards",
  },
  qa: {
    frontend: "HTML/CSS/JS (test authoring), Locator Strategies",
    backend: "API Testing, SQL for Data Validation, Python/TypeScript scripting",
    database: "PostgreSQL (validation queries), Test Data Management",
    tools: "Playwright, Cypress, Selenium, Postman/Newman, JMeter, k6, Jira, Allure, GitHub Actions",
    concepts: "Test Strategy, BDD, Contract Testing, Regression Suites, Exploratory Testing, CI Quality Gates",
    ai: "AI-assisted test generation, visual regression AI tools",
  },
};

// ── HEADER/GENERAL FIELD SUGGESTIONS ───────────────────────────
export const SECTION_LABELS = {
  header: "Header & Contact",
  summary: "Professional Summary",
  skills: "Technical Skills",
  experience: "Work Experience",
  projects: "Projects",
  education: "Education",
  certifications: "Certifications",
  achievements: "Achievements",
};
