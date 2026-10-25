const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please provide a name']
  },
  age: {
    type: Number,
    min: [13, 'Age must be at least 13']
  },
  height: {
    type: Number,
    min: [0, 'Height cannot be negative']
  },
  weight: {
    type: Number,
    min: [0, 'Weight cannot be negative']
  },
  fitnessGoals: {
    type: [String],
    enum: [
      'lose_weight',
      'build_muscle',
      'improve_fitness',
      'increase_strength',
      'improve_health',
      'increase_endurance',
      'improve_flexibility',
      'custom'
    ]
  },
  customGoal: {
    type: String
  },
  fitnessLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced']
  },
  workoutFrequency: {
    type: String,
    enum: ['1-2', '3-4', '5+']
  },
  stats: {
    workoutsCompleted: {
      type: Number,
      default: 0
    },
    totalMinutes: {
      type: Number,
      default: 0
    },
    averageCaloriesBurned: {
      type: Number,
      default: 0
    }
  },
  achievements: [
    {
      name: String,
      description: String,
      icon: String,
      completed: {
        type: Boolean,
        default: false
      },
      dateCompleted: Date
    }
  ],
  goals: {
    weekly: {
      workouts: {
        type: Number,
        default: 3
      },
      current: {
        type: Number,
        default: 0
      }
    },
    weight: {
      target: String,
      current: String
    },
    nextWorkout: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
ProfileSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Profile', ProfileSchema);
