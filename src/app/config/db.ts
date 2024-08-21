import dotenv from 'dotenv'
import mongoose, { ConnectOptions } from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI as string);

    console.log(`MongoDB is connected`);
  } catch (err) {
    console.log(`Error: ${(err as Error).message}`);
    // Exit process with failure
    process.exit(1);
  }
};

export default connectDB;