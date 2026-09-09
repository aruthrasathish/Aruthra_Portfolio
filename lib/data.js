// lib/data.js
// Single source of truth for all portfolio content.
// Rule: every metric here must be traceable to real work. No invented numbers.

export const hero = {
  greeting: "Hi, I'm",
  name: "Aruthra Sathish Kumar",
  role: "Software Engineer",
  // One line, not two chips: the old version repeated the same wording the
  // role and navbar already carry.
  specialization: "Backend & Distributed Systems · Applied AI / ML",
  tagline: "I build scalable backend systems and intelligent applications.",
  availability: "Open to Software Engineering and AI/ML roles",
  github: "https://github.com/aruthrasathish",
  linkedin: "https://www.linkedin.com/in/aruthrasathish",
  /**
   * Avatar - the hero's character.
   *
   * Rendered directly over the network background: no halo, ring, card or
   * border, so every pose must carry its own transparency.
   *
   * POSES
   * -----
   * `poses` is the character's pose registry: a name -> asset map. Only `idle`
   * exists today, because the source recordings contain exactly one static
   * pose (see public/avatar/README.md - measured, not assumed). Adding a file
   * here is all it takes to bring that pose into the performance:
   *
   *   poses: {
   *     idle:   { src: "/avatar/pose-idle.webp" },
   *     wave:   { src: "/avatar/pose-wave.webp" },
   *     danceL: { src: "/avatar/pose-dance-left.webp" },
   *     danceR: { src: "/avatar/pose-dance-right.webp" },
   *   }
   *
   * Every pose must share one canvas size and one baseline, or the character
   * will jump when it switches. `kind: "video"` is accepted too, for a
   * transparent WebM.
   *
   * CLIPS
   * -----
   * `clips` maps a character state to a sequence of pose frames, which is how
   * a real two-step sway or a wave gets expressed:
   *
   *   clips: {
   *     wave:  [{ pose: "wave", hold: 420 }, { pose: "idle", hold: 260 }],
   *     dance: [{ pose: "danceL", hold: 240 }, { pose: "danceR", hold: 240 }],
   *     micro: [{ pose: "smile", hold: 700 }],
   *   }
   *
   * Any state without a clip falls back to `idle`, so a partial pose set
   * degrades one state at a time rather than breaking. While `poses` holds a
   * single entry the component keeps its presentation motion at full (still
   * sub-degree) amplitude; once real poses arrive it damps itself down and
   * lets the artwork do the acting.
   *
   * `aspect` reserves the box before the asset decodes, so there is no layout
   * shift. It must match the artwork.
   */
  avatar: {
    /*
      The animation is IN THE FILE - 121 frames at 24fps, ~5.1s, looping, with
      real alpha. She waves, shifts weight and moves her head; none of that is
      CSS. `motion: false` therefore switches the component's presentation
      transforms off for good: no breathing, float, scale, rotation or bounce
      layered on top of artwork that is already moving.

      `src` is the re-flagged copy of aruthra-avatar-final.webp. That original
      marks every frame ALPHA-BLEND / dispose-none, which composites each frame
      over the last and smears the waving arm into a fan of ghost hands. The
      copy flips one header bit per frame to DO-NOT-BLEND; no pixel is touched
      and no re-encode happens. The original is left exactly as delivered.

      `staticSrc` is frame 0 (standing, arms down), shown instead of the
      animation when the visitor prefers reduced motion - browsers do not pause
      animated WebP on their own.
    */
    poses: {
      idle: {
        src: "/avatar/aruthra-avatar-final-noblend.webp",
        staticSrc: "/avatar/aruthra-avatar-static.webp",
      },
    },
    clips: {},
    motion: false,
    aspect: "640 / 1138",
    alt: "Animated avatar of Aruthra Sathish Kumar waving",
  },
};

export const identity = {
  lead: "Software Engineer and AI/ML Researcher",
  /*
    Each paragraph is either a plain string or an array of segments. A segment
    written as `{ mark: "..." }` is the same text, flagged for the purple
    highlight in About.js - the wording is untouched, only split so the two
    phrases can be wrapped.
  */
  body: [
    [
      "Recent M.S. graduate from George Mason University with a 3.97/4.0 GPA, recognized with the ",
      { mark: "Academic Excellence Award (2026)" },
      ". I enjoy building scalable backend and distributed systems, while exploring how AI and machine learning can make software more intelligent.",
    ],
    [
      "Currently, I'm working on ",
      { mark: "AI/ML research at American University" },
      ", where I work with large language models and applied machine learning.",
    ],
    "I love solving problems where software, scale, and intelligence come together. Outside of coding, you'll probably find me playing chess \u265F\uFE0F, exploring new technology, or getting completely absorbed in learning something new.",
  ],
  pillars: [
    {
      id: "backend",
      icon: "server",
      title: "Backend & Distributed Systems",
      description: "Build scalable, reliable systems.",
    },
    {
      id: "ai",
      icon: "brain",
      title: "Applied AI & Machine Learning",
      description: "Build intelligent systems with AI.",
    },
    {
      id: "cloud",
      icon: "cloud",
      title: "Cloud & Systems",
      description: "Design infrastructure that scales.",
    },
  ],
};

export const experiences = [
  {
    id: "american-university",
    org: "American University",
    role: "AI / ML Research Intern",
    period: "Jul 2026 - Present",
    type: "Machine Learning / NLP Research",
    logo: "/images/logos/american-university.png",
    monogram: "AU",
    current: true,
    summary:
      "CAM-Soft: scalable multimodal fusion for soft hate speech detection via camouflaged-implicature modeling and counterfactual invariance.",
    bullets: [
      "ARCHITECTED dual-pathway hate speech detection in PyTorch → harmonized 147K posts across seven benchmarks.",
      "FINE-TUNED NV-Embed-v2 with PEFT LoRA → achieved 0.835 macro-F1 across five benchmarks.",
      "BUILT cached Llama-3.1-8B reasoning pipeline → extracted pragmatic features from 140K+ posts.",
      "ENGINEERED implicature gap & camouflage scoring → modeled differences between literal and implied meaning.",
      "FUSED 6 semantic & pragmatic signals with multi-head cross-attention → improved macro-F1 from 0.7504 to 0.7854.",
      "DEVELOPED a dynamic coded-term inventory → tracked emerging coded language across communities and time.",
    ],
    tech: [
      "Python",
      "PyTorch",
      "Hugging Face",
      "Llama 3.1 8B",
      "NV-Embed-v2",
      "LoRA / PEFT",
      "Distributed GPU",
    ],
    metrics: [
      { value: "6", label: "datasets harmonized" },
      { value: "8B", label: "parameter LLM adapted", animate: false },
      { value: "2", label: "representation paths fused" },
    ],
  },
  {
    id: "george-mason-university",
    org: "George Mason University",
    role: "Graduate Teaching Assistant",
    context: "IT 207 - Applied IT Programming (Server-Side Development)",
    period: "Aug 2025 - May 2026",
    type: "Backend Engineering Instruction",
    logo: "/images/logos/george-mason-university.png",
    monogram: "GMU",
    current: false,
    summary:
      "Taught server-side development, REST API design, and SQL to undergraduate students.",
    bullets: [
      "MENTORED 100+ students on Node.js, SQL, and distributed systems → improved lab completion & pass rates.",
      "TRAINED students to build SQL-based backend services → 30% fewer runtime failures.",
      "LED weekly coding & debugging labs on RESTful service design → enabled students to build backend services.",
    ],
    tech: ["Node.js", "REST APIs", "SQL", "Debugging", "Code Review"],
    metrics: [
      { value: "100+", label: "students supported" },
      { value: "20%", label: "higher lab completion" },
      { value: "30%", label: "fewer runtime failures" },
    ],
  },
  {
    id: "verzeo-edutech",
    org: "Verzeo Edutech",
    role: "Software Engineer Intern",
    period: "Dec 2022 - Jan 2023",
    type: "Full-Stack Engineering",
    logo: "/images/logos/verzeo.png",
    logoScale: 1.45,
    monogram: "VZ",
    current: false,
    summary:
      "Built and optimized full-stack features on an e-learning platform serving 1K+ students.",
    bullets: [
      "BUILT full-stack features (React + Django) → supported 1K+ students accessing courses & assessments smoothly.",
      "DESIGNED focused REST API layer for course/progress data → 40% fewer client calls & 25% faster page loads.",
      "RESOLVED login failures with OAuth2 + OpenAthens SSO → 45% fewer auth issues during peak hours.",
      "OPTIMIZED relational schemas for courses, users & attempts → reduced heavy query latency by 30–45%.",
      "STANDARDIZED cursor pagination & server-side joins in REST layer → 60% fewer DB round-trips during peak traffic.",
      "COLLABORATED with engineers via code reviews & Git workflows → improved API consistency & codebase quality.",
    ],
    tech: ["React", "Django", "REST APIs", "OAuth2 / SSO", "SQL", "Git"],
    metrics: [
      { value: "45%", label: "fewer auth issues" },
      { value: "60%", label: "fewer DB round trips" },
      { value: "40%", label: "fewer client calls" },
    ],
  },
];

export const projects = [
  {
    id: "watchtower-mcp-server",
    summary: "Claude Desktop drives 12 MCP tools to triage and safely remediate Kubernetes incidents.",
    // Cover art: the real screenshot shown at the top of the project card.
    image: "/images/projects/watchtower.png",
    imageAlt: "WatchTower project cover",
    visualType: "incident-console",
    shortTitle: "WatchTower",
    title: "WatchTower - MCP Server for Incident Response",
    category: "AI Infrastructure",
    accent: "violet",
    featured: true,
    problem:
      "Production incidents burn engineer hours on manual correlation across logs, metrics, deploys, and alerts before anyone can act.",
    description:
      "An agentic AI incident response platform where Claude Desktop orchestrates 12 MCP tools to investigate, diagnose, and safely remediate production outages across Kubernetes infrastructure - with cryptographic human-in-the-loop approval and auto-generated postmortems.",
    tech: [
      "Python",
      "MCP",
      "PostgreSQL + pgvector",
      "Kubernetes",
      "Prometheus",
      "Loki",
      "Terraform",
    ],
    metrics: [
      { value: "6x", label: "faster incident triage" },
      { value: "12", label: "MCP tools exposed" },
      { value: "4", label: "live data sources" },
    ],
    flow: [
      { id: "claude", label: "Claude Desktop", meta: "Agent" },
      { id: "mcp", label: "MCP Server", meta: "12 tools" },
      { id: "collectors", label: "Collectors", meta: "GitHub, K8s, Slack, PagerDuty" },
      { id: "store", label: "Event Store", meta: "Postgres + pgvector" },
      { id: "rank", label: "Suspect Ranking", meta: "Correlation" },
      { id: "approval", label: "Approval Broker", meta: "HMAC gated" },
      { id: "remediate", label: "K8s Remediation", meta: "Runbooks" },
    ],
    note: "Every AI-initiated action is gated behind an HMAC-signed human approval before it reaches the cluster.",
    architecture:
      "Claude Desktop to MCP Server to Event Store, fed by collectors (GitHub, Kubernetes, Slack, PagerDuty), then runbooks with HMAC approval and safe remediation.",
    github:
      "https://github.com/aruthrasathish/Watchtower-MCP-server-for-incident-response",
  },
  {
    id: "realtime-search-ranking",
    summary: "Reorders search results in real time from live clickstream data.",
    // Cover art: the real screenshot shown at the top of the project card.
    image: "/images/projects/realtime-search-ranking.png",
    imageAlt: "Real-Time Search Ranking System project cover",
    visualType: "search-ranking",
    shortTitle: "Real-Time Search Ranking",
    title: "Real-Time Search Ranking System",
    category: "Distributed Systems",
    accent: "cyan",
    featured: true,
    problem:
      "Static relevance ordering ignores what users are clicking on right now, so search results go stale within minutes.",
    description:
      "A production-style real-time ranking system that processes clickstream data using Kafka, Flink, and Redis to dynamically reorder search results based on live user behavior.",
    tech: ["Node.js", "Kafka", "Apache Flink", "Redis", "Distributed Systems", "A/B Testing"],
    metrics: [
      { value: "1K+", label: "events/min processed" },
      { value: "<50ms", label: "search latency" },
      { value: "30%", label: "relevance lift (CTR A/B)" },
    ],
    flow: [
      { id: "browser", label: "Clickstream", meta: "Browser events" },
      { id: "api", label: "Collection API", meta: "Node.js" },
      { id: "kafka", label: "Kafka", meta: "Event log" },
      { id: "flink", label: "Flink", meta: "Windowed aggregation" },
      { id: "redis", label: "Redis", meta: "Sorted sets" },
      { id: "search", label: "Search API", meta: "Ranked results" },
    ],
    note: "Ranking signals are recomputed in streaming windows, so the ordering reflects behaviour from seconds ago, not from the last batch job.",
    architecture:
      "Browser to Collection API to Kafka to Flink to Redis to Search API, returning ranked results.",
    github: "https://github.com/aruthrasathish/Real-time-Search-Ranking-System",
  },
  {
    id: "usda-chatbot",
    summary: "Natural-language search across 176 USDA programs with citation-backed answers.",
    // Cover art: the real screenshot shown at the top of the project card.
    image: "/images/projects/usda-ai-chatbot.png",
    imageAlt: "USDA Rural Development AI Assistant project cover",
    visualType: "rag-assistant",
    shortTitle: "USDA AI Assistant",
    title: "USDA Rural Development AI Assistant",
    category: "RAG System",
    accent: "emerald",
    featured: true,
    problem:
      "Rural applicants could not find which of 176 federal programs they qualified for without reading dense policy documents end to end.",
    description:
      "A retrieval-augmented generation system that enables natural language discovery of 176 USDA Rural Development programs using semantic search over BGE embeddings and grounded, citation-backed answers.",
    tech: [
      "React",
      "Tailwind",
      "FastAPI",
      "Python",
      "BGE Embeddings",
      "FAISS",
      "Mistral 7B (Ollama)",
      "PostgreSQL",
    ],
    metrics: [
      { value: "176", label: "federal programs indexed" },
      { value: "90s to 8s", label: "response time", animate: false },
      { value: "100%", label: "answers grounded in retrieval" },
    ],
    flow: [
      { id: "query", label: "User Query", meta: "Natural language" },
      { id: "embed", label: "BGE Embeddings", meta: "Vectorize" },
      { id: "faiss", label: "FAISS", meta: "Semantic search" },
      { id: "programs", label: "Retrieved Programs", meta: "Top-k context" },
      { id: "llm", label: "Mistral 7B", meta: "Ollama" },
      { id: "answer", label: "Grounded Answer", meta: "Cited programs" },
    ],
    note: "The model only answers from retrieved program documents, so every response traces back to a specific USDA program.",
    architecture:
      "User to FastAPI to BGE embeddings to FAISS retrieval to Mistral 7B on Ollama, with PostgreSQL persistence and a React UI.",
    github: "https://github.com/aruthrasathish/usda-chatbot",
  },
  {
    id: "voice-qa",
    summary: "Multilingual anonymous Q&A for live events, with voice questions and live voting.",
    // Cover art: the real screenshot shown at the top of the project card.
    image: "/images/projects/SpeakUp.png",
    imageAlt: "SpeakUp project cover",
    visualType: "live-qa",
    shortTitle: "SpeakUp",
    title: "SpeakUp - Anonymous Voice Q&A Platform",
    category: "Real-Time Systems",
    accent: "indigo",
    featured: true,
    problem:
      "Live event Q&A breaks down at scale: audiences self-censor, and hosts have no way to surface the questions that matter across languages.",
    description:
      "A multilingual anonymous Q&A platform for live events with text and voice questions, live voting, polls, host moderation, and real-time synchronization across every connected client.",
    tech: [
      "Next.js 14",
      "Fastify",
      "PostgreSQL",
      "Redis",
      "Kafka",
      "Socket.io",
      "Groq Whisper",
      "DeepL",
    ],
    metrics: [
      { value: "500+", label: "concurrent users per room" },
      { value: "<100ms", label: "vote sync latency" },
      { value: "99+", label: "languages transcribed" },
    ],
    flow: [
      { id: "browser", label: "Browser", meta: "Next.js client" },
      { id: "api", label: "Fastify API", meta: "REST + WS" },
      { id: "kafka", label: "Kafka", meta: "Voice pipeline" },
      { id: "ai", label: "Whisper / DeepL", meta: "Transcribe + translate" },
      { id: "data", label: "Postgres + Redis", meta: "State + cache" },
      { id: "sync", label: "Socket.io", meta: "Live sync" },
    ],
    note: "Voice questions are pushed through Kafka so transcription and translation never block the real-time vote channel.",
    architecture:
      "Browser to Fastify API to Kafka voice pipeline, through Groq Whisper and DeepL, into PostgreSQL and Redis, then Socket.io live sync.",
    github: "https://github.com/aruthrasathish/anonymous-voice-QA-platform",
  },
  {
    id: "cnn-gru-predictor",
    summary: "Predicts student risk and grades from LMS activity with a multi-task CNN-GRU.",
    // Cover art: the real screenshot shown at the top of the project card.
    image: "/images/projects/Academic-performance-predictor.png",
    imageAlt: "Academic Performance Predictor project cover",
    visualType: "ml-dashboard",
    shortTitle: "CNN-GRU Predictor",
    title: "Academic Performance Intelligence System",
    category: "Deep Learning",
    accent: "violet",
    featured: false,
    problem:
      "At-risk students are usually identified after they have already failed an assessment.",
    description:
      "A multi-task CNN-GRU model that predicts student risk and grades from sequential behavioural data captured in LMS activity logs.",
    tech: ["PyTorch", "Scikit-learn", "Pandas", "MLflow", "Plotly"],
    metrics: [
      { value: "88.9%", label: "risk prediction accuracy" },
      { value: "59%", label: "lower error vs baseline" },
    ],
    flow: [
      { id: "data", label: "LMS Data", meta: "Activity logs" },
      { id: "features", label: "Feature Pipeline", meta: "Sequential" },
      { id: "cnn", label: "CNN", meta: "Local patterns" },
      { id: "gru", label: "GRU + Attention", meta: "Temporal" },
      { id: "out", label: "Risk + Grade", meta: "Multi-task" },
    ],
    architecture:
      "LMS data to feature pipeline to CNN to GRU with attention, producing risk and grade outputs on a dashboard.",
    github:
      "https://github.com/aruthrasathish/academic-performance-predictor-CNN-GRU",
  },
  {
    id: "url-shortener",
    summary: "URL shortener with cache-aside redirects and asynchronous click analytics.",
    // Cover art: the real screenshot shown at the top of the project card.
    image: "/images/projects/pathly.png",
    imageAlt: "Pathly project cover",
    visualType: "link-redirect",
    shortTitle: "Pathly",
    title: "Pathly - URL Shortener",
    category: "Backend Systems",
    accent: "cyan",
    featured: false,
    problem:
      "Redirects sit on the hot path of every click, so any database read on redirect becomes the bottleneck.",
    description:
      "A production-ready URL shortener with custom short links, click analytics, and a secure dashboard built on a cache-aside Redis layer.",
    tech: ["React", "FastAPI", "Redis", "MySQL", "JWT", "Cache-Aside"],
    metrics: [
      { value: "<1ms", label: "cached redirects" },
      { value: "100%", label: "clicks tracked async" },
    ],
    flow: [
      { id: "client", label: "Client", meta: "React + JWT" },
      { id: "api", label: "FastAPI", meta: "Redirect service" },
      { id: "redis", label: "Redis", meta: "Cache-aside" },
      { id: "mysql", label: "MySQL", meta: "Source of truth" },
      { id: "analytics", label: "Analytics", meta: "Background tasks" },
    ],
    architecture:
      "Authenticated React dashboard to FastAPI, reading through a Redis cache-aside layer over MySQL, with background-task analytics.",
    github: "https://github.com/aruthrasathish/url-shortener",
  },
  {
    id: "job-tracker",
    summary: "Turns application tracking into funnel analytics, fed by a Chrome extension.",
    // Cover art: the real screenshot shown at the top of the project card.
    image: "/images/projects/careerlens.png",
    imageAlt: "CareerLens project cover",
    visualType: "job-funnel",
    shortTitle: "CareerLens",
    title: "CareerLens - Job Search Intelligence Platform",
    category: "Full-Stack",
    accent: "emerald",
    featured: false,
    problem:
      "Application tracking spreadsheets tell you what you applied to, not where your funnel is actually failing.",
    description:
      "A job search intelligence platform that turns application tracking into funnel analytics, with a Chrome Extension that captures postings automatically.",
    tech: [
      "React",
      "FastAPI",
      "PostgreSQL",
      "JWT",
      "Google OAuth",
      "Recharts",
      "Chrome Extension",
    ],
    metrics: [
      { value: "60%", label: "less manual entry" },
      { value: "<1s", label: "SQL funnel aggregations" },
    ],
    flow: [
      { id: "ext", label: "Chrome Extension", meta: "Auto-capture" },
      { id: "api", label: "FastAPI", meta: "JWT + OAuth" },
      { id: "db", label: "PostgreSQL", meta: "Applications" },
      { id: "agg", label: "Analytics API", meta: "SQL aggregation" },
      { id: "ui", label: "Dashboard", meta: "Recharts" },
    ],
    architecture:
      "React client to FastAPI with JWT and Google OAuth, over PostgreSQL, exposing analytics endpoints that the Chrome Extension also calls.",
    github: "https://github.com/aruthrasathish/job-application-tracker",
  },
];

// Skills are tied to evidence, not to invented proficiency percentages.
// `used` entries that match a project id resolve to that project's shortTitle.
// Each cluster id is also a filter id: selecting a filter shows exactly the one
// cluster whose id matches, so no card ever appears under two categories.
/**
 * Skills.
 *
 * A flat list so the section can filter by category without nesting. Every
 * entry is backed by something already in this file - a project's tech list,
 * an experience, or a certification. Nothing aspirational is listed here.
 *
 * `category` is a single id, or an array of ids for a skill that genuinely
 * belongs to more than one area (Python). One object per skill either way, so
 * the All tab never shows the same card twice.
 *
 * `level` is a self-assessment on a deliberately conservative scale:
 *   90-95  core, used daily across most of the work here
 *   85-88  strong working command, used end to end on several projects
 *   78-84  solid, shipped in production-style work
 *   70-77  comfortable, used on one project or at certification depth
 *   below  working familiarity, still building depth
 */
export const skillFilters = [
  { id: "all", label: "All" },
  { id: "frontend", label: "Frontend" },
  { id: "backend", label: "Backend" },
  { id: "ai", label: "AI / ML" },
  { id: "tools", label: "Tools" },
];

export const skills = [
  // Frontend
  { name: "HTML/CSS", category: "frontend", level: 90 },
  { name: "JavaScript", category: "frontend", level: 90 },
  { name: "ReactJS", category: "frontend", level: 95 },
  { name: "TypeScript", category: "frontend", level: 85 },
  { name: "React Native", category: "frontend", level: 80 },
  { name: "TailwindCSS", category: "frontend", level: 80 },
  { name: "Next.js", category: "frontend", level: 85 },

  // Backend & distributed systems.
  // Python carries both categories rather than being duplicated - see the
  // note above `category` for how the filter reads it.
  { name: "Python", category: ["backend", "ai"], level: 90 },
  { name: "FastAPI", category: "backend", level: 85 },
  { name: "Java", category: "backend", level: 85 },
  { name: "REST & WebSockets", category: "backend", level: 84 },
  { name: "PostgreSQL", category: "backend", level: 82 },
  { name: "Redis", category: "backend", level: 82 },
  { name: "Node.js", category: "backend", level: 80 },
  { name: "Kafka", category: "backend", level: 78 },
  { name: "MySQL", category: "backend", level: 76 },
  { name: "Socket.io", category: "backend", level: 76 },
  { name: "C / C++", category: "backend", level: 75 },
  { name: "Fastify", category: "backend", level: 74 },
  { name: "Apache Flink", category: "backend", level: 72 },
  { name: "MongoDB", category: "backend", level: 68 },
  { name: "Django", category: "backend", level: 66 },

  // AI / ML
  { name: "Prompt Engineering", category: "ai", level: 85 },
  { name: "Natural Language Processing (NLP)", category: "ai", level: 85 },
  { name: "Machine Learning (General)", category: "ai", level: 85 },
  { name: "RAG pipelines", category: "ai", level: 84 },
  { name: "LLM integration", category: "ai", level: 82 },
  { name: "Pandas & NumPy", category: "ai", level: 82 },
  { name: "PyTorch", category: "ai", level: 80 },
  { name: "Embeddings & FAISS", category: "ai", level: 80 },
  { name: "AI Agents (Multi-Agent Systems)", category: "ai", level: 80 },
  { name: "scikit-learn", category: "ai", level: 78 },
  { name: "Hugging Face", category: "ai", level: 76 },
  { name: "MCP & pgvector", category: "ai", level: 76 },
  { name: "Speech & translation APIs", category: "ai", level: 72 },
  { name: "LoRA / PEFT", category: "ai", level: 70 },
  { name: "MLflow", category: "ai", level: 66 },

  // Tooling, cloud & delivery
  { name: "Git & GitHub", category: "tools", level: 86 },
  { name: "Docker", category: "tools", level: 80 },
  { name: "GitHub Actions & CI/CD", category: "tools", level: 78 },
  { name: "AWS", category: "tools", level: 74 },
  { name: "Kubernetes", category: "tools", level: 72 },
  { name: "Azure", category: "tools", level: 70 },
  { name: "Prometheus & Loki", category: "tools", level: 70 },
  { name: "Terraform", category: "tools", level: 68 },
];

export const education = [
  {
    id: "gmu-msis",
    degree: "Master of Science - Information Systems",
    school: "George Mason University",
    dates: "Aug 2024 - May 2026",
    logo: "/images/logos/george-mason-university.png",
    monogram: "GMU",
    isCurrent: true,
    summary:
      "Graduate program focused on backend systems, distributed computing, data engineering, and AI/ML applications.",
    credentials: [
      { value: "3.97 / 4.00", label: "GPA" },
      { value: "Academic Excellence Award", label: "Recognition" },
    ],
    highlights: [
      "Projects in distributed systems, RAG platforms, and cloud-native services",
      "Emphasis on software architecture, data modeling, and cloud infrastructure",
    ],
  },
  {
    id: "anna-btech-it",
    degree: "Bachelor of Technology - Information Technology",
    school: "Anna University",
    dates: "Aug 2020 - May 2024",
    logo: "/images/logos/anna-university-tight.png",
    monogram: "AU",
    isCurrent: false,
    summary:
      "Undergraduate foundation in algorithms, data structures, networking, databases, and full-stack development.",
    credentials: [],
    highlights: [],
  },
];

// Awards & Recognition. Its own section, between Projects and Certifications.
// The card's left panel is a photo container. Set `image` to the real
// photograph to fill it; until then it renders a neutral photo placeholder.
export const awards = [
  {
    id: "academic-excellence",
    title: "Academic Excellence Award",
    issuer: "George Mason University",
    monogram: "GMU",
    year: "2026",
    program: "M.S. Information Systems",
    description:
      "Recognized for outstanding academic performance in the M.S. Information Systems program at George Mason University.",
    image: "/images/awards/award.jpeg",
    imageAlt: "George Mason University Academic Excellence Award",
    // Supporting context only - the GPA is evidence for the award, not the award.
    supporting: [
      { value: "3.97 / 4.00", label: "Cumulative GPA" },
      { value: "M.S. Information Systems", label: "Program" },
      { value: "2026", label: "Year awarded" },
    ],
  },
];

export const certifications = [
  {
    id: "aws-data-eng",
    title: "AWS Academy - Data Engineering",
    provider: "Amazon Web Services",
    level: "TRAINED",
    date: "December 2024",
    description:
      "Data pipelines, ETL workflows, distributed data processing, and cloud-native data engineering patterns.",
    skills: ["AWS Cloud", "Data Pipelines", "ETL"],
    badgeImage: "/images/certifications/aws-data-engineering.png",
    verifyUrl:
      "https://www.credly.com/badges/7065b005-0db8-4d54-a9db-3624b5726dd5/public_url",
  },
  {
    id: "azure-fundamentals",
    title: "Microsoft Certified - Azure Fundamentals (AZ-900)",
    provider: "Microsoft",
    level: "CERTIFIED",
    date: "February 2025",
    description:
      "Cloud architecture, security, compute, storage, networking, governance, and cost modeling on Azure.",
    skills: ["Azure", "Cloud Fundamentals", "Security"],
    badgeImage: "/images/certifications/microsoft-certified-fundamentals-badge.svg",
    verifyUrl:
      "https://learn.microsoft.com/en-us/users/aruthras-1156/credentials/e421509f05843a92?ref=https%3A%2F%2Fwww.linkedin.com%2F",
  },
];

export const contact = {
  email: "aruthra.sathish@gmail.com",
  linkedin: "https://www.linkedin.com/in/aruthrasathish",
  github: "https://github.com/aruthrasathish",
  location: "United States",
  cta: "Open to backend, distributed systems, infrastructure and applied AI/ML roles. Say hello.",
};

export const footer = {
  name: "Aruthra Sathish Kumar",
};
