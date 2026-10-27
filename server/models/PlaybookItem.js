import mongoose from 'mongoose';

const playbookItemSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    topic: {
      type: String,
      required: [true, 'Topic or preparation item title is required'],
      trim: true,
      maxlength: [150, 'Topic cannot exceed 150 characters'],
    },
    targetGroups: {
      type: [String],
      required: [true, 'At least one target group tag is required'],
      validate: {
        validator: function (groups) {
          if (!groups || groups.length === 0) return false;
          const valid = ['Decent', 'Excellent', 'Easy to Crack', 'Hard to Crack'];
          return groups.every((g) => valid.includes(g));
        },
        message: 'Valid tags are: Decent, Excellent, Easy to Crack, Hard to Crack',
      },
      default: ['Decent'],
    },
    priority: {
      type: String,
      enum: {
        values: ['Low', 'Medium', 'High'],
        message: '{VALUE} is not a valid priority',
      },
      default: 'Medium',
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    estimatedHours: {
      type: Number,
      min: [0.5, 'Estimated hours must be at least 0.5'],
      max: [200, 'Estimated hours cannot exceed 200'],
      default: 2,
    },
  },
  {
    timestamps: true,
  }
);

playbookItemSchema.index({ user: 1, targetGroups: 1 });
playbookItemSchema.index({ user: 1, isCompleted: 1 });

const PlaybookItem = mongoose.model('PlaybookItem', playbookItemSchema);
export default PlaybookItem;
