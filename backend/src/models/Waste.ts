import mongoose from 'mongoose';

export interface IWaste extends mongoose.Document {
  type: string;
  quantity: number;
  unit: string;
  condition: string;
  description: string;
  images: string[];
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  status: 'available' | 'collected' | 'recycled';
  owner: mongoose.Types.ObjectId;
  collector?: mongoose.Types.ObjectId;
  recycler?: mongoose.Types.ObjectId;
  qrCode?: string;
  craftSuggestions: mongoose.Types.ObjectId[];
}

const wasteSchema = new mongoose.Schema<IWaste>(
  {
    type: {
      type: String,
      required: [true, 'Waste type is required'],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      enum: ['kg', 'liters', 'pieces'],
      default: 'kg',
    },
    condition: {
      type: String,
      required: [true, 'Condition is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    images: [{
      type: String,
      required: [true, 'At least one image is required'],
    }],
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    status: {
      type: String,
      enum: ['available', 'collected', 'recycled'],
      default: 'available',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    collector: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    recycler: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    qrCode: {
      type: String,
    },
    craftSuggestions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CraftProject',
    }],
  },
  {
    timestamps: true,
  }
);

// Create a 2dsphere index for location-based queries
wasteSchema.index({ location: '2dsphere' });

export const Waste = mongoose.model<IWaste>('Waste', wasteSchema);
