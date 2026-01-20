import apiService from './apiService';

class WalletService {
  /**
   * Get wallet balance and details
   */
  async getWallet() {
    const response = await apiService.get('/wallet');
    return response.data;
  }

  /**
   * Get wallet statistics
   */
  async getWalletStats() {
    const response = await apiService.get('/wallet/stats');
    return response.data;
  }

  /**
   * Get transaction history
   */
  async getTransactions(params = {}) {
    const { page = 1, limit = 20, type, category } = params;
    const queryParams = new URLSearchParams({
      page,
      limit,
      ...(type && { type }),
      ...(category && { category })
    });

    const response = await apiService.get(`/wallet/transactions?${queryParams}`);
    return response.data;
  }

  /**
   * Request withdrawal
   */
  async requestWithdrawal(amount) {
    const response = await apiService.post('/wallet/withdraw', { amount });
    return response.data;
  }

  /**
   * Get withdrawal history
   */
  async getWithdrawals(params = {}) {
    const { page = 1, limit = 20, status } = params;
    const queryParams = new URLSearchParams({
      page,
      limit,
      ...(status && { status })
    });

    const response = await apiService.get(`/wallet/withdrawals?${queryParams}`);
    return response.data;
  }

  /**
   * Update bank details
   */
  async updateBankDetails(bankDetails) {
    const response = await apiService.put('/wallet/bank-details', bankDetails);
    return response.data;
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
