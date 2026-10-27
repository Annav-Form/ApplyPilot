import mongoose from 'mongoose';

const roundSchema = new mongoose.Schema(
  {
    roundType: {
      type: String,
      required: [true, 'Round type is required'],
      enum: {
        values: [
          'Online Assessment',
          'Coding Round',
          'Technical Interview',
          'HR Interview',
          'Managerial Interview',
          'Other',
        ],
        message: '{VALUE} is not a valid round type',
      },
    },
    name: {
      type: String,
      trim: true,
      default: '',
    },
    scheduledAt: {
      type: Date,
      required: [true, 'Scheduled date and time is required'],
    },
    status: {
      type: String,
      enum: {
        values: ['Upcoming', 'Completed', 'Missed', 'Rescheduled'],
        message: '{VALUE} is not a valid round status',
      },
      default: 'Upcoming',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    outcome: {
      type: String,
      enum: {
        values: ['Cleared', 'Pending', 'Rejected', 'N/A'],
        message: '{VALUE} is not a valid outcome',
      },
      default: 'Pending',
    },
    durationMinutes: {
      type: Number,
      min: [5, 'Duration must be at least 5 minutes'],
      max: [480, 'Duration cannot exceed 480 minutes'],
      default: 60,
    },
    meetingLink: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const applicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters'],
    },
    role: {
      type: String,
      required: [true, 'Job title or role is required'],
      trim: true,
      maxlength: [100, 'Role title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    jobUrl: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: String,
      trim: true,
      default: 'Remote / Hybrid',
    },
    source: {
      type: String,
      trim: true,
      default: 'On-Campus',
    },
    deadline: {
      type: Date,
      default: null,
    },
    appliedDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: {
        values: [
          'Wishlist',
          'Applied',
          'Online Assessment',
          'Interview',
          'Offer',
          'Rejected',
          'Withdrawn',
        ],
        message: '{VALUE} is not a valid application status',
      },
      default: 'Applied',
    },
    // Company Classification
    tier: {
      type: String,
      enum: {
        values: ['Decent', 'Excellent'],
        message: '{VALUE} is not a valid tier. Must be Decent or Excellent',
      },
      required: [true, 'Company tier is required'],
      default: 'Decent',
    },
    difficulty: {
      type: String,
      enum: {
        values: ['Easy to Crack', 'Hard to Crack'],
        message: '{VALUE} is not a valid difficulty. Must be Easy to Crack or Hard to Crack',
      },
      required: [true, 'Difficulty classification is required'],
      default: 'Easy to Crack',
    },
    priority: {
      type: String,
      enum: {
        values: ['Low', 'Medium', 'High'],
        message: '{VALUE} is not a valid priority',
      },
      default: 'Medium',
    },
    salary: {
      type: String,
      trim: true,
      default: '',
    },
    additionalNotes: {
      type: String,
      trim: true,
      default: '',
    },
    rounds: [roundSchema],
  },
  {
    timestamps: true,
  }
);

// Indexes for fast querying and filtering
applicationSchema.index({ user: 1, status: 1 });
applicationSchema.index({ user: 1, tier: 1 });
applicationSchema.index({ user: 1, difficulty: 1 });
applicationSchema.index({ user: 1, deadline: 1 });

const Application = mongoose.model('Application', applicationSchema);
export default Application;
