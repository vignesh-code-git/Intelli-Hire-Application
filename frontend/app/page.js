"use client";

import { useState, useEffect, useRef } from "react";
import { ALTERNATIVE_SUMMARIES, ALTERNATIVE_EXPERIENCES, ALTERNATIVE_ACHIEVEMENTS, SKILLS_DB } from "./cvData";
import {
  getRoleType, SUMMARY_BANK, EXPERIENCE_BANK, EDUCATION_BANK,
  PROJECT_BANK, CERTIFICATION_BANK, ACHIEVEMENT_BANK, SKILLSET_BANK, SECTION_LABELS,
} from "./aiDataset";

// Backend API base URL: set NEXT_PUBLIC_API_URL on Vercel to the Render
// backend URL (e.g. https://intellihire-backend.onrender.com)
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// Premium SVG Icon Components
const SparklesIcon = ({ className = "icon-svg", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={{ width: "1.25rem", height: "1.25rem", ...style }}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5.5z" opacity="0.6" />
    <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z" opacity="0.6" />
  </svg>
);

const SearchIcon = ({ className = "icon-svg", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={{ width: "1.1rem", height: "1.1rem", ...style }}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const BellIcon = ({ className = "icon-svg", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={{ width: "1.25rem", height: "1.25rem", ...style }}>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

const DownloadIcon = ({ className = "icon-svg", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={{ width: "1.1rem", height: "1.1rem", ...style }}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" x2="12" y1="15" y2="3" />
  </svg>
);

const BriefcaseIcon = ({ className = "icon-svg", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={{ width: "1.25rem", height: "1.25rem", ...style }}>
    <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const CpuIcon = ({ className = "icon-svg", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={{ width: "2rem", height: "2rem", color: "var(--accent-blue)", ...style }}>
    <rect width="16" height="16" x="4" y="4" rx="2" />
    <rect width="6" height="6" x="9" y="9" rx="1" />
    <path d="M9 1v3" />
    <path d="M15 1v3" />
    <path d="M9 20v3" />
    <path d="M15 20v3" />
    <path d="M20 9h3" />
    <path d="M20 15h3" />
    <path d="M1 9h3" />
    <path d="M1 15h3" />
  </svg>
);

const PenIcon = ({ className = "icon-svg", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={{ width: "1.25rem", height: "1.25rem", ...style }}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);

const parseCVTextToSections = (text) => {
  const sections = {
    name: "CANDIDATE PROFILE",
    title: "Software Engineer",
    contact: "",
    summary: "",
    skills: [],
    experience: [],
    education: []
  };
  
  if (!text) return sections;
  
  const lines = text.split("\n");
  let currentSection = "general";
  
  let nameFound = false;
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].trim();
    if (line && line.length < 30 && !nameFound && !line.includes("@") && !line.includes("+") && !line.toLowerCase().includes("resume") && !line.toLowerCase().includes("cv")) {
      sections.name = line.toUpperCase();
      nameFound = true;
      break;
    }
  }

  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const contactParts = [];
  
  const headersRegex = {
    summary: /professional summary|summary|objective|about me|profile/i,
    experience: /experience|work history|employment history|work experience|professional experience/i,
    skills: /skills|technical skills|key skills|technologies|expertise|core competencies/i,
    education: /education|academic background|studies/i
  };

  const buffer = {
    summary: [],
    experience: [],
    skills: [],
    education: [],
    general: []
  };

  for (let line of lines) {
    const stripped = line.trim();
    if (!stripped) continue;

    if (emailRegex.test(stripped) && !contactParts.includes(stripped)) {
      const emailMatch = stripped.match(emailRegex);
      if (emailMatch) contactParts.push(emailMatch[0]);
    }
    if (phoneRegex.test(stripped) && !contactParts.includes(stripped)) {
      const phoneMatch = stripped.match(phoneRegex);
      if (phoneMatch) contactParts.push(phoneMatch[0]);
    }
    if ((stripped.toLowerCase().includes("linkedin.com") || stripped.toLowerCase().includes("github.com")) && !contactParts.includes(stripped)) {
      contactParts.push(stripped);
    }
    
    let matchedHeader = false;
    for (const [key, regex] of Object.entries(headersRegex)) {
      if (regex.test(stripped.toLowerCase()) && stripped.length < 40) {
        currentSection = key;
        matchedHeader = true;
        break;
      }
    }
    
    if (!matchedHeader) {
      buffer[currentSection].push(stripped);
    }
  }
  
  sections.contact = contactParts.join(" • ");
  sections.summary = buffer.summary.join(" ") || buffer.general.join(" ");
  
  const rawSkillsText = buffer.skills.join(", ");
  sections.skills = rawSkillsText.split(/[,•\-\*]/g)
    .map(s => s.trim())
    .filter(s => s.length > 1 && s.length < 35);
    
  sections.experience = buffer.experience;
  sections.education = buffer.education;
  
  return sections;
};

const parseOptimizedCVToSections = (text) => {
  const sections = {
    name: "ADITYA",
    title: "Full Stack Developer",
    contact: "+91 98765 43210 • aditya@gmail.com • Trivandrum, Kerala, India",
    summary: "",
    skills: "",
    experience: [],
    projects: [],
    education: [],
    certifications: [],
    achievements: []
  };
  if (!text) return sections;
  
  const lines = text.split("\n");
  let currentSection = "";
  
  for (let line of lines) {
    const stripped = line.trim();
    if (!stripped) continue;
    
    // Normalize header check
    const lowerLine = stripped.toLowerCase();
    if (stripped.startsWith("# ") && stripped.endsWith(" CANDIDATE")) {
      sections.title = stripped.slice(2, -10).trim();
      continue;
    }
    
    if (stripped.startsWith("## PROFESSIONAL SUMMARY") || lowerLine === "## professional summary" || lowerLine === "professional summary") {
      currentSection = "summary";
      continue;
    }
    if (stripped.startsWith("## TECHNICAL SKILLS") || lowerLine === "## technical skills" || lowerLine === "technical skills") {
      currentSection = "skills";
      continue;
    }
    if (stripped.startsWith("## WORK EXPERIENCE") || lowerLine === "## work experience" || stripped.startsWith("## EXPERIENCE") || lowerLine === "## experience" || lowerLine === "experience") {
      currentSection = "experience";
      continue;
    }
    if (stripped.startsWith("## PROJECTS") || lowerLine === "## projects" || lowerLine === "projects") {
      currentSection = "projects";
      continue;
    }
    if (stripped.startsWith("## EDUCATION") || lowerLine === "## education" || lowerLine === "education") {
      currentSection = "education";
      continue;
    }
    if (stripped.startsWith("## CERTIFICATIONS") || lowerLine === "## certifications" || lowerLine === "certifications" || lowerLine.includes("training")) {
      currentSection = "certifications";
      continue;
    }
    if (stripped.startsWith("## ACHIEVEMENTS") || lowerLine === "## achievements" || lowerLine === "achievements") {
      currentSection = "achievements";
      continue;
    }
    
    if (currentSection === "summary") {
      sections.summary += (sections.summary ? "\n" : "") + stripped;
    } else if (currentSection === "skills") {
      sections.skills += (sections.skills ? "\n" : "") + stripped;
    } else if (currentSection === "experience") {
      sections.experience.push(stripped);
    } else if (currentSection === "projects") {
      sections.projects.push(stripped);
    } else if (currentSection === "education") {
      sections.education.push(stripped);
    } else if (currentSection === "certifications") {
      sections.certifications.push(stripped);
    } else if (currentSection === "achievements") {
      sections.achievements.push(stripped);
    }
  }
  return sections;
};

const CV_TEMPLATES = {
  python: {
    name: "ADITYA KUMAR",
    title: "Python Backend Developer",
    contact: "+91 98765 43210 • aditya.k@gmail.com • Bangalore, India",
    originalScore: 68,
    optimizedScore: 94,
    original: {
      summary: "Python developer with some experience in backend programming and writing SQL queries.",
      skills: "Python, Django, Flask, PostgreSQL, Docker, Git",
      experience: [
        "Software Engineer at DevCorp - Wrote Python scripts and maintained APIs.",
        "Junior Developer at SoftSolutions - Worked on Django applications and SQL databases."
      ],
      education: [
        "B.Tech in Computer Science - KTU, 2021"
      ]
    },
    optimized: {
      summary: "Results-driven [Software Engineer] with [3+ years] of professional experience specializing in [Python], Django, and microservices architecture. Designed, implemented, and optimized performant APIs, improving system throughput by 35%. Proficient in [FastAPI], [Redis], and secure [microservices orchestration].",
      skills: "Languages: [Python], SQL, JavaScript • Frameworks: Django, [FastAPI], Flask • Databases: [PostgreSQL], [Redis] • Tools & Cloud: [Docker], Git, AWS",
      experience: [
        "Senior Software Engineer at [DevCorp] (2023 - Present) - Spearheaded migration of legacy monolith to [Python microservices] with [FastAPI] and [Redis], reducing API response times by [40%] and [increasing developer velocity by 25%].",
        "Backend Developer at [SoftSolutions] (2021 - 2023) - Architected Django web applications, integrated secure OAuth2 protocols, and optimized slow PostgreSQL queries to improve DB latency by [30%]."
      ],
      education: [
        "Bachelor of Technology in Computer Science - [KTU] (First Class with Distinction, 2021)"
      ]
    },
    alternatives: {
      summary: [
        "Results-driven [Software Engineer] with [3+ years] of professional experience specializing in [Python], Django, and microservices architecture.",
        "Dynamic and [solutions-oriented] Software Engineer with [3+ years] of hands-on experience orchestrating front-to-back engineering tasks. Specialized in improving system performance and [integrating modern microservices] with [Redis] and [FastAPI] to [increase developer velocity by 25%].",
        "[Highly technical] Developer with [3+ years] of database optimization and web interface development experience. Proficient in React.js, Python, and Django, with additional expertise in [Redis] to [improve API latency by 40%]."
      ],
      skills: [
        "Languages: [Python], SQL, JavaScript • Frameworks: Django, [FastAPI], Flask • Databases: [PostgreSQL], [Redis] • Tools & Cloud: [Docker], Git, AWS",
        "Core Skills: [Python backend engineering], REST APIs, [microservice orchestration] • Databases: [PostgreSQL], [Redis] cluster management • Infrastructure: [Docker], CI/CD pipelines, AWS EC2/S3",
        "Tech Stack: [Python 3.11], [FastAPI], Django Rest Framework • Cache/DB: [Redis], PostgreSQL • Devops: [Docker], Github Actions, Kubernetes basics"
      ],
      experience: [
        [
          "Senior Software Engineer at [DevCorp] (2023 - Present) - Spearheaded migration of legacy monolith to [Python microservices] with [FastAPI] and [Redis], reducing API response times by [40%] and [increasing developer velocity by 25%].",
          "Backend Developer at [SoftSolutions] (2021 - 2023) - Architected Django web applications, integrated secure OAuth2 protocols, and optimized slow PostgreSQL queries to improve DB latency by [30%]."
        ],
        [
          "Lead Python Developer at [DevCorp] - Integrated [microservices] with [FastAPI] and [Redis] cache layer, leading to [35% increase] in backend server performance.",
          "Software Analyst at [SoftSolutions] - Built micro-APIs for user auth and automated report generation, optimizing PostgreSQL databases to lower server costs by [15%]."
        ]
      ],
      education: [
        ["Bachelor of Technology in Computer Science - [KTU] (First Class with Distinction, 2021)"],
        ["B.Tech in Computer Science Engineering - [KTU], Kerala (Graduated 2021)"]
      ]
    }
  },
  devops: {
    name: "KIRAN RAJ",
    title: "DevOps Cloud Engineer",
    contact: "+91 91234 56789 • kiran.raj@gmail.com • Hyderabad, India",
    originalScore: 62,
    optimizedScore: 96,
    original: {
      summary: "DevOps engineer with experience in AWS cloud, CI/CD pipelines and deployment of web applications.",
      skills: "AWS, Linux, Jenkins, Docker, Kubernetes, Shell Scripting, Git",
      experience: [
        "DevOps Engineer at CloudSoft - Managed AWS EC2 instances and set up Jenkins pipelines.",
        "System Administrator at TechOps - Maintained servers and performed regular backup scripts."
      ],
      education: [
        "B.S. in Information Technology - JNTU, 2020"
      ]
    },
    optimized: {
      summary: "Expert [DevOps & Infrastructure Engineer] with [4+ years] of experience architecting secure cloud platforms on [AWS]. Specialized in [Infrastructure as Code (IaC)] with Terraform, container orchestration via [Kubernetes], and building zero-downtime [CI/CD automation pipelines].",
      skills: "Cloud Platforms: [AWS] (EC2, EKS, RDS, VPC) • Containerization: [Kubernetes], [Docker] • IaC & Automation: [Terraform], Ansible • CI/CD: Jenkins, [GitHub Actions] • OS & Scripting: [Linux], Bash, Python",
      experience: [
        "Senior Cloud DevOps Engineer at [CloudSoft] (2022 - Present) - Spearheaded automated infrastructure provisioning using [Terraform], reducing setup times by [80%]. Configured [Kubernetes (EKS)] clusters to handle traffic spikes, improving availability to [99.99%].",
        "DevOps Automation Engineer at [TechOps] (2020 - 2022) - Established Jenkins declarative pipelines for [Dockerized deployments], reducing deployment failure rates by [60%] and accelerating feedback loops."
      ],
      education: [
        "Bachelor of Science in Information Technology - [JNTU] (Graduated 2020)"
      ]
    },
    alternatives: {
      summary: [
        "Expert [DevOps & Infrastructure Engineer] with [4+ years] of experience architecting secure cloud platforms on [AWS].",
        "[Security-focused Cloud Engineer] with [4+ years] of automating deployments and implementing secure [DevSecOps pipelines] on [AWS] and [Azure].",
        "[Systems automation wizard] specializing in [Kubernetes orchestration] and GitOps configurations to reduce infra costs by [25%] and deployments duration."
      ],
      skills: [
        "Cloud Platforms: [AWS] (EC2, EKS, RDS, VPC) • Containerization: [Kubernetes], [Docker] • IaC & Automation: [Terraform], Ansible • CI/CD: Jenkins, [GitHub Actions]",
        "DevOps Suite: [Kubernetes (EKS/AKS)], [Docker] containers • Cloud & Networking: [AWS VPC], Route53, IAM • GitOps/IaC: [Terraform], ArgoCD, Helm Charts"
      ],
      experience: [
        [
          "Senior Cloud DevOps Engineer at [CloudSoft] (2022 - Present) - Spearheaded automated infrastructure provisioning using [Terraform], reducing setup times by [80%]. Configured [Kubernetes (EKS)] clusters to handle traffic spikes, improving availability to [99.99%].",
          "DevOps Automation Engineer at [TechOps] (2020 - 2022) - Established Jenkins declarative pipelines for [Dockerized deployments], reducing deployment failure rates by [60%]."
        ],
        [
          "Lead Platforms Engineer at [CloudSoft] - Transitioned manually provisioned AWS infrastructure to modular [Terraform IaC], cutting infrastructure drift by [95%].",
          "Junior Cloud Admin at [TechOps] - Maintained centralized logging using ELK Stack and configured Prometheus/Grafana monitors for container health alerts."
        ]
      ],
      education: [
        ["Bachelor of Science in Information Technology - [JNTU] (Graduated 2020)"],
        ["B.Sc. in IT - Jawaharlal Nehru Technological University (2020)"]
      ]
    }
  },
  frontend: {
    name: "SNEHA MENON",
    title: "React Frontend Developer",
    contact: "+91 97654 32109 • sneha.m@gmail.com • Chennai, India",
    originalScore: 70,
    optimizedScore: 95,
    original: {
      summary: "Frontend developer skilled in HTML, CSS, JavaScript, and building React web pages.",
      skills: "HTML5, CSS3, JavaScript, ES6, React, Redux, TailwindCSS, Git",
      experience: [
        "UI Developer at WebStudio - Created responsive web interfaces and landing pages.",
        "Frontend Intern at StartUpHub - Assisted in building user dashboards in React."
      ],
      education: [
        "B.C.A. (Bachelor of Computer Applications) - Madras University, 2022"
      ]
    },
    optimized: {
      summary: "Creative [Frontend Engineer] with [3+ years] of experience building highly interactive, responsive web applications using [React.js], [Next.js], and TypeScript. Expert in client-side state management ([Redux Toolkit], Zustand) and optimizing UI performance to achieve [95+ Lighthouse scores].",
      skills: "Core Tech: JavaScript (ES6+), [TypeScript] • Frameworks: [React.js], [Next.js] • State & Query: [Redux Toolkit], React Query • UI & Layout: CSS3, Sass, [TailwindCSS], Material UI • Build Tools: Webpack, Vite, npm",
      experience: [
        "Senior Frontend Specialist at [WebStudio] (2023 - Present) - Engineered consumer-facing React interfaces, reducing page weight by [35%] and improving cumulative layout shift (CLS) by [50%]. Integrated Rest API endpoints with strict TypeScript types.",
        "React UI Developer at [StartUpHub] (2022 - 2023) - Built interactive analytics dashboards, optimized rendering using React memoization hooks, and streamlined CSS stylesheets to Tailwind structures."
      ],
      education: [
        "Bachelor of Computer Applications (BCA) - [Madras University] (Distinction, 2022)"
      ]
    },
    alternatives: {
      summary: [
        "Creative [Frontend Engineer] with [3+ years] of experience building highly interactive, responsive web applications using [React.js], [Next.js], and TypeScript.",
        "[UI/UX Developer] specializing in high-fidelity React components, layout design, and [TailwindCSS responsive grid architectures] for scalable web apps.",
        "[TypeScript enthusiast] and Frontend developer focused on building secure, accessible (WCAG compliant) interfaces with Next.js App Router."
      ],
      skills: [
        "Core Tech: JavaScript (ES6+), [TypeScript] • Frameworks: [React.js], [Next.js] • State & Query: [Redux Toolkit], React Query • UI & Layout: CSS3, Sass, [TailwindCSS], Material UI",
        "Frontend Stack: [React.js], [TypeScript], HTML5/CSS3 • Styling: [TailwindCSS], styled-components, CSS modules • State/Store: [Redux Toolkit], Context API • Dev Tools: Vite, ESLint, Jest"
      ],
      experience: [
        [
          "Senior Frontend Specialist at [WebStudio] (2023 - Present) - Engineered consumer-facing React interfaces, reducing page weight by [35%] and improving cumulative layout shift (CLS) by [50%].",
          "React UI Developer at [StartUpHub] (2022 - 2023) - Built interactive analytics dashboards, optimized rendering using React memoization hooks, and streamlined CSS stylesheets."
        ],
        [
          "Lead React Developer at [WebStudio] - Authored reusable component library utilized across 4 enterprise products, increasing UI development speed by [30%].",
          "UI Associate at [StartUpHub] - Redesigned registration page utilizing mobile-first grid structures, improving conversion rates by [18%]."
        ]
      ],
      education: [
        ["Bachelor of Computer Applications (BCA) - [Madras University] (Distinction, 2022)"],
        ["BCA - University of Madras, Chennai (Graduated 2022)"]
      ]
    }
  },
  data: {
    name: "DR. ANIL NAIR",
    title: "Data Scientist & ML Engineer",
    contact: "+91 99887 76655 • anil.nair@gmail.com • Pune, India",
    originalScore: 65,
    optimizedScore: 93,
    original: {
      summary: "Data scientist with background in analytics, statistics, SQL queries and writing machine learning models in Python.",
      skills: "Python, R, SQL, Pandas, Scikit-Learn, Matplotlib, Jupyter Notebooks",
      experience: [
        "Data Scientist at InsightLabs - Analyzed customer behavior and trained classification models.",
        "Analyst at DataCorp - Maintained databases, generated SQL reports, and ran basic regressions."
      ],
      education: [
        "M.Sc. in Statistics - Pune University, 2019"
      ]
    },
    optimized: {
      summary: "Analytical [Data Scientist] with [5+ years] of expertise applying [Machine Learning (ML)] models, statistical modeling, and deep learning algorithms to solve complex business queries. Proficient in engineering [predictive pipelines] in Python, managing big data clusters, and translating data insights into ROI.",
      skills: "Languages: [Python], SQL, R • ML & Modeling: [Scikit-Learn], XGBoost, Pandas, NumPy • Deep Learning: [PyTorch], TensorFlow • Cloud & Big Data: [AWS S3], Snowflake, Spark • BI & Analytics: Tableau, SQL Server",
      experience: [
        "Lead Data Scientist at [InsightLabs] (2021 - Present) - Architected a recommendation engine that increased user engagement by [22%]. Formulated clustering models in [Scikit-Learn] that segmented customer databases into actionable marketing zones.",
        "Data Analyst at [DataCorp] (2019 - 2021) - Engineered ETL pipelines processing 1M+ daily rows. Designed dashboard analytics in Tableau and optimized SQL queries to speed up batch job generation by [45%]."
      ],
      education: [
        "Master of Science in Statistics - [Pune University] (Gold Medalist, 2019)"
      ]
    },
    alternatives: {
      summary: [
        "Analytical [Data Scientist] with [5+ years] of expertise applying [Machine Learning (ML)] models, statistical modeling, and deep learning algorithms.",
        "[Machine Learning Engineer] specialized in training predictive NLP/CV classifiers, model deployment via [Docker], and database queries at scale.",
        "[Data Specialist] proficient in Python, SQL databases, and statistical testing to discover high-value trends and optimize business conversion funnels."
      ],
      skills: [
        "Languages: [Python], SQL, R • ML & Modeling: [Scikit-Learn], XGBoost, Pandas, NumPy • Deep Learning: [PyTorch], TensorFlow • Cloud & Big Data: [AWS S3], Snowflake, Spark",
        "ML/Data Suite: [Python (Pandas, NumPy)], [Scikit-Learn] • Visualizations: Tableau, PowerBI • Deep Learning: [PyTorch], Keras • Big Data: Apache Spark, SQL databases"
      ],
      experience: [
        [
          "Lead Data Scientist at [InsightLabs] (2021 - Present) - Architected a recommendation engine that increased user engagement by [22%]. Formulated clustering models in [Scikit-Learn] that segmented customer databases.",
          "Data Analyst at [DataCorp] (2019 - 2021) - Engineered ETL pipelines processing 1M+ daily rows. Designed dashboard analytics in Tableau."
        ],
        [
          "Senior Data Researcher at [InsightLabs] - Developed classification algorithms using XGBoost, improving churn detection accuracy from 78% to 92%.",
          "Statistical Programmer at [DataCorp] - Automated data cleaning scripts using Python Pandas, saving analyst team 15 hours of manual work weekly."
        ]
      ],
      education: [
        ["Master of Science in Statistics - [Pune University] (Gold Medalist, 2019)"],
        ["M.Sc. Statistics - Savitribai Phule Pune University (Graduated 2019)"]
      ]
    }
  },
  product: {
    name: "MEERA PILLAI",
    title: "Technical Product Manager",
    contact: "+91 98888 77777 • meera.p@gmail.com • Mumbai, India",
    originalScore: 71,
    optimizedScore: 92,
    original: {
      summary: "Product manager with experience in writing specifications, gathering requirements, and managing software development lifecycle.",
      skills: "Product Management, Agile, Jira, Scrum, Product Roadmaps, SQL, Market Research",
      experience: [
        "Associate Product Manager at DevStudio - Gathered product specs and collaborated with engineers.",
        "Business Analyst at FinTechCorp - Analyzed user feedback and wrote business requirement documents."
      ],
      education: [
        "M.B.A. - IIT Bombay, 2021"
      ]
    },
    optimized: {
      summary: "Strategic [Technical Product Manager] with [4+ years] of experience leading cross-functional teams to launch scalable software features. Skilled in defining [long-term product roadmaps], executing [Agile/Scrum methodologies], and utilizing database metrics to drive user acquisition.",
      skills: "Product Design: [Jira], Confluence, Figma • Methodologies: [Agile], [Scrum], Kanban • Analytics: Google Analytics, [SQL], Amplitude • Strategy: Roadmap building, Market Research • Tech Context: REST APIs, System Architecture",
      experience: [
        "Product Manager at [DevStudio] (2022 - Present) - Owned the lifecycle of an e-commerce checkout page, resulting in [18% improvement] in completed transactions. Moderated sprints in [Jira] for [15+ software engineers] and designers.",
        "Business Analyst at [FinTechCorp] (2021 - 2022) - Conducted comprehensive user surveys and telemetry analysis, translating observations into PRDs that shaped the core payment gateway design."
      ],
      education: [
        "Master of Business Administration (MBA) - [IIT Bombay] (Specialization in Tech Management, 2021)"
      ]
    },
    alternatives: {
      summary: [
        "Strategic [Technical Product Manager] with [4+ years] of experience leading cross-functional teams to launch scalable software features.",
        "[Data-Driven Product Leader] specialized in orchestrating product analytics, [Jira sprint management], and launch strategies for mobile SaaS platforms.",
        "[Product Owner] with strong technical foundation in software development, bridge builder between business stakeholders and engineering teams."
      ],
      skills: [
        "Product Design: [Jira], Confluence, Figma • Methodologies: [Agile], [Scrum], Kanban • Analytics: Google Analytics, [SQL], Amplitude",
        "PM Toolkit: [Jira], Trello, ProductBoard • Analytics: [SQL], Google Analytics, Mixpanel • Agile: [Scrum Master], sprint planning, backlog grooming"
      ],
      experience: [
        [
          "Product Manager at [DevStudio] (2022 - Present) - Owned the lifecycle of an e-commerce checkout page, resulting in [18% improvement] in completed transactions. Moderated sprints in [Jira] for [15+ software engineers].",
          "Business Analyst at [FinTechCorp] (2021 - 2022) - Conducted comprehensive user surveys and telemetry analysis, translating observations into PRDs."
        ],
        [
          "Technical Product Manager at [DevStudio] - Launched mobile application version, acquiring 100k+ active users within first 6 months of deployment.",
          "Junior PM / Analyst at [FinTechCorp] - Maintained feature backlog, wrote user stories, and coordinated user acceptance testing (UAT) phases."
        ]
      ],
      education: [
        ["Master of Business Administration (MBA) - [IIT Bombay] (Specialization in Tech Management, 2021)"],
        ["MBA - Indian Institute of Technology, Bombay (Class of 2021)"]
      ]
    }
  },
  security: {
    name: "VIKRAM SEN",
    title: "Cyber Security Analyst",
    contact: "+91 94433 22110 • vikram.s@gmail.com • Kochi, India",
    originalScore: 66,
    optimizedScore: 91,
    original: {
      summary: "Cybersecurity analyst with experience in vulnerability scans, firewalls, and network monitoring.",
      skills: "Wireshark, Nmap, Metasploit, SIEM, Firewalls, Network Security, Linux",
      experience: [
        "Security Analyst at SecureNet - Monitored network traffic for suspicious activities.",
        "System Specialist at NetOps - Maintained firewalls, VPN configurations, and server patches."
      ],
      education: [
        "B.S. in Computer Science - CUSAT, 2020"
      ]
    },
    optimized: {
      summary: "Certified [Cyber Security Analyst] with [4+ years] of dedicated experience in [Vulnerability Assessment and Penetration Testing (VAPT)]. Proficient in configuring enterprise [SIEM platforms], auditing firewall rulebases, and executing threat hunts to secure critical infrastructure.",
      skills: "Security Auditing: [Nmap], [Metasploit], Nessus • Network Analysis: [Wireshark], tcpdump • Monitoring & SIEM: Splunk, ELK • Standards: OWASP Top 10, ISO 27001 • OS: [Linux] (Kali, RedHat), Windows Server",
      experience: [
        "Information Security Analyst at [SecureNet] (2022 - Present) - Directed incident response protocols during threat detections, securing network perimeters. Conducted regular VAPT using [Nmap] and [Metasploit] to patch [40+] potential vulnerabilities.",
        "Junior Security Admin at [NetOps] (2020 - 2022) - Managed SIEM ingestion logs, configured firewall policies, and audited employee authentication protocols, preventing brute-force attacks."
      ],
      education: [
        "Bachelor of Science in Computer Science - [CUSAT] (Distinction, 2020)"
      ]
    },
    alternatives: {
      summary: [
        "Certified [Cyber Security Analyst] with [4+ years] of dedicated experience in [Vulnerability Assessment and Penetration Testing (VAPT)].",
        "[Incident Responder & Security Architect] focused on threat detection, network segmentation, and configuring secure AWS cloud resources.",
        "[Infrastructure Audit Engineer] skilled in Kali Linux, Wireshark packet inspections, and implementing compliance policies for ISO 27001."
      ],
      skills: [
        "Security Auditing: [Nmap], [Metasploit], Nessus • Network Analysis: [Wireshark], tcpdump • Monitoring & SIEM: Splunk, ELK • Standards: OWASP Top 10 • OS: [Linux] (Kali, RedHat)",
        "Infosec Skills: [Wireshark packet capture], [Nmap vulnerability scanning] • Platforms: Splunk, Metasploit, Kali Linux • Protocols: TCP/IP, DNS, SSL/TLS, VPN architectures"
      ],
      experience: [
        [
          "Information Security Analyst at [SecureNet] (2022 - Present) - Directed incident response protocols during threat detections, securing network perimeters. Conducted regular VAPT using [Nmap] and [Metasploit].",
          "Junior Security Admin at [NetOps] (2020 - 2022) - Managed SIEM ingestion logs, configured firewall policies, and audited employee authentication protocols."
        ],
        [
          "Senior Security Engineer at [SecureNet] - Built automated audit logs that cut incident assessment times by [50%]. Implemented multi-factor authentication (MFA) company-wide.",
          "Net Specialist at [NetOps] - Patched OS kernels on 100+ servers, monitored network traffic using Wireshark to locate unauthorized ports."
        ]
      ],
      education: [
        ["Bachelor of Science in Computer Science - [CUSAT] (Distinction, 2020)"],
        ["B.Sc. Computer Science - Cochin University of Science and Technology (2020)"]
      ]
    }
  }
};
const POSITION_SKILLS_REC = {
  frontend: ["React.js", "Next.js", "TypeScript", "JavaScript", "HTML5", "CSS3", "Tailwind CSS", "Redux Toolkit", "Vite", "Bootstrap 5", "Material UI", "Webpack"],
  backend: ["Python", "Django", "FastAPI", "Node.js", "Express.js", "PostgreSQL", "MongoDB", "MySQL", "REST API", "GraphQL", "JWT Authentication", "RBAC", "Docker"],
  devops: ["Docker", "Kubernetes", "Terraform", "Ansible", "Jenkins", "GitHub Actions", "AWS", "GCP", "Linux", "CI/CD Pipeline", "Prometheus", "Grafana"],
  product: ["Product Management", "Agile/Scrum", "Jira", "PRD Writing", "Roadmap Planning", "Wireframing", "A/B Testing", "Market Research", "SQL Analytics", "Confluence"],
  security: ["Vulnerability Assessment", "Wireshark", "Nmap", "Metasploit", "SIEM", "Firewalls", "Network Security", "OWASP Top 10", "Penetration Testing", "Linux Security"],
  data: ["Python", "Pandas", "NumPy", "Scikit-Learn", "PyTorch", "TensorFlow", "Spark", "SQL", "Data Pipelines", "Tableau", "Machine Learning", "Deep Learning"]
};

const getRecommendedSkills = (position = "") => {
  const posLower = position.toLowerCase();
  if (posLower.includes("frontend") || posLower.includes("react") || posLower.includes("ui") || posLower.includes("ux")) {
    return POSITION_SKILLS_REC.frontend;
  }
  if (posLower.includes("backend") || posLower.includes("django") || posLower.includes("fastapi") || posLower.includes("node") || posLower.includes("python")) {
    return POSITION_SKILLS_REC.backend;
  }
  if (posLower.includes("devops") || posLower.includes("cloud") || posLower.includes("aws") || posLower.includes("site reliability") || posLower.includes("sre")) {
    return POSITION_SKILLS_REC.devops;
  }
  if (posLower.includes("product") || posLower.includes("manager") || posLower.includes("pm")) {
    return POSITION_SKILLS_REC.product;
  }
  if (posLower.includes("security") || posLower.includes("cyber") || posLower.includes("infosec") || posLower.includes("penetration")) {
    return POSITION_SKILLS_REC.security;
  }
  if (posLower.includes("data") || posLower.includes("machine") || posLower.includes("ml") || posLower.includes("ai") || posLower.includes("science")) {
    return POSITION_SKILLS_REC.data;
  }
  return [...POSITION_SKILLS_REC.frontend.slice(0, 6), ...POSITION_SKILLS_REC.backend.slice(0, 6)];
};

export default function Home() {
  // Navigation & Filter States
  const [activePill, setActivePill] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  // Custom CV Optimization States
  const [cvFile, setCvFile] = useState(null);
  const [cvText, setCvText] = useState("");
  const [originalPdfUrl, setOriginalPdfUrl] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [error, setError] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  // Dynamic API Result States (if user runs their own resume)
  const [customOptimizationResult, setCustomOptimizationResult] = useState(null);
  const [customRecommendations, setCustomRecommendations] = useState([]);
  const [jobs, setJobs] = useState([]);

  // New States for AI Analyzer Flow
  const [hasUploadedCV, setHasUploadedCV] = useState(false);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [parsedCV, setParsedCV] = useState(null);

  // Upload Modal States
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadStep, setUploadStep] = useState('idle'); // idle | parsing | optimizing | recommending | done | error
  const [isDragOver, setIsDragOver] = useState(false);
  const [cvViewTab, setCvViewTab] = useState('optimized'); // 'original' | 'optimized'

  // States for alternative content toggling
  const [summaryAltIndex, setSummaryAltIndex] = useState(0);
  const [skillsAltIndex, setSkillsAltIndex] = useState(0);
  const [expAltIndex, setExpAltIndex] = useState(0);
  const [eduAltIndex, setEduAltIndex] = useState(0);
  const [projectAltIndex, setProjectAltIndex] = useState(0);
  const [achievementsAltIndex, setAchievementsAltIndex] = useState(0);

  // States and helper functions for step-by-step CV section editing & highlights
  const [highlightedSection, setHighlightedSection] = useState('header'); 
  const [completedSections, setCompletedSections] = useState(['header']);
  const [headerQuestionIdx, setHeaderQuestionIdx] = useState(0); // chat starts by asking the user's name

  const isSectionVisible = (sectionName) => {
    return true;
  };

  const handleSectionClick = (sectionName) => {
    openSectionEditor(sectionName);
  };

  const isSkillPresent = (skillName) => {
    if (!cvDraftData || !cvDraftData.skills) return false;
    const searchVal = skillName.toLowerCase().trim();
    if (typeof cvDraftData.skills === 'string') {
      return cvDraftData.skills.toLowerCase().includes(searchVal);
    }
    return Object.values(cvDraftData.skills).some(val => 
      typeof val === 'string' && val.toLowerCase().includes(searchVal)
    );
  };

  const toggleRecommendedSkill = (skillName) => {
    setCvDraftData(prev => {
      if (!prev) return prev;
      if (typeof prev.skills === 'string') {
        const skillsList = prev.skills.split(/[,•]/).map(s => s.trim()).filter(Boolean);
        const exists = skillsList.some(s => s.toLowerCase() === skillName.toLowerCase());
        let newSkills = "";
        if (exists) {
          newSkills = skillsList.filter(s => s.toLowerCase() !== skillName.toLowerCase()).join(', ');
        } else {
          newSkills = [...skillsList, skillName].join(', ');
        }
        return { ...prev, skills: newSkills };
      }
      const currentFrontend = prev.skills?.frontend || "";
      const skillsList = currentFrontend.split(/[,•]/).map(s => s.trim()).filter(Boolean);
      const exists = skillsList.some(s => s.toLowerCase() === skillName.toLowerCase());
      let newFrontend = "";
      if (exists) {
        newFrontend = skillsList.filter(s => s.toLowerCase() !== skillName.toLowerCase()).join(', ');
      } else {
        newFrontend = [...skillsList, skillName].join(', ');
      }
      return {
        ...prev,
        skills: {
          ...(prev.skills || {}),
          frontend: newFrontend
        }
      };
    });
  };

  const getHeaderQuestionText = (idx) => {
    switch (idx) {
      case 0: return "What is your full name?";
      case 1: return "What is your job position?";
      case 2: return "List your existing skills (or enter custom ones to add/modify):";
      case 3: return "What is your phone number?";
      case 4: return "What is your email address?";
      case 5: return "What is your city, state, and country?";
      case 6: return "What is your portfolio URL/ID?";
      case 7: return "What is your LinkedIn profile link/ID?";
      case 8: return "What is your GitHub profile link/ID?";
      default: return "";
    }
  };

  const tryApplyEditCommand = (userText, queryLower) => {
    let updatedField = "";
    let val = "";

    const hasCommandWord = queryLower.includes("change ") || queryLower.includes("set ") || queryLower.includes("edit ") || queryLower.includes("update ");
    if (!hasCommandWord) return null;

    if (queryLower.includes("name")) {
      val = userText.replace(/change name to|set name to|edit name to|update name to/i, "").trim().toUpperCase();
      setCvDraftData(prev => ({ ...prev, name: val }));
      updatedField = `Name updated to **${val}**`;
      handleSectionProgress('name');
    } else if (queryLower.includes("email")) {
      const emailMatch = userText.match(/[\w.-]+@[\w.-]+\.\w+/);
      if (emailMatch) {
        setCvDraftData(prev => ({ ...prev, email: emailMatch[0] }));
        updatedField = `Email updated to **${emailMatch[0]}**`;
        handleSectionProgress('email');
      }
    } else if (queryLower.includes("phone")) {
      val = userText.replace(/change phone to|set phone to|edit phone to|update phone to/i, "").trim();
      setCvDraftData(prev => ({ ...prev, phone: val }));
      updatedField = `Phone number updated to **${val}**`;
      handleSectionProgress('phone');
    } else if (queryLower.includes("location")) {
      val = userText.replace(/change location to|set location to|edit location to|update location to/i, "").trim();
      setCvDraftData(prev => ({ ...prev, location: val }));
      updatedField = `Location updated to **${val}**`;
      handleSectionProgress('location');
    } else if (queryLower.includes("github")) {
      val = userText.replace(/change github to|set github to|edit github to|update github to/i, "").trim();
      setCvDraftData(prev => ({ ...prev, github: val }));
      updatedField = `GitHub updated to **${val}**`;
      handleSectionProgress('github');
    } else if (queryLower.includes("portfolio")) {
      val = userText.replace(/change portfolio to|set portfolio to|edit portfolio to|update portfolio to/i, "").trim();
      setCvDraftData(prev => ({ ...prev, portfolio: val }));
      updatedField = `Portfolio updated to **${val}**`;
      handleSectionProgress('portfolio');
    } else if (queryLower.includes("linkedin")) {
      val = userText.replace(/change linkedin to|set linkedin to|edit linkedin to|update linkedin to/i, "").trim();
      setCvDraftData(prev => ({ ...prev, linkedin: val }));
      updatedField = `LinkedIn updated to **${val}**`;
      handleSectionProgress('linkedin');
    } else if (queryLower.includes("summary")) {
      val = userText.replace(/change summary to|set summary to|edit summary to|update summary to/i, "").trim();
      setCvDraftData(prev => ({ ...prev, summary: val }));
      updatedField = `Professional summary updated`;
      handleSectionProgress('summary');
    } else if (queryLower.includes("education")) {
      val = userText.replace(/change education to|set education to|edit education to|update education to/i, "").trim();
      setCvDraftData(prev => ({ ...prev, education: val }));
      updatedField = `Education updated`;
      handleSectionProgress('education');
    } else if (queryLower.includes("skills") || queryLower.includes("skill")) {
      val = userText.replace(/change skills to|set skills to|edit skills to|update skills to|change skill to|set skill to|edit skill to|update skill to/i, "").trim();
      setCvDraftData(prev => {
        if (typeof prev.skills === 'string') {
          return { ...prev, skills: val };
        }
        return {
          ...prev,
          skills: {
            ...(prev.skills || {}),
            frontend: val
          }
        };
      });
      updatedField = `Technical skills updated to **${val}**`;
      handleSectionProgress('skills');
    } else if (queryLower.includes("position") || queryLower.includes("title")) {
      val = userText.replace(/change position to|set position to|edit position to|update position to|change title to|set title to|edit title to|update title to/i, "").trim();
      setCvDraftData(prev => ({ ...prev, position: val }));
      updatedField = `Position updated to **${val}**`;
    } else if (queryLower.includes("experience") || queryLower.includes("work") || queryLower.includes("company")) {
      updatedField = "Work Experience section updated";
      handleSectionProgress('experience');
    }

    return updatedField;
  };

  const getSectionStyle = (sectionName) => {
    const isHighlighted = highlightedSection === sectionName;
    return {
      border: isHighlighted ? '2.5px dashed var(--accent-blue)' : '2.5px dashed transparent',
      borderRadius: '10px',
      padding: isHighlighted ? '0.85rem' : '0.25rem',
      backgroundColor: isHighlighted ? 'rgba(37, 99, 235, 0.05)' : 'transparent',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: isHighlighted ? '0 8px 24px rgba(37, 99, 235, 0.12)' : 'none',
      position: 'relative',
      marginBottom: '0.85rem',
      cursor: 'pointer'
    };
  };

  const renderSectionBadge = (sectionName) => {
    if (highlightedSection !== sectionName) return null;
    return (
      <span style={{
        position: 'absolute',
        top: '-11px',
        right: '14px',
        backgroundColor: 'var(--accent-blue)',
        color: '#ffffff',
        fontSize: '0.65rem',
        fontWeight: 800,
        padding: '0.2rem 0.6rem',
        borderRadius: '5px',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        boxShadow: '0 3px 8px rgba(37,99,235,0.25)',
        zIndex: 10,
        pointerEvents: 'none'
      }}>
        Editing Section
      </span>
    );
  };

  const handleSectionProgress = (fieldName) => {
    setCompletedSections(prev => {
      const next = [...prev];
      if (['name', 'email', 'phone', 'location', 'github', 'linkedin', 'portfolio'].includes(fieldName)) {
        if (!next.includes('summary')) {
          next.push('summary');
          setHighlightedSection('summary');
        }
      } else if (fieldName === 'summary') {
        if (!next.includes('skills')) {
          next.push('skills');
          setHighlightedSection('skills');
        }
      } else if (fieldName === 'skills') {
        if (!next.includes('experience')) {
          next.push('experience');
          setHighlightedSection('experience');
        }
      } else if (fieldName === 'experience' || fieldName === 'company') {
        if (!next.includes('projects')) {
          next.push('projects', 'education', 'certifications', 'achievements');
          setHighlightedSection(null);
        }
      }
      return next;
    });
  };


  // AI Chat & Template Profile States
  const [activeProfile, setActiveProfile] = useState("python");
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: "ai", text: "**What is your name?**" }
  ]);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [platformStats, setPlatformStats] = useState(null);
  const [chatInput, setChatInput] = useState("");
  const [isChatCollapsed, setIsChatCollapsed] = useState(true);
  const [chatStep, setChatStep] = useState(0); // 0: Init, 1: Name/Position request, 2: Contacts/Location request, 3: Projects/Education request, 4: Free edit mode
  const [cvDraftData, setCvDraftData] = useState({
    name: "Name",
    position: "Software Developer",
    phone: "+91 00000 00000",
    email: "name@gmail.com",
    location: "City, State, India",
    portfolio: "name.vercel.app",
    linkedin: "linkedin.com/in/name",
    github: "github.com/name",
    summary: "Full Stack Developer with 10+ months of hands-on internship experience building and shipping production-ready web applications using React.js, TypeScript, Next.js, Python (Django/FastAPI), and PostgreSQL. Independently architected and deployed RentFlow – a live PWA with 20+ API endpoints, JWT-based RBAC, and real-time financial dashboards (frontend on Vercel, backend on Render, database on Supabase). Led backend development for a 5-member CRM team and team-led 2 full-stack projects end-to-end. Seeking a Full Stack, Frontend, or Backend Developer role to contribute to a product-focused engineering team.",
    skills: {
      frontend: "React.js, Redux Toolkit, Next.js, TypeScript, JavaScript (ES6+), HTML5, CSS3, Tailwind CSS, Bootstrap 5, Material UI, Vite",
      backend: "Python, Django, Django REST Framework (DRF), FastAPI, Pydantic, Uvicorn, ASGI, REST API, JWT Authentication, RBAC, REST API Design",
      database: "PostgreSQL, MySQL, Supabase, Django ORM, Raw SQL, Relational Schema Design",
      tools: "Git, GitHub, GitLab, Postman, VS Code, Figma, Vercel, Render, Supabase, Cloudflare, Cloud Deployment, Docker (basic), GitHub Actions",
      concepts: "Full Stack Development, Agile/Scrum, PWA, State Management, Component Architecture, Team Leadership",
      ai: "Gemini API, OpenAI API, LLM Integration, Prompt Engineering, RAG Architectures"
    },
    experience: [
      {
        company: "TechNova Solutions",
        place: "City, State",
        position: "Software Developer Intern",
        duration: "Jan 2024 – Present",
        bullets: [
          "Developed and shipped full-stack web applications using React.js, Node.js, and PostgreSQL.",
          "Implemented 20+ REST API endpoints with JWT authentication and Role-Based Access Control (RBAC).",
          "Collaborated in Agile/Scrum sprints using Git and GitHub for version control and code reviews.",
          "Optimized relational database schemas, reducing query latency by [35%].",
          "Configured production deployments on cloud platforms, improving server response times by [30%]."
        ]
      },
      {
        company: "Digital Craft Labs",
        place: "City, State",
        position: "Junior Developer",
        duration: "Jun 2023 – Dec 2023",
        bullets: [
          "Built responsive user interfaces with React.js and Tailwind CSS.",
          "Created backend endpoints using Express.js and Node.js, ensuring efficient data processing.",
          "Integrated third-party APIs and analytics dashboard widgets for real-time metrics."
        ]
      }
    ],
    projects: [
      {
        name: "ProjectAlpha – Full-Stack Web Application",
        duration: "Jan 2024 – Present",
        tech: "React • Node.js • PostgreSQL • Tailwind CSS • JWT • Vercel",
        bullets: [
          "Designed and deployed a full-stack web application with 15+ REST API endpoints.",
          "Implemented JWT-based authentication, role access controls, and real-time dashboards.",
          "Reduced database query latency by [30%] through schema indexing and query profiling."
        ]
      },
      {
        name: "ProjectBeta – E-Commerce Platform",
        duration: "Aug 2023 – Dec 2023",
        tech: "Django • PostgreSQL • Bootstrap 5 • Python",
        bullets: [
          "Built a full-featured e-commerce platform with product catalog, cart, and secure user checkout.",
          "Optimized item retrieval speeds using Django ORM query filters and caching."
        ]
      }
    ],
    education: "Bachelor of Technology in Computer Science (Graduated 2023) • State Technical University",
    certifications: [
      "Full Stack Developer Certification (2023)",
      "Cloud Fundamentals – AWS (2022)",
      "Agile & Scrum Practitioner (2022)"
    ],
    achievements: [
      "Best Project Award – Built a scalable app prototype in under 3 hours at college hackathon.",
      "Team Lead: Led a 4-member team delivering a production-ready CRM application on schedule."
    ]
  });

  const fileInputRef = useRef(null);
  const optimizedCardRef = useRef(null);
  const dropdownRef = useRef(null);

  // ═══════════════════════════════════════════════════════════
  // AI SECTION EDITOR — chat-driven editing per CV section:
  // the user picks "AI suggestions" (role-tailored cards) or
  // "type my own data" for every portion of the CV.
  // ═══════════════════════════════════════════════════════════
  const [sectionEditFlow, setSectionEditFlow] = useState(null); // { section, stage: 'choose'|'pick'|'await-own' }

  const pushAiMessage = (msg) =>
    setChatMessages(prev => [...prev, { id: Date.now() + Math.random(), sender: 'ai', ...msg }]);

  const NEXT_ORDER = ['header', 'summary', 'skills', 'experience', 'projects', 'education', 'certifications', 'achievements'];

  const nextSectionOptions = (current) => {
    const idx = NEXT_ORDER.indexOf(current);
    const next = NEXT_ORDER[idx + 1];
    const opts = [];
    if (next) opts.push({ label: `Edit ${SECTION_LABELS[next]}`, action: 'open', section: next });
    opts.push({ label: 'Download PDF', action: 'download' });
    return opts;
  };

  // Every section edit starts with a question asking for the user's real details;
  // the answer is then polished by AI before it lands on the CV.
  const SECTION_QUESTIONS = {
    summary: "Tell me about yourself — your role, years of experience, main technologies, and one accomplishment you're proud of. I'll polish it into a professional summary.",
    skills: "List your skills separated by commas — I'll organize them into the skills table.",
    experience: "Describe your most recent job.\nFirst line: Position | Company | Duration | Location — then one line per thing you did there.",
    projects: "Describe a project you built.\nFirst line: Project Name | Duration | Tech Stack — then one line per highlight.",
    education: "What did you study? Give your degree, years, institute, and grade.\nExample: B.Tech CSE (2020 – 2024) • NIT Calicut • CGPA 8.5",
    certifications: "List your certifications or trainings, one per line.",
    achievements: "List your achievements, one per line.",
  };

  const openSectionEditor = (section) => {
    setHighlightedSection(section);
    if (section === 'header') {
      // Header is always filled manually, step by step — never AI-generated
      setSectionEditFlow(null);
      setHeaderQuestionIdx(0);
      pushAiMessage({ text: "Let's fill your header details manually. **What is your full name?**" });
      return;
    }
    setHeaderQuestionIdx(null);
    setSectionEditFlow({ section, stage: 'await-own' });
    pushAiMessage({
      text: `**${SECTION_LABELS[section] || section}** — ${SECTION_QUESTIONS[section] || 'Type the details you want in this section.'}`,
      options: [
        { label: 'Use AI suggestions instead', action: 'ai-suggest', section },
        { label: 'Skip for now', action: 'skip', section },
      ],
    });
  };

  // ── AI polish helpers ──────────────────────────────────────────
  const polishLine = (line) => {
    let t = line.trim().replace(/^[-•*]\s*/, '');
    if (!t) return t;
    t = t.charAt(0).toUpperCase() + t.slice(1);
    if (!/[.!?]$/.test(t)) t += '.';
    return t;
  };

  // Turns the user's raw answer into polished suggestion cards
  // (their own details cleaned up + an AI-enhanced version)
  const buildPolishedCards = (section, text) => {
    const role = getRoleType(cvDraftData?.position || '');
    const pick = (bank) => bank[role] || bank.fullstack || Object.values(bank)[0];
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    switch (section) {
      case 'summary': {
        const base = polishLine(text.replace(/\s+/g, ' '));
        const closer = `Seeking a ${cvDraftData?.position || 'developer'} role on a product-focused team where clean code and measurable impact matter.`;
        const enhanced = `${base} ${closer}`;
        return [
          { title: 'Your details — polished', preview: base, payload: base },
          { title: 'Polished + AI enhanced', preview: enhanced, payload: enhanced },
        ];
      }
      case 'skills': {
        const own = categorizeSkills(text);
        const rec = pick(SKILLSET_BANK);
        const merged = {};
        Object.keys(rec).forEach((k) => {
          const ownItems = (own[k] && own[k] !== '—' ? own[k] : '').split(',').map(s => s.trim()).filter(Boolean);
          const recItems = (rec[k] || '').split(',').map(s => s.trim()).filter(Boolean)
            .filter(r => !ownItems.some(o => o.toLowerCase() === r.toLowerCase()))
            .slice(0, 3);
          const all = [...ownItems, ...recItems];
          merged[k] = all.length ? all.join(', ') : (own[k] || '—');
        });
        const previewOf = (set) => Object.entries(set)
          .filter(([, v]) => v && v !== '—')
          .map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`)
          .join('\n');
        return [
          { title: 'Your skills — organized', preview: previewOf(own), payload: own },
          { title: 'Your skills + AI recommended', preview: previewOf(merged), payload: merged },
        ];
      }
      case 'experience': {
        const [first, ...rest] = lines;
        const parts = (first || '').split('|').map(p => p.trim());
        const entry = {
          position: parts[0] || cvDraftData?.position || 'Position',
          company: parts[1] || 'Company',
          duration: parts[2] || '',
          place: parts[3] || '',
          bullets: rest.length ? rest.map(polishLine) : ['Describe your key contributions here.'],
        };
        const aiBullets = pick(EXPERIENCE_BANK).flat().flatMap(e => e.bullets)
          .filter(b => !entry.bullets.includes(b)).slice(0, 2);
        const enhanced = { ...entry, bullets: [...entry.bullets, ...aiBullets] };
        const previewOf = (e) => `${e.position} @ ${e.company} (${e.duration})\n${e.bullets.map(b => `- ${b}`).join('\n')}`;
        return [
          { title: 'Your experience — polished', preview: previewOf(entry), payload: [entry] },
          { title: 'Polished + AI enhanced bullets', preview: previewOf(enhanced), payload: [enhanced] },
        ];
      }
      case 'projects': {
        const [first, ...rest] = lines;
        const parts = (first || '').split('|').map(p => p.trim());
        const entry = {
          name: parts[0] || 'Project Name',
          duration: parts[1] || '',
          tech: parts[2] || '',
          bullets: rest.length ? rest.map(polishLine) : ['Describe what you built.'],
        };
        const aiBullets = pick(PROJECT_BANK).flat().flatMap(p => p.bullets)
          .filter(b => !entry.bullets.includes(b)).slice(0, 2);
        const enhanced = { ...entry, bullets: [...entry.bullets, ...aiBullets] };
        const previewOf = (p) => `${p.name}${p.tech ? `\n${p.tech}` : ''}\n${p.bullets.map(b => `- ${b}`).join('\n')}`;
        return [
          { title: 'Your project — polished', preview: previewOf(entry), payload: [entry] },
          { title: 'Polished + AI enhanced bullets', preview: previewOf(enhanced), payload: [enhanced] },
        ];
      }
      case 'education': {
        const base = lines.length > 1 ? lines.map(polishLine) : polishLine(text.replace(/\s+/g, ' '));
        const preview = Array.isArray(base) ? base.join('\n') : base;
        return [{ title: 'Your education — formatted', preview, payload: base }];
      }
      case 'certifications': {
        const own = lines.map(polishLine);
        const aiExtra = pick(CERTIFICATION_BANK).flat().filter(c => !own.includes(c)).slice(0, 1);
        return [
          { title: 'Your certifications — formatted', preview: own.join('\n'), payload: own },
          { title: 'Formatted + AI recommended', preview: [...own, ...aiExtra].join('\n'), payload: [...own, ...aiExtra] },
        ];
      }
      case 'achievements': {
        const own = lines.map(polishLine);
        return [{ title: 'Your achievements — polished', preview: own.join('\n'), payload: own }];
      }
      default:
        return [];
    }
  };

  // Applies a payload to the CV draft (shared by suggestion cards and the AI cycle button)
  const applyPayload = (section, payload) => {
    setCvDraftData(prev => {
      switch (section) {
        case 'summary': return { ...prev, summary: payload };
        case 'skills': return { ...prev, skills: typeof payload === 'object' && payload !== null ? { ...payload } : payload };
        case 'experience': return { ...prev, experience: payload };
        case 'projects': return { ...prev, projects: payload };
        case 'education': return { ...prev, education: payload };
        case 'certifications': return { ...prev, certifications: payload };
        case 'achievements': return { ...prev, achievements: payload };
        default: return prev;
      }
    });
  };

  // Local fallback bank (used if the backend dataset API is unreachable)
  const buildLocalSuggestions = (section) => {
    const role = getRoleType(cvDraftData?.position || '');
    const pick = (bank) => bank[role] || bank.fullstack || Object.values(bank)[0];
    switch (section) {
      case 'summary':
        return pick(SUMMARY_BANK).map((s, i) => ({ title: `Summary option ${i + 1}`, preview: s, payload: s }));
      case 'skills': {
        const set = pick(SKILLSET_BANK);
        const preview = Object.entries(set)
          .filter(([, v]) => v && v !== '—')
          .map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`)
          .join('\n');
        return [{ title: `Recommended ${cvDraftData?.position || 'role'} skill set`, preview, payload: set }];
      }
      case 'experience':
        return pick(EXPERIENCE_BANK).map((set) => ({
          title: set.map(e => e.company).join('  +  '),
          preview: set.map(e => `${e.position} @ ${e.company} (${e.duration})`).join('\n'),
          payload: set,
        }));
      case 'projects':
        return pick(PROJECT_BANK).map((set) => ({
          title: set.map(p => p.name.split('–')[0].trim()).join('  +  '),
          preview: set.map(p => `${p.name}\n${p.tech}`).join('\n\n'),
          payload: set,
        }));
      case 'education':
        return [...EDUCATION_BANK].sort(() => Math.random() - 0.5).slice(0, 4)
          .map((e) => ({ title: (e.split('•')[1] || 'Education').trim(), preview: e, payload: e }));
      case 'certifications':
        return pick(CERTIFICATION_BANK).map((set, i) => ({ title: `Certification set ${i + 1}`, preview: set.join('\n'), payload: set }));
      case 'achievements':
        return [...ACHIEVEMENT_BANK].sort(() => Math.random() - 0.5).slice(0, 3)
          .map((set, i) => ({ title: `Achievement set ${i + 1}`, preview: set.join('\n'), payload: set }));
      default:
        return [];
    }
  };

  // AI suggestions come from the backend dataset (1,600+ snippets in the database),
  // with the local bank as an offline fallback.
  const buildSectionSuggestions = async (section) => {
    const role = getRoleType(cvDraftData?.position || '');
    try {
      const res = await fetch(`${API_BASE}/api/cv-content/?section=${section}&role=${role}&count=4`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.options) && data.options.length > 0) {
          return data.options.map(o => ({ title: o.title, preview: o.preview, payload: o.payload }));
        }
      }
    } catch (err) {
      console.error('cv-content API unavailable, using local dataset:', err);
    }
    return buildLocalSuggestions(section);
  };

  // The AI icon on each CV preview section cycles through alternative content
  const altCacheRef = useRef({});
  const cycleSectionAlternative = async (section) => {
    let cache = altCacheRef.current[section];
    if (!cache || cache.cards.length === 0) {
      const cards = await buildSectionSuggestions(section);
      if (!cards || cards.length === 0) return;
      cache = { cards, idx: -1 };
      altCacheRef.current[section] = cache;
    }
    cache.idx = (cache.idx + 1) % cache.cards.length;
    applyPayload(section, cache.cards[cache.idx].payload);
    setHighlightedSection(section);
    pushAiMessage({
      text: `Generated an alternative **${SECTION_LABELS[section]}** (version ${cache.idx + 1} of ${cache.cards.length}). Click the AI icon again for another version, or click the section to enter your own details.`,
    });
  };

  const applySectionSuggestion = (section, payload) => {
    applyPayload(section, payload);
    setSectionEditFlow(null);
    handleSectionProgress(section);
    pushAiMessage({
      text: `**${SECTION_LABELS[section]}** updated — it's live on the CV preview. You can re-open any section from the Edit Section bar whenever you like.`,
      options: nextSectionOptions(section),
    });
  };

  const handleChatOption = async (opt) => {
    if (!opt || !opt.action) return;
    if (opt.action === 'open') { openSectionEditor(opt.section); return; }
    if (opt.action === 'download') { handleDownloadPdf(); return; }
    if (opt.action === 'skip') {
      setSectionEditFlow(null);
      setHighlightedSection(null);
      pushAiMessage({ text: 'No problem — click any CV section whenever you want to edit it.' });
      return;
    }
    if (opt.action === 'own') {
      setSectionEditFlow({ section: opt.section, stage: 'await-own' });
      pushAiMessage({ text: `Sure — ${SECTION_QUESTIONS[opt.section] || `type your ${SECTION_LABELS[opt.section]} below and hit send.`}` });
      return;
    }
    if (opt.action === 'ai-suggest') {
      const cards = await buildSectionSuggestions(opt.section);
      setSectionEditFlow({ section: opt.section, stage: 'pick' });
      pushAiMessage({
        text: `Here are AI-crafted options for **${SECTION_LABELS[opt.section]}**, tailored to **${cvDraftData?.position || 'your role'}**. Tap one to apply:`,
        cards: cards.map(c => ({ ...c, section: opt.section })),
        options: [{ label: 'I\'ll type my own instead', action: 'own', section: opt.section }],
      });
      return;
    }
    if (opt.action === 'apply') {
      applySectionSuggestion(opt.section, opt.payload);
      return;
    }
  };

  // Generates a role-tailored draft CV from the dataset and opens the workspace.
  // Everything except the header gets AI content the user then replaces
  // section by section with their own polished details.
  const generateRoleCv = (position) => {
    const role = getRoleType(position);
    const pick = (bank) => bank[role] || bank.fullstack || Object.values(bank)[0];
    setCvDraftData(prev => ({
      ...prev,
      position,
      summary: pick(SUMMARY_BANK)[0],
      skills: { ...pick(SKILLSET_BANK) },
      experience: pick(EXPERIENCE_BANK)[0],
      projects: pick(PROJECT_BANK)[0],
      education: EDUCATION_BANK[0],
      certifications: pick(CERTIFICATION_BANK)[0],
      achievements: ACHIEVEMENT_BANK[0],
    }));
    setParsedCV(null);
    setHasUploadedCV(true);
    setIsAnalyzed(true);
    setCustomOptimizationResult({ original_score: 75, optimized_score: 95 });
    setCustomRecommendations(jobs.slice(0, 3));
    setChatStep(4);
  };

  // Manual, question-by-question header flow (never AI-generated)
  const handleHeaderAnswer = (userText) => {
    let replyText = "";
    if (headerQuestionIdx === 0) {
      if (userText.includes(',')) {
        // "Name, Role" shortcut — capture both and jump ahead
        const parts = userText.split(',');
        const nm = parts[0].trim().toUpperCase();
        const pos = parts.slice(1).join(',').trim() || 'Full Stack Developer';
        setCvDraftData(prev => ({ ...prev, name: nm }));
        generateRoleCv(pos);
        replyText = `Nice to meet you, **${nm}**. I've drafted a **${pos}** CV with AI content — now let's replace it with your real details.\n\n**List your existing skills (comma separated):**`;
        setHeaderQuestionIdx(2);
      } else {
        const val = userText.toUpperCase();
        setCvDraftData(prev => ({ ...prev, name: val }));
        replyText = "**What is your job position?** (e.g. Frontend Developer)";
        setHeaderQuestionIdx(1);
      }
    } else if (headerQuestionIdx === 1) {
      generateRoleCv(userText);
      replyText = `I've drafted a **${userText}** CV with AI content — you can see it on the left. Now let's fill in your real details.\n\n**List your existing skills (comma separated):**`;
      setHeaderQuestionIdx(2);
    } else if (headerQuestionIdx === 2) {
      setCvDraftData(prev => ({ ...prev, skills: categorizeSkills(userText) }));
      replyText = "**What is your phone number?**";
      setHeaderQuestionIdx(3);
    } else if (headerQuestionIdx === 3) {
      setCvDraftData(prev => ({ ...prev, phone: userText }));
      replyText = "**What is your email address?**";
      setHeaderQuestionIdx(4);
    } else if (headerQuestionIdx === 4) {
      setCvDraftData(prev => ({ ...prev, email: userText }));
      replyText = "**What is your city, state, and country?**";
      setHeaderQuestionIdx(5);
    } else if (headerQuestionIdx === 5) {
      setCvDraftData(prev => ({ ...prev, location: userText }));
      replyText = "**What is your portfolio URL/ID?**";
      setHeaderQuestionIdx(6);
    } else if (headerQuestionIdx === 6) {
      setCvDraftData(prev => ({ ...prev, portfolio: userText }));
      replyText = "**What is your LinkedIn profile link/ID?**";
      setHeaderQuestionIdx(7);
    } else if (headerQuestionIdx === 7) {
      setCvDraftData(prev => ({ ...prev, linkedin: userText }));
      replyText = "**What is your GitHub profile link/ID?**";
      setHeaderQuestionIdx(8);
    } else if (headerQuestionIdx === 8) {
      setCvDraftData(prev => ({ ...prev, github: userText }));
      setHeaderQuestionIdx(null);
      pushAiMessage({ text: "**Header completed.** Your contact details are on the CV. Next:" });
      openSectionEditor('summary');
      return;
    }
    setChatMessages(prev => [...prev, { id: Date.now() + 2, sender: "ai", text: replyText }]);
  };

  // Fetch jobs from backend on component mount and handle click outside for dropdown
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/jobs/`);
        const data = await res.json();
        if (res.ok) {
          setJobs(data.jobs || []);
        }
      } catch (err) {
        console.error("Error fetching jobs from backend:", err);
      }
    };
    fetchJobs();

    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/stats/`);
        const data = await res.json();
        if (res.ok) setPlatformStats(data);
      } catch (err) {
        console.error("Error fetching platform stats:", err);
      }
    };
    fetchStats();

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Speech to Text (Web Speech API SpeechRecognition)
  const handleSpeechToText = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please try Chrome, Edge, or Safari.");
      return;
    }

    if (isListening) {
      if (window.recognitionInstance) {
        window.recognitionInstance.stop();
      }
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        setChatInput((prev) => {
          const space = prev ? " " : "";
          return prev + space + transcript;
        });
      }
    };

    window.recognitionInstance = recognition;
    recognition.start();
  };

  // Generate resume data based on selected job suggestions pill
  const handlePillClick = async (pill) => {
    setActivePill(pill);
    setSearchQuery(pill);

    const cleanPosition = pill;
    const cleanName = "Name";
    const cleanEmail = "name@gmail.com";
    const cleanPhone = "+91 00000 00000";
    const cleanLocation = "City, State, India";
    const cleanLinkedin = "linkedin.com/in/name";
    const cleanGithub = "github.com/name";
    
    let summary = `Experienced and result-driven [${cleanPosition}] with a strong background in software development. Skilled in architecting, developing, and deploying scalable web solutions, optimizing frontend user interfaces, and building resilient backend services. Proven track record of improving system performance and delivering high-quality user experiences.`;
    
    let skills = {
      frontend: "React, Next.js, HTML5, CSS3, Tailwind CSS, JavaScript (ES6+), TypeScript",
      backend: "Node.js, Express, Python, Django, REST APIs, Microservices",
      database: "PostgreSQL, MongoDB, MySQL, Redis",
      tools: "Docker, Git, GitHub Actions, AWS, Vercel, Render",
      concepts: "Agile, Scrum, CI/CD, OOP, RESTful API Design",
      ai: "LLM Integration, Prompt Engineering, Gemini AI API"
    };

    let experience = [];
    let projects = [];

    const lowerPill = pill.toLowerCase();
    if (lowerPill.includes("frontend") || lowerPill.includes("ux") || lowerPill.includes("ui")) {
      summary = `Dedicated [Frontend Engineer] with [3+ years] of expertise building responsive web applications using [React.js], [Next.js], and [TypeScript]. Expert in UI/UX fidelity, client-side state management, and optimizing frontend performance to achieve [95+ Lighthouse scores].`;
      skills.frontend = "React.js, Next.js, TypeScript, Redux Toolkit, Tailwind CSS, CSS Modules, HTML5/CSS3";
      skills.backend = "Node.js, REST APIs (integration), GraphQL";
      experience = [
        {
          company: "PixelCraft Solutions",
          place: "Bangalore, India",
          position: "Senior Frontend Developer",
          duration: "2023 - Present",
          bullets: [
            "Engineered responsive user interfaces in [React.js] and [Next.js] for an e-commerce platform, reducing cumulative layout shift by [45%].",
            "Leveraged [TypeScript] to build reusable design components, reducing UI development iteration time by [30%].",
            "Optimized client-side bundle size using code splitting and lazy loading, achieving [95+ Lighthouse performance scores]."
          ]
        },
        {
          company: "WebCreations Inc.",
          place: "Kochi, India",
          position: "Junior UI Engineer",
          duration: "2021 - 2023",
          bullets: [
            "Collaborated with product designers to implement pixel-perfect user dashboards using [Tailwind CSS].",
            "Maintained high-fidelity user workflows using React Router, increasing conversion rate by [15%]."
          ]
        }
      ];
      projects = [
        {
          name: "DashboardX - Interactive Analytics Console",
          duration: "3 months",
          tech: "React • Next.js • Tailwind CSS • Recharts",
          bullets: [
            "Designed and implemented high-performance real-time data charts displaying telemetry analytics with low rendering overhead.",
            "Integrated secure user sessions and route protection configurations."
          ]
        }
      ];
    } else if (lowerPill.includes("devops") || lowerPill.includes("cloud") || lowerPill.includes("architect")) {
      summary = `Certified [DevOps & Cloud Engineer] with [4+ years] of experience specializing in [AWS], [Infrastructure as Code (IaC)] with Terraform, container orchestration via [Kubernetes], and building secure [CI/CD automation pipelines].`;
      skills.tools = "Docker, Kubernetes, Terraform, Ansible, Jenkins, GitHub Actions, AWS CloudFormation";
      experience = [
        {
          company: "InfraScale Tech",
          place: "Hyderabad, India",
          position: "Senior DevOps Cloud Engineer",
          duration: "2023 - Present",
          bullets: [
            "Provisioned high-availability cloud infrastructure on [AWS] utilizing [Terraform], reducing deployment setup times by [75%].",
            "Configured [Kubernetes (EKS)] clusters to autoscale dynamically during peak traffic hours, securing [99.99% system availability].",
            "Established zero-downtime Blue-Green deployment strategies in Jenkins."
          ]
        },
        {
          company: "CloudSystem Ltd",
          place: "Chennai, India",
          position: "Systems Administrator",
          duration: "2020 - 2023",
          bullets: [
            "Managed secure server backups and configured Bash automation scripts.",
            "Audited enterprise user access policies in AWS IAM to ensure compliance standards."
          ]
        }
      ];
      projects = [
        {
          name: "AutoDeploy - GitOps Deployment pipeline",
          duration: "4 months",
          tech: "Kubernetes • Terraform • AWS • ArgoCD",
          bullets: [
            "Built a declarative CI/CD pipeline using GitOps patterns, resulting in seamless rollbacks and configurations drift tracking."
          ]
        }
      ];
    } else if (lowerPill.includes("data") || lowerPill.includes("machine") || lowerPill.includes("science")) {
      summary = `Analytical [Data Scientist & ML Engineer] specializing in [Python], predictive modeling, [Scikit-Learn], and big data analytics. Expert in engineering data pipelines and translating statistics into direct business revenue.`;
      skills.backend = "Python, Pandas, NumPy, Scikit-Learn, PyTorch, SQL";
      skills.database = "PostgreSQL, Snowflake, Spark, SQLite";
      experience = [
        {
          company: "InsightData Labs",
          place: "Pune, India",
          position: "Lead Data Scientist",
          duration: "2022 - Present",
          bullets: [
            "Architected recommendation engines using [Python] and [Scikit-Learn] that increased customer retention by [20%].",
            "Developed predictive ETL pipelines handling 2M+ database rows daily using Spark and Snowflake.",
            "Optimized search performance of historical data models, lowering querying overhead by [35%]."
          ]
        },
        {
          company: "DataMetrics Corp",
          place: "Mumbai, India",
          position: "Data Analyst",
          duration: "2020 - 2022",
          bullets: [
            "Formulated complex SQL queries to compile corporate metrics and designed interactive dashboards in Tableau."
          ]
        }
      ];
      projects = [
        {
          name: "ChurnRadar - Customer Retention Predictor",
          duration: "3 months",
          tech: "Python • Scikit-Learn • Pandas • Flask",
          bullets: [
            "Trained gradient boosting models to classify customer churn patterns, achieving 91% accuracy scores."
          ]
        }
      ];
    } else if (lowerPill.includes("product") || lowerPill.includes("manager")) {
      summary = `Strategic [Technical Product Manager] with [4+ years] of experience leading cross-functional teams to ship scalable features. Expert in [Agile/Scrum roadmaps] and data-driven product analytics.`;
      skills.concepts = "Agile, Scrum, Product Roadmaps, Market Research, PRD writing";
      experience = [
        {
          company: "DevStudio Solutions",
          place: "Mumbai, India",
          position: "Technical Product Manager",
          duration: "2022 - Present",
          bullets: [
            "Owned the lifecycle of the core payment gateway checkout page, leading to [18% improvement] in completed transactions.",
            "Managed product backlog and moderated daily sprints in [Jira] for [12+ software engineers].",
            "Authored detailed PRDs matching business requirements to technical architecture."
          ]
        },
        {
          company: "FinTechCorp",
          place: "Bangalore, India",
          position: "Product Analyst",
          duration: "2020 - 2022",
          bullets: [
            "Conducted user research metrics mapping, shaping design layouts of user dashboard widgets."
          ]
        }
      ];
      projects = [
        {
          name: "CheckoutPlus - Cart Optimization Plan",
          duration: "5 months",
          tech: "Jira • Figma • SQL • Mixpanel",
          bullets: [
            "Spearheaded user onboarding redesign, reducing checkout friction drop-offs by [25%]."
          ]
        }
      ];
    } else if (lowerPill.includes("security") || lowerPill.includes("analyst")) {
      summary = `Certified [Cyber Security Analyst] with [4+ years] of expertise in [Vulnerability Assessment & Penetration Testing (VAPT)]. Proficient in SIEM, auditing firewalls, and network scanning tools.`;
      skills.concepts = "VAPT, Penetration Testing, OWASP Top 10, Network Security, IAM";
      skills.tools = "Wireshark, Nmap, Metasploit, Splunk, Kali Linux";
      experience = [
        {
          company: "SecureNet Systems",
          place: "Kochi, India",
          position: "Information Security Analyst",
          duration: "2022 - Present",
          bullets: [
            "Conducted comprehensive network penetration tests using [Nmap] and [Metasploit], patching [35+] vulnerability points.",
            "Established corporate incident response guidelines, reducing security response times by [40%].",
            "Configured secure VPN and firewall rule structures."
          ]
        },
        {
          company: "NetOps Firewall Corp",
          place: "Bangalore, India",
          position: "Security Administrator",
          duration: "2020 - 2022",
          bullets: [
            "Monitored incoming network packet logs via Wireshark to isolate suspicious traffic origins."
          ]
        }
      ];
      projects = [
        {
          name: "ThreatBlock - Firewall Rule Auditor",
          duration: "2 months",
          tech: "Python • Nmap • Splunk",
          bullets: [
            "Developed automated scripts to scan and audit open ports across 50+ database servers."
          ]
        }
      ];
    } else {
      summary = `Dedicated [Software Engineer] with [3+ years] of experience building robust web applications. Skilled in [Python], [Django], [PostgreSQL], and REST API design. Experienced in Agile team environments.`;
      skills.backend = "Python, Django, FastAPI, Django REST Framework, REST APIs";
      skills.database = "PostgreSQL, MySQL, Redis, Django ORM";
      experience = [
        {
          company: "DevScale Software Labs",
          place: "Kozhikode, Kerala",
          position: `Senior ${cleanPosition}`,
          duration: "2023 - Present",
          bullets: [
            `Engineered the core database backend APIs for web applications using [Python] and [Django], scaling requests limit by [40%].`,
            "Designed 25+ secure endpoints with JWT authentication and Role-Based Access Control (RBAC).",
            "Optimized slow PostgreSQL queries, reducing database lookups response latency by [35%]."
          ]
        },
        {
          company: "CodeStudio Solutions",
          place: "Trivandrum, India",
          position: `Junior Backend developer`,
          duration: "2021 - 2023",
          bullets: [
            "Integrated third-party payment gateways and drafted API documentations using Swagger."
          ]
        }
      ];
      projects = [
        {
          name: "RentFlow - Tenant Property Tracker",
          duration: "2 months",
          tech: "React • FastAPI • PostgreSQL • Supabase",
          bullets: [
            "Independently constructed property ledger dashboards, reducing bookkeeping error rates by [30%]."
          ]
        }
      ];
    }

    const structured = {
      name: cleanName,
      position: cleanPosition,
      phone: cleanPhone,
      email: cleanEmail,
      location: cleanLocation,
      linkedin: cleanLinkedin,
      github: cleanGithub,
      portfolio: "name.vercel.app",
      summary: summary,
      skills: skills,
      experience: experience,
      projects: projects,
      education: "Bachelor of Technology in Computer Science (Graduated 2023) • State Technical University",
      certifications: [
        `${cleanPosition} Professional Certification (2023)`,
        "Agile & Scrum Practitioner (2022)"
      ],
      achievements: [
        "Best Project Award – Built a scalable app prototype in under 3 hours at college hackathon.",
        "Team Lead: Led a 4-member team delivering production-ready applications on schedule."
      ]
    };

    const cvTextPlain = `
${cleanName}
${cleanPosition}
${cleanPhone} • ${cleanEmail} • ${cleanLocation}

## PROFESSIONAL SUMMARY
${summary.replace(/\[|\]/g, "")}

## TECHNICAL SKILLS
Frontend: ${skills.frontend}
Backend: ${skills.backend}
Database: ${skills.database}
Tools: ${skills.tools}

## WORK EXPERIENCE
${experience.map(exp => `${exp.position} at ${exp.company} (${exp.duration})\n${exp.bullets.join("\n")}`).join("\n\n")}

## PROJECTS
${projects.map(p => `${p.name} (${p.duration})\n${p.bullets.join("\n")}`).join("\n\n")}
    `.trim();

    setCvText(cvTextPlain);
    // Don't set parsedCV - pill click shows ONLY the AI-generated optimized CV (no left original card)
    setParsedCV(null);
    setCvDraftData(structured);
    setHasUploadedCV(true);
    setIsAnalyzed(true);
    setCompletedSections(['header']);
    setHighlightedSection('header');

    
    // Filter matching job objects from `jobs` to feed customRecommendations
    const recommendedJobs = jobs.filter(job => {
      const pillLower = pill.toLowerCase();
      const titleLower = job.title.toLowerCase();
      if (pillLower.includes("frontend") || pillLower.includes("ux") || pillLower.includes("ui")) {
        return titleLower.includes("frontend") || titleLower.includes("react") || titleLower.includes("ui") || titleLower.includes("ux");
      } else if (pillLower.includes("backend") || pillLower.includes("python") || pillLower.includes("node")) {
        return titleLower.includes("backend") || titleLower.includes("python") || titleLower.includes("node") || titleLower.includes("django");
      } else if (pillLower.includes("devops") || pillLower.includes("cloud") || pillLower.includes("architect")) {
        return titleLower.includes("devops") || titleLower.includes("kubernetes") || titleLower.includes("aws") || titleLower.includes("cloud");
      } else if (pillLower.includes("data") || pillLower.includes("machine") || pillLower.includes("science")) {
        return titleLower.includes("data") || titleLower.includes("machine") || titleLower.includes("science") || titleLower.includes("analyst");
      } else {
        const keyword = pillLower.replace(" developer", "").replace(" engineer", "");
        return titleLower.includes(keyword);
      }
    });
    setCustomRecommendations(recommendedJobs);

    const mockOptResult = {
      original_score: 72,
      optimized_score: 96,
      optimized_text: `
# ${cleanName} CANDIDATE
## PROFESSIONAL SUMMARY
${summary}

## TECHNICAL SKILLS
${Object.values(skills).join(" • ")}

## WORK EXPERIENCE
${experience.map(exp => `* [${exp.position}] at [${exp.company}] (${exp.duration}) - ${exp.bullets.map(b => b).join(". ")}`).join("\n")}
      `.trim(),
      recommendations: [
        "Quantify bullet points with metrics (e.g. % performance increase).",
        "Highlight your cloud architecture and containerization skills explicitly.",
        "List major tools and systems used in the projects section."
      ]
    };
    setCustomOptimizationResult(mockOptResult);

    // Auto-scroll to CV workspace and sequentially prompt user to fill in their real details
    setTimeout(() => {
      const workspaceEl = document.getElementById("cv-workspace");
      if (workspaceEl) workspaceEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);

    setChatMessages(prev => [
      ...prev,
      { id: Date.now(), sender: "user", text: `Selected suggestion: ${pill}` },
      { id: Date.now() + 1, sender: "ai", text: `**What is your full name?**` }
    ]);
    setHeaderQuestionIdx(0);
    setHighlightedSection('header');
  };

  // Handle file selection inside upload modal
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      e.target.value = ''; // allow re-selecting same file
    }
  };

  // Full upload pipeline: parse → optimize → recommend
  const handleUploadAndAnalyze = async (file) => {
    if (!file) return;
    setShowUploadModal(false);
    setSelectedFile(null);
    setError('');
    setUploadedFileName(file.name);
    setHasUploadedCV(true);
    setIsAnalyzed(false);
    setCustomOptimizationResult(null);
    setCustomRecommendations([]);
    setParsedCV(null);
    setUploadStep('parsing');
    setIsOptimizing(true);

    setChatMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: `📎 Uploaded CV: ${file.name}` }]);

    const formData = new FormData();
    formData.append('cv_file', file);

    try {
      // Step 1 — Parse
      const res = await fetch(`${API_BASE}/api/parse/`, { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to parse CV file.');

      setCvText(data.text);
      const structured = parseCVTextToSections(data.text);
      setParsedCV(structured);

      const textLower = data.text.toLowerCase();
      let matchedProfile = 'python';
      if (textLower.includes('devops') || textLower.includes('aws') || textLower.includes('kubernetes')) matchedProfile = 'devops';
      else if (textLower.includes('react') || textLower.includes('frontend') || textLower.includes('next.js')) matchedProfile = 'frontend';
      else if (textLower.includes('machine learning') || textLower.includes('data science') || textLower.includes('pandas')) matchedProfile = 'data';
      else if (textLower.includes('product manager') || textLower.includes('agile') || textLower.includes('scrum')) matchedProfile = 'product';
      else if (textLower.includes('security') || textLower.includes('cyber') || textLower.includes('vapt')) matchedProfile = 'security';
      setActiveProfile(matchedProfile);

      // Step 2 — Optimize
      setUploadStep('optimizing');
      const targetJob = jobs.find(j => j.title.toLowerCase().includes(matchedProfile)) || jobs[0];
      const targetJobId = targetJob ? targetJob.id : 7;
      const optFormData = new FormData();
      optFormData.append('job_id', targetJobId);
      optFormData.append('cv_text', data.text);

      const optRes = await fetch(`${API_BASE}/api/optimize/`, { method: 'POST', body: optFormData });
      const optData = await optRes.json();
      if (!optRes.ok) throw new Error(optData.error || 'Failed to optimize CV.');
      setCustomOptimizationResult(optData);
      setChatStep(4);

      const optimizedStructured = parseOptimizedCVToSections(optData.optimized_text);
      optimizedStructured.name = structured.name || 'Name';
      optimizedStructured.phone = structured.contact?.match(/\+?\d[\d\s\-().]{7,}/)?.[0] || '+91 00000 00000';
      optimizedStructured.email = structured.contact?.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)?.[0] || 'name@gmail.com';
      optimizedStructured.location = 'City, State, India';
      optimizedStructured.portfolio = 'name.vercel.app';
      optimizedStructured.linkedin = 'linkedin.com/in/name';
      optimizedStructured.github = 'github.com/name';
      setCvDraftData(optimizedStructured);

      // Step 3 — Recommend
      setUploadStep('recommending');
      const recRes = await fetch(`${API_BASE}/api/recommend/`, { method: 'POST', body: optFormData });
      const recData = await recRes.json();
      if (recRes.ok) setCustomRecommendations(recData.recommendations || []);

      setIsAnalyzed(true);
      setUploadStep('done');
      setCvViewTab('original');
      setHeaderQuestionIdx(null);

      setChatMessages(prev => [...prev, {
        id: Date.now() + 2, sender: 'ai',
        text: `CV parsed and optimized! Original ATS: **${optData.original_score}%** → AI Optimized: **${optData.optimized_score}%**.\n\nUse the **Original / AI Optimized** tabs above to compare. Chat below to edit any field.`
      }]);

      setTimeout(() => {
        document.getElementById('cv-workspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);

    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred during CV processing.');
      setUploadStep('error');
      setChatMessages(prev => [...prev, { id: Date.now() + 3, sender: 'ai', text: `Sorry, error: ${err.message}` }]);
    } finally {
      setIsOptimizing(false);
    }
  };


  // Run AI Analyzer - step 2: optimize and find recommendations
  const handleRunAIAnalysis = async () => {
    setIsOptimizing(true);
    setError("");
    setCustomOptimizationResult(null);
    setCustomRecommendations([]);
    
    const formData = new FormData();
    // Default to the first Python/Backend job in the database (or fallback to first job / ID 7)
    const targetJob = jobs.find(j => j.title.toLowerCase().includes("python")) || jobs[0];
    const targetJobId = targetJob ? targetJob.id : 7;
    formData.append("job_id", targetJobId);
    formData.append("cv_text", cvText);

    try {
      // 1. Optimize CV API
      const optRes = await fetch(`${API_BASE}/api/optimize/`, {
        method: "POST",
        body: formData,
      });
      const optData = await optRes.json();
      if (!optRes.ok) throw new Error(optData.error || "Failed to optimize CV.");
      setCustomOptimizationResult(optData);
      setIsAnalyzed(true);

      const optimizedStructured = parseOptimizedCVToSections(optData.optimized_text);
      optimizedStructured.name = parsedCV?.name || "Name";
      optimizedStructured.phone = parsedCV?.phone || "+91 00000 00000";
      optimizedStructured.email = parsedCV?.email || "name@gmail.com";
      optimizedStructured.location = parsedCV?.location || "City, State, India";
      optimizedStructured.portfolio = parsedCV?.portfolio || "name.vercel.app";
      optimizedStructured.linkedin = parsedCV?.linkedin || "linkedin.com/in/name";
      optimizedStructured.github = parsedCV?.github || "github.com/name";
      
      setCvDraftData(optimizedStructured);

      // 2. Job Recommendations API
      const recRes = await fetch(`${API_BASE}/api/recommend/`, {
        method: "POST",
        body: formData,
      });
      const recData = await recRes.json();
      if (recRes.ok) {
        setCustomRecommendations(recData.recommendations || []);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "An error occurred during CV processing.");
    } finally {
      setIsOptimizing(false);
    }
  };

  // Handle Chat Message Submission (Multi-step Interactive Onboarding)
  const handleSendChatMessage = async (e, directText = null) => {
    if (e) e.preventDefault();
    const userText = directText || chatInput;
    if (!userText.trim()) return;

    if (!directText) {
      setChatInput("");
    }
    
    // Add user message
    setChatMessages(prev => [...prev, { id: Date.now(), sender: "user", text: userText }]);

    // Section editor asked a question and is waiting for the user's details —
    // polish their answer with AI and offer it as suggestion cards
    if (sectionEditFlow?.stage === 'await-own') {
      const section = sectionEditFlow.section;
      const cards = buildPolishedCards(section, userText);
      setSectionEditFlow({ section, stage: 'pick' });
      pushAiMessage({
        text: `Here is your **${SECTION_LABELS[section]}**, polished by AI — tap the version you want on your CV:`,
        cards: cards.map(c => ({ ...c, section })),
        options: [{ label: 'Show AI suggestions instead', action: 'ai-suggest', section }],
      });
      return;
    }

    // Header details are collected manually, question by question (no AI content)
    if (headerQuestionIdx !== null) {
      handleHeaderAnswer(userText);
      return;
    }

    setIsOptimizing(true);
    setError("");

    // Route career questions to the backend AI assistant (unless it's a CV-builder command
    // like "Name, Role" or an active guided-edit step)
    const isAssistantQuery = (q) => {
      if (q.includes(",")) return false;
      if (headerQuestionIdx !== null) return false;
      const t = q.trim();
      return /\?\s*$/.test(t) ||
        /^(hi+|hello|hey+|yo|namaste|good (morning|afternoon|evening)|thanks|thank you|help)\b/i.test(t) ||
        /\b(salary|salaries|package|ctc|lpa|compensation|interview|ats|career|roadmap|certification|resume tips?|cv tips?|improve my (resume|cv)|skills? (for|needed|required|to become)|how to become|show me|find (me )?jobs?|remote jobs?|jobs? (in|for|near)|hiring|vacanc|what can you do|how (do|does)|tell me about)\b/i.test(t);
    };

    if (isAssistantQuery(userText)) {
      try {
        const res = await fetch(`${API_BASE}/api/chat/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userText }),
        });
        const data = await res.json();
        if (res.ok && data.reply) {
          setIsOptimizing(false);
          setChatMessages(prev => [...prev, { id: Date.now() + 2, sender: "ai", text: data.reply }]);
          return;
        }
      } catch (err) {
        console.error("AI assistant unavailable, falling back to local logic:", err);
      }
    }

    // Simulate AI response delay
    setTimeout(() => {
      const queryLower = userText.toLowerCase().trim();

      // Check if user is asking to switch/edit another section or issue a general command
      const hasEditCommand = queryLower.includes("change ") || queryLower.includes("set ") || queryLower.includes("edit ") || queryLower.includes("update ");
      const isSwitchCommand = ['summary', 'skills', 'experience', 'projects', 'education', 'certifications', 'achievements', 'header'].some(sec => queryLower.includes(sec)) && (queryLower.includes('edit') || queryLower.includes('change') || queryLower.includes('switch') || queryLower.includes('go to') || queryLower.includes('jump') || queryLower.includes('update'));
      
      if (isSwitchCommand && hasEditCommand) {
        setIsOptimizing(false);
        let targetSec = null;
        if (queryLower.includes('summary')) targetSec = 'summary';
        else if (queryLower.includes('skills')) targetSec = 'skills';
        else if (queryLower.includes('experience')) targetSec = 'experience';
        else if (queryLower.includes('projects')) targetSec = 'projects';
        else if (queryLower.includes('education')) targetSec = 'education';
        else if (queryLower.includes('certifications')) targetSec = 'certifications';
        else if (queryLower.includes('achievements')) targetSec = 'achievements';
        else if (queryLower.includes('header')) targetSec = 'header';

        if (targetSec) {
          setHighlightedSection(targetSec);
          setHeaderQuestionIdx(targetSec === 'header' ? 0 : null);
          setChatMessages(prev => [...prev, {
            id: Date.now() + 2,
            sender: 'ai',
            text: `Switched focus to **${targetSec.toUpperCase()}**. ${targetSec === 'header' ? 'Let’s verify your header details. **What is your full name?**' : 'What would you like to update in this section?'}`
          }]);
          return;
        }
      }

      // Check if it is a direct edit command
      const editResult = tryApplyEditCommand(userText, queryLower);
      if (editResult) {
        setIsOptimizing(false);
        const replyMsg = `${editResult}. What would you like to update next?`;
        setChatMessages(prev => [...prev, {
          id: Date.now() + 2,
          sender: "ai",
          text: replyMsg
        }]);
        return;
      }

      // 1. Check if user requests instant CV creation: e.g. "vighnesh tp , full stack developer"
      if (queryLower.includes(",") || queryLower.includes("create a") || queryLower.includes("build a") || queryLower.includes("developer") || queryLower.includes("engineer")) {
        let name = "Name";
        let position = "Full Stack Developer";
        
        if (userText.includes(",")) {
          const parts = userText.split(",");
          name = parts[0].trim().toUpperCase();
          position = parts[1].trim();
        } else {
          // Fallback parsing
          const parts = userText.split(/\b(?:create|build|a|an)\b/i);
          const candidate = parts[parts.length - 1].trim();
          if (candidate) {
            position = candidate;
          }
        }

        // Determine backend technology filter
        let backendType = "both";
        const queryClean = queryLower.replace(/\s+/g, "");
        if (queryClean.includes("node") || queryClean.includes("express") || queryClean.includes("nest")) {
          backendType = "node";
        } else if (queryClean.includes("python") || queryClean.includes("django") || queryClean.includes("fastapi")) {
          backendType = "python";
        }

        const skillSet = SKILLS_DB[backendType] || SKILLS_DB.both;

        // Fetch corresponding 6-point experience sets
        const exp1 = ALTERNATIVE_EXPERIENCES[0];
        const exp2 = ALTERNATIVE_EXPERIENCES[10] || ALTERNATIVE_EXPERIENCES[1];

        const initialProjects = [
          {
            name: "RentFlow – Tenant Rent Management System (Personal Project – Live)",
            duration: "Jan – Feb 2026",
            tech: backendType === "node" ? "React 18 • Vite • Node.js • Express • PostgreSQL • Supabase • Tailwind CSS • Recharts • JWT • Vercel • Render" : "React 18 • Vite • FastAPI • Pydantic • PostgreSQL • Supabase • Tailwind CSS • Recharts • JWT • Vercel • Render",
            bullets: [
              "Independently designed, built & deployed – frontend on Vercel, backend on Render, database on Supabase.",
              "Architected 20+ async REST API endpoints with secure request validation, JWT-based RBAC, and relational schema.",
              "Designed real-time Recharts dashboards (Bar, Donut) tracking revenue, collection rates, and tenant status.",
              "Integrated Supabase Storage for tenant lease documents and automated PDF invoice generation.",
              "Configured custom service workers to enable PWA support and offline access modes.",
              "Reduced query latencies by 35% through query profiling and selective schema indexing."
            ]
          },
          {
            name: "CRM – Customer Relationship Management System (Team Lead – 5 Members)",
            duration: "Jan – Feb 2026",
            tech: backendType === "node" ? "React 19 • Vite • Material UI • NestJS • TypeScript • PostgreSQL • JWT • jsPDF" : "React 19 • Vite • Material UI • Django • Django REST Framework • PostgreSQL • JWT • jsPDF",
            bullets: [
              "Led 5-member team; solely owned entire backend development including 30+ REST APIs and AbstractUser auth.",
              "PostgreSQL schema with 10+ models (Lead, Company, Deal, Ticket) handling 5 CRM modules.",
              "Configured robust CSV import/export utilities for bulk company and lead data ingestions.",
              "Designed analytical visualizers to track deal closures, ticket statuses, and employee activity logs.",
              "Authored full technical documentation, explaining state management and permission structures.",
              "Achieved 100% on-time milestone delivery through clear Agile sprint execution."
            ]
          },
          {
            name: "ShaKart – E-Commerce Web Application",
            duration: "Sep – Nov 2025",
            tech: backendType === "node" ? "React • Express.js • MongoDB • Tailwind CSS • Node.js" : "Django 5.2 • PostgreSQL • Bootstrap 5 • Django ORM • ModelForms • Python",
            bullets: [
              "Developed fully featured e-commerce application supporting product catalog search and secure user checkout.",
              "Styled with responsive themes, incorporating dark mode toggles and glassmorphic card grids.",
              "Optimized item retrieval speeds using indexed MongoDB queries / Django ORM filters.",
              "Implemented custom admin panels to manage catalog listings and customer order tickets.",
              "Designed clean input forms with thorough validation schemas, preventing invalid submissions.",
              "Cached product listings to ensure instant page paint times on lower-end devices."
            ]
          },
          {
            name: "SHOP.CO – Full-Stack E-Commerce Application",
            duration: "Oct – Nov 2025",
            tech: backendType === "node" ? "React • Redux Toolkit • NestJS • PostgreSQL • Vite • Axios • JWT" : "React • Redux Toolkit • Django • DRF • PostgreSQL • Vite • Axios • JWT",
            bullets: [
              "React + Redux Toolkit state architecture handling authentication slices, product listings, and cart states.",
              "Connected DRF/NestJS backend APIs, configuring Axios interceptors for automated JWT injection.",
              "Styled high-fidelity checkout checkout pages, ensuring pixel-perfect responsive layouts.",
              "Added protection rules on route links, redirecting unauthenticated users to login portals.",
              "Wrote comprehensive unit test runs for cart slice states and user checkout procedures.",
              "Monitored network bundles using Vite analyzer, trimming redundant client dependencies by 20%."
            ]
          }
        ];

        // Select summary alternative
        let summaryText = ALTERNATIVE_SUMMARIES[0];
        if (backendType === "node") {
          summaryText = ALTERNATIVE_SUMMARIES.find(s => s.toLowerCase().includes("node")) || ALTERNATIVE_SUMMARIES[2];
        } else if (backendType === "python") {
          summaryText = ALTERNATIVE_SUMMARIES.find(s => s.toLowerCase().includes("django")) || ALTERNATIVE_SUMMARIES[0];
        }

        const newDraft = {
          name: name,
          position: skillSet.title,
          phone: "+91 00000 00000",
          email: "name@gmail.com",
          location: "City, State, India",
          portfolio: "name.vercel.app",
          linkedin: "linkedin.com/in/name",
          github: "github.com/name",
          summary: summaryText,
          skills: {
            frontend: skillSet.skills.frontend,
            backend: skillSet.skills.backend,
            database: skillSet.skills.database,
            tools: skillSet.skills.tools,
            concepts: skillSet.skills.concepts,
            ai: "Gemini API, OpenAI API, LLM Integration, Prompt Engineering, RAG Architectures"
          },
          experience: [
            {
              company: exp1.company,
              place: exp1.place,
              position: exp1.position,
              duration: exp1.duration,
              bullets: exp1.bullets
            },
            {
              company: exp2.company,
              place: exp2.place,
              position: exp2.position,
              duration: exp2.duration,
              bullets: exp2.bullets
            }
          ],
          projects: initialProjects,
          education: "Bachelor of Technology in Computer Science (Graduated 2023) • State Technical University",
          certifications: [
            `${skillSet.title} Certification (2023)`,
            "Cloud Fundamentals – AWS (2022)",
            "Agile & Scrum Practitioner (2022)"
          ],
          achievements: [
            "Best Project Award – Built a scalable app prototype in under 3 hours at college hackathon.",
            "Team Lead: Led a 4-member team delivering a production-ready application on schedule."
          ]
        };

        setCvDraftData(newDraft);
        setParsedCV(null); // When prompt CV created, show only 1 CV preview on screen (right optimized card)
        setHasUploadedCV(true);
        setIsAnalyzed(true);
        setCustomOptimizationResult({
          original_score: 75,
          optimized_score: 95
        });

        // Filter matched jobs
        const matchedJobs = jobs.filter(j => 
          j.title.toLowerCase().includes(backendType) || 
          j.description.toLowerCase().includes(backendType)
        );
        setCustomRecommendations(matchedJobs.length > 0 ? matchedJobs : jobs.slice(0, 3));

        setChatStep(4);
        setIsOptimizing(false);
        setChatMessages(prev => [...prev, {
          id: Date.now() + 2,
          sender: "ai",
          text: `I have generated a professional **${skillSet.title}** CV for **${name}**! The original ATS score is **75%**, and the optimized ATS score is **95%**. You can check the preview above.`
        }]);
        return;
      }

      

      // 3. Fallback standard conversation
      setIsOptimizing(false);
      setChatMessages(prev => [...prev, {
        id: Date.now() + 2,
        sender: "ai",
        text: `I've noted that! You can continue directing me to create or edit your CV, or upload an existing PDF.`
      }]);
    }, 1000);
  };

  // Filter jobs based on search query and active pill
  const getFilteredJobs = () => {
    const sourceList = customRecommendations.length > 0 ? customRecommendations : jobs;
    return sourceList.filter((job) => {
      const query = searchQuery.toLowerCase().trim();
      const titleMatches = job.title.toLowerCase().includes(query);
      const companyMatches = job.company.toLowerCase().includes(query);
      const descMatches = job.description.toLowerCase().includes(query);
      const skillMatches = job.requirements
        ? (Array.isArray(job.requirements) ? job.requirements.join(" ") : job.requirements).toLowerCase().includes(query)
        : false;
      const matchingSkillsMatches = job.matching_skills
        ? job.matching_skills.some((s) => s.toLowerCase().includes(query))
        : false;

      const matchesSearch =
        !query || titleMatches || companyMatches || descMatches || skillMatches || matchingSkillsMatches;

      let matchesPill = true;
      if (activePill) {
        const pillLower = activePill.toLowerCase();
        if (pillLower === "frontend developer") {
          matchesPill = job.title.toLowerCase().includes("frontend") || job.title.toLowerCase().includes("react");
        } else if (pillLower === "backend engineer") {
          matchesPill =
            job.title.toLowerCase().includes("backend") ||
            job.title.toLowerCase().includes("python") ||
            job.title.toLowerCase().includes("node");
        } else if (pillLower === "full stack developer") {
          matchesPill = job.title.toLowerCase().includes("full stack") || job.title.toLowerCase().includes("fullstack");
        } else if (pillLower === "devops engineer") {
          matchesPill =
            job.title.toLowerCase().includes("devops") ||
            job.title.toLowerCase().includes("kubernetes") ||
            job.title.toLowerCase().includes("aws");
        } else {
          matchesPill = job.title
            .toLowerCase()
            .includes(pillLower.replace(" developer", "").replace(" engineer", ""));
        }
      }

      return matchesSearch && matchesPill;
    });
  };

  // Function to download optimized CV text
  const handleDownload = (text, filename = "Optimized_CV.txt") => {
    const element = document.createElement("a");
    const file = new Blob([text], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Real vector-text PDF using jsPDF text API
  const handleDownloadPdf = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF('p', 'pt', 'a4');
      const W = doc.internal.pageSize.getWidth();   // 595.28
      const H = doc.internal.pageSize.getHeight();  // 841.89
      const ML = 45, MR = 45, MT = 48;
      const TW = W - ML - MR; // text width
      let y = MT;

      const cv = cvDraftData;
      const name = (cv.name || 'Candidate').toUpperCase();
      // Position line mirrors the editor header: "Position • Skill • Skill …"
      const pdfSkillsSource = cv.skills && typeof cv.skills === 'object' && !Array.isArray(cv.skills)
        ? (cv.skills.frontend || Object.values(cv.skills).filter(v => v && v !== '—')[0] || '')
        : (Array.isArray(cv.skills) ? cv.skills.join(', ') : (cv.skills || ''));
      const pdfHeaderSkills = pdfSkillsSource.split(',').map(s => s.trim()).filter(Boolean).slice(0, 6).join(' • ');
      const position = (cv.position || 'Software Developer') + (pdfHeaderSkills ? `  •  ${pdfHeaderSkills}` : '');

      // Helpers
      const checkPage = (needed = 14) => {
        if (y + needed > H - 36) { doc.addPage(); y = MT; }
      };

      const sectionHeader = (title) => {
        checkPage(22);
        y += 8;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(15, 23, 42);
        doc.text(title.toUpperCase(), ML, y);
        y += 3;
        doc.setDrawColor(15, 23, 42);
        doc.setLineWidth(0.8);
        doc.line(ML, y, W - MR, y);
        y += 9;
        doc.setTextColor(30, 41, 59);
      };

      const bodyText = (text, opts = {}) => {
        if (!text) return;
        doc.setFont('helvetica', opts.bold ? 'bold' : 'normal');
        doc.setFontSize(opts.size || 8.5);
        doc.setTextColor(...(opts.color || [30, 41, 59]));
        const lines = doc.splitTextToSize(text, opts.width || TW);
        lines.forEach(line => { checkPage(12); doc.text(line, opts.x || ML, y); y += 11; });
      };

      const bullet = (text) => {
        if (!text) return;
        const cleanText = text.replace(/\[|\]/g, '');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.2);
        doc.setTextColor(51, 65, 85);
        doc.text('•', ML, y);
        const lines = doc.splitTextToSize(cleanText, TW - 10);
        lines.forEach((line, i) => { checkPage(11); doc.text(line, ML + 9, y); y += 10.5; });
      };

      // ── NAME & CONTACT ──
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(17);
      doc.setTextColor(15, 23, 42);
      doc.text(name, W / 2, y, { align: 'center' });
      y += 15;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.6);
      doc.setTextColor(30, 41, 59);
      doc.splitTextToSize(position, TW).forEach((ln) => {
        doc.text(ln, W / 2, y, { align: 'center' });
        y += 10.5;
      });
      y += 0.5;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);

      const contact = [cv.phone, cv.email, cv.location].filter(Boolean).join('  |  ');
      const contact2 = [cv.portfolio, cv.linkedin, cv.github].filter(Boolean).join('  |  ');
      if (contact) { doc.text(contact, W / 2, y, { align: 'center' }); y += 10; }
      if (contact2) { doc.text(contact2, W / 2, y, { align: 'center' }); y += 10; }

      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(ML, y + 2, W - MR, y + 2);
      y += 12;

      // ── PROFESSIONAL SUMMARY ──
      if (cv.summary) {
        sectionHeader('Professional Summary');
        bodyText(cv.summary.replace(/\[|\]/g, ''));
      }

      // ── TECHNICAL SKILLS ──
      const skills = cv.skills || {};
      // Skills table — mirrors the on-screen editor's table exactly (same
      // categorization, same labels, bordered two-column layout)
      const skillsNorm = categorizeSkills(skills);
      const labelMap = { frontend: 'Frontend', backend: 'Backend', database: 'Database', tools: 'Tools', concepts: 'Concepts', ai: 'AI Integrations' };
      const skillRows = Object.entries(labelMap)
        .filter(([key]) => skillsNorm[key] && skillsNorm[key].trim() && skillsNorm[key].trim() !== '—')
        .map(([key, label]) => [label, skillsNorm[key].replace(/\[|\]/g, '')]);
      if (skillRows.length > 0) {
        sectionHeader('Technical Skills');
        const col1 = 92;          // label column width
        const cellPad = 4;
        skillRows.forEach(([label, val]) => {
          doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
          const lines = doc.splitTextToSize(val, TW - col1 - cellPad * 2);
          const rowH = lines.length * 9.5 + cellPad * 2;
          checkPage(rowH + 4);
          const top = y - 7;
          doc.setDrawColor(203, 213, 225);
          doc.setLineWidth(0.5);
          doc.setFillColor(248, 250, 252);
          doc.rect(ML, top, col1, rowH, 'FD');
          doc.rect(ML + col1, top, TW - col1, rowH);
          doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(15, 23, 42);
          doc.text(label, ML + cellPad, top + cellPad + 6);
          doc.setFont('helvetica', 'normal'); doc.setTextColor(51, 65, 85);
          lines.forEach((ln, i) => doc.text(ln, ML + col1 + cellPad, top + cellPad + 6 + i * 9.5));
          y = top + rowH + 8;
        });
        y += 3;
      }

      // ── WORK EXPERIENCE ──
      const experience = Array.isArray(cv.experience) ? cv.experience : [];
      if (experience.length > 0) {
        sectionHeader('Work Experience');
        experience.forEach(exp => {
          checkPage(20);
          doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(15, 23, 42);
          doc.text(exp.position || '', ML, y);
          if (exp.duration) { doc.setFont('helvetica', 'normal'); doc.text(exp.duration, W - MR, y, { align: 'right' }); }
          y += 11;
          doc.setFont('helvetica', 'italic'); doc.setFontSize(8.2); doc.setTextColor(71, 85, 105);
          doc.text(`${exp.company || ''}${exp.place ? ` — ${exp.place}` : ''}`, ML, y);
          y += 10;
          if (Array.isArray(exp.bullets)) exp.bullets.forEach(b => bullet(b));
          y += 3;
        });
      }

      // ── PROJECTS ──
      const projects = Array.isArray(cv.projects) ? cv.projects : [];
      if (projects.length > 0) {
        sectionHeader('Projects');
        projects.forEach(proj => {
          checkPage(20);
          doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(15, 23, 42);
          doc.text(proj.name || '', ML, y);
          if (proj.duration) { doc.setFont('helvetica', 'normal'); doc.setFontSize(8.2); doc.text(proj.duration, W - MR, y, { align: 'right' }); }
          y += 11;
          if (proj.tech) {
            doc.setFont('helvetica', 'italic'); doc.setFontSize(8); doc.setTextColor(71, 85, 105);
            bodyText(proj.tech, { size: 8, color: [71, 85, 105] }); y -= 2;
          }
          if (Array.isArray(proj.bullets)) proj.bullets.forEach(b => bullet(b));
          y += 3;
        });
      }

      // ── EDUCATION ──
      const edu = cv.education;
      if (edu) {
        sectionHeader('Education');
        if (typeof edu === 'string') bodyText(edu.replace(/\[|\]/g, ''));
        else if (Array.isArray(edu)) edu.forEach(e => bodyText(e.replace(/\[|\]/g, '')));
      }

      // ── CERTIFICATIONS ──
      const certs = Array.isArray(cv.certifications) ? cv.certifications : [];
      if (certs.length > 0) {
        sectionHeader('Certifications & Training');
        certs.forEach(c => bullet(c));
      }

      // ── ACHIEVEMENTS ──
      const ach = Array.isArray(cv.achievements) ? cv.achievements : [];
      if (ach.length > 0) {
        sectionHeader('Achievements');
        ach.forEach(a => bullet(a));
      }

      const candidateName = cv.name || parsedCV?.name || 'Optimized';
      doc.save(`${candidateName}_CV.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('PDF generation failed. Please try again.');
    }
  };


  // Popup Gmail compose with pre-filled details for HR
  const handleEasyApply = (job) => {
    const recipient = "hr@gmail.com";
    const candidateName = cvDraftData.name || parsedCV?.name || "Applicant";
    const subject = encodeURIComponent(`Application for ${job.title} - ${candidateName}`);
    
    // Extracted optimized text or plain text CV
    let cvContentText = "";
    if (customOptimizationResult && customOptimizationResult.optimized_text) {
      // Remove highlight brackets for a clean email text layout
      cvContentText = customOptimizationResult.optimized_text.replace(/\[|\]/g, "");
    } else {
      cvContentText = cvText || "Please refer to the CV text on file.";
    }

    const emailBody = `Dear HR Team,

I am pleased to submit my application for the ${job.title} position at ${job.company}. 

Please review my optimized professional profile and resume details copied below:

======================================================================
${cvContentText}
======================================================================

I look forward to discussing how my experience aligns with your engineering goals.

Best regards,
${candidateName}`;

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${recipient}&su=${subject}&body=${encodeURIComponent(emailBody)}`;
    
    // Open a small centered floating browser popup window with the real Gmail compose page
    const width = 600;
    const height = 650;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    window.open(
      gmailUrl,
      "GmailCompose",
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`
    );
  };

  const handleCycleExperience = () => {
    const nextIdx = expAltIndex + 1;
    setExpAltIndex(nextIdx);
    const exp1 = ALTERNATIVE_EXPERIENCES[(nextIdx * 2) % ALTERNATIVE_EXPERIENCES.length];
    const exp2 = ALTERNATIVE_EXPERIENCES[(nextIdx * 2 + 1) % ALTERNATIVE_EXPERIENCES.length];
    setCvDraftData(prev => ({
      ...prev,
      experience: [
        {
          company: exp1.company,
          place: exp1.place,
          position: exp1.position,
          duration: exp1.duration,
          bullets: exp1.bullets
        },
        {
          company: exp2.company,
          place: exp2.place,
          position: exp2.position,
          duration: exp2.duration,
          bullets: exp2.bullets
        }
      ]
    }));
  };

  const handleCycleAchievements = () => {
    const nextIdx = achievementsAltIndex + 1;
    setAchievementsAltIndex(nextIdx);
    const altItems = ALTERNATIVE_ACHIEVEMENTS[nextIdx % ALTERNATIVE_ACHIEVEMENTS.length];
    setCvDraftData(prev => ({
      ...prev,
      certifications: altItems.slice(0, 4),
      achievements: altItems.slice(4)
    }));
  };

  const categorizeSkills = (skillsVal) => {
    const result = {
      frontend: "",
      backend: "",
      database: "",
      tools: "",
      concepts: "",
      ai: ""
    };
    if (!skillsVal) return result;
    if (typeof skillsVal === "object" && !Array.isArray(skillsVal)) {
      return {
        frontend: skillsVal.frontend || "",
        backend: skillsVal.backend || "",
        database: skillsVal.database || "",
        tools: skillsVal.tools || "",
        concepts: skillsVal.concepts || "",
        ai: skillsVal.ai || ""
      };
    }
    let list = [];
    if (typeof skillsVal === "string") {
      list = skillsVal.split(/[,•\n\-\*]/g).map(s => s.trim()).filter(Boolean);
    } else if (Array.isArray(skillsVal)) {
      list = skillsVal.map(s => s.trim()).filter(Boolean);
    }
    const categories = {
      frontend: ["react", "next", "typescript", "javascript", "html", "css", "tailwind", "bootstrap", "material", "vite", "vue", "angular", "redux", "es6"],
      backend: ["python", "django", "fastapi", "node", "express", "nest", "pydantic", "uvicorn", "asgi", "wsgi", "jwt", "rbac", "rest api", "apis", "api", "auth"],
      database: ["postgres", "mysql", "supabase", "mongodb", "orm", "sql", "relational", "nosql", "schema", "redis", "sqlite"],
      tools: ["git", "github", "gitlab", "postman", "vs code", "figma", "vercel", "render", "docker", "kubernetes", "aws", "gcp", "azure", "ci/cd", "actions"],
      concepts: ["full stack", "agile", "scrum", "pwa", "state management", "architecture", "leadership", "sprints", "microservices", "testing", "unit test", "oop"],
      ai: ["gemini", "openai", "llm", "prompt", "rag", "artificial intelligence", "machine learning", "deep learning", "nlp", "vector", "langchain"]
    };
    const matches = {
      frontend: [],
      backend: [],
      database: [],
      tools: [],
      concepts: [],
      ai: []
    };
    for (const skill of list) {
      let categorized = false;
      const lowerSkill = skill.toLowerCase();
      for (const [catName, keywords] of Object.entries(categories)) {
        if (keywords.some(kw => lowerSkill.includes(kw))) {
          matches[catName].push(skill);
          categorized = true;
          break;
        }
      }
      if (!categorized) {
        matches.backend.push(skill);
      }
    }
    return {
      frontend: matches.frontend.join(", "),
      backend: matches.backend.join(", "),
      database: matches.database.join(", "),
      tools: matches.tools.join(", "),
      concepts: matches.concepts.join(", "),
      ai: matches.ai.join(", ")
    };
  };

  // Renders AI option buttons + suggestion cards attached to a chat message
  const renderMessageExtras = (msg) => {
    if (!msg.cards && !msg.options) return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', maxWidth: '92%', marginTop: '0.1rem' }}>
        {msg.cards && msg.cards.map((card, i) => (
          <div key={i} onClick={() => handleChatOption({ action: 'apply', section: card.section, payload: card.payload })}
            style={{ border: '1.5px solid #bfdbfe', borderRadius: '12px', background: '#ffffff', padding: '0.6rem 0.75rem', cursor: 'pointer', boxShadow: '0 1px 4px rgba(37,99,235,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
              <SparklesIcon style={{ width: '0.8rem', height: '0.8rem', color: 'var(--accent-blue)' }} />
              <span style={{ fontWeight: 750, fontSize: '0.74rem', color: 'var(--text-dark)' }}>{card.title}</span>
              <span style={{ marginLeft: 'auto', flexShrink: 0, fontSize: '0.64rem', fontWeight: 800, color: '#ffffff', background: 'var(--accent-blue)', borderRadius: '50px', padding: '0.18rem 0.65rem', letterSpacing: '0.04em' }}>APPLY</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-gray)', lineHeight: 1.45, whiteSpace: 'pre-line', maxHeight: '86px', overflow: 'hidden' }}>{card.preview}</p>
          </div>
        ))}
        {msg.options && (
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {msg.options.map((opt, i) => (
              <button key={i} type="button" onClick={() => handleChatOption(opt)}
                style={{ padding: '0.35rem 0.8rem', borderRadius: '50px', border: '1px solid #bfdbfe', background: '#eff6ff', color: 'var(--accent-blue)', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderCVContent = (cv, isOptimized = false) => {
    if (!cv) return null;

    const name = cv.name || "Name";
    const position = cv.position || "Software Developer";
    
    // Header skill strip always derives from the CV's actual skills (matches PDF)
    const headerSkillsSource = cv.skills && typeof cv.skills === "object" && !Array.isArray(cv.skills)
      ? (cv.skills.frontend || Object.values(cv.skills).filter(v => v && v !== "—")[0] || "")
      : (Array.isArray(cv.skills) ? cv.skills.join(", ") : (cv.skills || ""));
    const headerSkills = headerSkillsSource.split(",").map(s => s.trim()).filter(Boolean).slice(0, 6).join(" • ")
      || "React.js • TypeScript • Python";

    const phone = cv.phone || "+91 00000 00000";
    const email = cv.email || "name@gmail.com";
    const location = cv.location || "City, State, India";
    const portfolio = cv.portfolio || "name.vercel.app";
    const linkedin = cv.linkedin || "linkedin.com/in/name";
    const github = cv.github || "github.com/name";

    let summary = cv.summary || "";
    if (isOptimized && summaryAltIndex > 0) {
      summary = ALTERNATIVE_SUMMARIES[summaryAltIndex % ALTERNATIVE_SUMMARIES.length];
    }

    const normalizedSkills = categorizeSkills(cv.skills);
    let frontendSkills = normalizedSkills.frontend;
    let backendSkills = normalizedSkills.backend;
    let databaseSkills = normalizedSkills.database;
    let toolsSkills = normalizedSkills.tools;
    let conceptsSkills = normalizedSkills.concepts;
    let aiSkills = normalizedSkills.ai;

    if (!isOptimized) {
      const originalSkills = Array.isArray(cv.skills) ? cv.skills.join(", ") : (typeof cv.skills === "object" ? Object.values(cv.skills).join(", ") : (cv.skills || ""));
      frontendSkills = originalSkills;
      backendSkills = "Python, Django, Node.js, Express";
      databaseSkills = "PostgreSQL, MySQL, Supabase";
      toolsSkills = "Git, GitHub, Vercel, Render";
      conceptsSkills = "Full Stack Development, Agile/Scrum";
    }

    let experienceList = cv.experience || [];
    if (isOptimized && expAltIndex > 0) {
      const exp1 = ALTERNATIVE_EXPERIENCES[(expAltIndex * 2) % ALTERNATIVE_EXPERIENCES.length];
      const exp2 = ALTERNATIVE_EXPERIENCES[(expAltIndex * 2 + 1) % ALTERNATIVE_EXPERIENCES.length];
      experienceList = [exp1, exp2];
    }
    if (experienceList.length === 0) {
      experienceList = [
        {
          company: "TechNova Solutions",
          place: "City, State",
          position: "Software Developer",
          duration: "Jan 2023 – Present",
          bullets: [
            "Developed and shipped full-stack web applications using React.js, Node.js, and PostgreSQL.",
            "Implemented 20+ REST API endpoints with JWT authentication and Role-Based Access Control (RBAC).",
            "Collaborated in Agile/Scrum sprints using Git and GitHub for version control and code reviews.",
            "Optimized relational database schemas, reducing query latency by 35%.",
            "Configured production deployments on cloud platforms, improving server response times by 30%.",
            "Configured production servers on Render and Vercel, reducing response latencies by 35%."
          ]
        }
      ];
    }

    let projectsList = cv.projects || [];
    if (typeof projectsList === "string" || projectsList.length === 0) {
      projectsList = [
        {
          name: "RentFlow – Tenant Rent Management System (Personal Project – Live)",
          duration: "Jan – Feb 2026",
          tech: "React 18 • Vite • FastAPI • Pydantic • PostgreSQL • Supabase • Tailwind CSS • Recharts • JWT • Vercel • Render",
          bullets: [
            "Independently designed, built & deployed – frontend on Vercel, FastAPI backend on Render, PostgreSQL on Supabase.",
            "Architected 20+ async REST API endpoints with Pydantic validation, JWT-based RBAC, and Supabase SQL.",
            "Designed real-time Recharts dashboards tracking property revenue, collection rates, and tenant occupancy status.",
            "Integrated Supabase Storage for tenant lease documents and automated PDF invoice generation.",
            "Configured custom service workers to enable PWA support and offline access modes.",
            "Reduced query latencies by 35% through query profiling and selective schema indexing."
          ]
        },
        {
          name: "CRM – Customer Relationship Management System (Team Lead – 5 Members)",
          duration: "Jan – Feb 2026",
          tech: "React 19 • Vite • Material UI • Django • Django REST Framework • PostgreSQL • JWT • jsPDF",
          bullets: [
            "Led 5-member team; solely owned entire backend development including 30+ REST APIs and AbstractUser auth.",
            "PostgreSQL schema with 10+ models (Lead, Company, Deal, Ticket) handling 5 CRM modules.",
            "Configured robust CSV import/export utilities for bulk company and lead data ingestions.",
            "Designed analytical visualizers to track deal closures, ticket statuses, and employee activity logs.",
            "Authored full technical documentation, explaining state management and permission structures.",
            "Achieved 100% on-time milestone delivery through clear Agile sprint execution."
          ]
        },
        {
          name: "ShaKart – E-Commerce Web Application",
          duration: "Sep – Nov 2025",
          tech: "Django 5.2 • PostgreSQL • Bootstrap 5 • Django ORM • ModelForms • Python",
          bullets: [
            "Developed fully featured e-commerce application supporting product catalog search and secure user checkout.",
            "Responsive Bootstrap 5 UI with dark mode, glassmorphism effects, image zoom, and 3-slide auto-rotating hero carousel.",
            "Optimized item retrieval speeds using indexed MongoDB queries / Django ORM filters.",
            "Implemented custom admin panels to manage catalog listings and customer order tickets.",
            "Designed clean input forms with thorough validation schemas, preventing invalid submissions.",
            "Cached product listings to ensure instant page paint times on lower-end devices."
          ]
        },
        {
          name: "SHOP.CO – Full-Stack E-Commerce Application",
          duration: "Oct – Nov 2025",
          tech: "React • Redux Toolkit • Django • DRF • PostgreSQL • Vite • Axios • JWT",
          bullets: [
            "React + Redux Toolkit state architecture handling authentication slices, product listings, and cart states.",
            "Connected DRF/NestJS backend APIs, configuring Axios interceptors for automated JWT injection.",
            "Styled high-fidelity checkout checkout pages, ensuring pixel-perfect responsive layouts.",
            "Added protection rules on route links, redirecting unauthenticated users to login portals.",
            "Wrote comprehensive unit test runs for cart slice states and user checkout procedures.",
            "Monitored network bundles using Vite analyzer, trimming redundant client dependencies by 20%."
          ]
        }
      ];
    }

    const education = cv.education || "B.Sc Computer Science (2022 – 2025) • University of Calicut";

    let certifications = cv.certifications || [];
    let achievements = cv.achievements || [];
    if (isOptimized && achievementsAltIndex > 0) {
      const altItems = ALTERNATIVE_ACHIEVEMENTS[achievementsAltIndex % ALTERNATIVE_ACHIEVEMENTS.length];
      certifications = altItems.slice(0, 4);
      achievements = altItems.slice(4);
    }
    if (certifications.length === 0) {
      certifications = [
        "AI-Powered Full Stack Developer Internship (React + Python) – Upcode Software Labs (Jun 2025 – Apr 2026)",
        "Flutter & Dart Mobile Development Internship – Trycode Innovations (Mar 2025)",
        "Software Development Bootcamp – Upcode Labs (Feb 2024)",
        "Cybersecurity Internship – TechbyHeart, Kochi (Dec 2023)"
      ];
    }
    if (achievements.length === 0) {
      achievements = [
        "Best Performer – Hackathon 2025: Built a fully responsive OTT Platform UI in under 2 hours.",
        "Workshop Lead: Conducted a hands-on Firebase deployment workshop, mentoring 25+ peers.",
        "Team Leadership: Led full-stack development teams across 2 projects, delivering production-ready applications."
      ];
    }

    return (
      <div className="resume-body" style={{ fontSize: "0.81rem", color: "#1e293b", fontFamily: "var(--font-sans)", lineHeight: "1.45" }}>
        {/* Name Header */}
        {isSectionVisible('header') && (
          <div onClick={() => handleSectionClick('header')} style={getSectionStyle('header')}>
            {renderSectionBadge('header')}
            <div style={{ textAlign: "center", marginBottom: "0.6rem" }}>
              <h2 className="resume-name" style={{ fontSize: "1.4rem", color: "#0f172a", textTransform: "uppercase", fontWeight: "800", marginBottom: "0.15rem", letterSpacing: "-0.01em" }}>
                {name}
              </h2>
              <div style={{ fontSize: "0.81rem", color: "#0f172a", fontWeight: "600", marginBottom: "0.2rem" }}>
                {position}  •  {headerSkills}
              </div>
              <div style={{ fontSize: "0.76rem", color: "#475569", display: "flex", justifyContent: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.1rem" }}>
                <span>{phone}</span> | <span>{email}</span> | <span>{location}</span>
              </div>
              <div style={{ fontSize: "0.76rem", color: "#475569", display: "flex", justifyContent: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                <span>{portfolio}</span> | <span>{linkedin}</span> | <span>{github}</span>
              </div>
            </div>
          </div>
        )}

        {/* Professional Summary */}
        {isSectionVisible('summary') && (
          <div onClick={() => handleSectionClick('summary')} style={getSectionStyle('summary')}>
            {renderSectionBadge('summary')}
            <div className="resume-section-header">
              <span>Professional Summary</span>
              <button
                className="section-ai-icon"
                onClick={(e) => { e.stopPropagation(); cycleSectionAlternative('summary'); }}
                title="Generate alternative AI content for this section"
              >
                <SparklesIcon style={{ width: "0.75rem", height: "0.75rem" }} />
              </button>
            </div>
            <p className="resume-text" style={{ textAlign: "justify", marginBottom: "0.4rem" }}>
              {isOptimized ? renderWithHighlights(summary) : summary}
            </p>
          </div>
        )}

        {/* Technical Skills */}
        {isSectionVisible('skills') && (
          <div onClick={() => handleSectionClick('skills')} style={getSectionStyle('skills')}>
            {renderSectionBadge('skills')}
            <div className="resume-section-header">
              <span>Technical Skills</span>
              <button
                className="section-ai-icon"
                onClick={(e) => { e.stopPropagation(); cycleSectionAlternative('skills'); }}
                title="Generate alternative AI content for this section"
              >
                <SparklesIcon style={{ width: "0.75rem", height: "0.75rem" }} />
              </button>
            </div>
            <table className="skills-table">
              <tbody>
                <tr>
                  <td>Frontend</td>
                  <td>{frontendSkills}</td>
                </tr>
                <tr>
                  <td>Backend</td>
                  <td>{backendSkills}</td>
                </tr>
                <tr>
                  <td>Database</td>
                  <td>{databaseSkills}</td>
                </tr>
                <tr>
                  <td>Tools</td>
                  <td>{toolsSkills}</td>
                </tr>
                <tr>
                  <td>Concepts</td>
                  <td>{conceptsSkills}</td>
                </tr>
                {aiSkills && (
                  <tr>
                    <td>AI Integrations</td>
                    <td>{aiSkills}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Work Experience */}
        {isSectionVisible('experience') && (
          <div onClick={() => handleSectionClick('experience')} style={getSectionStyle('experience')}>
            {renderSectionBadge('experience')}
            <div className="resume-section-header">
              <span>Work Experience</span>
              <button
                className="section-ai-icon"
                onClick={(e) => { e.stopPropagation(); cycleSectionAlternative('experience'); }}
                title="Generate alternative AI content for this section"
              >
                <SparklesIcon style={{ width: "0.75rem", height: "0.75rem" }} />
              </button>
            </div>
            {experienceList.length > 0 && typeof experienceList[0] === "string" ? (
              <ul className="resume-list" style={{ marginTop: "0.1rem", marginBottom: "0.3rem" }}>
                {experienceList.map((bullet, idx) => (
                  <li key={idx}>{isOptimized ? renderWithHighlights(bullet) : bullet}</li>
                ))}
              </ul>
            ) : (
              experienceList.map((exp, idx) => (
                <div key={idx} style={{ marginBottom: "0.4rem" }}>
                  <div className="experience-header-row">
                    <span>{exp.position}</span>
                    <span>{exp.duration}</span>
                  </div>
                  <div className="experience-sub-row">
                    <span>{exp.company}</span>
                    <span>{exp.place}</span>
                  </div>
                  <ul className="resume-list" style={{ marginTop: "0.1rem", marginBottom: "0.3rem" }}>
                    {exp.bullets && Array.isArray(exp.bullets) ? (
                      exp.bullets.map((bullet, bIdx) => (
                        <li key={bIdx}>{isOptimized ? renderWithHighlights(bullet) : bullet}</li>
                      ))
                    ) : (
                      <li>{exp.bullets || ""}</li>
                    )}
                  </ul>
                </div>
              ))
            )}
          </div>
        )}

        {/* Projects */}
        {isSectionVisible('projects') && (
          <div onClick={() => handleSectionClick('projects')} style={getSectionStyle('projects')}>
            {renderSectionBadge('projects')}
            <div className="resume-section-header">
              <span>Projects</span>
              <button
                className="section-ai-icon"
                onClick={(e) => { e.stopPropagation(); cycleSectionAlternative('projects'); }}
                title="Generate alternative AI content for this section"
              >
                <SparklesIcon style={{ width: "0.75rem", height: "0.75rem" }} />
              </button>
            </div>
            {projectsList.length > 0 && typeof projectsList[0] === "string" ? (
              <ul className="resume-list" style={{ marginTop: "0.1rem", marginBottom: "0.3rem" }}>
                {projectsList.map((bullet, idx) => (
                  <li key={idx}>{isOptimized ? renderWithHighlights(bullet) : bullet}</li>
                ))}
              </ul>
            ) : (
              projectsList.map((proj, idx) => (
                <div key={idx} style={{ marginBottom: "0.4rem" }}>
                  <div className="experience-header-row">
                    <span>{proj.name}</span>
                    <span>{proj.duration}</span>
                  </div>
                  <div style={{ fontSize: "0.76rem", color: "#475569", fontStyle: "italic", marginBottom: "0.1rem" }}>
                    {proj.tech}
                  </div>
                  <ul className="resume-list" style={{ marginTop: "0.1rem", marginBottom: "0.3rem" }}>
                    {proj.bullets && Array.isArray(proj.bullets) ? (
                      proj.bullets.map((bullet, bIdx) => (
                        <li key={bIdx}>{isOptimized ? renderWithHighlights(bullet) : bullet}</li>
                      ))
                    ) : (
                      <li>{proj.bullets || ""}</li>
                    )}
                  </ul>
                </div>
              ))
            )}
          </div>
        )}

        {/* Education */}
        {isSectionVisible('education') && (
          <div onClick={() => handleSectionClick('education')} style={getSectionStyle('education')}>
            {renderSectionBadge('education')}
            <div className="resume-section-header">
              <span>Education</span>
              <button
                className="section-ai-icon"
                onClick={(e) => { e.stopPropagation(); cycleSectionAlternative('education'); }}
                title="Generate alternative AI content for this section"
              >
                <SparklesIcon style={{ width: "0.75rem", height: "0.75rem" }} />
              </button>
            </div>
            {Array.isArray(education) ? (
              <ul className="resume-list" style={{ marginTop: "0.1rem", marginBottom: "0.3rem", listStyleType: "none", paddingLeft: 0 }}>
                {education.map((edu, idx) => (
                  <li key={idx} className="resume-text" style={{ marginBottom: "0.25rem" }}>
                    {isOptimized ? renderWithHighlights(edu) : edu}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="resume-text" style={{ marginBottom: "0.4rem" }}>
                {isOptimized ? renderWithHighlights(education) : education}
              </p>
            )}
          </div>
        )}

        {/* Certifications & Training */}
        {isSectionVisible('certifications') && (
          <div onClick={() => handleSectionClick('certifications')} style={getSectionStyle('certifications')}>
            {renderSectionBadge('certifications')}
            <div className="resume-section-header">
              <span>Certifications & Training</span>
              <button
                className="section-ai-icon"
                onClick={(e) => { e.stopPropagation(); cycleSectionAlternative('certifications'); }}
                title="Generate alternative AI content for this section"
              >
                <SparklesIcon style={{ width: "0.75rem", height: "0.75rem" }} />
              </button>
            </div>
            <ul className="resume-list" style={{ marginBottom: "0.4rem" }}>
              {certifications.map((cert, idx) => (
                <li key={idx}>{isOptimized ? renderWithHighlights(cert) : cert}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Achievements */}
        {isSectionVisible('achievements') && (
          <div onClick={() => handleSectionClick('achievements')} style={getSectionStyle('achievements')}>
            {renderSectionBadge('achievements')}
            <div className="resume-section-header">
              <span>Achievements</span>
              <button
                className="section-ai-icon"
                onClick={(e) => { e.stopPropagation(); cycleSectionAlternative('achievements'); }}
                title="Generate alternative AI content for this section"
              >
                <SparklesIcon style={{ width: "0.75rem", height: "0.75rem" }} />
              </button>
            </div>
            <ul className="resume-list" style={{ marginBottom: "0.4rem" }}>
              {achievements.map((ach, idx) => (
                <li key={idx}>{isOptimized ? renderWithHighlights(ach) : ach}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  // Helper to parse bracket highlights [word] in optimized CV text
  const renderWithHighlights = (text) => {
    if (!text) return "";
    
    // Split text by brackets, keeping them
    const parts = text.split(/(\[.*?\])/g);
    return parts.map((part, i) => {
      if (part.startsWith("[") && part.endsWith("]")) {
        const inner = part.slice(1, -1);
        if (inner.startsWith("**") && inner.endsWith("**")) {
          return (
            <span key={i} className="highlight bold">
              {inner.slice(2, -2)}
            </span>
          );
        }
        return (
          <span key={i} className="highlight">
            {inner}
          </span>
        );
      }
      return part;
    });
  };

  // Clean raw text to display in Original panel if loaded dynamically
  const renderOriginalText = (text) => {
    return text || "";
  };

  // Categories list matching mockup
  const categories = [
    "Frontend Developer",
    "Backend Engineer",
    "Data Analyst",
    "Product Manager",
    "Full Stack Developer",
    "UX Designer",
    "DevOps Engineer",
    "Cloud Architect",
    "Machine Learning",
    "Mobile Developer",
    "Security Analyst",
    "QA Engineer",
    "Data Scientist",
    "Database Engineer"
  ];

  const isInitialState = !activePill && !searchQuery && !isOptimizing && !customOptimizationResult && !isAnalyzed && !hasUploadedCV;

  // Chat vs history: older messages are tucked into a collapsible, dimmed history
  // block; only the current conversation (last few messages) renders full-contrast.
  const historyMessages = chatMessages.length > 5 ? chatMessages.slice(0, -4) : [];
  const currentMessages = chatMessages.length > 5 ? chatMessages.slice(-4) : chatMessages;
  const lastMessage = chatMessages[chatMessages.length - 1];

  const renderChatHistoryBlock = () => (
    historyMessages.length > 0 && (
      <div style={{ borderBottom: "1px dashed var(--border-color)", paddingBottom: "0.6rem", marginBottom: "0.35rem" }}>
        <button
          type="button"
          onClick={() => setShowChatHistory(v => !v)}
          style={{
            display: "flex", alignItems: "center", gap: "0.35rem",
            background: "#f1f5f9", border: "1px solid var(--border-color)", borderRadius: "50px",
            padding: "0.25rem 0.75rem", fontSize: "0.68rem", fontWeight: 700,
            color: "var(--text-muted)", cursor: "pointer", margin: "0 auto",
          }}
        >
          {showChatHistory ? "Hide" : "Show"} chat history ({historyMessages.length})
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: "0.7rem", height: "0.7rem", strokeWidth: 2.5, transform: showChatHistory ? "rotate(180deg)" : "none" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showChatHistory && historyMessages.map((msg) => (
          <div key={msg.id} style={{ display: "flex", justifyContent: msg.sender === "user" ? "flex-end" : "flex-start", marginTop: "0.5rem", opacity: 0.65 }}>
            <div style={{
              maxWidth: "82%", padding: "0.45rem 0.7rem", borderRadius: "10px",
              background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0",
              fontSize: "0.72rem", lineHeight: 1.45, textAlign: "left",
            }}>
              {msg.text.split("\n").map((line, lIdx) => (
                <p key={lIdx} style={{ margin: 0 }}>
                  {line.replace(/\*\*/g, "")}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  );

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-body)", fontFamily: "var(--font-sans)" }}>

      {/* ── INITIAL STATE: centered hero ── */}
      {isInitialState && (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem 1rem",
        }}>
          {/* Brand mark */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "2.5rem" }}>
            <svg viewBox="0 0 24 24" fill="var(--accent-blue)" style={{ width: "2.4rem", height: "2.4rem" }}>
              <path d="M 8 3 Q 8 12 15 12 Q 8 12 8 21 Q 8 12 1 12 Q 8 12 8 3 Z" />
              <path d="M 18 1 Q 18 7 23 7 Q 18 7 18 13 Q 18 7 13 7 Q 18 7 18 1 Z" />
              <path d="M 16 13 Q 16 17 19.5 17 Q 16 17 16 21 Q 16 17 12.5 17 Q 16 17 16 13 Z" />
            </svg>
            <span style={{ fontWeight: 800, fontSize: "2rem", color: "var(--text-dark)", letterSpacing: "-0.03em" }}>IntelliHire</span>
          </div>

          <h1 className="hero-title">Find Your Jobs</h1>
          <p className="hero-desc">
            Discover top opportunities tailored to your skills. Pick a role below to instantly generate a professional AI CV — then personalise it with the chat.
          </p>

          {/* Platform stats bar */}
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center", margin: "0.25rem 0 1.75rem 0" }}>
            {[
              { value: platformStats ? `${platformStats.total_jobs}+` : "190+", label: "Live Jobs" },
              { value: platformStats ? `${platformStats.total_companies}+` : "40+", label: "Companies" },
              { value: platformStats ? `${platformStats.skills_in_taxonomy}+` : "450+", label: "Skills Trained" },
              { value: platformStats ? `${platformStats.roles_in_knowledge_base}` : "18", label: "Career Guides" },
            ].map((stat) => (
              <div key={stat.label} style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                background: "#ffffff", border: "1px solid var(--border-color)", borderRadius: "14px",
                padding: "0.7rem 1.4rem", minWidth: "110px",
                boxShadow: "0 2px 10px rgba(15, 23, 42, 0.04)",
              }}>
                <span style={{ fontWeight: 800, fontSize: "1.25rem", color: "var(--accent-blue)", letterSpacing: "-0.02em" }}>{stat.value}</span>
                <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{stat.label}</span>
              </div>
            ))}
          </div>

          {/* Suggested roles — collapsed behind a dropdown, shown on click */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
            <button
              type="button"
              onClick={() => setShowRoleDropdown(v => !v)}
              style={{
                display: "flex", alignItems: "center", gap: "0.45rem",
                background: "#ffffff", border: "1px solid var(--border-color)", borderRadius: "50px",
                padding: "0.5rem 1.2rem", fontSize: "0.85rem", fontWeight: 600,
                color: "var(--text-gray)", cursor: "pointer", transition: "var(--transition)",
              }}
            >
              Suggested Roles
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: "0.85rem", height: "0.85rem", strokeWidth: 2.5, transform: showRoleDropdown ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showRoleDropdown && (
              <div className="pill-list" style={{ maxHeight: "none" }}>
                {categories.map((pill) => (
                  <span
                    key={pill}
                    className={`pill-tag ${activePill === pill ? "active" : ""}`}
                    onClick={() => { setShowRoleDropdown(false); handlePillClick(pill); }}
                  >
                    {pill}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Hidden file upload — single instance */}
          <input type="file" ref={fileInputRef} style={{ display: "none" }} accept=".txt,.pdf,.docx" onChange={handleFileChange} />

          {/* Bottom chat bar */}
          <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50 }}>
            <div className="bottom-chat-container">
              {/* Floating conversation panel — starts with the first question */}
              <div style={{
                background: "#ffffff", border: "1px solid var(--border-color)", borderRadius: "18px",
                boxShadow: "0 12px 40px rgba(15, 23, 42, 0.12)", marginBottom: "0.75rem",
                maxHeight: "46vh", display: "flex", flexDirection: "column", overflow: "hidden",
              }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.65rem 1rem",
                  borderBottom: "1px solid var(--border-color)", background: "#f8fafc",
                }}>
                  <div style={{ width: "22px", height: "22px", background: "linear-gradient(135deg, #2563eb, #3b82f6)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg viewBox="0 0 24 24" fill="white" style={{ width: "0.7rem", height: "0.7rem" }}>
                      <path d="M12 2L14.3 7.7L20 10L14.3 12.3L12 18L9.7 12.3L4 10L9.7 7.7L12 2Z" />
                    </svg>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: "0.78rem", color: "var(--text-dark)" }}>IntelliHire AI Assistant</span>
                  <span style={{ marginLeft: "auto", fontSize: "0.65rem", fontWeight: 700, color: "#16a34a", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
                    Online
                  </span>
                </div>
                <div style={{ flex: 1, overflowY: "auto", padding: "0.9rem 1rem", display: "flex", flexDirection: "column", gap: "0.7rem" }}>
                  {renderChatHistoryBlock()}
                  {currentMessages.map((msg) => (
                    <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: msg.sender === "user" ? "flex-end" : "flex-start", gap: "0.35rem" }}>
                      <div style={{
                        maxWidth: "85%", padding: "0.6rem 0.85rem",
                        borderRadius: msg.sender === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                        background: msg.sender === "user" ? "var(--accent-blue)" : "#f8fafc",
                        color: msg.sender === "user" ? "#ffffff" : "var(--text-dark)",
                        border: msg.sender === "user" ? "none" : "1px solid var(--border-color)",
                        fontSize: "0.78rem", lineHeight: 1.55, textAlign: "left",
                      }}>
                        {msg.text.split("\n").map((line, lIdx) => (
                          <p key={lIdx} style={{ margin: 0, marginBottom: lIdx < msg.text.split("\n").length - 1 ? "0.4rem" : 0 }}>
                            {line.split("**").map((part, i) => i % 2 === 1 ? <strong key={i} style={{ fontWeight: 700 }}>{part}</strong> : part)}
                          </p>
                        ))}
                      </div>
                      {msg.sender === "ai" && msg === lastMessage && renderMessageExtras(msg)}
                    </div>
                  ))}
                  {isOptimizing && (
                    <div style={{ display: "flex" }}>
                      <div style={{ background: "#f8fafc", border: "1px solid var(--border-color)", borderRadius: "14px 14px 14px 4px", padding: "0.55rem 0.8rem", display: "flex", gap: "4px", alignItems: "center" }}>
                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#3b82f6", animation: "bounce 1.2s infinite 0s" }} />
                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#3b82f6", animation: "bounce 1.2s infinite 0.2s" }} />
                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#3b82f6", animation: "bounce 1.2s infinite 0.4s" }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="chat-composer-section">
                <form onSubmit={handleSendChatMessage} className="chat-composer-input-row" style={{ margin: 0 }}>
                  <input
                    type="text"
                    className="chat-input-field"
                    placeholder="Type your answer..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                  />
                  <div className="chat-composer-actions">
                    <button type="button" className={`chat-audio-btn ${isListening ? "listening" : ""}`} onClick={handleSpeechToText} title={isListening ? "Listening... Click to stop" : "Speak to write..."}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: "1.2rem", height: "1.2rem" }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    </button>
                    <button type="button" className="chat-upload-btn-premium" onClick={() => setShowUploadModal(true)} title="Upload existing CV">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: "1.1rem", height: "1.1rem" }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      <span style={{ fontSize: "0.75rem", fontWeight: "700", whiteSpace: "nowrap" }}>Upload CV</span>
                    </button>
                    <button type="submit" className="chat-send-btn-round" title="Send message">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ACTIVE STATE: two-column layout after pill click ── */}
      {!isInitialState && (
        <div style={{ display: "flex", minHeight: "100vh", maxHeight: "100vh", overflow: "hidden" }}>

          {/* ── LEFT COLUMN: Full-height CV ── */}
          <div style={{
            width: "55%",
            height: "100vh",
            overflowY: "auto",
            borderRight: "1px solid var(--border-color)",
            backgroundColor: "#ffffff",
            padding: "2rem 2.5rem",
          }}>
            {/* Thin brand bar at top of CV column */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem", paddingBottom: "0.75rem", borderBottom: "1px solid var(--border-color)" }}>
              <svg viewBox="0 0 24 24" fill="var(--accent-blue)" style={{ width: "1.4rem", height: "1.4rem" }}>
                <path d="M 8 3 Q 8 12 15 12 Q 8 12 8 21 Q 8 12 1 12 Q 8 12 8 3 Z" />
                <path d="M 18 1 Q 18 7 23 7 Q 18 7 18 13 Q 18 7 13 7 Q 18 7 18 1 Z" />
                <path d="M 16 13 Q 16 17 19.5 17 Q 16 17 16 21 Q 16 17 12.5 17 Q 16 17 16 13 Z" />
              </svg>
              <span style={{ fontWeight: 800, fontSize: "1.1rem", color: "var(--text-dark)" }}>IntelliHire Workspace</span>
            </div>

            {/* Upload success banner */}
            {uploadedFileName && !isOptimizing && uploadStep !== 'error' && (
              <div className="upload-success-banner">
                <div className="upload-success-banner-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: '0.85rem', height: '0.85rem', strokeWidth: 3 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="upload-success-banner-text">
                  📎 <strong>{uploadedFileName}</strong> — Parsed & Optimized by AI ✓
                </span>
                <button className="upload-success-banner-remove" title="Remove uploaded CV" onClick={() => {
                  setUploadedFileName(''); setUploadStep('idle'); setHasUploadedCV(false);
                  setIsAnalyzed(false); setParsedCV(null); setCustomOptimizationResult(null);
                  setCustomRecommendations([]); setCvText(''); setActivePill(''); setSearchQuery('');
                }}>✕</button>
              </div>
            )}

            {/* Error banner */}
            {error && (
              <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.875rem' }}>
                <strong>Error:</strong> {error}
              </div>
            )}

            {/* Upload progress steps */}
            {isOptimizing && uploadStep !== 'idle' && (
              <div className="upload-progress-container">
                <p style={{ fontWeight: '700', color: 'var(--text-dark)', fontSize: '1rem' }}>
                  {uploadStep === 'parsing' && '🔍 Parsing your CV...'}
                  {uploadStep === 'optimizing' && '✨ AI is optimizing for ATS...'}
                  {uploadStep === 'recommending' && '🎯 Finding matching jobs...'}
                </p>
                <div className="upload-progress-steps">
                  <div className={`upload-step ${uploadStep === 'parsing' ? 'active' : ['optimizing','recommending','done'].includes(uploadStep) ? 'done' : ''}`}>
                    <div className="step-dot" />
                    <span>Parsing CV</span>
                  </div>
                  <div className="step-line" />
                  <div className={`upload-step ${uploadStep === 'optimizing' ? 'active' : ['recommending','done'].includes(uploadStep) ? 'done' : ''}`}>
                    <div className="step-dot" />
                    <span>AI Optimizing</span>
                  </div>
                  <div className="step-line" />
                  <div className={`upload-step ${uploadStep === 'recommending' ? 'active' : uploadStep === 'done' ? 'done' : ''}`}>
                    <div className="step-dot" />
                    <span>Finding Jobs</span>
                  </div>
                </div>
              </div>
            )}

            {/* Generic spinner for pill-click / chat CV generation */}
            {isOptimizing && uploadStep === 'idle' && (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ width: '36px', height: '36px', border: '3px solid rgba(37,99,235,0.1)', borderLeftColor: 'var(--accent-blue)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto' }} />
                <p style={{ fontWeight: '600', color: 'var(--text-dark)' }}>Generating your AI CV...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            )}

            {/* ATS Score strip */}
            {!isOptimizing && isAnalyzed && customOptimizationResult && (
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1, background: '#f1f5f9', borderRadius: '10px', padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Original ATS</span>
                  <span style={{ marginLeft: 'auto', fontWeight: 800, fontSize: '1.1rem', color: '#64748b' }}>{customOptimizationResult.original_score ?? '–'}%</span>
                </div>
                <div style={{ flex: 1, background: '#dbeafe', borderRadius: '10px', padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', fontWeight: 600 }}>AI Optimised ATS</span>
                  <span style={{ marginLeft: 'auto', fontWeight: 800, fontSize: '1.1rem', color: 'var(--accent-blue)' }}>{customOptimizationResult.optimized_score ?? 96}%</span>
                </div>
                <button onClick={handleDownloadPdf} title="Download CV as PDF"
                  style={{ padding: '0.6rem 1rem', background: 'var(--accent-blue)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <DownloadIcon /> PDF
                </button>
              </div>
            )}

            {/* CV Tab Switcher — only when uploaded file has parsedCV */}
            {!isOptimizing && isAnalyzed && customOptimizationResult && parsedCV && (
              <div className="cv-tab-switcher">
                <button className={`cv-tab-btn ${cvViewTab === 'original' ? 'active' : ''}`} onClick={() => setCvViewTab('original')}>
                  📄 Original CV
                </button>
                <button className={`cv-tab-btn ${cvViewTab === 'optimized' ? 'active' : ''}`} onClick={() => setCvViewTab('optimized')}>
                  ✨ AI Optimized
                </button>
              </div>
            )}

            {/* CV content */}
            {!isOptimizing && hasUploadedCV && (
              <div id="cv-workspace" ref={optimizedCardRef} className="resume-card optimized" style={{ boxShadow: 'none', border: 'none', borderRadius: '0', height: 'auto', maxHeight: 'none', overflow: 'visible', padding: '0' }}>
                {isAnalyzed && customOptimizationResult ? (
                  <>
                    {/* Original CV tab */}
                    {cvViewTab === 'original' && parsedCV ? (
                      <div className="resume-body" style={{ fontSize: '0.81rem', color: '#1e293b', fontFamily: 'var(--font-sans)', lineHeight: '1.45' }}>
                        <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
                          <h2 className="resume-name" style={{ fontSize: '1.4rem', color: '#0f172a', textTransform: 'uppercase', fontWeight: '800', marginBottom: '0.15rem' }}>
                            {parsedCV.name || 'YOUR NAME'}
                          </h2>
                          {parsedCV.contact && <div style={{ fontSize: '0.76rem', color: '#475569' }}>{parsedCV.contact}</div>}
                        </div>
                        {parsedCV.summary && (<><div className="resume-section-header"><span>Professional Summary</span></div><p className="resume-text" style={{ textAlign: 'justify' }}>{parsedCV.summary}</p></>)}
                        {parsedCV.skills && parsedCV.skills.length > 0 && (<><div className="resume-section-header"><span>Technical Skills</span></div><p className="resume-text">{Array.isArray(parsedCV.skills) ? parsedCV.skills.join(' • ') : parsedCV.skills}</p></>)}
                        {parsedCV.experience && parsedCV.experience.length > 0 && (<><div className="resume-section-header"><span>Work Experience</span></div><ul className="resume-list">{parsedCV.experience.map((l, i) => <li key={i}>{l}</li>)}</ul></>)}
                        {parsedCV.education && parsedCV.education.length > 0 && (<><div className="resume-section-header"><span>Education</span></div><ul className="resume-list" style={{ listStyleType: 'none', paddingLeft: 0 }}>{parsedCV.education.map((l, i) => <li key={i}>{l}</li>)}</ul></>)}
                        {!parsedCV.summary && !parsedCV.experience?.length && (
                          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                            <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>⚠️ Limited text extracted</p>
                            <p style={{ fontSize: '0.82rem' }}>Your PDF may be image-based or scanned. Try uploading a text-based PDF or DOCX.</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      renderCVContent(cvDraftData, true)
                    )}
                  </>
                ) : (
                  <div className="analyzer-prompt-container">
                    <CpuIcon />
                    <h3 className="analyzer-prompt-title">AI Analyzer Ready</h3>
                    <p className="analyzer-prompt-desc">Click below to optimize your CV sections for maximum ATS match.</p>
                    <button className="analyzer-btn" onClick={handleRunAIAnalysis}>
                      <SparklesIcon style={{ width: '1.1rem', height: '1.1rem' }} />
                      AI Analyzer
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Single hidden file input */}
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".txt,.pdf,.docx" onChange={handleFileChange} />

          </div>

          {/* ── RIGHT COLUMN: Search/Pills (top) + Claude-style AI Chat Panel (bottom) ── */}
          <div style={{
            width: '45%',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#ffffff',
            borderLeft: '1px solid var(--border-color)',
            position: 'sticky',
            top: 0,
            overflow: 'hidden',
          }}>

            {/* ── TOP SECTION: Search + Suggested Role Pills ── */}
            <div style={{
              flexShrink: 0,
              padding: '0.85rem 1.5rem',
              backgroundColor: '#ffffff',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: '0.6rem'
            }}>
              {/* Search bar */}
              <div className="search-bar-container" ref={dropdownRef} style={{
                width: '100%',
                borderRadius: '50px',
                padding: '0 4px 0 1.1rem',
                border: '1.5px solid #cbd5e1',
                boxShadow: 'none',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#ffffff',
                transition: 'border-color 0.2s'
              }}
              onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--accent-blue)'}
              onBlurCapture={e => e.currentTarget.style.borderColor = '#cbd5e1'}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: '1.1rem', height: '1.1rem', color: 'var(--text-muted)', marginRight: '0.65rem', flexShrink: 0 }}>
                  <circle cx="11" cy="11" r="8" strokeWidth="2.5" />
                  <path d="m21 21-4.3-4.3" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                <input type="text" className="search-input" placeholder="Search roles, skills, or certifications..." value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setShowSearchDropdown(true); }}
                  onFocus={() => setShowSearchDropdown(true)}
                  style={{ border: 'none', outline: 'none', fontSize: '0.85rem', flexGrow: 1, height: '100%', padding: 0, lineHeight: 'normal' }} />
                <button className="search-button" style={{ height: '30px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 700, padding: '0 1.1rem', background: 'var(--accent-blue)', color: '#fff', border: 'none', cursor: 'pointer' }}>Search</button>
                {showSearchDropdown && searchQuery.trim() && (
                  <div className="search-dropdown" style={{ borderRadius: '16px', marginTop: '0.5rem', border: '1px solid var(--border-color)', boxShadow: '0 10px 25px rgba(0,0,0,0.08)', zIndex: 100 }}>
                    {jobs.filter(j => j.title.toLowerCase().includes(searchQuery.toLowerCase()) || j.company.toLowerCase().includes(searchQuery.toLowerCase())).map((job) => (
                      <div key={job.id} className="search-dropdown-item" onClick={() => { setSearchQuery(job.title); setShowSearchDropdown(false); }} style={{ padding: '0.75rem 1rem' }}>
                        <span className="search-dropdown-item-title" style={{ fontWeight: 600 }}>{job.title}</span>
                        <span className="search-dropdown-item-company" style={{ fontSize: '0.75rem' }}>{job.company} • {job.location}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Suggested roles — dropdown, pills shown on click */}
              <button
                type="button"
                onClick={() => setShowRoleDropdown(v => !v)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem', alignSelf: 'flex-start',
                  background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
                  fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}
              >
                Suggested Roles
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: '0.75rem', height: '0.75rem', strokeWidth: 3, transform: showRoleDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Role pills — only when the dropdown is open */}
              {showRoleDropdown && (
                <div className="pill-list" style={{ maxHeight: 'none', overflowX: 'auto', display: 'flex', gap: '0.5rem', flexWrap: 'nowrap', paddingBottom: '0.25rem', scrollbarWidth: 'none' }}>
                  {categories.map((pill) => (
                    <span key={pill} className={`pill-tag ${activePill === pill ? 'active' : ''}`} onClick={() => { setShowRoleDropdown(false); handlePillClick(pill); }} style={{
                      fontSize: '0.75rem',
                      padding: '0.35rem 0.85rem',
                      borderRadius: '50px',
                      whiteSpace: 'nowrap',
                      cursor: 'pointer',
                      border: activePill === pill ? '1.5px solid var(--accent-blue)' : '1px solid var(--border-color)',
                      background: activePill === pill ? 'var(--accent-light)' : '#ffffff',
                      color: activePill === pill ? 'var(--accent-blue)' : 'var(--text-gray)',
                      fontWeight: activePill === pill ? 700 : 500,
                      transition: 'all 0.2s'
                    }}>{pill}</span>
                  ))}
                </div>
              )}
            </div>

            {/* ── BOTTOM SECTION: AI Chat Panel (Claude-style with bluish background & border) ── */}
            <div style={{
              flex: 1,
              backgroundColor: '#ffffff', // pure white background
              borderTop: '1px solid var(--border-color)', // standard border
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}>
              {/* Chat header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.85rem 1.25rem',
                borderBottom: '1px solid var(--border-color)',
                backgroundColor: '#ffffff' // white header background
              }}>
                <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg, #2563eb, #3b82f6)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg viewBox="0 0 24 24" fill="white" style={{ width: '0.9rem', height: '0.9rem' }}>
                    <path d="M12 2L14.3 7.7L20 10L14.3 12.3L12 18L9.7 12.3L4 10L9.7 7.7L12 2Z" />
                    <path d="M19 4L20 6.5L22.5 7.5L20 8.5L19 11L18 8.5L15.5 7.5L18 6.5L19 4Z" />
                    <path d="M6 14L6.8 16L8.8 16.8L6.8 17.6L6 19.6L5.2 17.6L3.2 16.8L5.2 16L6 14Z" />
                  </svg>
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '0.85rem', color: '#1e293b' }}>Intelli Hire AI</p>
                </div>
                <button onClick={() => setShowUploadModal(true)} title="Upload CV"
                  style={{ marginLeft: 'auto', background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '50px', padding: '0.35rem 0.85rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-blue)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: '0.75rem', height: '0.75rem', strokeWidth: 2.5 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload CV
                </button>
              </div>

              {/* Section selector / Quick navigation */}
              <div style={{
                display: 'flex',
                gap: '0.4rem',
                padding: '0.55rem 1.25rem',
                borderBottom: '1px solid var(--border-color)',
                backgroundColor: '#f8fafc',
                overflowX: 'auto',
                scrollbarWidth: 'none',
                alignItems: 'center',
                flexShrink: 0
              }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-gray)', whiteSpace: 'nowrap', marginRight: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Edit Section:</span>
                {['header', 'summary', 'skills', 'experience', 'projects', 'education', 'certifications', 'achievements'].map((sec) => {
                  const isActive = highlightedSection === sec;
                  return (
                    <button
                      key={sec}
                      onClick={() => handleSectionClick(sec)}
                      style={{
                        padding: '0.25rem 0.65rem',
                        borderRadius: '6px',
                        border: isActive ? '1.5px solid var(--accent-blue)' : '1px solid #e2e8f0',
                        background: isActive ? 'var(--accent-light)' : '#ffffff',
                        color: isActive ? 'var(--accent-blue)' : '#475569',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.15s',
                        boxShadow: isActive ? '0 1px 3px rgba(37,99,235,0.06)' : 'none'
                      }}
                    >
                      {sec.toUpperCase()} {isActive ? '●' : ''}
                    </button>
                  );
                })}
              </div>

              {/* Messages area — dimmed collapsible history above the current conversation */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {renderChatHistoryBlock()}
                {currentMessages.map((msg) => (
                  <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start', gap: '0.4rem' }}>
                    <div style={{
                      maxWidth: '82%',
                      padding: '0.75rem 1rem',
                      borderRadius: msg.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      background: msg.sender === 'user' ? '#2563eb' : '#f8fafc',
                      color: msg.sender === 'user' ? '#ffffff' : '#1e293b',
                      border: msg.sender === 'user' ? 'none' : '1px solid #e2e8f0',
                      fontSize: '0.8rem',
                      lineHeight: '1.5',
                      fontWeight: msg.sender === 'user' ? 500 : 400,
                      boxShadow: msg.sender === 'user' ? '0 4px 12px rgba(37,99,235,0.15)' : 'none',
                    }}>
                      {msg.text.split('\n').map((line, lIdx) => (
                        <p key={lIdx} style={{ margin: 0, marginBottom: lIdx < msg.text.split('\n').length - 1 ? '0.5rem' : 0 }}>
                          {line.split('**').map((part, i) => i % 2 === 1 ? <strong key={i} style={{ fontWeight: 700 }}>{part}</strong> : part)}
                        </p>
                      ))}
                    </div>
                    {msg.sender === 'ai' && msg === lastMessage && renderMessageExtras(msg)}
                  </div>
                ))}
                {isOptimizing && uploadStep === 'idle' && (
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', paddingLeft: '0.5rem' }}>
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px 16px 16px 4px', padding: '0.6rem 0.85rem', display: 'flex', gap: '5px', alignItems: 'center' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6', animation: 'bounce 1.2s infinite 0s' }} />
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6', animation: 'bounce 1.2s infinite 0.2s' }} />
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6', animation: 'bounce 1.2s infinite 0.4s' }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Chat input styled like Claude (floating white panel inside input container) */}
              <div style={{ padding: '1rem 1.25rem 1.25rem 1.25rem', backgroundColor: 'transparent', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {/* Dynamic Skills Recommendations Tag Chips */}
                {highlightedSection === 'skills' && cvDraftData && (
                  <div style={{
                    padding: '0.65rem 0.85rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.01)'
                  }}>
                    <p style={{ margin: 0, fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-gray)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" style={{ width: '0.8rem', height: '0.8rem', strokeWidth: 2.5 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a1.5 1.5 0 002.122 0l4.72-4.72a1.5 1.5 0 000-2.122L11.16 3.659A1.5 1.5 0 0010.165 3z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                      </svg>
                      Toggle Recommended Skills for {cvDraftData.position || 'Developer'}:
                    </p>
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', maxHeight: '95px', overflowY: 'auto', paddingBottom: '0.15rem' }}>
                      {getRecommendedSkills(cvDraftData.position || '').map((skill) => {
                        const present = isSkillPresent(skill);
                        return (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => toggleRecommendedSkill(skill)}
                            style={{
                              padding: '0.25rem 0.55rem',
                              borderRadius: '50px',
                              border: present ? '1.25px solid #2563eb' : '1.25px solid #e2e8f0',
                              backgroundColor: present ? '#eff6ff' : '#f8fafc',
                              color: present ? '#2563eb' : '#475569',
                              fontSize: '0.68rem',
                              fontWeight: 650,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.2rem',
                              transition: 'all 0.15s',
                              boxShadow: present ? '0 1px 3px rgba(37,99,235,0.08)' : 'none'
                            }}
                          >
                            {present ? '✓ ' : '+ '}
                            {skill}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <form onSubmit={handleSendChatMessage} style={{
                  background: '#ffffff',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '16px',
                  padding: '0.6rem 0.85rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                  boxShadow: '0 4px 14px rgba(37,99,235,0.03)',
                  transition: 'border-color 0.2s'
                }}
                onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--accent-blue)'}
                onBlurCapture={e => e.currentTarget.style.borderColor = '#cbd5e1'}
                >
                  <textarea
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendChatMessage(e);
                      }
                    }}
                    placeholder="Type your answer or ask AI to change any section..."
                    rows={1}
                    style={{
                      border: 'none',
                      outline: 'none',
                      width: '100%',
                      resize: 'none',
                      fontSize: '0.85rem',
                      color: '#1e293b',
                      fontFamily: 'inherit',
                      lineHeight: '1.4'
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '0.4rem' }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      Try: "change name to John" · "change email..."
                    </span>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <button type="button" onClick={handleSpeechToText} title={isListening ? 'Stop listening' : 'Speak'}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          border: 'none',
                          background: isListening ? '#fee2e2' : '#f1f5f9',
                          color: isListening ? '#ef4444' : '#64748b',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s'
                        }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: '0.9rem', height: '0.9rem', strokeWidth: 2.2 }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                      </button>
                      <button type="submit" title="Send"
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          border: 'none',
                          background: 'var(--accent-blue)',
                          color: '#fff',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 6px rgba(37,99,235,0.2)',
                          transition: 'all 0.2s'
                        }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: '0.9rem', height: '0.9rem', strokeWidth: 2.5 }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Upload CV Modal */}
      {showUploadModal && (
        <div className="paste-modal-overlay" onClick={() => { setShowUploadModal(false); setSelectedFile(null); setIsDragOver(false); }}>
          <div className="upload-modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-title-row">
              <h3 style={{ margin: 0, fontWeight: '800', color: 'var(--text-dark)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: '1.25rem', height: '1.25rem', color: 'var(--accent-blue)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload Your CV
              </h3>
              <button className="modal-close-btn" onClick={() => { setShowUploadModal(false); setSelectedFile(null); }}>×</button>
            </div>

            {/* Drop zone — shown when no file selected */}
            {!selectedFile && (
              <div
                className={`upload-dropzone ${isDragOver ? 'drag-over' : ''}`}
                onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={e => { e.preventDefault(); setIsDragOver(false); const f = e.dataTransfer.files[0]; if (f) setSelectedFile(f); }}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="upload-dropzone-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: '1.75rem', height: '1.75rem' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="upload-dropzone-title">Drag & drop your CV here</p>
                <p className="upload-dropzone-sub">or click to browse your files</p>
                <div className="upload-format-badges">
                  <span className="upload-format-badge">PDF</span>
                  <span className="upload-format-badge">DOCX</span>
                  <span className="upload-format-badge">TXT</span>
                </div>
              </div>
            )}

            {/* File chip — shown after file selected */}
            {selectedFile && (
              <div className="upload-file-chip">
                <div className="upload-file-chip-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: '1rem', height: '1rem', strokeWidth: 2.5 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="upload-file-chip-name">{selectedFile.name}</span>
                <span className="upload-file-chip-size">{(selectedFile.size / 1024).toFixed(0)} KB</span>
                <button className="upload-file-chip-remove" onClick={() => setSelectedFile(null)}>✕</button>
              </div>
            )}

            <button
              className="upload-action-btn"
              disabled={!selectedFile}
              onClick={() => handleUploadAndAnalyze(selectedFile)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: '1rem', height: '1rem', strokeWidth: 2.5 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              {selectedFile ? 'Upload & Analyze CV' : 'Select a file first'}
            </button>
            <button className="upload-cancel-btn" onClick={() => { setShowUploadModal(false); setSelectedFile(null); }}>Cancel</button>

            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.75rem' }}>
              🔒 Your CV is processed locally and never stored permanently.
            </p>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="paste-modal-overlay" onClick={() => setShowSettingsModal(false)}>
          <div className="paste-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px" }}>
            <div className="modal-title-row">
              <h3 style={{ margin: 0, fontWeight: "800", color: "var(--text-dark)", fontSize: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: "1.25rem", height: "1.25rem", color: "var(--accent-blue)" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                About IntelliHire
              </h3>
              <button className="modal-close-btn" onClick={() => setShowSettingsModal(false)}>&times;</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.875rem", color: "#334155", lineHeight: "1.5" }}>
              <div><strong>IntelliHire</strong> is a professional AI Job Portal &amp; CV Optimizer application designed to parse your resume, match it against job opportunities, and optimize key sections to achieve high ATS scores.</div>
              <div style={{ backgroundColor: "#f8fafc", padding: "1rem", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                <strong style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-dark)" }}>Tech Stack Used:</strong>
                <ul style={{ listStyleType: "disc", paddingLeft: "1.25rem", margin: 0, display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  <li><strong>Frontend:</strong> Next.js 15, React 19, Vanilla CSS</li>
                  <li><strong>Backend:</strong> Django, Django REST Framework</li>
                  <li><strong>Database:</strong> SQLite</li>
                  <li><strong>AI Engine:</strong> Gemini AI API Integration</li>
                </ul>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.5rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border-color)" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Version 1.0.0</span>
                <span style={{ fontWeight: "700", color: "var(--accent-blue)", fontSize: "0.85rem" }}>Created by Vighnesh</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
