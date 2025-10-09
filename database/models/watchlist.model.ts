import { Schema, model, models, type Document, type Model, Query } from 'mongoose';
import { cleanStockSymbol } from '@/utils/stockUtils';

export interface WatchlistItem extends Document {
  userId: string;
  symbol: string;
  company: string;
  addedAt: Date;
}

const WatchlistSchema = new Schema<WatchlistItem>(
  {
    userId: { type: String, required: true, index: true },
    symbol: { type: String, required: true, uppercase: true, trim: true },
    company: { type: String, required: true, trim: true },
    addedAt: { type: Date, default: Date.now },
  },
  { 
    timestamps: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Clean symbol before saving
WatchlistSchema.pre('save', function(next) {
  if (this.symbol) {
    this.symbol = cleanStockSymbol(this.symbol);
  }
  next();
});

// Clean symbol in queries
WatchlistSchema.pre(/^find/, function(this: Query<any, any>, next) {
  const query = this as any;
  if (query.getQuery().symbol) {
    query.getQuery().symbol = cleanStockSymbol(query.getQuery().symbol);
  }
  next();
});

// Prevent duplicate symbols per user
WatchlistSchema.index({ userId: 1, symbol: 1 }, { 
  unique: true,
  background: true,
  name: 'idx_user_symbol'
});

// Error handling
WatchlistSchema.post('save', function(error: any, doc: any, next: any) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    next(new Error('Stock already exists in watchlist'));
  } else {
    next(error);
  }
});

export const Watchlist: Model<WatchlistItem> =
  (models?.Watchlist as Model<WatchlistItem>) || model<WatchlistItem>('Watchlist', WatchlistSchema);