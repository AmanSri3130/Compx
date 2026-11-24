import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting CompX Database Seeding...");

  // 1. Seed Site Settings
  console.log("⚙️ Seeding Site Settings...");
  await prisma.siteSetting.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      siteName: "CompX",
      tagline: "Study smart. Score higher.",
      upiId: "compx@upi",
      upiPayeeName: "CompX Education",
      upiQrImageUrl: "/images/sample-upi-qr.png",
      whatsappNumber: "919876543210",
      whatsappWelcomeMsg: "Hello CompX Team! I want to inquire about notes or confirm my payment.",
      razorpayEnabled: false,
      freeNotesRequireLogin: false,
      enableWatermark: true,
      signedUrlExpiryMinutes: 60,
      maintenanceMode: false,
      contactEmail: "support@compx.in",
      contactPhone: "+91 98765 43210",
      telegramGroupUrl: "https://t.me/compx_notes",
      whatsappCommunityUrl: "https://chat.whatsapp.com/compx",
      instagramUrl: "https://instagram.com/compx_notes",
      youtubeUrl: "https://youtube.com/@compx_notes",
      noticeBarText: "🎉 Big Exam Season Sale: Use coupon 'COMPX50' for flat 50% discount on all Entrance & Govt Exam Notes!",
      noticeBarEnabled: true,
    },
  });

  // 2. Seed Users (Super Admin, Admin, Student)
  console.log("👤 Seeding Users...");
  const superAdminPassword = await bcrypt.hash("SuperAdmin@123", 10);
  const adminPassword = await bcrypt.hash("AdminPassword@123", 10);
  const studentPassword = await bcrypt.hash("Student@123", 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@compx.in" },
    update: {},
    create: {
      name: "Super Administrator",
      email: "superadmin@compx.in",
      password: superAdminPassword,
      phone: "+91 99999 00001",
      role: "SUPER_ADMIN",
      permissions: JSON.stringify(["all"]),
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@compx.in" },
    update: {},
    create: {
      name: "Academic Manager",
      email: "admin@compx.in",
      password: adminPassword,
      phone: "+91 99999 00002",
      role: "ADMIN",
      permissions: JSON.stringify(["manage_notes", "manage_orders", "manage_cms", "view_revenue"]),
    },
  });

  const student = await prisma.user.upsert({
    where: { email: "student@compx.in" },
    update: {},
    create: {
      name: "Aarav Sharma",
      email: "student@compx.in",
      password: studentPassword,
      phone: "+91 98765 12345",
      role: "STUDENT",
      permissions: JSON.stringify([]),
    },
  });

  // 3. Seed Category Hierarchy
  console.log("📚 Seeding Categories and Sub-categories...");
  
  // Top Level Categories
  const categoriesData = [
    {
      name: "School",
      slug: "school",
      description: "Class 6 to Class 12 CBSE, ICSE and State Board handwritten & topper notes",
      icon: "GraduationCap",
      order: 1,
      children: [
        { name: "Class 10 Board", slug: "class-10", description: "CBSE & State Board Class 10 full syllabus revision notes" },
        { name: "Class 12 Science (PCM/PCB)", slug: "class-12-science", description: "Physics, Chemistry, Maths & Biology Topper Notes" },
        { name: "Class 12 Commerce", slug: "class-12-commerce", description: "Accountancy, Business Studies, Economics notes" },
        { name: "Class 9", slug: "class-9", description: "Complete Class 9 foundation study materials" },
        { name: "Class 11 Science", slug: "class-11-science", description: "Concept builders for 11th grade and competitive foundation" },
      ],
    },
    {
      name: "Engineering & Medical Entrance",
      slug: "engineering-medical-entrance",
      description: "Formula sheets, rapid revision and short notes for JEE, NEET, BITSAT",
      icon: "Atom",
      order: 2,
      children: [
        { name: "JEE Main & Advanced", slug: "jee-main-advanced", description: "Kota faculty handwritten notes, physics formulas, chemistry reaction charts" },
        { name: "NEET UG", slug: "neet-ug", description: "NCERT line-by-line biology diagrams, mindmaps and rapid revision" },
        { name: "BITSAT", slug: "bitsat", description: "High-yield speed booster notes & English proficiency" },
        { name: "CUET UG", slug: "cuet-ug", description: "Domain specific notes + General test preparation" },
      ],
    },
    {
      name: "Government & Civil Services",
      slug: "government-civil-services",
      description: "UPSC CSE, State PSC, SSC CGL, Banking, Railways & Defence exams",
      icon: "Landmark",
      order: 3,
      children: [
        { name: "UPSC Civil Services (IAS/IPS)", slug: "upsc-cse", description: "Prelims GS Paper 1 & 2 (CSAT), Mains GS 1-4, Topper mindmaps" },
        { name: "SSC (CGL, CHSL, MTS)", slug: "ssc-exams", description: "Quantitative aptitude tricks, English grammar rules, Static GK capsules" },
        { name: "Banking (IBPS, SBI, RBI)", slug: "banking-exams", description: "Banking awareness, reasoning shortcuts, financial current affairs" },
        { name: "Defence (NDA, CDS, AFCAT)", slug: "defence-exams", description: "NDA Maths shortcuts, CDS General Knowledge, Agniveer modules" },
        { name: "State PSC (UPPSC, BPSC, MPPSC)", slug: "state-psc", description: "State special GK, history, polity & current affairs" },
      ],
    },
    {
      name: "B.Tech (All Branches)",
      slug: "btech-engineering",
      description: "University semester notes, pyqs, coding notes across all engineering branches",
      icon: "Cpu",
      order: 4,
      children: [
        { name: "CSE & IT", slug: "btech-cse-it", description: "DSA, Operating Systems, DBMS, Computer Networks, System Design" },
        { name: "AI & Data Science", slug: "btech-ai-ds", description: "Machine Learning, Python, Neural Networks, Deep Learning notes" },
        { name: "ECE & EEE", slug: "btech-ece-eee", description: "Signals & Systems, Digital Electronics, Microprocessors, Control Systems" },
        { name: "Mechanical Engineering", slug: "btech-mechanical", description: "Thermodynamics, Fluid Mechanics, TOM, SOM handwritten formulas" },
        { name: "Civil Engineering", slug: "btech-civil", description: "Structural Analysis, Geotechnical, Surveying, RCC design" },
      ],
    },
    {
      name: "Graduation & Masters",
      slug: "graduation-masters",
      description: "BCA, MCA, BBA, MBA, B.Com and B.Sc semester-wise study material",
      icon: "BookOpen",
      order: 5,
      children: [
        { name: "BCA & MCA", slug: "bca-mca", description: "Computer Applications, C++, Web Dev, Software Engineering" },
        { name: "BBA & MBA", slug: "bba-mba", description: "Marketing Management, Financial Management, Organizational Behavior" },
        { name: "B.Com", slug: "bcom", description: "Financial Accounting, Corporate Law, Cost & Management Accounting" },
      ],
    },
    {
      name: "More Competitive Exams",
      slug: "more-competitive-exams",
      description: "GATE, CAT, UGC NET/JRF and management aptitude notes",
      icon: "Award",
      order: 6,
      children: [
        { name: "GATE CS/IT", slug: "gate-cs", description: "GATE Computer Science subject-wise notes and solved formula booklets" },
        { name: "CAT & Management", slug: "cat-mba", description: "VARC strategies, DILR puzzles, Quant formula cheat-sheets" },
        { name: "UGC NET / JRF", slug: "ugc-net", description: "Paper 1 teaching aptitude and higher education system" },
      ],
    },
  ];

  const categoryMap = {};

  for (const parent of categoriesData) {
    const parentRecord = await prisma.category.upsert({
      where: { slug: parent.slug },
      update: {
        name: parent.name,
        description: parent.description,
        icon: parent.icon,
        order: parent.order,
      },
      create: {
        name: parent.name,
        slug: parent.slug,
        description: parent.description,
        icon: parent.icon,
        order: parent.order,
        showOnHome: true,
      },
    });

    categoryMap[parent.slug] = parentRecord.id;

    for (let i = 0; i < parent.children.length; i++) {
      const child = parent.children[i];
      const childRecord = await prisma.category.upsert({
        where: { slug: child.slug },
        update: {
          name: child.name,
          description: child.description,
          parentId: parentRecord.id,
          order: i + 1,
        },
        create: {
          name: child.name,
          slug: child.slug,
          description: child.description,
          parentId: parentRecord.id,
          order: i + 1,
          showOnHome: true,
        },
      });
      categoryMap[child.slug] = childRecord.id;
    }
  }

  // 4. Seed Notes (Sample notes across Free & Paid)
  console.log("📝 Seeding High-Yield Notes...");

  const notesData = [
    {
      title: "Class 10 Science: Complete Handwritten Topper Notes (Physics + Chemistry + Biology)",
      slug: "class-10-science-complete-handwritten-topper-notes",
      shortDescription: "Color-coded, diagram-rich handwritten notes curated by 98% CBSE Board Toppers. Covers full NCERT with solved exemplars and formula cheat sheet.",
      fullDescription: `
        <h3>Master Class 10 Science in 30 Days!</h3>
        <p>This premium collection includes comprehensive, color-coded handwritten notes designed specifically for CBSE and State Board Class 10 students aiming for 95%+ marks.</p>
        <h4>Key Highlights:</h4>
        <ul>
          <li><strong>Physics:</strong> Light (Reflection & Refraction), Human Eye, Electricity, Magnetic Effects with ray diagrams and solved numericals.</li>
          <li><strong>Chemistry:</strong> Chemical Reactions, Acids Bases & Salts, Metals & Non-metals, Carbon & its Compounds with reaction balance tricks.</li>
          <li><strong>Biology:</strong> Life Processes, Control & Coordination, How do Organisms Reproduce, Heredity with neat labeled diagrams.</li>
        </ul>
        <p>Includes past 10 years high-frequency board questions with model answers.</p>
      `,
      coverImage: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80",
      price: 149,
      mrp: 399,
      isFree: false,
      categoryId: categoryMap["class-10"] || categoryMap["school"],
      subCategory: "CBSE Class 10",
      subject: "Science",
      classLevel: "Class 10",
      pagesCount: 184,
      language: "English & Hinglish",
      author: "Er. Ramesh Verma (Ex-Allen Faculty)",
      fileSize: "28.4 MB",
      format: "PDF",
      syllabus: "CBSE Latest 2026 Curriculum & NCERT Based",
      whatsIncluded: JSON.stringify([
        "184 Pages of High-Definition Handwritten Notes",
        "Physics Formula Cheat Sheet (1-page rapid revision)",
        "Organic Chemistry Reaction Balancing Chart",
        "Top 100 Repeated Board Exam Numerical Questions",
        "Printable A4 format with margins for self-notes"
      ]),
      tags: "Class 10, Science, Physics, Chemistry, Biology, Board Exam, CBSE, Topper Notes",
      difficulty: "Exam-Oriented",
      editionYear: "2026 Edition",
      isFeatured: true,
      isTrending: true,
      isBestSeller: true,
      pdfPath: "/storage/sample-pdfs/class10-science-topper-notes.pdf",
      previewPdfPath: "/storage/previews/class10-science-sample.pdf",
      viewsCount: 2480,
      downloadsCount: 620,
      salesCount: 412,
    },
    {
      title: "JEE Main Physics: Formula Bible & Shortcut Techniques (Mechanics to Modern Physics)",
      slug: "jee-main-physics-formula-bible-shortcuts",
      shortDescription: "Every single formula, condition, and trick required for JEE Main & BITSAT Physics. Designed for rapid revision 24 hours before the exam.",
      fullDescription: `
        <h3>Score 80+ in JEE Main Physics Guaranteed!</h3>
        <p>Curated by Kota senior faculty members with over 15 years of mentoring top 100 AIR rankers. Contains all critical definitions, unit conversions, limiting cases, and graphical insights.</p>
        <h4>Topics Covered:</h4>
        <ul>
          <li>Kinematics, NLM, Friction, Work Power Energy, Center of Mass & Rotational Dynamics</li>
          <li>Gravitation, SHM, Waves, Fluids & Heat Thermodynamics</li>
          <li>Electrostatics, Current Electricity, Magnetism & EMI/AC</li>
          <li>Optics (Wave & Ray), Semiconductor devices & Modern Physics</li>
        </ul>
      `,
      coverImage: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=800&q=80",
      price: 99,
      mrp: 299,
      isFree: false,
      categoryId: categoryMap["jee-main-advanced"] || categoryMap["engineering-medical-entrance"],
      subCategory: "JEE Main",
      subject: "Physics",
      classLevel: "Class 11 & 12 / Dropper",
      pagesCount: 92,
      language: "English",
      author: "Prof. Alok Gupta (Kota Physics Mentor)",
      fileSize: "16.8 MB",
      format: "PDF",
      syllabus: "NTA JEE Main Latest Pattern",
      whatsIncluded: JSON.stringify([
        "92 Pages Complete Physics Formula Sheets",
        "Special 'Common Traps' section highlighting negative marking mistakes",
        "Shortcut derivation approximations for speed solving",
        "Dimensional analysis quick verification methods"
      ]),
      tags: "JEE Main, Physics, Formula Sheet, BITSAT, Shortcuts, Kota Notes",
      difficulty: "Exam-Oriented",
      isFeatured: true,
      isTrending: true,
      isBestSeller: true,
      pdfPath: "/storage/sample-pdfs/jee-physics-formula-bible.pdf",
      viewsCount: 4120,
      downloadsCount: 1100,
      salesCount: 890,
    },
    {
      title: "FREE: Class 10 Maths All Formulas & Theorem Proofs Booklet",
      slug: "free-class-10-maths-all-formulas-theorems",
      shortDescription: "Complete formula booklet for CBSE Class 10 Mathematics Standard & Basic. Completely FREE for all students.",
      fullDescription: `
        <h3>100% Free Class 10 Maths Quick Revision Booklet</h3>
        <p>Never forget a formula in your board exam! Download this concise 36-page PDF containing all essential formulas, identities, surface area & volume shapes, and step-by-step theorem proofs.</p>
        <h4>Includes Proofs of:</h4>
        <ul>
          <li>Basic Proportionality Theorem (Thales Theorem)</li>
          <li>Tangent to a circle is perpendicular to radius</li>
          <li>Lengths of tangents drawn from an external point are equal</li>
        </ul>
      `,
      coverImage: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80",
      price: 0,
      mrp: 149,
      isFree: true,
      categoryId: categoryMap["class-10"] || categoryMap["school"],
      subCategory: "CBSE Class 10",
      subject: "Mathematics",
      classLevel: "Class 10",
      pagesCount: 36,
      language: "English",
      author: "CompX Academic Team",
      fileSize: "6.2 MB",
      format: "PDF",
      syllabus: "NCERT Class 10 Maths (Standard & Basic)",
      whatsIncluded: JSON.stringify([
        "Complete 36-Page Formula & Theorem Guide",
        "Trigonometry Value Table with mnemonic tricks",
        "Surface Areas & Volumes 3D formula diagrams",
        "Coordinate Geometry distance, section and centroid formulas"
      ]),
      tags: "Free Notes, Class 10, Maths, Formulas, Theorems, CBSE",
      difficulty: "Easy",
      isFeatured: true,
      isTrending: false,
      isBestSeller: false,
      pdfPath: "/storage/sample-pdfs/free-class10-maths-formulas.pdf",
      viewsCount: 5200,
      downloadsCount: 3450,
      salesCount: 0,
    },
    {
      title: "UPSC CSE Prelims: Modern Indian History Mindmaps & Timeline Charts (1757 - 1947)",
      slug: "upsc-cse-prelims-modern-indian-history-mindmaps",
      shortDescription: "Visual timeline mindmaps covering Spectrum & Bipan Chandra. Chronological Governor-Generals, Acts, Tribal/Peasant Revolts, and Freedom Struggle.",
      fullDescription: `
        <h3>Revise Modern History in 6 Hours!</h3>
        <p>Modern History accounts for 6-10 questions in UPSC CSE Prelims. These high-resolution visual mindmaps simplify complicated events, organizations, personalities, and movements into easy-to-recall chronological flowcharts.</p>
        <h4>Key Focus Areas:</h4>
        <ul>
          <li>Early British Expansion & Carnatic Wars</li>
          <li>Socio-Religious Reform Movements (Tables of Founders, Years, Objectives)</li>
          <li>1857 Revolt - Centers & Leaders</li>
          <li>Constitutional Developments from Regulating Act 1773 to 1947 Indian Independence Act</li>
          <li>Gandhian Era, Revolutionary Nationalism, and Subhash Chandra Bose</li>
        </ul>
      `,
      coverImage: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=800&q=80",
      price: 199,
      mrp: 499,
      isFree: false,
      categoryId: categoryMap["upsc-cse"] || categoryMap["government-civil-services"],
      subCategory: "UPSC Civil Services",
      subject: "History",
      classLevel: "UPSC Aspirants",
      pagesCount: 115,
      language: "English",
      author: "Aditya Mukherjee (UPSC Interview Appeared)",
      fileSize: "22.1 MB",
      format: "PDF",
      syllabus: "UPSC CSE GS Paper 1 Prelims & Mains",
      whatsIncluded: JSON.stringify([
        "115 High-Resolution Color Mindmaps",
        "Chronological Timeline of All Governor-Generals & Viceroys",
        "Pre-Congress Political Associations Chart",
        "Tribal & Peasant Movements Reference Matrix",
        "Important Newspapers, Journals and their Founders"
      ]),
      tags: "UPSC, IAS, Modern History, Mindmaps, Prelims, Spectrum, Civil Services",
      difficulty: "Exam-Oriented",
      isFeatured: true,
      isTrending: true,
      isBestSeller: true,
      pdfPath: "/storage/sample-pdfs/upsc-modern-history-mindmaps.pdf",
      viewsCount: 3890,
      downloadsCount: 820,
      salesCount: 654,
    },
    {
      title: "Data Structures & Algorithms (DSA): Ultimate Interview Prep Notes (Java & C++)",
      slug: "dsa-ultimate-interview-prep-notes-java-cpp",
      shortDescription: "Handwritten coding interview notes with visual dry-run diagrams, time/space complexities, LeetCode top 150 patterns, and template codes.",
      fullDescription: `
        <h3>Crack FAANG / MAANG & Product Companies!</h3>
        <p>Comprehensive DSA revision notes written by a Senior Software Engineer at Amazon. Perfect for B.Tech CSE/IT, BCA, MCA students and working professionals preparing for technical coding rounds.</p>
        <h4>Chapters Covered:</h4>
        <ul>
          <li>Arrays, Two Pointers, Sliding Window, Prefix Sum</li>
          <li>Strings & Pattern Matching (KMP, Rabin-Karp)</li>
          <li>Linked List, Stack, Queue & Monotonic Stacks</li>
          <li>Binary Trees, BST, Heaps / Priority Queues, Graph Algorithms (BFS, DFS, Dijkstra, Topo Sort)</li>
          <li>Dynamic Programming (0/1 Knapsack, LCS, LIS, Matrix Chain, Grid DP)</li>
        </ul>
      `,
      coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
      price: 249,
      mrp: 699,
      isFree: false,
      categoryId: categoryMap["btech-cse-it"] || categoryMap["btech-engineering"],
      subCategory: "CSE & IT",
      subject: "Data Structures & Algorithms",
      classLevel: "B.Tech Semester 3/4 & Placement Prep",
      pagesCount: 220,
      language: "English",
      author: "Siddharth Verma (Ex-Amazon SWE)",
      fileSize: "35.6 MB",
      format: "PDF",
      syllabus: "Industry Standard Coding Interview Patterns & University Syllabi",
      whatsIncluded: JSON.stringify([
        "220 Pages Comprehensive DSA Guide",
        "Dry Run Step-by-Step Diagrams for complex algorithms",
        "Time & Space Complexity Cheat Sheet",
        "Code snippets in both C++ and Java",
        "LeetCode Top 150 Must-Do Questions Checklist"
      ]),
      tags: "DSA, B.Tech, CSE, Coding, Java, C++, Placements, LeetCode, Software Engineering",
      difficulty: "Hard",
      isFeatured: true,
      isTrending: true,
      isBestSeller: true,
      pdfPath: "/storage/sample-pdfs/dsa-ultimate-interview-notes.pdf",
      viewsCount: 6300,
      downloadsCount: 1400,
      salesCount: 1120,
    },
    {
      title: "FREE: Python for Beginners & Data Science Quick Reference Sheet",
      slug: "free-python-for-beginners-cheat-sheet",
      shortDescription: "Complete Python syntax, data structures, list comprehensions, OOPs, NumPy & Pandas quick cheat sheet. Free download.",
      fullDescription: `
        <h3>Zero to Python in One Handy PDF!</h3>
        <p>Essential quick reference cheat sheet for college students learning Python for college practicals, AI/ML, or Data Science.</p>
        <h4>Contents:</h4>
        <ul>
          <li>Variables, Data Types, Type Casting, Slicing</li>
          <li>Lists, Tuples, Dictionaries, Sets and Common Methods</li>
          <li>Functions, Lambda expressions, Map/Filter/Reduce</li>
          <li>NumPy Array operations and Pandas DataFrame indexing</li>
        </ul>
      `,
      coverImage: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=800&q=80",
      price: 0,
      mrp: 99,
      isFree: true,
      categoryId: categoryMap["btech-ai-ds"] || categoryMap["btech-engineering"],
      subCategory: "AI & Data Science",
      subject: "Python Programming",
      classLevel: "All Semesters",
      pagesCount: 24,
      language: "English",
      author: "CompX Tech Community",
      fileSize: "4.1 MB",
      format: "PDF",
      syllabus: "Python 3.x Standard Library",
      whatsIncluded: JSON.stringify([
        "24-Page Color Illustrated Python Guide",
        "NumPy & Pandas 1-page cheatsheets",
        "Common Exception Handling and File I/O examples"
      ]),
      tags: "Python, Free Notes, Data Science, AI, B.Tech, Programming",
      difficulty: "Easy",
      isFeatured: false,
      isTrending: true,
      isBestSeller: false,
      pdfPath: "/storage/sample-pdfs/free-python-cheat-sheet.pdf",
      viewsCount: 4890,
      downloadsCount: 2980,
      salesCount: 0,
    },
    {
      title: "NEET Biology 360/360: NCERT Line-by-Line Diagram Book & Mindmaps",
      slug: "neet-biology-360-ncert-diagram-book-mindmaps",
      shortDescription: "Every single NCERT diagram extracted with labeled pointers, mnemonic tricks for examples, and high-probability statement-based questions.",
      fullDescription: `
        <h3>Target Perfect 360 in NEET Biology!</h3>
        <p>Biology carries 50% weightage in NEET UG. Over 85% of questions are directly framed from NCERT lines, tables, and diagrams. This guide condenses Class 11 and 12 Biology into crisp visual revision maps.</p>
        <h4>Key Inclusions:</h4>
        <ul>
          <li>Human Physiology & Plant Physiology flowcharts</li>
          <li>Genetics & Evolution Punnett square cheat tables</li>
          <li>Ecology & Environment data points, years and conventions</li>
          <li>Biotechnology principles and processes with step diagrams</li>
        </ul>
      `,
      coverImage: "https://images.unsplash.com/photo-1530210124550-912dc1381cb8?auto=format&fit=crop&w=800&q=80",
      price: 179,
      mrp: 450,
      isFree: false,
      categoryId: categoryMap["neet-ug"] || categoryMap["engineering-medical-entrance"],
      subCategory: "NEET UG",
      subject: "Biology",
      classLevel: "Class 11 & 12 / Droppers",
      pagesCount: 160,
      language: "English",
      author: "Dr. Neha Singhal (AIIMS Alum & Senior NEET Faculty)",
      fileSize: "26.3 MB",
      format: "PDF",
      syllabus: "NMC NEET Latest Syllabus",
      whatsIncluded: JSON.stringify([
        "160 High-Quality Pages of Diagrammatic Notes",
        "All NCERT Examples memorization mnemonics",
        "Comparison Tables for Plant & Animal Kingdom",
        "Past 5 Years Assertion-Reason Biology Practice Set"
      ]),
      tags: "NEET, Biology, NCERT, Diagrams, Medical Entrance, Mindmaps",
      difficulty: "Exam-Oriented",
      isFeatured: true,
      isTrending: true,
      isBestSeller: true,
      pdfPath: "/storage/sample-pdfs/neet-biology-ncert-diagrams.pdf",
      viewsCount: 5120,
      downloadsCount: 1250,
      salesCount: 940,
    },
    {
      title: "NDA & CDS Mathematics: Rapid Shortcut Tricks & Formula Handbook",
      slug: "nda-cds-mathematics-rapid-shortcuts-handbook",
      shortDescription: "Solve NDA maths paper in half the time! 250+ time-tested shortcut tricks for Trigonometry, Calculus, Probability, and Matrices.",
      fullDescription: `
        <h3>Clear the NDA Written Exam with Ease!</h3>
        <p>The NDA Mathematics paper has 120 questions to be solved in 150 minutes. Traditional methods will leave you short on time. Learn the art of option elimination, value substitution, and geometric approximations.</p>
        <h4>Chapters Covered:</h4>
        <ul>
          <li>Trigonometry & Inverse Trig shortcut values</li>
          <li>Limits, Continuity, Differentiation & Definite Integrals without integration</li>
          <li>Matrices & Determinants rapid expansion</li>
          <li>Vector Algebra and 3D Geometry projection formulas</li>
          <li>Permutations, Combinations & Probability quick odds</li>
        </ul>
      `,
      coverImage: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80",
      price: 129,
      mrp: 349,
      isFree: false,
      categoryId: categoryMap["defence-exams"] || categoryMap["government-civil-services"],
      subCategory: "NDA / CDS",
      subject: "Mathematics",
      classLevel: "Defence Aspirants (10+2 / Graduates)",
      pagesCount: 88,
      language: "English & Hindi",
      author: "Col. Sanjeev Nair & Defence Academy Team",
      fileSize: "14.5 MB",
      format: "PDF",
      syllabus: "UPSC NDA / NA & CDS Mathematics",
      whatsIncluded: JSON.stringify([
        "88 Pages of Formulae & Shortcuts",
        "Value-substitution techniques for 50+ question archetypes",
        "5 Years Previous Years Solved shortcut walkthroughs",
        "Printable pocket handbook format"
      ]),
      tags: "NDA, CDS, Defence, Maths, Shortcuts, UPSC, Agniveer",
      difficulty: "Exam-Oriented",
      isFeatured: false,
      isTrending: true,
      isBestSeller: true,
      pdfPath: "/storage/sample-pdfs/nda-cds-maths-shortcuts.pdf",
      viewsCount: 2980,
      downloadsCount: 710,
      salesCount: 580,
    },
    {
      title: "SSC CGL & CHSL: Complete Quantitative Aptitude Smart Revision Book",
      slug: "ssc-cgl-chsl-quantitative-aptitude-smart-revision",
      shortDescription: "TCS Pattern Arithmetic and Advanced Maths tricks. Percentage, SI/CI, Geometry, Mensuration & Algebra formulas.",
      fullDescription: `
        <h3>Score 50/50 in SSC CGL Maths!</h3>
        <p>Designed strictly in accordance with recent TCS examination patterns for SSC CGL, CHSL, CPO and MTS. Features direct formula applications, digit sum methods, and unit digit tricks.</p>
      `,
      coverImage: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80",
      price: 119,
      mrp: 299,
      isFree: false,
      categoryId: categoryMap["ssc-exams"] || categoryMap["government-civil-services"],
      subCategory: "SSC CGL / CHSL",
      subject: "Quantitative Aptitude",
      classLevel: "Competitive Govt Exams",
      pagesCount: 104,
      language: "Bilingual (English + Hindi)",
      author: "Vikram Sir (Maths Wizard)",
      fileSize: "18.2 MB",
      format: "PDF",
      syllabus: "Latest SSC TCS Exam Pattern",
      whatsIncluded: JSON.stringify([
        "104 Pages of Concept & Formula Notes",
        "Digit-Sum method explained with 30 solved examples",
        "Advanced Maths geometry circle and triangle properties summary"
      ]),
      tags: "SSC CGL, CHSL, Maths, Quant, Government Exams, Aptitude",
      difficulty: "Medium",
      isFeatured: false,
      isTrending: false,
      isBestSeller: true,
      pdfPath: "/storage/sample-pdfs/ssc-quant-smart-notes.pdf",
      viewsCount: 3120,
      downloadsCount: 640,
      salesCount: 512,
    },
    {
      title: "B.Tech CSE: Operating Systems & DBMS University Semester Notes",
      slug: "btech-cse-operating-systems-dbms-semester-notes",
      shortDescription: "AKTU, VTU, Mumbai Univ & GTU semester-ready notes. CPU Scheduling, Deadlocks, Paging, SQL Queries, Normalization (1NF to BCNF).",
      fullDescription: `
        <h3>Ace Your Engineering University Semesters!</h3>
        <p>Thorough semester exam notes with standard 10-mark and 5-mark question answers, diagrams, definitions, and numerical problems solved step-by-step.</p>
      `,
      coverImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80",
      price: 89,
      mrp: 249,
      isFree: false,
      categoryId: categoryMap["btech-cse-it"] || categoryMap["btech-engineering"],
      subCategory: "B.Tech CSE",
      subject: "OS & DBMS",
      classLevel: "Semester 4/5",
      pagesCount: 140,
      language: "English",
      author: "TopperNotes B.Tech Panel",
      fileSize: "21.4 MB",
      format: "PDF",
      syllabus: "Universal Indian Technical Universities (AICTE Model)",
      whatsIncluded: JSON.stringify([
        "140 Pages Dual Subject Semester Guide",
        "CPU Scheduling Algorithms comparative charts",
        "Database Normalization solved examples (1NF to 5NF)",
        "Banker's Algorithm & Semaphore implementation snippets"
      ]),
      tags: "B.Tech, CSE, Operating Systems, DBMS, Engineering, University Notes",
      difficulty: "Medium",
      isFeatured: true,
      isTrending: false,
      isBestSeller: false,
      pdfPath: "/storage/sample-pdfs/btech-os-dbms-notes.pdf",
      viewsCount: 2240,
      downloadsCount: 510,
      salesCount: 380,
    },
  ];

  for (const n of notesData) {
    await prisma.note.upsert({
      where: { slug: n.slug },
      update: n,
      create: n,
    });
  }

  // 5. Seed Coupons
  console.log("🎟️ Seeding Promotional Coupons...");
  const couponsData = [
    {
      code: "COMPX50",
      discountType: "PERCENTAGE",
      discountValue: 50,
      minOrderAmount: 99,
      maxDiscount: 200,
      usageLimit: 1000,
      isActive: true,
    },
    {
      code: "FIRST100",
      discountType: "FLAT",
      discountValue: 100,
      minOrderAmount: 199,
      usageLimit: 500,
      isActive: true,
    },
    {
      code: "EXAM20",
      discountType: "PERCENTAGE",
      discountValue: 20,
      minOrderAmount: 0,
      usageLimit: 5000,
      isActive: true,
    },
  ];

  for (const c of couponsData) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: c,
      create: c,
    });
  }

  // 6. Seed Homepage Banners
  console.log("🎨 Seeding Homepage Banners...");
  const bannersData = [
    {
      title: "Target 95%+ in 2026 Board & Entrance Exams",
      subtitle: "Verified handwritten notes by toppers and top Kota / Delhi faculty. Free & Paid PDF notes.",
      badge: "EXAM SEASON 2026",
      linkUrl: "/browse",
      bgGradient: "from-blue-700 via-indigo-800 to-slate-900",
      order: 1,
      isActive: true,
    },
    {
      title: "Flat 50% Off on All UPSC & Engineering Bundles",
      subtitle: "Use coupon code COMPX50 at checkout. Instant download + lifetime library access.",
      badge: "LIMITED PERIOD OFFER",
      linkUrl: "/browse?category=government-civil-services",
      bgGradient: "from-amber-600 via-orange-600 to-rose-700",
      order: 2,
      isActive: true,
    },
  ];

  for (const b of bannersData) {
    const existing = await prisma.banner.findFirst({ where: { title: b.title } });
    if (!existing) {
      await prisma.banner.create({ data: b });
    }
  }

  // 7. Seed Static CMS Pages
  console.log("📄 Seeding Static CMS Pages...");
  const pagesData = [
    {
      slug: "about",
      title: "About CompX",
      content: `
        <h2>Welcome to CompX – Study Smart. Score Higher.</h2>
        <p>CompX is India's premier digital study material marketplace built with a single mission: to provide high-yield, affordable, and authentic exam notes to students across every corner of the country.</p>
        <h3>Why CompX?</h3>
        <ul>
          <li><strong>Topper Curated:</strong> Notes verified by exam toppers and experienced educators.</li>
          <li><strong>Instant Access:</strong> Pay via UPI / QR / WhatsApp and unlock study material in your personal library.</li>
          <li><strong>Affordable & Free:</strong> Quality education shouldn't break the bank. Hundreds of high-quality PDFs are 100% free.</li>
          <li><strong>Anti-Piracy Protected:</strong> Clean, legible PDFs with personalized buyer authentication watermarks.</li>
        </ul>
      `,
    },
    {
      slug: "refund-policy",
      title: "Refund & Cancellation Policy",
      content: `
        <h2>CompX Refund and Cancellation Policy</h2>
        <p>Last updated: November 2026</p>
        <p>At CompX, we strive to deliver top-notch academic notes. Please read our digital goods refund policy carefully before making any purchase.</p>
        <h3>1. Digital Products Nature</h3>
        <p>Because notes sold on CompX are downloadable digital PDFs and viewable materials, once an order is verified and unlocked in your library, transactions are generally non-refundable.</p>
        <h3>2. Eligibility for Refund</h3>
        <p>We consider refund requests under the following rare circumstances:</p>
        <ul>
          <li><strong>Duplicate Payment:</strong> If you were debited multiple times for the same order due to a network glitch.</li>
          <li><strong>Corrupted or Inaccessible File:</strong> If the PDF file is unreadable and our support team cannot provide a working copy within 24 hours.</li>
          <li><strong>Incorrect Item Delivered:</strong> If the content delivered materially differs from the description and syllabus specified on the product page.</li>
        </ul>
        <h3>3. Requesting a Refund</h3>
        <p>To request a refund, please contact us within 48 hours of purchase at <strong>support@compx.in</strong> or via WhatsApp with your Order ID, payment proof, and detailed explanation.</p>
      `,
    },
    {
      slug: "terms-conditions",
      title: "Terms and Conditions",
      content: `
        <h2>CompX Terms of Service</h2>
        <p>By accessing or purchasing from CompX, you agree to abide by these terms and applicable Indian copyright laws.</p>
        <h3>1. Personal Use Only</h3>
        <p>All notes purchased or downloaded for free on CompX are strictly for individual academic use. Reselling, redistributing, public uploading on Telegram, Google Drive or commercial publishing is strictly prohibited and subject to legal action under the Indian Copyright Act.</p>
        <h3>2. Watermarking</h3>
        <p>CompX employs automated digital watermarking containing the student's registered identifier to prevent unauthorized leaking and piracy.</p>
      `,
    },
    {
      slug: "privacy-policy",
      title: "Privacy Policy",
      content: `
        <h2>CompX Privacy Policy</h2>
        <p>We respect your privacy and comply with the Digital Personal Data Protection (DPDP) Act of India.</p>
        <p>We only collect the data necessary to provide and secure your purchases: your name, email address, phone number (for WhatsApp updates), and transaction references (UTR).</p>
      `,
    },
    {
      slug: "disclaimer",
      title: "Disclaimer",
      content: `
        <h2>Academic Disclaimer</h2>
        <p>CompX notes are supplemental revision guides designed to assist students. While we take every effort to maintain accuracy, CompX is not affiliated with any official examination boards (such as CBSE, NTA, UPSC, SSC, etc.). Students are advised to refer to standard textbooks and official board notifications.</p>
      `,
    },
    {
      slug: "contact",
      title: "Contact & Student Support",
      content: `
        <h2>We are here to help you succeed!</h2>
        <p>Have a question about a note, payment verification, or want to contribute notes as an author?</p>
        <p><strong>Email:</strong> support@compx.in</p>
        <p><strong>WhatsApp Support:</strong> +91 98765 43210 (10:00 AM – 8:00 PM IST)</p>
        <p><strong>Telegram Channel:</strong> @compx_notes</p>
      `,
    },
    {
      slug: "faq",
      title: "Frequently Asked Questions",
      content: `
        <h2>Frequently Asked Questions</h2>
        <h3>How do I download my notes after payment?</h3>
        <p>Immediately upon payment verification (or immediately for free notes), your notes will appear under 'My Library' in your account. You can view them online or download them to your device anytime.</p>
        <h3>How does UPI QR payment work?</h3>
        <p>At checkout, you will see a dynamic QR code pre-filled with the exact amount, along with our UPI ID. Scan with GPay, PhonePe, or Paytm, complete the payment, enter your 12-digit UTR / Transaction ID and upload the screenshot. Our team verifies it promptly.</p>
        <h3>Can I pay directly via WhatsApp?</h3>
        <p>Yes! Choose 'Pay via WhatsApp' at checkout. A pre-filled message with your order details will open in WhatsApp. You can send the payment proof to our admin team directly.</p>
      `,
    },
  ];

  for (const p of pagesData) {
    await prisma.page.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });
  }

  // 8. Seed Sample Order with Payment for Student
  console.log("📦 Seeding Sample Orders & Library Access...");
  const firstNote = await prisma.note.findFirst({ where: { isFree: false } });
  if (firstNote && student) {
    const orderId = "CPX-20261114-1001";
    const order = await prisma.order.upsert({
      where: { id: orderId },
      update: {},
      create: {
        id: orderId,
        userId: student.id,
        totalAmount: firstNote.price,
        discountAmount: 0,
        finalAmount: firstNote.price,
        status: "PAID",
        paymentMode: "UPI_QR",
        customerName: student.name,
        customerEmail: student.email,
        customerPhone: student.phone,
        items: {
          create: [
            {
              noteId: firstNote.id,
              price: firstNote.price,
              title: firstNote.title,
            },
          ],
        },
        payment: {
          create: {
            mode: "UPI_QR",
            amount: firstNote.price,
            status: "PAID",
            utr: "432109876543",
            screenshotUrl: "/images/sample-payment-screenshot.png",
            verifiedAt: new Date(),
            verifiedBy: "Super Administrator",
          },
        },
      },
    });

    // Also seed a sample review
    await prisma.review.create({
      data: {
        noteId: firstNote.id,
        userId: student.id,
        rating: 5,
        title: "Best notes for Class 10! Scored 96 in pre-boards",
        comment: "The handwriting is so clean and the ray diagrams made light reflection so easy to understand. Best 149 rupees spent!",
        isApproved: true,
        adminReply: "Thank you Aarav! Best of luck for your upcoming board exams!",
      },
    });
  }

  console.log("✅ CompX Database Seeding Completed Successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

