import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const MagicLoginPage = () => {
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('Verifying your unique access link...');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleMagicLogin = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');

      if (!token) {
        setStatus('error');
        setMessage('No login token found in the link.');
        return;
      }

      try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/magic-login`, { token });

        if (response.data.success) {
          const { token: sessionToken, user } = response.data;
          
          // Save credentials
          localStorage.setItem('token', sessionToken);
          localStorage.setItem('user', JSON.stringify(user));
          
          setStatus('success');
          setMessage(`Welcome back, ${user.name}! Taking you to your dashboard...`);
          
          // Redirect after a short delay to show success
          setTimeout(() => {
            navigate('/hotel/dashboard', { replace: true });
            window.location.reload(); // Ensure everything refreshes
          }, 2000);
        }
      } catch (error) {
        console.error('Magic Login Failed:', error);
        setStatus('error');
        setMessage(error.response?.data?.message || 'Link invalid or expired. Please login with OTP.');
      }
    };

    handleMagicLogin();
  }, [location, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 text-center">
        {status === 'verifying' && (
          <div className="flex flex-col items-center gap-6">
            <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Securing your session</h1>
              <p className="text-slate-500">{message}</p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-10 h-10 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Granted</h1>
              <p className="text-green-600 font-medium">{message}</p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
              <p className="text-red-500 mb-6">{message}</p>
              <button 
                onClick={() => navigate('/hotel/login')}
                className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 transition-colors"
              >
                Go to standard login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MagicLoginPage;
