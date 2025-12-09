import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAuthAPI } from '../services/api';
import ConfirmationModal from '../components/ConfirmationModal';

export default function ChangePassword() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    return '';
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (currentPassword === newPassword) {
      setError('New password must be different from current password');
      return;
    }

    setShowConfirmModal(true);
  };

  const confirmChangePassword = async () => {
    setShowConfirmModal(false);
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await adminAuthAPI.changePassword(currentPassword, newPassword);
      setSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err?.message || 'Failed to change password. Please check your current password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) navigate('/dashboard');
      }}
    >
      <div className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <h1 className="text-3xl font-bold mb-2 text-white">Change Password</h1>
        <p className="text-sm text-gray-300 mb-6">Update your admin password below.</p>

        <div className="bg-[#2b2b2b] border border-[#3c3c3c] rounded-2xl shadow-2xl p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-900/60 border border-red-500 text-red-100 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-900/60 border border-green-500 text-green-100 rounded">
              {success}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPassword.current ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1f1f1f] text-white border border-[#4a4a4a] rounded-md focus:outline-none focus:ring-2 focus:ring-[#900C27] focus:border-[#900C27] placeholder-gray-500"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                  className="absolute right-2 top-2 text-gray-400 hover:text-gray-200"
                >
                  {showPassword.current ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword.new ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1f1f1f] text-white border border-[#4a4a4a] rounded-md focus:outline-none focus:ring-2 focus:ring-[#900C27] focus:border-[#900C27] placeholder-gray-500"
                  placeholder="Enter new password (min 8 characters)"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                  className="absolute right-2 top-2 text-gray-400 hover:text-gray-200"
                >
                  {showPassword.new ? '🙈' : '👁️'}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">Must be at least 8 characters long</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword.confirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1f1f1f] text-white border border-[#4a4a4a] rounded-md focus:outline-none focus:ring-2 focus:ring-[#900C27] focus:border-[#900C27] placeholder-gray-500"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                  className="absolute right-2 top-2 text-gray-400 hover:text-gray-200"
                >
                  {showPassword.confirm ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-[#900C27] text-white py-2 px-4 rounded-md hover:bg-[#7a0a20] transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#900C27]/30"
            >
              {loading ? 'Changing Password...' : 'Change Password'}
            </button>
          </div>
        </div>

        <ConfirmationModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={confirmChangePassword}
          title="Change Password"
          message="Are you sure you want to change your password?"
          confirmText="Change Password"
          cancelText="Cancel"
        />
      </div>
    </div>
  );
}

