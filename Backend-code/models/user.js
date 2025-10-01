const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  age: {
    type: Number,
    min: [1, 'Age must be at least 1'],
    max: [120, 'Age must be less than 120']
  },
  weight: {
    type: Number,
    min: [1, 'Weight must be at least 1']
  },
  height: {
    type: Number,
    min: [1, 'Height must be at least 1']
  },
  goals: {
    water: { 
      type: Number, 
      default: 2000,
      min: [500, 'Water goal must be at least 500ml']
    }, // ml
    food: { 
      type: Number, 
      default: 2000,
      min: [1000, 'Food goal must be at least 1000 calories']
    },  // calories
    sleep: { 
      type: Number, 
      default: 8,
      min: [4, 'Sleep goal must be at least 4 hours'],
      max: [12, 'Sleep goal must be less than 12 hours']
    }     // hours
  },

  // === RESET PASSWORD FIELDS ===
  // store temporary verification/reset code and expiry
  resetCode: { type: String, default: undefined },
  resetCodeExpiry: { type: Date, default: undefined }

}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  try {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();
    
    // Hash password with cost of 12
    const hashedPassword = await bcrypt.hash(this.password, 12);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Optional helper to set reset code + expiry and save
userSchema.methods.setResetCode = async function(code, ttlMinutes = 15) {
  this.resetCode = code;
  this.resetCodeExpiry = Date.now() + ttlMinutes * 60 * 1000;
  return this.save();
};

// Remove sensitive fields from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.resetCode;
  delete userObject.resetCodeExpiry;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);
