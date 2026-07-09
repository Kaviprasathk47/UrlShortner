import mongoose from "mongoose";

const urlSchema = new mongoose.Schema({
  alias: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true,
  },
  longUrl: {
    type: String,
    required: true,
  },
  clickCount: {
    type: Number,
    required: true,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    default: null,
  },
});

const Url = mongoose.model("Url", urlSchema);

export default Url;
