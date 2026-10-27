import PlaybookItem from '../models/PlaybookItem.js';

// Curated starter preparation curriculum for college placements
const STARTER_PLAYBOOK_TEMPLATES = [
  {
    topic: 'Core Data Structures: Arrays, Strings, HashMaps & Two Pointers',
    targetGroups: ['Decent', 'Easy to Crack'],
    priority: 'High',
    notes: 'Focus on LeetCode Easy & Medium problems: Two Sum, Valid Palindrome, Group Anagrams, Subarray Sum.',
    estimatedHours: 8,
  },
  {
    topic: 'Trees & Graphs: BFS, DFS, Dijkstra & Topological Sort',
    targetGroups: ['Excellent', 'Hard to Crack'],
    priority: 'High',
    notes: 'Crucial for Tier-1 companies (Amazon, Microsoft, Google). Practice Number of Islands, Course Schedule, Lowest Common Ancestor.',
    estimatedHours: 14,
  },
  {
    topic: 'Dynamic Programming: 1D & 2D Knapsack, Subsequences & Grid Paths',
    targetGroups: ['Excellent', 'Hard to Crack'],
    priority: 'High',
    notes: 'Master memoization vs tabulation. Classic problems: Coin Change, Longest Common Subsequence, Edit Distance.',
    estimatedHours: 16,
  },
  {
    topic: 'CS Fundamentals: Operating Systems (Paging, Deadlocks, Virtual Memory)',
    targetGroups: ['Decent', 'Easy to Crack', 'Hard to Crack'],
    priority: 'Medium',
    notes: 'Frequently asked in initial technical MCQs and rounds: Mutex vs Semaphore, Thread vs Process, Thrashing.',
    estimatedHours: 6,
  },
  {
    topic: 'Database Management & SQL Queries: Joins, Indexing, Transactions (ACID)',
    targetGroups: ['Decent', 'Excellent', 'Easy to Crack'],
    priority: 'High',
    notes: 'Practice writing subqueries, GROUP BY, HAVING, and understanding B-Tree indices and normalization.',
    estimatedHours: 8,
  },
  {
    topic: 'Computer Networks: TCP/IP 3-Way Handshake, DNS Lookup, HTTP vs HTTPS',
    targetGroups: ['Decent', 'Easy to Crack'],
    priority: 'Medium',
    notes: 'Explain what happens when you type google.com into your browser step-by-step.',
    estimatedHours: 5,
  },
  {
    topic: 'System Design Basics: Scalability, Caching (Redis), Load Balancing & Rate Limiting',
    targetGroups: ['Excellent', 'Hard to Crack'],
    priority: 'Medium',
    notes: 'Focus on high-level architecture for URL shortener (TinyURL) and Notification service.',
    estimatedHours: 10,
  },
  {
    topic: 'Behavioral & HR: STAR Method Stories for Leadership & Conflict Resolution',
    targetGroups: ['Decent', 'Excellent', 'Easy to Crack', 'Hard to Crack'],
    priority: 'High',
    notes: 'Prepare 4 distinct project stories covering: greatest technical challenge, failure recovery, teamwork conflict, and innovation.',
    estimatedHours: 4,
  },
];

// @desc    Get all playbook items with filtering and group progress
// @route   GET /api/playbooks
// @access  Private
export const getPlaybookItems = async (req, res, next) => {
  try {
    const { group, priority, isCompleted } = req.query;
    const query = { user: req.user._id };

    if (group) {
      query.targetGroups = group;
    }
    if (priority) {
      query.priority = priority;
    }
    if (isCompleted !== undefined) {
      query.isCompleted = isCompleted === 'true';
    }

    const items = await PlaybookItem.find(query).sort({ isCompleted: 1, priority: -1, createdAt: -1 });

    // Calculate group stats across ALL items of this user
    const allUserItems = await PlaybookItem.find({ user: req.user._id });

    const groups = ['Decent', 'Excellent', 'Easy to Crack', 'Hard to Crack'];
    const groupStats = {};

    groups.forEach((g) => {
      const groupItems = allUserItems.filter((i) => i.targetGroups.includes(g));
      const total = groupItems.length;
      const completed = groupItems.filter((i) => i.isCompleted).length;
      const hours = groupItems.reduce((acc, i) => acc + (i.estimatedHours || 0), 0);
      const completedHours = groupItems
        .filter((i) => i.isCompleted)
        .reduce((acc, i) => acc + (i.estimatedHours || 0), 0);

      groupStats[g] = {
        total,
        completed,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
        hours,
        completedHours,
      };
    });

    res.status(200).json({
      success: true,
      count: items.length,
      items,
      groupStats,
      totalCount: allUserItems.length,
      completedCount: allUserItems.filter((i) => i.isCompleted).length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new preparation playbook item
// @route   POST /api/playbooks
// @access  Private
export const createPlaybookItem = async (req, res, next) => {
  try {
    const { topic, targetGroups, priority, notes, estimatedHours } = req.body;

    if (!topic) {
      return res.status(400).json({
        success: false,
        message: 'Topic title is required.',
      });
    }

    if (!targetGroups || !Array.isArray(targetGroups) || targetGroups.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one company group tag (Decent, Excellent, Easy to Crack, Hard to Crack) is required.',
      });
    }

    const item = await PlaybookItem.create({
      user: req.user._id,
      topic: topic.trim(),
      targetGroups,
      priority: priority || 'Medium',
      notes: notes ? notes.trim() : '',
      estimatedHours: estimatedHours ? Number(estimatedHours) : 2,
    });

    res.status(201).json({
      success: true,
      message: 'Preparation item added.',
      item,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a playbook item
// @route   PUT /api/playbooks/:id
// @access  Private
export const updatePlaybookItem = async (req, res, next) => {
  try {
    const { topic, targetGroups, priority, notes, estimatedHours, isCompleted } = req.body;

    const item = await PlaybookItem.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Preparation item not found.',
      });
    }

    if (topic) item.topic = topic.trim();
    if (targetGroups && Array.isArray(targetGroups) && targetGroups.length > 0) {
      item.targetGroups = targetGroups;
    }
    if (priority) item.priority = priority;
    if (notes !== undefined) item.notes = notes.trim();
    if (estimatedHours !== undefined) item.estimatedHours = Number(estimatedHours);
    if (isCompleted !== undefined) {
      item.isCompleted = Boolean(isCompleted);
      item.completedAt = item.isCompleted ? new Date() : null;
    }

    await item.save();

    res.status(200).json({
      success: true,
      message: 'Preparation item updated.',
      item,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle playbook item completion
// @route   PATCH /api/playbooks/:id/toggle
// @access  Private
export const togglePlaybookItem = async (req, res, next) => {
  try {
    const item = await PlaybookItem.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Preparation item not found.',
      });
    }

    item.isCompleted = !item.isCompleted;
    item.completedAt = item.isCompleted ? new Date() : null;
    await item.save();

    res.status(200).json({
      success: true,
      message: item.isCompleted ? 'Topic marked as completed! 🎉' : 'Topic marked as in-progress.',
      item,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a playbook item
// @route   DELETE /api/playbooks/:id
// @access  Private
export const deletePlaybookItem = async (req, res, next) => {
  try {
    const item = await PlaybookItem.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Preparation item not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Preparation item deleted.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Seed starter playbook curriculum
// @route   POST /api/playbooks/seed-starter
// @access  Private
export const seedStarterPlaybook = async (req, res, next) => {
  try {
    const existing = await PlaybookItem.countDocuments({ user: req.user._id });
    if (existing > 0) {
      return res.status(400).json({
        success: false,
        message: `You already have ${existing} preparation topics in your playbook. Starter templates are only seeded when your playbook is empty.`,
      });
    }

    const itemsToInsert = STARTER_PLAYBOOK_TEMPLATES.map((template) => ({
      ...template,
      user: req.user._id,
    }));

    const inserted = await PlaybookItem.insertMany(itemsToInsert);

    res.status(201).json({
      success: true,
      message: `Successfully loaded ${inserted.length} curated preparation topics!`,
      count: inserted.length,
      items: inserted,
    });
  } catch (error) {
    next(error);
  }
};
