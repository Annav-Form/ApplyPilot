import Application from '../models/Application.js';

// @desc    Get all applications for logged-in user with filters and search
// @route   GET /api/applications
// @access  Private
export const getApplications = async (req, res, next) => {
  try {
    const {
      search,
      status,
      tier,
      difficulty,
      priority,
      sortBy = 'appliedDate',
      sortOrder = 'desc',
    } = req.query;

    const query = { user: req.user._id };

    // Search by company, role, or location
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { company: searchRegex },
        { role: searchRegex },
        { location: searchRegex },
      ];
    }

    // Exact filters
    if (status) query.status = status;
    if (tier) query.tier = tier;
    if (difficulty) query.difficulty = difficulty;
    if (priority) query.priority = priority;

    // Sorting
    const sort = {};
    const validSortFields = ['deadline', 'appliedDate', 'company', 'priority', 'status', 'createdAt'];
    const field = validSortFields.includes(sortBy) ? sortBy : 'appliedDate';
    sort[field] = sortOrder === 'asc' ? 1 : -1;

    const applications = await Application.find(query).sort(sort);

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single application by ID
// @route   GET /api/applications/:id
// @access  Private
export const getApplicationById = async (req, res, next) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found or you do not have permission to view it.',
      });
    }

    // Sort rounds chronologically
    application.rounds.sort(
      (a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt)
    );

    res.status(200).json({
      success: true,
      application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new application
// @route   POST /api/applications
// @access  Private
export const createApplication = async (req, res, next) => {
  try {
    const {
      company,
      role,
      description,
      jobUrl,
      location,
      source,
      deadline,
      appliedDate,
      status,
      tier,
      difficulty,
      priority,
      salary,
      additionalNotes,
      rounds,
    } = req.body;

    if (!company || !role) {
      return res.status(400).json({
        success: false,
        message: 'Company name and job title/role are required.',
      });
    }

    const application = await Application.create({
      user: req.user._id,
      company: company.trim(),
      role: role.trim(),
      description: description ? description.trim() : '',
      jobUrl: jobUrl ? jobUrl.trim() : '',
      location: location ? location.trim() : 'Remote / Hybrid',
      source: source ? source.trim() : 'On-Campus',
      deadline: deadline ? new Date(deadline) : null,
      appliedDate: appliedDate ? new Date(appliedDate) : new Date(),
      status: status || 'Applied',
      tier: tier || 'Decent',
      difficulty: difficulty || 'Easy to Crack',
      priority: priority || 'Medium',
      salary: salary ? salary.trim() : '',
      additionalNotes: additionalNotes ? additionalNotes.trim() : '',
      rounds: Array.isArray(rounds) ? rounds : [],
    });

    res.status(201).json({
      success: true,
      message: 'Application created successfully.',
      application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update application
// @route   PUT /api/applications/:id
// @access  Private
export const updateApplication = async (req, res, next) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found or you do not have permission to edit it.',
      });
    }

    const updatableFields = [
      'company',
      'role',
      'description',
      'jobUrl',
      'location',
      'source',
      'deadline',
      'appliedDate',
      'status',
      'tier',
      'difficulty',
      'priority',
      'salary',
      'additionalNotes',
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === 'deadline') {
          application.deadline = req.body.deadline ? new Date(req.body.deadline) : null;
        } else if (field === 'appliedDate') {
          application.appliedDate = req.body.appliedDate ? new Date(req.body.appliedDate) : application.appliedDate;
        } else {
          application[field] = req.body[field];
        }
      }
    });

    await application.save();

    res.status(200).json({
      success: true,
      message: 'Application updated successfully.',
      application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Quick status change
// @route   PATCH /api/applications/:id/status
// @access  Private
export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = [
      'Wishlist',
      'Applied',
      'Online Assessment',
      'Interview',
      'Offer',
      'Rejected',
      'Withdrawn',
    ];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Valid statuses are: ${validStatuses.join(', ')}`,
      });
    }

    const application = await Application.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { status },
      { new: true, runValidators: true }
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: `Status updated to ${status}.`,
      application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete application
// @route   DELETE /api/applications/:id
// @access  Private
export const deleteApplication = async (req, res, next) => {
  try {
    const application = await Application.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Application deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
