import Application from '../models/Application.js';
import PlaybookItem from '../models/PlaybookItem.js';

// @desc    Seed realistic demo data for the authenticated student
// @route   POST /api/demo/seed
// @access  Private
export const seedDemoData = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Check if user already has data to prevent accidental duplicate seeding
    const existingAppsCount = await Application.countDocuments({ user: userId });
    const existingPlaybookCount = await PlaybookItem.countDocuments({ user: userId });

    if (existingAppsCount > 0 || existingPlaybookCount > 0) {
      // If client didn't explicitly request force re-seed
      if (!req.body.force) {
        return res.status(409).json({
          success: false,
          message: `Demo data cannot be loaded: You already have ${existingAppsCount} application(s) and ${existingPlaybookCount} playbook topic(s). Loading demo data would duplicate your records.`,
          hasExistingData: true,
        });
      }
    }

    const now = new Date();
    const inTwoDays = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    const inFourDays = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);
    const inTenDays = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
    const pastThreeDays = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const pastSevenDays = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const demoApplications = [
      {
        user: userId,
        company: 'Google',
        role: 'Software Engineer Intern - Summer 2027',
        description: 'Global Tools and Infrastructure engineering team. Focus on distributed systems, C++, and Go.',
        jobUrl: 'https://careers.google.com/jobs/results/',
        location: 'Bangalore / Hyderabad, India',
        source: 'Referral',
        status: 'Interview',
        tier: 'Excellent',
        difficulty: 'Hard to Crack',
        priority: 'High',
        salary: '₹1,25,000 / month stipend',
        deadline: inTenDays,
        appliedDate: pastSevenDays,
        additionalNotes: 'Referred by college senior in Google Cloud. Need to review Graph BFS/DFS and OS internals.',
        rounds: [
          {
            roundType: 'Online Assessment',
            name: 'Round 1: Google Online Challenge (OA)',
            scheduledAt: pastThreeDays,
            status: 'Completed',
            outcome: 'Cleared',
            notes: '2 algorithm problems (Greedy & Dynamic Programming). Solved both with 100% test cases.',
            durationMinutes: 60,
          },
          {
            roundType: 'Technical Interview',
            name: 'Round 2: Data Structures & Algorithms',
            scheduledAt: inTwoDays,
            status: 'Upcoming',
            notes: 'Live Google Meet coding interview with Senior SWE. Focus on graphs, trees, and time complexity.',
            durationMinutes: 45,
            meetingLink: 'https://meet.google.com/xyz-demo-appl',
          },
        ],
      },
      {
        user: userId,
        company: 'Atlassian',
        role: 'Associate Software Engineer',
        description: 'Jira Core Platform engineering team. Microservices, Kafka, AWS, Java/Kotlin.',
        jobUrl: 'https://www.atlassian.com/company/careers',
        location: 'Bengaluru (Remote Eligible)',
        source: 'On-Campus',
        status: 'Online Assessment',
        tier: 'Excellent',
        difficulty: 'Hard to Crack',
        priority: 'High',
        salary: '₹1,00,000 / month + ₹25 LPA CTC',
        deadline: inFourDays,
        appliedDate: pastSevenDays,
        additionalNotes: 'HackerRank test link received via placement portal.',
        rounds: [
          {
            roundType: 'Online Assessment',
            name: 'HackerRank Assessment (DSA + Core CS)',
            scheduledAt: inFourDays,
            status: 'Upcoming',
            notes: '3 DSA questions + 10 MCQs on OS, DBMS, and System Design basics.',
            durationMinutes: 90,
          },
        ],
      },
      {
        user: userId,
        company: 'Microsoft',
        role: 'Software Engineering Intern',
        description: 'Azure Storage and Cloud Developer Platform team.',
        jobUrl: 'https://careers.microsoft.com',
        location: 'Hyderabad / Noida, India',
        source: 'Career Portal',
        status: 'Offer',
        tier: 'Excellent',
        difficulty: 'Hard to Crack',
        priority: 'High',
        salary: '₹1,20,000 / month stipend',
        deadline: pastSevenDays,
        appliedDate: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
        additionalNotes: 'Offer letter received! Acceptance deadline by end of next month.',
        rounds: [
          {
            roundType: 'Online Assessment',
            name: 'Codility Online Test',
            scheduledAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
            status: 'Completed',
            outcome: 'Cleared',
            notes: '3 coding questions. Time limit 80 minutes.',
            durationMinutes: 80,
          },
          {
            roundType: 'Technical Interview',
            name: 'Technical Round 1: Data Structures',
            scheduledAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
            status: 'Completed',
            outcome: 'Cleared',
            notes: 'Binary search variants, Trie implementation for autocomplete.',
            durationMinutes: 45,
          },
          {
            roundType: 'Managerial Interview',
            name: 'Round 3: Partner Director Interview',
            scheduledAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
            status: 'Completed',
            outcome: 'Cleared',
            notes: 'Discussed project architecture, college open-source contributions, and behavioral alignment.',
            durationMinutes: 60,
          },
        ],
      },
      {
        user: userId,
        company: 'Zomato',
        role: 'Backend Engineering Intern',
        description: 'Core Delivery Services & Real-time Tracking platform.',
        jobUrl: 'https://www.zomato.com/careers',
        location: 'Gurugram, Haryana',
        source: 'LinkedIn',
        status: 'Applied',
        tier: 'Decent',
        difficulty: 'Easy to Crack',
        priority: 'Medium',
        salary: '₹50,000 / month',
        deadline: inTwoDays,
        appliedDate: pastThreeDays,
        additionalNotes: 'Applied via company job board. Resume tailored for backend node/golang.',
        rounds: [],
      },
      {
        user: userId,
        company: 'Razorpay',
        role: 'Frontend Engineering Intern',
        description: 'Checkout Experience & Merchant Dashboard frontend in React and TypeScript.',
        jobUrl: 'https://razorpay.com/jobs/',
        location: 'Bengaluru, India',
        source: 'Unstop',
        status: 'Interview',
        tier: 'Decent',
        difficulty: 'Hard to Crack',
        priority: 'Medium',
        salary: '₹45,000 / month',
        deadline: inTenDays,
        appliedDate: pastSevenDays,
        additionalNotes: 'Machine coding round scheduled for next week.',
        rounds: [
          {
            roundType: 'Coding Round',
            name: 'Machine Coding: Custom Component Library',
            scheduledAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
            status: 'Upcoming',
            notes: 'Build an infinite scroll data table with client-side sorting and debounce filtering.',
            durationMinutes: 90,
          },
        ],
      },
      {
        user: userId,
        company: 'Deloitte',
        role: 'Analyst - Technology Consulting',
        description: 'Enterprise Cloud Architecture & Data Analytics.',
        jobUrl: 'https://deloitte.com/careers',
        location: 'Pan India (Campus Pool)',
        source: 'On-Campus',
        status: 'Wishlist',
        tier: 'Decent',
        difficulty: 'Easy to Crack',
        priority: 'Low',
        salary: '₹8.5 LPA CTC',
        deadline: inTenDays,
        appliedDate: now,
        additionalNotes: 'On-campus drive starts next week. Registration portal opening on Friday.',
        rounds: [],
      },
    ];

    const demoPlaybookItems = [
      {
        user: userId,
        topic: 'Graph Algorithms: BFS, DFS, Dijkstra & Topological Sort',
        targetGroups: ['Excellent', 'Hard to Crack'],
        priority: 'High',
        isCompleted: true,
        completedAt: pastThreeDays,
        notes: 'Covered LeetCode 200, 207, 743. Reviewed adjacency list representation.',
        estimatedHours: 12,
      },
      {
        user: userId,
        topic: 'Operating Systems: Processes, Threads, Mutex, Semaphores & Paging',
        targetGroups: ['Decent', 'Easy to Crack', 'Hard to Crack'],
        priority: 'High',
        isCompleted: true,
        completedAt: pastSevenDays,
        notes: 'Reviewed Galvin OS notes chapters 3, 5, 8. Prepared 10 classic MCQ questions.',
        estimatedHours: 6,
      },
      {
        user: userId,
        topic: 'Dynamic Programming: 1D & 2D Knapsack, Subsequences & Grid Paths',
        targetGroups: ['Excellent', 'Hard to Crack'],
        priority: 'High',
        isCompleted: false,
        notes: 'Need to master space optimization from O(N*M) to O(M).',
        estimatedHours: 15,
      },
      {
        user: userId,
        topic: 'Database & SQL: Joins, Indexing (B-Trees), Normalization & ACID Transactions',
        targetGroups: ['Decent', 'Excellent', 'Easy to Crack'],
        priority: 'High',
        isCompleted: false,
        notes: 'Write complex subqueries on LeetCode Database section. Review Redis caching strategies.',
        estimatedHours: 8,
      },
      {
        user: userId,
        topic: 'Behavioral & Leadership: STAR Method Stories for College Projects',
        targetGroups: ['Decent', 'Excellent', 'Easy to Crack', 'Hard to Crack'],
        priority: 'Medium',
        isCompleted: true,
        completedAt: pastThreeDays,
        notes: 'Structured 4 project stories: challenging bug in team project, deadline crunch, and leadership.',
        estimatedHours: 4,
      },
      {
        user: userId,
        topic: 'System Design Basics: Scalability, Load Balancing & CDN Caching',
        targetGroups: ['Excellent', 'Hard to Crack'],
        priority: 'Medium',
        isCompleted: false,
        notes: 'Read System Design Primer. Prepared TinyURL and Rate Limiter designs.',
        estimatedHours: 10,
      },
    ];

    const [createdApps, createdPlaybook] = await Promise.all([
      Application.insertMany(demoApplications),
      PlaybookItem.insertMany(demoPlaybookItems),
    ]);

    res.status(201).json({
      success: true,
      message: `Successfully loaded demo dataset: ${createdApps.length} applications and ${createdPlaybook.length} preparation playbook topics!`,
      applicationsCount: createdApps.length,
      playbookCount: createdPlaybook.length,
    });
  } catch (error) {
    next(error);
  }
};
