import Wallet from '../models/Wallet.js';
import Transaction from '../models/Transaction.js';
import Withdrawal from '../models/Withdrawal.js';
import PaymentConfig from '../config/payment.config.js';

/**
 * @desc    Get wallet balance and details
 * @route   GET /api/wallet
 * @access  Private (Partner)
 */
export const getWallet = async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ partnerId: req.user._id });

    // Create wallet if doesn't exist
    if (!wallet) {
      wallet = await Wallet.create({
        partnerId: req.user._id,
        balance: 0
      });
    }

    res.json({
      success: true,
      wallet: {
        balance: wallet.balance,
        totalEarnings: wallet.totalEarnings,
        totalWithdrawals: wallet.totalWithdrawals,
        pendingClearance: wallet.pendingClearance,
        lastTransactionAt: wallet.lastTransactionAt,
        bankDetails: wallet.bankDetails
      }
    });

  } catch (error) {
    console.error('Get Wallet Error:', error);
    res.status(500).json({ message: 'Failed to fetch wallet details' });
  }
};

/**
 * @desc    Get wallet transactions
 * @route   GET /api/wallet/transactions
 * @access  Private (Partner)
 */
export const getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, category } = req.query;

    const query = { partnerId: req.user._id };
    if (type) query.type = type;
    if (category) query.category = category;

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Transaction.countDocuments(query);

    res.json({
      success: true,
      transactions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get Transactions Error:', error);
    res.status(500).json({ message: 'Failed to fetch transactions' });
  }
};

/**
 * @desc    Request withdrawal
 * @route   POST /api/wallet/withdraw
 * @access  Private (Partner)
 */
export const requestWithdrawal = async (req, res) => {
  try {
    const { amount } = req.body;

    // Validation
    if (!amount || amount < PaymentConfig.minWithdrawalAmount) {
      return res.status(400).json({
        message: `Minimum withdrawal amount is ₹${PaymentConfig.minWithdrawalAmount}`
      });
    }

    if (amount > PaymentConfig.maxWithdrawalAmount) {
      return res.status(400).json({
        message: `Maximum withdrawal amount is ₹${PaymentConfig.maxWithdrawalAmount}`
      });
    }

    // Get wallet
    const wallet = await Wallet.findOne({ partnerId: req.user._id });
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    if (wallet.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Check bank details
    if (!wallet.bankDetails?.verified) {
      return res.status(400).json({
        message: 'Please add and verify your bank details first'
      });
    }

    // Create withdrawal request
    const withdrawal = await Withdrawal.create({
      partnerId: req.user._id,
      walletId: wallet._id,
      amount,
      bankDetails: wallet.bankDetails,
      status: 'pending'
    });

    // Deduct amount from wallet (move to pending clearance)
    wallet.balance -= amount;
    wallet.pendingClearance += amount;
    await wallet.save();

    // Create transaction
    const transaction = await Transaction.create({
      walletId: wallet._id,
      partnerId: req.user._id,
      type: 'debit',
      category: 'withdrawal',
      amount,
      balanceAfter: wallet.balance,
      description: `Withdrawal Request (${withdrawal.withdrawalId})`,
      reference: withdrawal.withdrawalId,
      status: 'pending'
    });

    withdrawal.transactionId = transaction._id;
    await withdrawal.save();

    res.json({
      success: true,
      message: 'Withdrawal request submitted successfully',
      withdrawal: {
        id: withdrawal.withdrawalId,
        amount: withdrawal.amount,
        status: withdrawal.status,
        estimatedDays: PaymentConfig.withdrawalProcessingDays
      }
    });

  } catch (error) {
    console.error('Request Withdrawal Error:', error);
    res.status(500).json({ message: 'Failed to process withdrawal request' });
  }
};

/**
 * @desc    Get withdrawal history
 * @route   GET /api/wallet/withdrawals
 * @access  Private (Partner)
 */
export const getWithdrawals = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const query = { partnerId: req.user._id };
    if (status) query.status = status;

    const withdrawals = await Withdrawal.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Withdrawal.countDocuments(query);

    res.json({
      success: true,
      withdrawals,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get Withdrawals Error:', error);
    res.status(500).json({ message: 'Failed to fetch withdrawals' });
  }
};

/**
 * @desc    Update bank details
 * @route   PUT /api/wallet/bank-details
 * @access  Private (Partner)
 */
export const updateBankDetails = async (req, res) => {
  try {
    const { accountNumber, ifscCode, accountHolderName, bankName } = req.body;

    // Validation
    if (!accountNumber || !ifscCode || !accountHolderName || !bankName) {
      return res.status(400).json({ message: 'All bank details are required' });
    }

    let wallet = await Wallet.findOne({ partnerId: req.user._id });

    if (!wallet) {
      wallet = await Wallet.create({
        partnerId: req.user._id,
        balance: 0
      });
    }

    wallet.bankDetails = {
      accountNumber,
      ifscCode: ifscCode.toUpperCase(),
      accountHolderName,
      bankName,
      verified: false // Will be verified by admin
    };

    await wallet.save();

    res.json({
      success: true,
      message: 'Bank details updated successfully. Verification pending.',
      bankDetails: wallet.bankDetails
    });

  } catch (error) {
    console.error('Update Bank Details Error:', error);
    res.status(500).json({ message: 'Failed to update bank details' });
  }
};

/**
 * @desc    Get wallet statistics
 * @route   GET /api/wallet/stats
 * @access  Private (Partner)
 */
export const getWalletStats = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ partnerId: req.user._id });

    if (!wallet) {
      return res.json({
        success: true,
        stats: {
          totalEarnings: 0,
          totalWithdrawals: 0,
          currentBalance: 0,
          pendingClearance: 0,
          thisMonthEarnings: 0,
          transactionCount: 0
        }
      });
    }

    // Get current month earnings
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const thisMonthTransactions = await Transaction.find({
      partnerId: req.user._id,
      type: 'credit',
      category: 'booking_payment',
      createdAt: { $gte: startOfMonth }
    });

    const thisMonthEarnings = thisMonthTransactions.reduce((sum, txn) => sum + txn.amount, 0);
    const transactionCount = await Transaction.countDocuments({ partnerId: req.user._id });

    res.json({
      success: true,
      stats: {
        totalEarnings: wallet.totalEarnings,
        totalWithdrawals: wallet.totalWithdrawals,
        currentBalance: wallet.balance,
        pendingClearance: wallet.pendingClearance,
        thisMonthEarnings,
        transactionCount
      }
    });

  } catch (error) {
    console.error('Get Wallet Stats Error:', error);
    res.status(500).json({ message: 'Failed to fetch wallet statistics' });
  }
};
