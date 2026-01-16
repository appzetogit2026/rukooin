import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema({
  partnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    default: 0,
    min: 0
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

const Wallet = mongoose.model('Wallet', walletSchema);
export default Wallet;
