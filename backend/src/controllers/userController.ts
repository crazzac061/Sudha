import { Request, Response } from 'express';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { registerSchema, loginSchema, updateProfileSchema } from '../utils/validation';

const generateToken = (user: IUser): string => {
  const payload = { 
    id: user._id.toString(),
    role: user.role
  };

  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  const secret: Secret = process.env.JWT_SECRET;
  const options: SignOptions = {
    expiresIn: '24h'
  };

  return jwt.sign(payload, secret, options);
};

export const register = async (req: Request, res: Response): Promise<Response> => {
  try {
    // Validate input
    const validatedData = registerSchema.parse(req.body);

    // Check if user exists
    const userExists = await User.findOne({ 
      email: validatedData.email.toLowerCase()
    });
    
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Create user with validated data
    const user = await User.create({
      ...validatedData,
      email: validatedData.email.toLowerCase(),
      impactScore: 0,
      totalWasteListed: 0,
      badges: []
    });

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        company: user.company,
        location: user.location,
        role: user.role
      }
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    // Validate input
    const validatedData = loginSchema.parse(req.body);

    // Check if user exists and include password for comparison
    const user = await User.findOne({ 
      email: validatedData.email.toLowerCase() 
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password with rate limiting (implemented in auth middleware)
    const isMatch = await user.comparePassword(validatedData.password);
    if (!isMatch) {
      // Increment failed attempts (implement in User model)
      await User.updateOne(
        { _id: user._id },
        { $inc: { loginAttempts: 1 } }
      );

      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Reset login attempts on successful login
    await User.updateOne(
      { _id: user._id },
      { $set: { loginAttempts: 0, lastLogin: new Date() } }
    );

    const token = generateToken(user);

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        company: user.company,
        location: user.location,
        role: user.role
      }
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getCurrentUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        company: user.company,
        location: user.location,
        role: user.role
      }
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<Response> => {
  try {
    // Validate input
    const validatedData = updateProfileSchema.parse(req.body);

    // Only update fields that were provided
    const updates = Object.entries(validatedData)
      .filter(([_, value]) => value !== undefined)
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

    // Update user with validated data
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      {
        new: true,
        runValidators: true
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        company: user.company,
        location: user.location,
        role: user.role
      }
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
