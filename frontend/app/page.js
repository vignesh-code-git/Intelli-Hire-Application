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

const EditPencilIcon = ({ className = "", style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={{ width: "0.82rem", height: "0.82rem", ...style }}>
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="m15 5 4 4" />
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
  const [headerQuestionIdx, setHeaderQuestionIdx] = useState(null); // legacy step-by-step header flow (replaced by the header form card)

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
      case 0: return "Enter your full name";
      case 1: return "What role are you targeting?";
      case 2: return "Add your key skills";
      case 3: return "Enter your email address";
      case 4: return "Enter your phone number";
      case 5: return "Where are you based?";
      case 6: return "Add your professional links";
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
      border: isHighlighted ? '1px solid rgba(37, 99, 235, 0.25)' : '1px solid transparent',
      borderLeft: isHighlighted ? '4px solid var(--accent-blue)' : '4px solid transparent',
      borderRadius: '12px',
      padding: isHighlighted ? '0.85rem 0.85rem 0.85rem 1rem' : '0.25rem 0.25rem 0.25rem 0.55rem',
      background: isHighlighted
        ? 'linear-gradient(90deg, rgba(37, 99, 235, 0.06) 0%, rgba(37, 99, 235, 0.02) 60%, transparent 100%)'
        : 'transparent',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: isHighlighted ? '0 10px 30px rgba(37, 99, 235, 0.10)' : 'none',
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
        top: '-10px',
        right: '14px',
        background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
        color: '#ffffff',
        fontSize: '0.62rem',
        fontWeight: 800,
        padding: '0.22rem 0.7rem',
        borderRadius: '50px',
        textTransform: 'uppercase',
        letterSpacing: '0.07em',
        boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
        zIndex: 10,
        pointerEvents: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.32rem',
      }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ffffff', display: 'inline-block', animation: 'pulse 1.6s ease-in-out infinite' }} />
        Editing
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
  const [chatMessages, setChatMessages] = useState([]);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [platformStats, setPlatformStats] = useState(null);
  const [chatInput, setChatInput] = useState("");
  const [isChatCollapsed, setIsChatCollapsed] = useState(true);
  const [chatTab, setChatTab] = useState('assistant'); // 'assistant' | 'jobs'
  const chatEndRef = useRef(null);

  // Keep the newest message (or typing indicator) in view
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [chatMessages, isOptimizing]);
  const [chatStep, setChatStep] = useState(0); // 0: Init, 1: Name/Position request, 2: Contacts/Location request, 3: Projects/Education request, 4: Free edit mode
  const [cvDraftData, setCvDraftData] = useState({
    name: "", position: "", phone: "", email: "", location: "",
    portfolio: "", linkedin: "", github: "",
    summary: "", skills: {}, experience: [], projects: [],
    education: "", certifications: [], achievements: [],
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
  // Guided work-experience flow — asks company → title → duration, then a role-based bullet picker.
  const [expFlow, setExpFlow] = useState(null); // { stage: 'company'|'title'|'duration'|'bullets', draft, pool, chosen }

  const pushAiMessage = (msg) =>
    setChatMessages(prev => [...prev, { id: Date.now() + Math.random(), sender: 'ai', ...msg }]);

  const NEXT_ORDER = ['header', 'summary', 'skills', 'experience', 'projects', 'education', 'certifications', 'achievements'];

  // ── Guided CV builder (suggestion-first, no free typing required) ──
  const guidedRef = useRef(false); // true while the step-by-step build flow is active

  const emptyCv = (position) => ({
    name: "", position: position || "", phone: "", email: "", location: "",
    portfolio: "", linkedin: "", github: "", headerSkills: [],
    summary: "", skills: {}, experience: [], projects: [],
    education: "", certifications: [], achievements: [],
  });

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const YEARS = Array.from({ length: 14 }, (_, i) => String(2026 - i));

  // Master chip pool per skills category — merged with the role-recommended set
  const SKILL_SUGGESTION_POOL = {
    frontend: ["React.js", "Next.js", "TypeScript", "JavaScript (ES6+)", "HTML5", "CSS3", "Tailwind CSS", "Redux Toolkit", "Vue.js", "Angular", "Bootstrap 5", "Material UI", "Vite"],
    backend: ["Python", "Django", "FastAPI", "Node.js", "Express.js", "REST APIs", "GraphQL", "JWT Authentication", "Spring Boot", "Microservices"],
    database: ["PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "Supabase", "Firebase", "Django ORM"],
    tools: ["Git", "GitHub", "Docker", "AWS", "Vercel", "Render", "Postman", "VS Code", "GitHub Actions", "Linux", "Figma", "Jira"],
    concepts: ["Agile/Scrum", "CI/CD", "OOP", "System Design", "Data Structures & Algorithms", "Unit Testing", "Responsive Design", "State Management"],
    ai: ["LLM Integration", "Prompt Engineering", "Hugging Face Transformers", "scikit-learn", "TensorFlow", "PyTorch", "LangChain", "RAG"],
  };

  // Which skill categories make sense for each role — e.g. a Frontend Developer
  // shouldn't be offered a heavy Backend section (and vice versa)
  const ROLE_SKILL_CATEGORIES = {
    frontend: ['frontend', 'database', 'tools', 'concepts', 'ai'],
    backend: ['backend', 'database', 'tools', 'concepts', 'ai'],
    fullstack: ['frontend', 'backend', 'database', 'tools', 'concepts', 'ai'],
    data: ['backend', 'database', 'tools', 'concepts', 'ai'],
    devops: ['backend', 'database', 'tools', 'concepts', 'ai'],
    mobile: ['frontend', 'backend', 'database', 'tools', 'concepts'],
    design: ['frontend', 'tools', 'concepts'],
    qa: ['frontend', 'backend', 'tools', 'concepts'],
  };

  // Category whose skills appear in the CV header strip, per role
  const ROLE_PRIMARY_SKILL_CAT = {
    frontend: 'frontend', backend: 'backend', fullstack: 'frontend', data: 'backend',
    devops: 'tools', mobile: 'frontend', design: 'frontend', qa: 'tools',
  };

  const roleSkillCategories = () => {
    const role = getRoleType(cvDraftData?.position || '');
    return ROLE_SKILL_CATEGORIES[role] || Object.keys(SKILL_SUGGESTION_POOL);
  };

  // Pool of headline-skill chips for the header form — the skills that define
  // the role (frontend dev → frontend skills, devops → tools, ...)
  const headerSkillPool = () => {
    const role = getRoleType(cvDraftData?.position || '');
    const cat = ROLE_PRIMARY_SKILL_CAT[role] || 'frontend';
    const bank = ((SKILLSET_BANK[role] || SKILLSET_BANK.fullstack || {})[cat] || '');
    const bankItems = bank.split(',').map(s => s.trim()).filter(Boolean);
    return [...new Set([...bankItems, ...(SKILL_SUGGESTION_POOL[cat] || [])])].slice(0, 14);
  };

  const HEADER_SKILL_LIMIT = 6;
  const toggleHeaderSkill = (skill) => {
    setCvDraftData(prev => {
      const cur = Array.isArray(prev.headerSkills) ? [...prev.headerSkills] : [];
      const i = cur.findIndex(s => s.toLowerCase() === skill.toLowerCase());
      if (i >= 0) cur.splice(i, 1);
      else if (cur.length < HEADER_SKILL_LIMIT) cur.push(skill);
      return { ...prev, headerSkills: cur };
    });
  };

  const cvSkillHas = (cat, skill) => {
    const cur = (cvDraftData?.skills?.[cat] || '');
    return cur.toLowerCase().split(',').map(s => s.trim()).includes(skill.toLowerCase());
  };

  const toggleCvSkill = (cat, skill) => {
    setCvDraftData(prev => {
      const skills = { ...(prev.skills || {}) };
      const items = (skills[cat] || '').split(',').map(s => s.trim()).filter(s => s && s !== '—');
      const i = items.findIndex(s => s.toLowerCase() === skill.toLowerCase());
      if (i >= 0) items.splice(i, 1); else items.push(skill);
      skills[cat] = items.join(', ');
      return { ...prev, skills };
    });
  };

  const saveHeaderForm = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const get = (k) => (fd.get(k) || '').toString().trim();
    setCvDraftData(prev => ({
      ...prev,
      name: get('name') || prev.name,
      position: get('position') || prev.position,
      phone: get('phone') || prev.phone,
      email: get('email') || prev.email,
      location: get('location') || prev.location,
      portfolio: get('portfolio') || prev.portfolio,
      linkedin: get('linkedin') || prev.linkedin,
      github: get('github') || prev.github,
    }));
    handleSectionProgress('name');
    advanceGuided('header');
  };

  const saveExperienceForm = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const get = (k) => (fd.get(k) || '').toString().trim();
    const present = fd.get('present') === 'on';
    const duration = `${get('fromMonth')} ${get('fromYear')} – ${present ? 'Present' : `${get('toMonth')} ${get('toYear')}`}`;
    const picked = fd.getAll('bullets').map(String);
    const own = get('ownBullets').split('\n').map(l => l.trim()).filter(Boolean).map(polishLine);
    const bullets = [...picked, ...own];
    const entry = {
      position: get('position') || cvDraftData?.position || 'Position',
      company: get('company') || 'Company',
      place: get('place') || '',
      duration,
      bullets: bullets.length ? bullets : ['Contributed to the development and delivery of production applications.'],
    };
    setCvDraftData(prev => ({ ...prev, experience: [entry] }));
    handleSectionProgress('experience');
    advanceGuided('experience');
  };

  // Advance the guided flow to the next section; finish with the completion message.
  const advanceGuided = (fromSection) => {
    setSectionEditFlow(null);
    const idx = NEXT_ORDER.indexOf(fromSection);
    const next = NEXT_ORDER[idx + 1];
    if (guidedRef.current && next) {
      openSectionEditor(next, fromSection);
      return;
    }
    if (guidedRef.current && !next) {
      guidedRef.current = false;
      setHighlightedSection(null);
      pushAiMessage({
        text: "🎉 **Your CV is completed!** It's ready on the left.\n\n" +
          "Want to refine anything? **Click any section on the CV** (or use the Edit Section bar) — pick new suggestions, or type your own content and I'll polish it into professional wording. ",
        options: [
          { label: '⬇️ Download PDF', action: 'download' },
          { label: '👁️ View CV', action: 'view' },
        ],
      });
      return;
    }
    // Section edited outside the guided flow — confirm briefly, stay put
    if (fromSection) {
      pushAiMessage({ text: `✅ **${SECTION_LABELS[fromSection]} updated** — it's live on your CV. Click any other section to keep refining.` });
    }
    setHighlightedSection(null);
  };

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

  const openSectionEditor = async (section, savedFrom = null) => {
    setHighlightedSection(section);
    setHeaderQuestionIdx(null);
    setExpFlow(null);
    // Interactive transition: confirm what was saved, introduce what comes next
    const savedNote = savedFrom ? `✅ **${SECTION_LABELS[savedFrom]} added** — it's live on your CV.\n\n` : '';
    const intro = `${savedNote}**${SECTION_LABELS[section]}**`;

    if (section === 'header') {
      setSectionEditFlow(null);
      setHeaderQuestionIdx(0);
      pushAiMessage({ text: `${savedNote}**Enter your full name**`, hint: 'e.g. Ravi Kumar' });
      return;
    }

    if (section === 'skills') {
      setSectionEditFlow(null);
      // Pre-select the recommended set for the role when skills are still empty
      setCvDraftData(prev => {
        const hasAny = prev?.skills && Object.values(prev.skills).some(v => v && v !== '—');
        if (hasAny) return prev;
        const role = getRoleType(prev?.position || '');
        const rec = SKILLSET_BANK[role] || SKILLSET_BANK.fullstack || Object.values(SKILLSET_BANK)[0];
        // Pre-select only the categories that make sense for this role
        const allowed = ROLE_SKILL_CATEGORIES[role] || Object.keys(rec);
        const filtered = {};
        allowed.forEach(c => { if (rec[c]) filtered[c] = rec[c]; });
        return { ...prev, skills: filtered };
      });
      pushAiMessage({
        text: `${intro} — tap chips to add or remove. The recommended set for your role is pre-selected:`,
        skillsPicker: true,
        options: [{ label: '✓ Done — next section', action: 'section-done', section: 'skills' }],
      });
      return;
    }

    if (section === 'experience') {
      // Guided, one-by-one flow: company → title → duration → role-based bullets
      setSectionEditFlow(null);
      setExpFlow({ stage: 'company', draft: {}, pool: [], chosen: [] });
      pushAiMessage({
        text: `${savedNote}**Which company did you work for?**`,
        hint: 'e.g. TCS, Infosys, or a startup name',
        options: [{ label: 'Skip experience', action: 'skip', section: 'experience' }],
      });
      return;
    }

    // Text sections — ask for the user's own details first, then polish into options
    setSectionEditFlow({ section, stage: 'await-own' });
    pushAiMessage({
      text: `${intro} — ${SECTION_QUESTIONS[section] || `tell me about your ${SECTION_LABELS[section].toLowerCase()} and I'll polish it.`}`,
      options: [
        { label: '✨ Suggest content for me', action: 'ai-suggest', section },
        { label: 'Skip for now', action: 'skip', section },
      ],
    });
  };

  // ── AI polish helpers ──────────────────────────────────────────
  const polishLine = (line) => {
    let t = line.trim().replace(/^[-•*]\s*/, '');
    if (!t) return t;
    t = t.charAt(0).toUpperCase() + t.slice(1);
    t = t.replace(/\bi\b/g, 'I'); // standalone "i" → "I"
    t = t.replace(/\s+/g, ' ');
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
    const roleKey = getRoleType(cvDraftData?.position || '');
    let cache = altCacheRef.current[section];
    // Rebuild the cache when the target role changed so alternatives always match the job role
    if (!cache || cache.role !== roleKey || cache.cards.length === 0) {
      let cards = await buildSectionSuggestions(section);
      // Blend in polished variants of the user's own content so alternatives
      // stay personal, not just generic role templates
      if (section === 'summary' && cvDraftData?.summary) {
        try {
          const own = buildPolishedCards('summary', cvDraftData.summary)
            .map(c => ({ ...c, title: `From your content — ${c.title}` }));
          cards = [...own, ...cards];
        } catch (err) { /* fall back to role suggestions only */ }
      }
      if (!cards || cards.length === 0) return;
      cache = { cards, idx: -1, role: roleKey };
      altCacheRef.current[section] = cache;
    }
    cache.idx = (cache.idx + 1) % cache.cards.length;
    applyPayload(section, cache.cards[cache.idx].payload);
    setHighlightedSection(section);
    pushAiMessage({
      text: `✨ Applied **${SECTION_LABELS[section]}** alternative ${cache.idx + 1} of ${cache.cards.length}, tailored to **${cvDraftData?.position || 'your role'}**. Click the icon again for another — or click the section to edit the text yourself.`,
    });
  };

  const applySectionSuggestion = (section, payload) => {
    applyPayload(section, payload);
    setSectionEditFlow(null);
    handleSectionProgress(section);
    // No acknowledgment chatter — move straight to the next step (or finish)
    advanceGuided(section);
  };

  const handleChatOption = async (opt) => {
    if (!opt || !opt.action) return;
    if (opt.action === 'open') { openSectionEditor(opt.section); return; }
    if (opt.action === 'download') { handleDownloadPdf(); return; }
    if (opt.action === 'view') {
      document.getElementById('cv-workspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    if (opt.action === 'section-done') {
      handleSectionProgress(opt.section);
      advanceGuided(opt.section);
      return;
    }
    if (opt.action === 'skip') {
      setSectionEditFlow(null);
      setExpFlow(null);
      advanceGuided(opt.section);
      return;
    }
    if (opt.action === 'exp-done') { finishExperienceFlow(); return; }
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

  // ── Guided Work-Experience flow ─────────────────────────────────
  // Role-specific bullet points the user can choose from
  const roleExperienceBullets = () => {
    const role = getRoleType(cvDraftData?.position || '');
    const bank = EXPERIENCE_BANK[role] || EXPERIENCE_BANK.fullstack || Object.values(EXPERIENCE_BANK)[0] || [];
    const pool = bank.flat().flatMap(e => e.bullets || []);
    return [...new Set(pool)].slice(0, 8);
  };

  const handleExperienceAnswer = (userText) => {
    const stage = expFlow?.stage;
    if (stage === 'company') {
      const draft = { ...expFlow.draft, company: userText.trim() };
      setExpFlow({ ...expFlow, stage: 'title', draft });
      pushAiMessage({
        text: "**What was your job title there?**",
        hint: `e.g. ${cvDraftData?.position || 'Software Engineer'}`,
        suggestions: cvDraftData?.position ? [cvDraftData.position] : undefined,
      });
      return;
    }
    if (stage === 'title') {
      const draft = { ...expFlow.draft, position: userText.trim() || cvDraftData?.position || 'Position' };
      setExpFlow({ ...expFlow, stage: 'duration', draft });
      pushAiMessage({
        text: "**When did you work there?**",
        hint: 'Start – end. Use "Present" if it\'s your current job',
        suggestions: ['2023 – Present', '2022 – 2024', '2021 – 2023'],
      });
      return;
    }
    if (stage === 'duration') {
      const draft = { ...expFlow.draft, duration: userText.trim() };
      const pool = roleExperienceBullets();
      setExpFlow({ ...expFlow, stage: 'bullets', draft, pool, chosen: pool.slice(0, 3) });
      pushAiMessage({
        text: `**What did you do at ${draft.company}?**\nTap the points that fit your **${draft.position}** role (a few are pre-selected). You can also type your own to add it.`,
        expBulletPicker: true,
        options: [{ label: '✓ Add to CV', action: 'exp-done' }],
      });
      return;
    }
    if (stage === 'bullets') {
      // Typing while choosing bullets adds a custom, polished point.
      // Re-push the picker so it stays the last message and shows the new point.
      const custom = polishLine(userText);
      if (!custom) return;
      const pool = [...expFlow.pool, custom];
      const chosen = [...expFlow.chosen, custom];
      setExpFlow({ ...expFlow, pool, chosen });
      pushAiMessage({
        text: `Added **"${custom}"**. Tap more points or type another — then add it to your CV.`,
        expBulletPicker: true,
        options: [{ label: '✓ Add to CV', action: 'exp-done' }],
      });
      return;
    }
  };

  const toggleExpBullet = (bullet) => {
    setExpFlow(prev => {
      if (!prev) return prev;
      const has = prev.chosen.includes(bullet);
      return { ...prev, chosen: has ? prev.chosen.filter(b => b !== bullet) : [...prev.chosen, bullet] };
    });
  };

  const finishExperienceFlow = () => {
    if (!expFlow) return;
    const d = expFlow.draft || {};
    const entry = {
      position: d.position || cvDraftData?.position || 'Position',
      company: d.company || 'Company',
      place: d.place || '',
      duration: d.duration || '',
      bullets: expFlow.chosen.length ? expFlow.chosen : ['Contributed to the development and delivery of production applications.'],
    };
    setCvDraftData(prev => ({ ...prev, experience: [entry] }));
    setExpFlow(null);
    handleSectionProgress('experience');
    advanceGuided('experience');
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

  // Manual, question-by-question header flow (never AI-generated).
  // Every question is asked in a clear order (Step N of 8) and, where it helps,
  // comes with tappable suggestion chips so the user can answer with one click.
  const handleHeaderAnswer = (userText) => {
    const skip = userText.trim().toLowerCase() === 'skip';
    const recSkills = getRecommendedSkills(cvDraftData?.position || '').slice(0, 6).join(', ');
    const cityChips = ['Bangalore, Karnataka, India', 'Kochi, Kerala, India', 'Chennai, Tamil Nadu, India', 'Hyderabad, Telangana, India', 'Remote'];
    const skillsHint = 'Separate with commas — or tap the recommended set below';
    let replyText = "";
    let replyHint = null;
    let replySuggestions = null;

    if (headerQuestionIdx === 0) {
      if (userText.includes(',')) {
        // "Name, Role" shortcut — capture both and jump ahead
        const parts = userText.split(',');
        const nm = parts[0].trim().toUpperCase();
        const pos = parts.slice(1).join(',').trim() || 'Full Stack Developer';
        setCvDraftData(prev => ({ ...prev, name: nm }));
        generateRoleCv(pos);
        replyText = "**Add your key skills**";
        replyHint = skillsHint;
        replySuggestions = getRecommendedSkills(pos).slice(0, 6).join(', ') ? [getRecommendedSkills(pos).slice(0, 6).join(', ')] : null;
        setHeaderQuestionIdx(2);
      } else {
        const val = userText.toUpperCase();
        setCvDraftData(prev => ({ ...prev, name: val }));
        if (cvDraftData?.position) {
          // Role already chosen from the picker — skip the position question
          replyText = "**Add your key skills**";
          replyHint = skillsHint;
          replySuggestions = recSkills ? [recSkills] : null;
          setHeaderQuestionIdx(2);
        } else {
          replyText = "**What role are you targeting?**";
          replyHint = 'Pick one below, or type your own';
          replySuggestions = ['Frontend Developer', 'Backend Engineer', 'Full Stack Developer', 'Data Analyst'];
          setHeaderQuestionIdx(1);
        }
      }
    } else if (headerQuestionIdx === 1) {
      generateRoleCv(userText);
      const rec = getRecommendedSkills(userText).slice(0, 6).join(', ');
      replyText = "**Add your key skills**";
      replyHint = skillsHint;
      replySuggestions = rec ? [rec] : null;
      setHeaderQuestionIdx(2);
    } else if (headerQuestionIdx === 2) {
      setCvDraftData(prev => ({ ...prev, skills: categorizeSkills(userText) }));
      replyText = "**Enter your email address**";
      replyHint = 'e.g. ravi.kumar@gmail.com';
      setHeaderQuestionIdx(3);
    } else if (headerQuestionIdx === 3) {
      setCvDraftData(prev => ({ ...prev, email: userText }));
      replyText = "**Enter your phone number**";
      replyHint = 'e.g. +91 98765 43210';
      setHeaderQuestionIdx(4);
    } else if (headerQuestionIdx === 4) {
      setCvDraftData(prev => ({ ...prev, phone: userText }));
      replyText = "**Where are you based?**";
      replyHint = 'City, State, Country — or tap a suggestion';
      replySuggestions = cityChips;
      setHeaderQuestionIdx(5);
    } else if (headerQuestionIdx === 5) {
      setCvDraftData(prev => ({ ...prev, location: skip ? '' : userText }));
      replyText = "**Add your professional links**";
      replyHint = 'Paste your LinkedIn and/or GitHub — or tap Skip';
      replySuggestions = ['Skip'];
      setHeaderQuestionIdx(6);
    } else if (headerQuestionIdx === 6) {
      if (!skip) {
        // One combined step for links — sort each URL into LinkedIn / GitHub
        const tokens = userText.split(/[\s,]+/).filter(Boolean);
        let li = '', gh = '';
        tokens.forEach(tok => {
          const low = tok.toLowerCase();
          if (low.includes('linkedin')) li = tok;
          else if (low.includes('github')) gh = tok;
        });
        setCvDraftData(prev => ({ ...prev, linkedin: li || prev.linkedin, github: gh || prev.github }));
      }
      setHeaderQuestionIdx(null);
      openSectionEditor('summary');
      return;
    }
    setChatMessages(prev => [...prev, { id: Date.now() + 2, sender: "ai", text: replyText, hint: replyHint || undefined, suggestions: replySuggestions || undefined }]);
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
  const handlePillClick = (pill) => {
    setActivePill(pill);
    setSearchQuery(pill);
    setError("");
    setParsedCV(null);
    setUploadedFileName("");
    setCvText("");
    setCvDraftData(emptyCv(pill));
    setHasUploadedCV(true);
    setIsAnalyzed(true);
    setCustomOptimizationResult({ builder: true });
    setCompletedSections(['header']);
    setHighlightedSection('header');
    setSectionEditFlow(null);
    setHeaderQuestionIdx(0);
    guidedRef.current = true;

    // Matching jobs for the recommendations rail
    const keyword = pill.toLowerCase().replace(" developer", "").replace(" engineer", "").trim();
    setCustomRecommendations(jobs.filter(j => j.title.toLowerCase().includes(keyword)).slice(0, 6));

    setChatMessages([{
      id: Date.now(), sender: 'ai',
      text: `**Enter your full name**`,
      hint: 'e.g. Ravi Kumar',
    }]);

    setTimeout(() => {
      document.getElementById("cv-workspace")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
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
    if (!userText.trim() || isOptimizing) return;

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

    // Guided work-experience flow — collect company → title → duration → bullets
    if (expFlow) {
      handleExperienceAnswer(userText);
      return;
    }

    const lowText = userText.toLowerCase();

    // ── Understand CV-editing requests typed in chat ─────────────────────
    // "edit my professional summary", "change skills", "update education",
    // "add a project", or just "summary" → open that section's editor.
    const SECTION_KEYWORDS = [
      ['professional summary', 'summary'], ['summary', 'summary'], ['about me', 'summary'],
      ['technical skill', 'skills'], ['skill', 'skills'],
      ['work experience', 'experience'], ['experience', 'experience'], ['job history', 'experience'],
      ['project', 'projects'],
      ['education', 'education'], ['qualification', 'education'], ['degree', 'education'],
      ['certification', 'certifications'], ['training', 'certifications'], ['course', 'certifications'],
      ['achievement', 'achievements'], ['award', 'achievements'], ['accomplishment', 'achievements'],
      ['header', 'header'], ['contact detail', 'header'], ['personal detail', 'header'],
    ];
    const detectSectionIntent = (t) => {
      const hit = SECTION_KEYWORDS.find(([k]) => t.includes(k));
      if (!hit) return null;
      const hasEditVerb = /(edit|change|update|improve|rewrite|modify|redo|fix|add|open|correct)/.test(t);
      const isShortMention = t.trim().split(/\s+/).length <= 3; // e.g. "summary", "my skills"
      return (hasEditVerb || isShortMention) ? hit[1] : null;
    };
    // Don't hijack career questions like "skills for data scientist" or "interview questions"
    const looksLikeCareerQuestion = /\b(for|salary|interview|roadmap|become|career path|jobs?)\b/.test(lowText) || /\?\s*$/.test(lowText);
    const intentSection = !looksLikeCareerQuestion ? detectSectionIntent(lowText) : null;
    if (intentSection) {
      openSectionEditor(intentSection);
      return;
    }

    // Download / view requests typed in chat
    if (/\b(download|export|save)\b.*\b(cv|resume|pdf)\b|\bdownload\b\s*$/.test(lowText)) {
      pushAiMessage({ text: '⬇️ **Downloading your CV as a PDF now.** Check your browser downloads.' });
      handleDownloadPdf();
      return;
    }
    if (/\b(view|show|see)\b.*\b(my )?(cv|resume)\b/.test(lowText)) {
      document.getElementById('cv-workspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      pushAiMessage({ text: '👁️ Here it is — your CV is on the left. Click any section to edit it.' });
      return;
    }

    // Route career questions to the backend AI assistant FIRST — even during the
    // guided header flow, "show me remote jobs" deserves a real answer instead of
    // being stored as a name. Plain answers (names, emails, ...) never match.
    const isAssistantQuery = (q) => {
      if (q.includes(",")) return false; // "Name, Role" CV shortcut
      const t = q.trim();
      return /\?\s*$/.test(t) ||
        /^(hi+|hello|hey+|yo|namaste|good (morning|afternoon|evening)|thanks|thank you|help)\b/i.test(t) ||
        /\b(salary|salaries|package|ctc|lpa|compensation|interview|ats|career|roadmap|certification|resume tips?|cv tips?|improve my (resume|cv)|skills? (for|needed|required|to become)|how to become|show me|find (me )?jobs?|remote jobs?|jobs? (in|for|near)|hiring|vacanc|what can you do|how (do|does)|tell me about)\b/i.test(t);
    };

    if (isAssistantQuery(userText)) {
      setIsOptimizing(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE}/api/chat/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userText }),
        });
        const data = await res.json();
        if (res.ok && data.reply) {
          setIsOptimizing(false);
          // If a guided CV question was pending, gently resume it after answering
          const pendingQuestion = headerQuestionIdx !== null
            ? `\n\n↩️ **Back to your CV — ${getHeaderQuestionText(headerQuestionIdx)}**`
            : "";
          setChatMessages(prev => [...prev, {
            id: Date.now() + 2, sender: "ai", text: data.reply + pendingQuestion,
            suggestions: data.suggestions, jobs: data.jobs,
          }]);
          return;
        }
      } catch (err) {
        console.error("AI assistant unavailable, falling back to local logic:", err);
      }
      setIsOptimizing(false);
    }

    // Header details are collected manually, question by question (no AI content)
    if (headerQuestionIdx !== null) {
      handleHeaderAnswer(userText);
      return;
    }

    setIsOptimizing(true);
    setError("");

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

  // Pixel-exact PDF: captures the on-screen CV with html2canvas so the PDF
  // matches the left-side preview's exact layout, spacing, and typography.
  const handleDownloadPdf = async () => {
    const node = optimizedCardRef.current;
    if (!node) return;
    try {
      const [{ jsPDF }, html2canvas] = await Promise.all([
        import('jspdf'),
        import('html2canvas').then(m => m.default || m),
      ]);
      node.classList.add('printing-pdf');
      const canvas = await html2canvas(node, { scale: 2, backgroundColor: '#ffffff', useCORS: true, logging: false });
      node.classList.remove('printing-pdf');

      const doc = new jsPDF('p', 'pt', 'a4');
      const W = doc.internal.pageSize.getWidth();
      const H = doc.internal.pageSize.getHeight();
      const margin = 30;
      const imgW = W - margin * 2;
      const pageContentH = H - margin * 2;
      const pxPerPt = canvas.width / imgW;
      const pagePx = Math.floor(pageContentH * pxPerPt);

      let rendered = 0;
      while (rendered < canvas.height) {
        const sliceH = Math.min(pagePx, canvas.height - rendered);
        const slice = document.createElement('canvas');
        slice.width = canvas.width;
        slice.height = sliceH;
        slice.getContext('2d').drawImage(canvas, 0, rendered, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
        if (rendered > 0) doc.addPage();
        doc.addImage(slice.toDataURL('image/jpeg', 0.95), 'JPEG', margin, margin, imgW, sliceH / pxPerPt);
        rendered += sliceH;
      }

      const candidateName = cvDraftData.name || parsedCV?.name || 'My';
      doc.save(`${candidateName}_CV.pdf`);
    } catch (err) {
      if (node) node.classList.remove('printing-pdf');
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
    if (!msg.cards && !msg.options && !(msg.suggestions?.length) && !(msg.jobs?.length)
      && !msg.headerForm && !msg.skillsPicker && !msg.experienceForm && !msg.expBulletPicker) return null;

    const formInputStyle = {
      width: '100%', padding: '0.42rem 0.6rem', border: '1px solid #e2e8f0', borderRadius: '8px',
      fontSize: '0.74rem', color: '#1e293b', outline: 'none', fontFamily: 'inherit', background: '#ffffff',
    };
    const formLabelStyle = { fontSize: '0.63rem', fontWeight: 800, color: 'var(--text-gray)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.15rem', display: 'block' };
    const formCardStyle = { border: '1.5px solid #bfdbfe', borderRadius: '12px', background: '#ffffff', padding: '0.75rem 0.85rem', boxShadow: '0 1px 4px rgba(37,99,235,0.06)' };
    const saveBtnStyle = { padding: '0.45rem 1.1rem', borderRadius: '50px', border: 'none', background: 'var(--accent-blue)', color: '#fff', fontSize: '0.74rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 2px 6px rgba(37,99,235,0.2)' };

    let expSuggestedBullets = [];
    if (msg.experienceForm) {
      const role = getRoleType(cvDraftData?.position || '');
      const bank = EXPERIENCE_BANK[role] || EXPERIENCE_BANK.fullstack || Object.values(EXPERIENCE_BANK)[0] || [];
      expSuggestedBullets = bank.flat().flatMap(e => (e.bullets || [])).slice(0, 5);
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', maxWidth: '92%', marginTop: '0.1rem' }}>
        {msg.headerForm && (
          <form onSubmit={saveHeaderForm} style={formCardStyle}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.6rem' }}>
              <div><label style={formLabelStyle}>Full Name *</label>
                <input name="name" required placeholder="e.g. Arjun Nair" defaultValue={cvDraftData?.name || ''} style={formInputStyle} /></div>
              <div><label style={formLabelStyle}>Job Position</label>
                <input name="position" list="role-suggestions" placeholder="e.g. Full Stack Developer" defaultValue={cvDraftData?.position || ''} style={formInputStyle} />
                <datalist id="role-suggestions">{categories.map(c => <option key={c} value={c} />)}</datalist></div>
              <div><label style={formLabelStyle}>Phone</label>
                <input name="phone" placeholder="+91 98765 43210" defaultValue={cvDraftData?.phone || ''} style={formInputStyle} /></div>
              <div><label style={formLabelStyle}>Email</label>
                <input name="email" type="email" placeholder="you@gmail.com" defaultValue={cvDraftData?.email || ''} style={formInputStyle} /></div>
              <div><label style={formLabelStyle}>Location</label>
                <input name="location" list="city-suggestions" placeholder="City, State, India" defaultValue={cvDraftData?.location || ''} style={formInputStyle} />
                <datalist id="city-suggestions">
                  {['Bangalore, Karnataka, India', 'Kochi, Kerala, India', 'Chennai, Tamil Nadu, India', 'Hyderabad, Telangana, India', 'Mumbai, Maharashtra, India', 'Pune, Maharashtra, India', 'Delhi NCR, India', 'Trivandrum, Kerala, India'].map(c => <option key={c} value={c} />)}
                </datalist></div>
              <div><label style={formLabelStyle}>Portfolio</label>
                <input name="portfolio" placeholder="yourname.vercel.app" defaultValue={cvDraftData?.portfolio || ''} style={formInputStyle} /></div>
              <div><label style={formLabelStyle}>LinkedIn</label>
                <input name="linkedin" placeholder="linkedin.com/in/yourname" defaultValue={cvDraftData?.linkedin || ''} style={formInputStyle} /></div>
              <div><label style={formLabelStyle}>GitHub</label>
                <input name="github" placeholder="github.com/yourname" defaultValue={cvDraftData?.github || ''} style={formInputStyle} /></div>
            </div>
            <div style={{ marginBottom: '0.6rem' }}>
              <label style={formLabelStyle}>
                Headline skills — shown next to your job title (choose up to {HEADER_SKILL_LIMIT}) · {(cvDraftData?.headerSkills || []).length}/{HEADER_SKILL_LIMIT} selected
              </label>
              <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                {headerSkillPool().map((skill) => {
                  const on = (cvDraftData?.headerSkills || []).some(s => s.toLowerCase() === skill.toLowerCase());
                  const full = !on && (cvDraftData?.headerSkills || []).length >= HEADER_SKILL_LIMIT;
                  return (
                    <button key={skill} type="button" onClick={() => toggleHeaderSkill(skill)}
                      style={{
                        padding: '0.22rem 0.55rem', borderRadius: '50px', fontSize: '0.66rem', fontWeight: 650,
                        cursor: full ? 'not-allowed' : 'pointer', opacity: full ? 0.45 : 1,
                        border: on ? '1.25px solid #2563eb' : '1.25px solid #e2e8f0',
                        background: on ? '#eff6ff' : '#f8fafc', color: on ? '#2563eb' : '#475569', transition: 'all 0.15s',
                      }}>
                      {on ? '✓ ' : '+ '}{skill}
                    </button>
                  );
                })}
              </div>
            </div>
            <button type="submit" style={saveBtnStyle}>Save Header → Next</button>
          </form>
        )}
        {msg.skillsPicker && (
          <div style={formCardStyle}>
            {roleSkillCategories().map((cat) => {
              const current = (cvDraftData?.skills?.[cat] || '').split(',').map(s => s.trim()).filter(s => s && s !== '—');
              const pool = [...new Set([...current, ...SKILL_SUGGESTION_POOL[cat]])];
              return (
                <div key={cat} style={{ marginBottom: '0.55rem' }}>
                  <span style={formLabelStyle}>{cat === 'ai' ? 'AI Integrations' : cat}</span>
                  <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                    {pool.map((skill) => {
                      const on = cvSkillHas(cat, skill);
                      return (
                        <button key={skill} type="button" onClick={() => toggleCvSkill(cat, skill)}
                          style={{
                            padding: '0.22rem 0.55rem', borderRadius: '50px', fontSize: '0.66rem', fontWeight: 650, cursor: 'pointer',
                            border: on ? '1.25px solid #2563eb' : '1.25px solid #e2e8f0',
                            background: on ? '#eff6ff' : '#f8fafc', color: on ? '#2563eb' : '#475569', transition: 'all 0.15s',
                          }}>
                          {on ? '✓ ' : '+ '}{skill}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {msg.expBulletPicker && expFlow?.stage === 'bullets' && (
          <div style={formCardStyle}>
            <span style={formLabelStyle}>Responsibilities & achievements — tap to include</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.3rem' }}>
              {(expFlow.pool || []).map((bullet, i) => {
                const on = (expFlow.chosen || []).includes(bullet);
                return (
                  <button key={i} type="button" onClick={() => toggleExpBullet(bullet)}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: '0.4rem', textAlign: 'left', width: '100%',
                      padding: '0.4rem 0.55rem', borderRadius: '9px', fontSize: '0.72rem', fontWeight: 500, cursor: 'pointer',
                      lineHeight: 1.35, border: on ? '1.25px solid #2563eb' : '1.25px solid #e2e8f0',
                      background: on ? '#eff6ff' : '#f8fafc', color: on ? '#1e3a8a' : '#475569', transition: 'all 0.15s',
                    }}>
                    <span style={{ flexShrink: 0, fontWeight: 800, color: on ? '#2563eb' : '#94a3b8' }}>{on ? '✓' : '+'}</span>
                    <span>{bullet}</span>
                  </button>
                );
              })}
            </div>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.66rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              {(expFlow.chosen || []).length} selected · type below to add your own
            </p>
          </div>
        )}
        {msg.experienceForm && (
          <form onSubmit={saveExperienceForm} style={formCardStyle}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.55rem' }}>
              <div><label style={formLabelStyle}>Position</label>
                <input name="position" placeholder="e.g. Software Developer" defaultValue={cvDraftData?.position || ''} style={formInputStyle} /></div>
              <div><label style={formLabelStyle}>Company</label>
                <input name="company" required placeholder="e.g. TechNova Solutions" style={formInputStyle} /></div>
              <div style={{ gridColumn: '1 / -1' }}><label style={formLabelStyle}>Location</label>
                <input name="place" placeholder="e.g. Kochi, Kerala" style={formInputStyle} /></div>
              <div><label style={formLabelStyle}>From</label>
                <div style={{ display: 'flex', gap: '0.3rem' }}>
                  <select name="fromMonth" defaultValue="Jan" style={{ ...formInputStyle, padding: '0.4rem 0.3rem' }}>{MONTHS.map(m => <option key={m}>{m}</option>)}</select>
                  <select name="fromYear" defaultValue="2024" style={{ ...formInputStyle, padding: '0.4rem 0.3rem' }}>{YEARS.map(y => <option key={y}>{y}</option>)}</select>
                </div></div>
              <div><label style={formLabelStyle}>To</label>
                <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                  <select name="toMonth" defaultValue="Dec" style={{ ...formInputStyle, padding: '0.4rem 0.3rem' }}>{MONTHS.map(m => <option key={m}>{m}</option>)}</select>
                  <select name="toYear" defaultValue="2026" style={{ ...formInputStyle, padding: '0.4rem 0.3rem' }}>{YEARS.map(y => <option key={y}>{y}</option>)}</select>
                  <label style={{ fontSize: '0.66rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '0.2rem', whiteSpace: 'nowrap' }}>
                    <input type="checkbox" name="present" /> Present
                  </label>
                </div></div>
            </div>
            {expSuggestedBullets.length > 0 && (
              <div style={{ marginBottom: '0.55rem' }}>
                <span style={formLabelStyle}>Suggested bullet points — tick the ones that fit</span>
                {expSuggestedBullets.map((b, i) => (
                  <label key={i} style={{ display: 'flex', gap: '0.35rem', alignItems: 'flex-start', fontSize: '0.68rem', color: '#475569', marginBottom: '0.25rem', cursor: 'pointer' }}>
                    <input type="checkbox" name="bullets" value={b} defaultChecked={i < 2} style={{ marginTop: '0.15rem' }} />
                    <span>{b}</span>
                  </label>
                ))}
              </div>
            )}
            <div style={{ marginBottom: '0.55rem' }}>
              <label style={formLabelStyle}>Your own points (optional, one per line)</label>
              <textarea name="ownBullets" rows={2} placeholder="e.g. Built the payments module used by 10k users" style={{ ...formInputStyle, resize: 'vertical' }} />
            </div>
            <button type="submit" style={saveBtnStyle}>Save Experience → Next</button>
          </form>
        )}
        {msg.jobs && msg.jobs.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {msg.jobs.map((job) => (
              <div key={job.id} style={{ border: '1px solid var(--border-color)', borderRadius: '12px', background: '#ffffff', padding: '0.55rem 0.75rem', boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontWeight: 750, fontSize: '0.74rem', color: 'var(--text-dark)' }}>{job.title}</span>
                  <span style={{ marginLeft: 'auto', flexShrink: 0, fontSize: '0.62rem', fontWeight: 700, color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '50px', padding: '0.12rem 0.5rem', whiteSpace: 'nowrap' }}>{job.salary_range}</span>
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-gray)', marginTop: '0.2rem' }}>
                  {job.company} &middot; {job.location}
                </div>
              </div>
            ))}
          </div>
        )}
        {msg.suggestions && msg.suggestions.length > 0 && (
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.15rem' }}>
            {msg.suggestions.map((s, i) => (
              <button key={i} type="button" onClick={() => handleSendChatMessage(null, s)} className="ih-chip"
                style={{ padding: '0.42rem 0.9rem', borderRadius: '50px', border: '1px solid #2563eb', background: '#2563eb', color: '#ffffff', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 6px rgba(37,99,235,0.2)' }}>
                {s}
              </button>
            ))}
          </div>
        )}
        {msg.cards && msg.cards.map((card, i) => (
          <div key={i} onClick={() => handleChatOption({ action: 'apply', section: card.section, payload: card.payload })} className="ih-card"
            style={{ border: '1px solid #dbe6fb', borderRadius: '14px', background: '#ffffff', padding: '0.7rem 0.85rem', cursor: 'pointer', boxShadow: '0 2px 8px rgba(15,23,42,0.05)' }}>
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
              <button key={i} type="button" onClick={() => handleChatOption(opt)} className="ih-chip"
                style={{ padding: '0.42rem 0.9rem', borderRadius: '50px', border: '1px solid #cdddf9', background: '#eff6ff', color: 'var(--accent-blue)', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>
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
    // Header strip: skills the user hand-picked in the header form win;
    // otherwise fall back to the category that defines this role
    const primaryCat = ROLE_PRIMARY_SKILL_CAT[getRoleType(cv.position || "")] || "frontend";
    const headerSkillsSource = cv.skills && typeof cv.skills === "object" && !Array.isArray(cv.skills)
      ? (cv.skills[primaryCat] || Object.values(cv.skills).filter(v => v && v !== "—")[0] || "")
      : (Array.isArray(cv.skills) ? cv.skills.join(", ") : (cv.skills || ""));
    const headerSkills = (Array.isArray(cv.headerSkills) && cv.headerSkills.length > 0)
      ? cv.headerSkills.join(" • ")
      : headerSkillsSource.split(",").map(s => s.trim()).filter(s => s && s !== "—").slice(0, 6).join(" • ");

    const phone = cv.phone || "";
    const email = cv.email || "";
    const location = cv.location || "";
    const portfolio = cv.portfolio || "";
    const linkedin = cv.linkedin || "";
    const github = cv.github || "";
    const contactRow1 = [phone, email, location].filter(Boolean);
    const contactRow2 = [portfolio, linkedin, github].filter(Boolean);

    // Subtle placeholder shown for sections the chat hasn't filled yet
    const emptyNote = (label) => (
      <p style={{ fontStyle: "italic", color: "#94a3b8", fontSize: "0.74rem", margin: "0.15rem 0 0.5rem 0" }}>
        {label} not added yet — build it from the chat panel →
      </p>
    );

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

    let projectsList = cv.projects || [];
    if (typeof projectsList === "string") projectsList = [];

    const education = cv.education || "";

    let certifications = cv.certifications || [];
    let achievements = cv.achievements || [];
    if (isOptimized && achievementsAltIndex > 0) {
      const altItems = ALTERNATIVE_ACHIEVEMENTS[achievementsAltIndex % ALTERNATIVE_ACHIEVEMENTS.length];
      certifications = altItems.slice(0, 4);
      achievements = altItems.slice(4);
    }

    return (
      <div className="resume-body" style={{ fontSize: "0.81rem", color: "#1e293b", fontFamily: "var(--font-sans)", lineHeight: "1.45" }}>
        {/* Name Header */}
        {isSectionVisible('header') && (
          <div onClick={() => handleSectionClick('header')} style={getSectionStyle('header')}>
            {renderSectionBadge('header')}
            <button
              className="section-edit-icon"
              style={{ position: 'absolute', top: '0.45rem', right: '0.55rem' }}
              onClick={(e) => { e.stopPropagation(); handleSectionClick('header'); }}
              title="Edit Header & Contact"
            >
              <EditPencilIcon />
            </button>
            <div style={{ textAlign: "center", marginBottom: "0.6rem" }}>
              <h2 className="resume-name" style={{ fontSize: "1.4rem", color: cv.name ? "#0f172a" : "#cbd5e1", textTransform: "uppercase", fontWeight: "800", marginBottom: "0.15rem", letterSpacing: "-0.01em" }}>
                {cv.name || "Your Name"}
              </h2>
              <div style={{ fontSize: "0.81rem", color: "#0f172a", fontWeight: "600", marginBottom: "0.2rem" }}>
                {position}{headerSkills ? `  •  ${headerSkills}` : ""}
              </div>
              {contactRow1.length > 0 && (
                <div style={{ fontSize: "0.76rem", color: "#475569", display: "flex", justifyContent: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.1rem" }}>
                  {contactRow1.map((v, i) => <span key={i}>{i > 0 ? "| " : ""}{v}</span>)}
                </div>
              )}
              {contactRow2.length > 0 && (
                <div style={{ fontSize: "0.76rem", color: "#475569", display: "flex", justifyContent: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                  {contactRow2.map((v, i) => <span key={i}>{i > 0 ? "| " : ""}{v}</span>)}
                </div>
              )}
              {!cv.name && contactRow1.length === 0 && emptyNote("Contact details")}
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
                className="section-edit-icon"
                onClick={(e) => { e.stopPropagation(); handleSectionClick('summary'); }}
                title="Edit Professional Summary"
              >
                <EditPencilIcon />
              </button>
            </div>
            {summary ? (
              <p className="resume-text" style={{ textAlign: "justify", marginBottom: "0.4rem" }}>
                {isOptimized ? renderWithHighlights(summary) : summary}
              </p>
            ) : emptyNote("Summary")}
          </div>
        )}

        {/* Technical Skills */}
        {isSectionVisible('skills') && (
          <div onClick={() => handleSectionClick('skills')} style={getSectionStyle('skills')}>
            {renderSectionBadge('skills')}
            <div className="resume-section-header">
              <span>Technical Skills</span>
              <button
                className="section-edit-icon"
                onClick={(e) => { e.stopPropagation(); handleSectionClick('skills'); }}
                title="Edit Technical Skills"
              >
                <EditPencilIcon />
              </button>
            </div>
            {![frontendSkills, backendSkills, databaseSkills, toolsSkills, conceptsSkills, aiSkills].some(v => v && v !== "—") ? emptyNote("Skills") : (
            <table className="skills-table">
              <tbody>
                {frontendSkills && frontendSkills !== "—" && (
                <tr>
                  <td>Frontend</td>
                  <td>{frontendSkills}</td>
                </tr>
                )}
                {backendSkills && backendSkills !== "—" && (
                <tr>
                  <td>Backend</td>
                  <td>{backendSkills}</td>
                </tr>
                )}
                {databaseSkills && databaseSkills !== "—" && (
                <tr>
                  <td>Database</td>
                  <td>{databaseSkills}</td>
                </tr>
                )}
                {toolsSkills && toolsSkills !== "—" && (
                <tr>
                  <td>Tools</td>
                  <td>{toolsSkills}</td>
                </tr>
                )}
                {conceptsSkills && conceptsSkills !== "—" && (
                <tr>
                  <td>Concepts</td>
                  <td>{conceptsSkills}</td>
                </tr>
                )}
                {aiSkills && aiSkills !== "—" && (
                  <tr>
                    <td>AI Integrations</td>
                    <td>{aiSkills}</td>
                  </tr>
                )}
              </tbody>
            </table>
            )}
          </div>
        )}

        {/* Work Experience */}
        {isSectionVisible('experience') && (
          <div onClick={() => handleSectionClick('experience')} style={getSectionStyle('experience')}>
            {renderSectionBadge('experience')}
            <div className="resume-section-header">
              <span>Work Experience</span>
              <button
                className="section-edit-icon"
                onClick={(e) => { e.stopPropagation(); handleSectionClick('experience'); }}
                title="Edit Work Experience"
              >
                <EditPencilIcon />
              </button>
            </div>
            {experienceList.length === 0 ? emptyNote("Experience") : experienceList.length > 0 && typeof experienceList[0] === "string" ? (
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
                className="section-edit-icon"
                onClick={(e) => { e.stopPropagation(); handleSectionClick('projects'); }}
                title="Edit Projects"
              >
                <EditPencilIcon />
              </button>
            </div>
            {projectsList.length === 0 ? emptyNote("Projects") : projectsList.length > 0 && typeof projectsList[0] === "string" ? (
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
                className="section-edit-icon"
                onClick={(e) => { e.stopPropagation(); handleSectionClick('education'); }}
                title="Edit Education"
              >
                <EditPencilIcon />
              </button>
            </div>
            {(!education || education.length === 0) ? emptyNote("Education") : Array.isArray(education) ? (
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
                className="section-edit-icon"
                onClick={(e) => { e.stopPropagation(); handleSectionClick('certifications'); }}
                title="Edit Certifications & Training"
              >
                <EditPencilIcon />
              </button>
            </div>
            {certifications.length === 0 ? emptyNote("Certifications") : (
            <ul className="resume-list" style={{ marginBottom: "0.4rem" }}>
              {certifications.map((cert, idx) => (
                <li key={idx}>{isOptimized ? renderWithHighlights(cert) : cert}</li>
              ))}
            </ul>
            )}
          </div>
        )}

        {/* Achievements */}
        {isSectionVisible('achievements') && (
          <div onClick={() => handleSectionClick('achievements')} style={getSectionStyle('achievements')}>
            {renderSectionBadge('achievements')}
            <div className="resume-section-header">
              <span>Achievements</span>
              <button
                className="section-edit-icon"
                onClick={(e) => { e.stopPropagation(); handleSectionClick('achievements'); }}
                title="Edit Achievements"
              >
                <EditPencilIcon />
              </button>
            </div>
            {achievements.length === 0 ? emptyNote("Achievements") : (
            <ul className="resume-list" style={{ marginBottom: "0.4rem" }}>
              {achievements.map((ach, idx) => (
                <li key={idx}>{isOptimized ? renderWithHighlights(ach) : ach}</li>
              ))}
            </ul>
            )}
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
  // Jobs shown under the "Matching Jobs" tab — role-matched recommendations, else a general slice
  const jobMatches = customRecommendations.length > 0 ? customRecommendations : jobs.slice(0, 8);

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

          {/* Suggested roles — always visible, pick one to start building */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", marginBottom: "2rem" }}>
            <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: 800, color: "var(--text-gray)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              🎯 Pick a role to build your AI CV
            </p>
            <div className="pill-list" style={{ maxHeight: "none", justifyContent: "center" }}>
              {categories.map((pill) => (
                <span
                  key={pill}
                  className={`pill-tag ${activePill === pill ? "active" : ""}`}
                  onClick={() => handlePillClick(pill)}
                >
                  {pill}
                </span>
              ))}
            </div>
          </div>

          {/* Hidden file upload — single instance */}
          <input type="file" ref={fileInputRef} style={{ display: "none" }} accept=".txt,.pdf,.docx" onChange={handleFileChange} />
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

            {/* Builder toolbar — suggestion-built CVs get a clean bar without ATS scores */}
            {!isOptimizing && isAnalyzed && customOptimizationResult && !parsedCV && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-gray)' }}>
                  ✨ Building your <span style={{ color: 'var(--accent-blue)' }}>{cvDraftData?.position || 'CV'}</span> — follow the chat on the right
                </span>
                <button onClick={handleDownloadPdf} title="Download CV as PDF"
                  style={{ marginLeft: 'auto', padding: '0.6rem 1rem', background: 'var(--accent-blue)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <DownloadIcon /> PDF
                </button>
              </div>
            )}

            {/* ATS Score strip — only for genuinely uploaded CVs */}
            {!isOptimizing && isAnalyzed && customOptimizationResult && parsedCV && (
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
                gap: '0.7rem',
                padding: '0.85rem 1.25rem',
                borderBottom: '1px solid var(--border-color)',
                background: 'linear-gradient(180deg, #ffffff, #fbfcfe)',
                boxShadow: '0 1px 2px rgba(15,23,42,0.03)'
              }}>
                <div className="ih-chat-avatar" style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #2563eb, #4f8bff)', borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg viewBox="0 0 24 24" fill="white" style={{ width: '1.05rem', height: '1.05rem' }}>
                    <path d="M12 2L14.3 7.7L20 10L14.3 12.3L12 18L9.7 12.3L4 10L9.7 7.7L12 2Z" />
                    <path d="M19 4L20 6.5L22.5 7.5L20 8.5L19 11L18 8.5L15.5 7.5L18 6.5L19 4Z" />
                    <path d="M6 14L6.8 16L8.8 16.8L6.8 17.6L6 19.6L5.2 17.6L3.2 16.8L5.2 16L6 14Z" />
                  </svg>
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', letterSpacing: '-0.01em' }}>IntelliHire AI</p>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '1px', fontSize: '0.68rem', color: 'var(--text-gray)', fontWeight: 500 }}>
                    <span className="ih-status-dot" /> CV Assistant · Online
                  </span>
                </div>
                <button onClick={() => setShowUploadModal(true)} title="Upload CV" className="ih-upload-btn"
                  style={{ marginLeft: 'auto', background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '50px', padding: '0.42rem 0.9rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-blue)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: '0.8rem', height: '0.8rem', strokeWidth: 2.5 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload CV
                </button>
              </div>

              {/* Tab bar — AI Assistant | Matching Jobs */}
              <div style={{ display: 'flex', gap: '0.5rem', padding: '0 1.25rem', borderBottom: '1px solid var(--border-color)', backgroundColor: '#ffffff', flexShrink: 0 }}>
                {[
                  { key: 'assistant', label: 'AI Assistant' },
                  { key: 'jobs', label: `Matching Jobs${jobMatches.length ? ` (${jobMatches.length})` : ''}` },
                ].map((tab) => {
                  const active = chatTab === tab.key;
                  return (
                    <button key={tab.key} type="button" onClick={() => setChatTab(tab.key)} className="ih-tab"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.75rem 0.85rem', borderRadius: '8px 8px 0 0', fontSize: '0.8rem', fontWeight: active ? 700 : 500, color: active ? 'var(--accent-blue)' : 'var(--text-gray)', borderBottom: active ? '2.5px solid var(--accent-blue)' : '2.5px solid transparent', marginBottom: '-1px', letterSpacing: '-0.01em' }}>
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {chatTab === 'assistant' ? (
              <>
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
              <div className="ih-msgs" style={{ flex: 1, overflowY: 'auto', padding: '1.35rem', margin: '0.75rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'linear-gradient(180deg, #f7f9fc, #f2f5fa)', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
                {renderChatHistoryBlock()}
                {currentMessages.map((msg) => (
                  <div key={msg.id} className="ih-msg-row" style={{ display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start', gap: '0.4rem' }}>
                    <div style={{
                      maxWidth: '84%',
                      padding: '0.8rem 1.05rem',
                      borderRadius: msg.sender === 'user' ? '18px 18px 5px 18px' : '18px 18px 18px 5px',
                      background: msg.sender === 'user' ? 'linear-gradient(135deg, #2563eb, #3b82f6)' : '#ffffff',
                      color: msg.sender === 'user' ? '#ffffff' : '#1e293b',
                      border: msg.sender === 'user' ? 'none' : '1px solid #e9eef5',
                      fontSize: '0.82rem',
                      lineHeight: '1.55',
                      letterSpacing: '-0.005em',
                      fontWeight: msg.sender === 'user' ? 500 : 400,
                      boxShadow: msg.sender === 'user' ? '0 6px 18px rgba(37,99,235,0.24)' : '0 2px 8px rgba(15,23,42,0.06)',
                    }}>
                      {msg.text.split('\n').map((line, lIdx) => (
                        <p key={lIdx} style={{ margin: 0, marginBottom: lIdx < msg.text.split('\n').length - 1 ? '0.5rem' : 0 }}>
                          {line.split('**').map((part, i) => i % 2 === 1 ? <strong key={i} style={{ fontWeight: 700 }}>{part}</strong> : part)}
                        </p>
                      ))}
                    </div>
                    {msg.id > 1e12 && (
                      <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', padding: '0 0.3rem' }}>
                        {new Date(msg.id).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
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
                    <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)', fontWeight: 600 }}>IntelliHire AI is typing…</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Composer — visually separated from the message stream */}
              <div style={{ padding: '0.9rem 1.25rem 1.1rem 1.25rem', backgroundColor: '#ffffff', borderTop: '1px solid var(--border-color)', boxShadow: '0 -6px 16px rgba(15, 23, 42, 0.04)', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <form onSubmit={handleSendChatMessage} className="ih-composer" style={{
                  background: '#ffffff',
                  border: '1.5px solid #dde3ec',
                  borderRadius: '18px',
                  padding: '0.65rem 0.9rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                  boxShadow: '0 2px 10px rgba(15,23,42,0.04)'
                }}
                onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--accent-blue)'}
                onBlurCapture={e => e.currentTarget.style.borderColor = '#dde3ec'}
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
                      <button type="button" onClick={handleSpeechToText} title={isListening ? 'Stop listening' : 'Speak'} className="ih-mic-btn"
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          border: 'none',
                          background: isListening ? '#fee2e2' : '#f1f5f9',
                          color: isListening ? '#ef4444' : '#64748b',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: '0.9rem', height: '0.9rem', strokeWidth: 2.2 }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                      </button>
                      <button type="submit" title="Send"
                        disabled={isOptimizing} className="ih-send-btn"
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          border: 'none',
                          background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                          color: '#fff',
                          opacity: isOptimizing ? 0.5 : 1,
                          cursor: isOptimizing ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 3px 10px rgba(37,99,235,0.28)',
                        }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: '0.9rem', height: '0.9rem', strokeWidth: 2.5 }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
              </>
              ) : (
                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.7rem', backgroundColor: '#f6f8fb' }}>
                  {jobMatches.length === 0 ? (
                    <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', maxWidth: '240px', lineHeight: 1.5 }}>
                      No matching jobs yet — pick a role above or upload your CV to see roles you can apply to.
                    </div>
                  ) : jobMatches.map((job) => (
                    <div key={job.id} style={{ border: '1px solid var(--border-color)', borderRadius: '14px', background: '#ffffff', padding: '0.85rem 1rem', boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ margin: 0, fontWeight: 750, fontSize: '0.82rem', color: 'var(--text-dark)' }}>{job.title}</p>
                          <p style={{ margin: '0.15rem 0 0', fontSize: '0.72rem', color: 'var(--text-gray)' }}>{job.company} · {job.location}</p>
                        </div>
                        {job.salary_range && (
                          <span style={{ marginLeft: 'auto', flexShrink: 0, fontSize: '0.64rem', fontWeight: 700, color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '50px', padding: '0.15rem 0.55rem', whiteSpace: 'nowrap' }}>{job.salary_range}</span>
                        )}
                      </div>
                      <button type="button" onClick={() => handleEasyApply(job)}
                        style={{ marginTop: '0.7rem', width: '100%', padding: '0.5rem', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #2563eb, #3b82f6)', color: '#fff', fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', boxShadow: '0 2px 8px rgba(37,99,235,0.2)' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: '0.85rem', height: '0.85rem', strokeWidth: 2 }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Apply Now
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
