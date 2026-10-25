const Profile = require('../models/Profile');

// @desc    Create or update user profile
// @route   POST /api/profile
// @access  Private
exports.createProfile = async (req, res) => {
  try {
    const {
      name,
      age,
      height,
      weight,
      fitnessGoals,
      customGoal,
      fitnessLevel,
      workoutFrequency
    } = req.body;

    // Check if profile already exists
    let profile = await Profile.findOne({ user: req.user.id });

    if (profile) {
      // Update existing profile
      profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        {
          name,
          age,
          height,
          weight,
          fitnessGoals,
          customGoal,
          fitnessLevel,
          workoutFrequency
        },
        { new: true, runValidators: true }
      );

      return res.status(200).json({
        success: true,
        data: profile
      });
    }

    // Create new profile
    profile = await Profile.create({
      user: req.user.id,
      name,
      age,
      height,
      weight,
      fitnessGoals,
      customGoal,
      fitnessLevel,
      workoutFrequency,
      // Initialize with default achievements
      achievements: [
        {
          name: 'First Login',
          description: 'Logged into the app for the first time',
          icon: 'login',
          completed: true,
          dateCompleted: Date.now()
        },
        {
          name: 'Profile Complete',
          description: 'Completed your profile setup',
          icon: 'account-check',
          completed: true,
          dateCompleted: Date.now()
        },
        {
          name: 'First Workout',
          description: 'Complete your first workout',
          icon: 'weight-lifter',
          completed: false
        },
        {
          name: 'Consistency',
          description: 'Complete 5 workouts in a week',
          icon: 'calendar-check',
          completed: false
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get current user's profile
// @route   GET /api/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update user profile stats
// @route   PUT /api/profile/stats
// @access  Private
exports.updateStats = async (req, res) => {
  try {
    const { workoutsCompleted, totalMinutes, averageCaloriesBurned } = req.body;

    const profile = await Profile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Update stats
    if (workoutsCompleted !== undefined) {
      profile.stats.workoutsCompleted = workoutsCompleted;
    }
    if (totalMinutes !== undefined) {
      profile.stats.totalMinutes = totalMinutes;
    }
    if (averageCaloriesBurned !== undefined) {
      profile.stats.averageCaloriesBurned = averageCaloriesBurned;
    }

    await profile.save();

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update user goals
// @route   PUT /api/profile/goals
// @access  Private
exports.updateGoals = async (req, res) => {
  try {
    const { weekly, weight, nextWorkout } = req.body;

    const profile = await Profile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Update goals
    if (weekly) {
      if (weekly.workouts !== undefined) {
        profile.goals.weekly.workouts = weekly.workouts;
      }
      if (weekly.current !== undefined) {
        profile.goals.weekly.current = weekly.current;
      }
    }

    if (weight) {
      if (weight.target !== undefined) {
        profile.goals.weight.target = weight.target;
      }
      if (weight.current !== undefined) {
        profile.goals.weight.current = weight.current;
      }
    }

    if (nextWorkout !== undefined) {
      profile.goals.nextWorkout = nextWorkout;
    }

    await profile.save();

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
