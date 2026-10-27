import Application from '../models/Application.js';
import PlaybookItem from '../models/PlaybookItem.js';

// @desc    Get dashboard metrics, charts, upcoming events, and reminders
// @route   GET /api/dashboard/stats
// @access  Private
export const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const fourteenDaysFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    // Fetch all user applications and playbook items in parallel
    const [applications, playbookItems] = await Promise.all([
      Application.find({ user: userId }).sort({ updatedAt: -1 }),
      PlaybookItem.find({ user: userId }),
    ]);

    const totalApplications = applications.length;

    // Active applications are those still in progress (not rejected or withdrawn)
    const activeApplications = applications.filter(
      (app) => !['Rejected', 'Withdrawn'].includes(app.status)
    ).length;

    const offersReceived = applications.filter((app) => app.status === 'Offer').length;

    // Status breakdown
    const statusCounts = {
      Wishlist: 0,
      Applied: 0,
      'Online Assessment': 0,
      Interview: 0,
      Offer: 0,
      Rejected: 0,
      Withdrawn: 0,
    };

    // Tier and difficulty counts
    const tierCounts = { Decent: 0, Excellent: 0 };
    const difficultyCounts = { 'Easy to Crack': 0, 'Hard to Crack': 0 };

    // Rounds aggregation
    let totalScheduledRounds = 0;
    const upcomingEvents = [];
    const overdueEvents = [];
    const reminders = [];

    applications.forEach((app) => {
      // Status & classification counts
      if (statusCounts[app.status] !== undefined) {
        statusCounts[app.status]++;
      }
      if (tierCounts[app.tier] !== undefined) {
        tierCounts[app.tier]++;
      }
      if (difficultyCounts[app.difficulty] !== undefined) {
        difficultyCounts[app.difficulty]++;
      }

      // Check Application Deadline
      if (app.deadline) {
        const deadlineDate = new Date(app.deadline);
        const isAppPending = ['Wishlist', 'Applied'].includes(app.status);

        if (deadlineDate < now && isAppPending) {
          overdueEvents.push({
            type: 'Application Deadline',
            company: app.company,
            role: app.role,
            applicationId: app._id,
            date: deadlineDate,
            priority: app.priority,
            tier: app.tier,
            difficulty: app.difficulty,
          });

          reminders.push({
            id: `deadline-overdue-${app._id}`,
            level: 'danger',
            category: 'Application Deadline',
            title: `Deadline Passed: ${app.company} (${app.role})`,
            message: `The application deadline was ${deadlineDate.toLocaleDateString()}. Update status or withdraw.`,
            link: `/applications/${app._id}`,
            date: deadlineDate,
            actionText: 'View Application',
          });
        } else if (deadlineDate >= now && deadlineDate <= fourteenDaysFromNow && isAppPending) {
          const diffDays = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));
          upcomingEvents.push({
            type: 'Application Deadline',
            company: app.company,
            role: app.role,
            applicationId: app._id,
            date: deadlineDate,
            priority: app.priority,
            tier: app.tier,
            difficulty: app.difficulty,
            daysLeft: diffDays,
          });

          reminders.push({
            id: `deadline-upcoming-${app._id}`,
            level: diffDays <= 2 ? 'warning' : 'info',
            category: 'Application Deadline',
            title: `Deadline in ${diffDays} day${diffDays === 1 ? '' : 's'}: ${app.company}`,
            message: `Submit application for ${app.role} before ${deadlineDate.toLocaleDateString()}.`,
            link: `/applications/${app._id}`,
            date: deadlineDate,
            actionText: 'Review Details',
          });
        }
      }

      // Process nested rounds
      if (app.rounds && app.rounds.length > 0) {
        app.rounds.forEach((round) => {
          const roundDate = new Date(round.scheduledAt);

          if (round.status === 'Upcoming') {
            totalScheduledRounds++;

            if (roundDate < now) {
              // Overdue round
              overdueEvents.push({
                type: 'Round',
                roundType: round.roundType,
                roundName: round.name,
                company: app.company,
                role: app.role,
                applicationId: app._id,
                roundId: round._id,
                date: roundDate,
                priority: app.priority,
                tier: app.tier,
                difficulty: app.difficulty,
              });

              reminders.push({
                id: `round-overdue-${round._id}`,
                level: 'danger',
                category: 'Round Outcome Needed',
                title: `Pending Outcome: ${app.company} ${round.name || round.roundType}`,
                message: `This round took place on ${roundDate.toLocaleDateString()}. Please record the outcome.`,
                link: `/applications/${app._id}`,
                date: roundDate,
                actionText: 'Record Outcome',
              });
            } else {
              // Upcoming round
              const diffHours = Math.round((roundDate - now) / (1000 * 60 * 60));
              upcomingEvents.push({
                type: 'Round',
                roundType: round.roundType,
                roundName: round.name,
                company: app.company,
                role: app.role,
                applicationId: app._id,
                roundId: round._id,
                date: roundDate,
                durationMinutes: round.durationMinutes,
                meetingLink: round.meetingLink,
                priority: app.priority,
                tier: app.tier,
                difficulty: app.difficulty,
                hoursLeft: diffHours,
              });

              reminders.push({
                id: `round-upcoming-${round._id}`,
                level: diffHours <= 24 ? 'warning' : 'info',
                category: 'Upcoming Round',
                title: `${round.roundType} with ${app.company}`,
                message: `Scheduled for ${roundDate.toLocaleString([], {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}. Be prepared!`,
                link: `/applications/${app._id}`,
                date: roundDate,
                actionText: 'Prepare & Join',
              });
            }
          }
        });
      }
    });

    // Sort upcoming events chronologically ascending
    upcomingEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Sort overdue events chronologically descending
    overdueEvents.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Sort reminders: danger first, then warning, then info, then date
    const priorityWeight = { danger: 1, warning: 2, info: 3 };
    reminders.sort((a, b) => {
      const weightDiff = (priorityWeight[a.level] || 9) - (priorityWeight[b.level] || 9);
      if (weightDiff !== 0) return weightDiff;
      return new Date(a.date) - new Date(b.date);
    });

    // Playbook stats
    const totalPlaybookTopics = playbookItems.length;
    const completedPlaybookTopics = playbookItems.filter((i) => i.isCompleted).length;
    const totalStudyHours = playbookItems.reduce((acc, i) => acc + (i.estimatedHours || 0), 0);
    const completedStudyHours = playbookItems
      .filter((i) => i.isCompleted)
      .reduce((acc, i) => acc + (i.estimatedHours || 0), 0);

    // Recent activity (latest 5 created or updated apps)
    const recentActivity = applications.slice(0, 5).map((app) => ({
      _id: app._id,
      company: app.company,
      role: app.role,
      status: app.status,
      tier: app.tier,
      difficulty: app.difficulty,
      priority: app.priority,
      updatedAt: app.updatedAt,
      roundsCount: app.rounds.length,
    }));

    res.status(200).json({
      success: true,
      stats: {
        totalApplications,
        activeApplications,
        totalScheduledRounds,
        offersReceived,
        overdueCount: overdueEvents.length,
        upcomingCount: upcomingEvents.length,
        statusCounts,
        tierCounts,
        difficultyCounts,
        playbook: {
          totalTopics: totalPlaybookTopics,
          completedTopics: completedPlaybookTopics,
          progressPercentage:
            totalPlaybookTopics > 0
              ? Math.round((completedPlaybookTopics / totalPlaybookTopics) * 100)
              : 0,
          totalStudyHours,
          completedStudyHours,
        },
      },
      upcomingEvents: upcomingEvents.slice(0, 10),
      overdueEvents: overdueEvents.slice(0, 10),
      reminders,
      recentActivity,
    });
  } catch (error) {
    next(error);
  }
};
