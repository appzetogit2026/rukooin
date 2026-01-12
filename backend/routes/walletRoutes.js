import express from 'express';
import {
  getWallet,
  getTransactions,
  requestWithdrawal,
  getWithdrawals,
  updateBankDetails,
  getWalletStats
} from '../controllers/walletController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get wallet balance and details
router.get('/', getWallet);

// Get wallet statistics
router.get('/stats', getWalletStats);

// Get transaction history
router.get('/transactions', getTransactions);

// Request withdrawal
router.post('/withdraw', requestWithdrawal);

// Get withdrawal history
router.get('/withdrawals', getWithdrawals);

// Update bank details
router.put('/bank-details', updateBankDetails);

export default router;
