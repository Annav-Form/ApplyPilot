import Application from '../models/Application.js';

// @desc    Add a round to an application
// @route   POST /api/applications/:appId/rounds
// @access  Private
export const addRound = async (req, res, next) => {
  try {
    const { appId } = req.params;
    const { roundType, name, scheduledAt, status, notes, outcome, durationMinutes, meetingLink } = req.body;

    if (!roundType || !scheduledAt) {
      return res.status(400).json({
        success: false,
        message: 'Round type and scheduled date/time are required.',
      });
    }

    const scheduledDate = new Date(scheduledAt);
    if (isNaN(scheduledDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid scheduled date and time format.',
      });
    }

    const application = await Application.findOne({
      _id: appId,
      user: req.user._id,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
      });
    }

    const newRound = {
      roundType,
      name: name ? name.trim() : `${roundType} #${application.rounds.length + 1}`,
      scheduledAt: scheduledDate,
      status: status || 'Upcoming',
      notes: notes ? notes.trim() : '',
      outcome: outcome || 'Pending',
      durationMinutes: durationMinutes ? Number(durationMinutes) : 60,
      meetingLink: meetingLink ? meetingLink.trim() : '',
    };

    application.rounds.push(newRound);

    // If application was only Wishlist or Applied, and user adds an OA or Interview round,
    // optionally promote status if current status is earlier
    if (['Wishlist', 'Applied'].includes(application.status)) {
      if (roundType === 'Online Assessment') {
        application.status = 'Online Assessment';
      } else if (roundType.includes('Interview') || roundType === 'Coding Round') {
        application.status = 'Interview';
      }
    }

    await application.save();

    res.status(201).json({
      success: true,
      message: 'Round added successfully.',
      rounds: application.rounds,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a specific round
// @route   PUT /api/applications/:appId/rounds/:roundId
// @access  Private
export const updateRound = async (req, res, next) => {
  try {
    const { appId, roundId } = req.params;
    const { roundType, name, scheduledAt, status, notes, outcome, durationMinutes, meetingLink } = req.body;

    const application = await Application.findOne({
      _id: appId,
      user: req.user._id,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
      });
    }

    const round = application.rounds.id(roundId);
    if (!round) {
      return res.status(404).json({
        success: false,
        message: 'Round not found in this application.',
      });
    }

    if (roundType) round.roundType = roundType;
    if (name !== undefined) round.name = name.trim();
    if (scheduledAt) {
      const scheduledDate = new Date(scheduledAt);
      if (isNaN(scheduledDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid scheduled date and time format.',
        });
      }
      round.scheduledAt = scheduledDate;
    }
    if (status) round.status = status;
    if (notes !== undefined) round.notes = notes.trim();
    if (outcome) round.outcome = outcome;
    if (durationMinutes !== undefined) round.durationMinutes = Number(durationMinutes);
    if (meetingLink !== undefined) round.meetingLink = meetingLink.trim();

    await application.save();

    res.status(200).json({
      success: true,
      message: 'Round updated successfully.',
      rounds: application.rounds,
      round,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a round from an application
// @route   DELETE /api/applications/:appId/rounds/:roundId
// @access  Private
export const deleteRound = async (req, res, next) => {
  try {
    const { appId, roundId } = req.params;

    const application = await Application.findOne({
      _id: appId,
      user: req.user._id,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
      });
    }

    const round = application.rounds.id(roundId);
    if (!round) {
      return res.status(404).json({
        success: false,
        message: 'Round not found.',
      });
    }

    application.rounds.pull(roundId);
    await application.save();

    res.status(200).json({
      success: true,
      message: 'Round deleted successfully.',
      rounds: application.rounds,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all upcoming rounds across all applications for the student
// @route   GET /api/rounds/upcoming
// @access  Private
export const getUpcomingRounds = async (req, res, next) => {
  try {
    const applications = await Application.find({
      user: req.user._id,
      'rounds.0': { $exists: true },
    }).select('company role tier difficulty status rounds');

    const now = new Date();
    const allRounds = [];

    applications.forEach((app) => {
      app.rounds.forEach((round) => {
        allRounds.push({
          applicationId: app._id,
          company: app.company,
          role: app.role,
          tier: app.tier,
          difficulty: app.difficulty,
          appStatus: app.status,
          roundId: round._id,
          roundType: round.roundType,
          name: round.name,
          scheduledAt: round.scheduledAt,
          status: round.status,
          outcome: round.outcome,
          notes: round.notes,
          durationMinutes: round.durationMinutes,
          meetingLink: round.meetingLink,
          isOverdue: round.status === 'Upcoming' && new Date(round.scheduledAt) < now,
        });
      });
    });

    // Sort chronologically
    allRounds.sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));

    res.status(200).json({
      success: true,
      rounds: allRounds,
    });
  } catch (error) {
    next(error);
  }
};
