import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema({
  partnerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'modelType'
  },
  modelType: {
    type: String,
    required: true,
    enum: ['User', 'Partner', 'Admin'],
    default: 'User'
  },
  role: {
    type: String,
    enum: ['user', 'partner', 'admin'],
    default: 'partner',
    required: true
  },
  balance: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  totalWithdrawals: {
    type: Number,
    default: 0
  },
  pendingClearance: {
    type: Number,
    default: 0,
    comment: 'Amount pending settlement'
  },
  lastTransactionAt: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    accountHolderName: String,
    bankName: String,
    verified: {
      type: Boolean,
      default: false
    }
  }
}, { timestamps: true });

// Pre-save hook to set modelType based on role
walletSchema.pre('save', function (next) {
  if (this.role === 'partner') {
    this.modelType = 'Partner';
  } else if (this.role === 'admin') {
    this.modelType = 'Admin';
  } else {
    this.modelType = 'User';
  }
  next();
});

// Methods
walletSchema.methods.credit = async function (amount, description, reference, type = 'booking_payment') {
  this.balance += amount;
  if (type !== 'topup') {
    this.totalEarnings += amount;
  }
  this.lastTransactionAt = new Date();
  await this.save();

  // Create transaction record
  const Transaction = mongoose.model('Transaction');
  await Transaction.create({
    walletId: this._id,
    partnerId: this.partnerId,
    modelType: this.modelType,
    type: 'credit',
    category: type,
    amount,
    balanceAfter: this.balance,
    description,
    reference,
    status: 'completed'
  });

  return this;
};

walletSchema.methods.debit = async function (amount, description, reference, type = 'withdrawal') {
  if (this.balance < amount) {
    throw new Error('Insufficient balance');
  }

  this.balance -= amount;
  this.totalWithdrawals += amount;
  this.lastTransactionAt = new Date();
  await this.save();

  // Create transaction record
  const Transaction = mongoose.model('Transaction');
  await Transaction.create({
    walletId: this._id,
    partnerId: this.partnerId,
    modelType: this.modelType,
    type: 'debit',
    category: type,
    amount,
    balanceAfter: this.balance,
    description,
    reference,
    status: 'completed'
  });

  return this;
};

// Indexes
walletSchema.index({ createdAt: -1 });
walletSchema.index({ partnerId: 1, role: 1 }, { unique: true }); // Composite key

const Wallet = mongoose.model('Wallet', walletSchema);
export default Wallet;
