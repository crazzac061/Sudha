import { Request, Response } from 'express';
import { Waste } from '../models/Waste';
import { User } from '../models/User';
import { generateQRCode } from '../utils/qrCode';
import { wasteValidationSchema, wasteStatusSchema } from '../utils/validation';

export const createWaste = async (req: Request, res: Response): Promise<Response> => {
  try {
    const validatedData = wasteValidationSchema.parse({
      ...req.body,
      imageUrl: req.file?.path
    });

    const waste = await Waste.create({
      ...validatedData,
      user: req.user?._id,
      status: 'available'
    });

    // Generate QR code
    const qrCode = await generateQRCode(waste._id.toString());
    waste.qrCode = qrCode;
    await waste.save();

    // Add to user's listings
    await User.findByIdAndUpdate(req.user._id, {
      $push: { wasteListings: waste._id }
    });

    return res.status(201).json({
      success: true,
      data: waste
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getWastes = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { type, status, lat, lng, radius } = req.query;
    let query: any = {};

    // Filter by type
    if (type) {
      query.type = type;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Geospatial query if coordinates provided
    if (lat && lng && radius) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng as string), parseFloat(lat as string)]
          },
          $maxDistance: parseFloat(radius as string) * 1000 // Convert km to meters
        }
      };
    }

    const wastes = await Waste.find(query)
      .populate('owner', 'name company')
      .sort('-createdAt');

    return res.json({
      success: true,
      count: wastes.length,
      data: wastes
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getWasteById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const waste = await Waste.findById(req.params.id)
      .populate('owner', 'name company')
      .populate('collector', 'name company')
      .populate('recycler', 'name company');

    if (!waste) {
      return res.status(404).json({
        success: false,
        message: 'Waste listing not found'
      });
    }

    return res.json({
      success: true,
      data: waste
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateWasteStatus = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const validatedData = wasteStatusSchema.parse(req.body);

    const waste = await Waste.findById(id);
    if (!waste) {
      return res.status(404).json({
        success: false,
        message: 'Waste listing not found'
      });
    }

    // Only allow status updates by authorized users
    if (!req.user?._id.equals(waste.owner) && 
        !req.user?._id.equals(waste.collector) && 
        !req.user?._id.equals(waste.recycler)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this waste listing'
      });
    }

    const updatedWaste = await Waste.findByIdAndUpdate(
      id,
      { 
        $set: {
          ...validatedData,
          [validatedData.status === 'collected' ? 'collector' : 'recycler']: req.user?._id
        }
      },
      { new: true }
    ).populate('user', 'name company')
     .populate('collector', 'name company')
     .populate('recycler', 'name company');

    return res.json({
      success: true,
      data: updatedWaste
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getWasteByUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const waste = await Waste.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('user', 'name company')
      .populate('collector', 'name company')
      .populate('recycler', 'name company');

    return res.json({
      success: true,
      data: waste
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const searchWaste = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { query, type, status } = req.query;
    const searchQuery: any = {};

    if (query && typeof query === 'string') {
      searchQuery.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ];
    }

    if (type) {
      searchQuery.wasteType = type;
    }

    if (status) {
      searchQuery.status = status;
    }

    const waste = await Waste.find(searchQuery)
      .sort({ createdAt: -1 })
      .populate('user', 'name company')
      .populate('collector', 'name company')
      .populate('recycler', 'name company');

    return res.json({
      success: true,
      data: waste
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
