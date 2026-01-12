import apiService from './apiService';

class WalletService {
  /**
   * Get wallet balance and details
   */
  async getWallet() {
    try {
      const response = await apiService.get('/wallet');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get wallet statistics
   */
  async getWalletStats() {
    try {
      const response = await apiService.get('/wallet/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get transaction history
   */
  async getTransactions(params = {}) {
    try {
      const { page = 1, limit = 20, type, category } = params;
      const queryParams = new URLSearchParams({
        page,
        limit,
        ...(type && { type }),
        ...(category && { category })
      });

      const response = await apiService.get(`/wallet/transactions?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Request withdrawal
   */
  async requestWithdrawal(amount) {
    try {
      const response = await apiService.post('/wallet/withdraw', { amount });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get withdrawal history
   */
  async getWithdrawals(params = {}) {
    try {
      const { page = 1, limit = 20, status } = params;
      const queryParams = new URLSearchParams({
        page,
        limit,
        ...(status && { status })
      });

      const response = await apiService.get(`/wallet/withdrawals?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update bank details
   */
  async updateBankDetails(bankDetails) {
    try {
      const response = await apiService.put('/wallet/bank-details', bankDetails);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Format amount to INR currency
   */
  formatAmount(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  }
}

export default new WalletService();
