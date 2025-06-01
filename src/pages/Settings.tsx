import React, { useState, useEffect } from 'react';
import { AuthService } from '../services/AuthService';

const Settings: React.FC = () => {
  // State for settings
  const [darkMode, setDarkMode] = useState<boolean>(localStorage.getItem('darkMode') === 'true');
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState<boolean>(false);

  // State for change password modal
  const [oldPassword, setOldPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [passwordSuccess, setPasswordSuccess] = useState<string>('');

  // Effect to apply dark mode on initial load and when it changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

 
  

  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
  };
  

  const openChangePasswordModal = () => {
    setIsChangePasswordModalOpen(true);
    setPasswordError('');
    setPasswordSuccess('');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const closeChangePasswordModal = () => {
    setIsChangePasswordModalOpen(false);
  };

  const handleChangePasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError('Mật khẩu mới và xác nhận mật khẩu không khớp.');
      return;
    }
    if (newPassword.length < 6) { 
       setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự.');
       return;
    }

    try {
      // Gọi API đổi mật khẩu từ AuthService
      await AuthService.changePassword(oldPassword, newPassword);
      
      setPasswordSuccess('Đổi mật khẩu thành công!');
      // Đóng modal sau một khoảng thời gian
      setTimeout(() => {
        closeChangePasswordModal();
      }, 2000);

    } catch (error: any) {
      console.error("Password change failed:", error);
      setPasswordError(error.response?.data?.message || 'Đổi mật khẩu thất bại. Vui lòng thử lại.');
    }
  };


  return (
    <div className="dark:bg-gray-900 min-h-screen p-6"> {/* Added dark mode background */}
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">Cài đặt</h2>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-8">

        {/* Section: Account Security */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Bảo mật tài khoản</h3>
          <div className="space-y-4">
            <div>
              <button
                onClick={openChangePasswordModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm transition duration-150 ease-in-out"
              >
                Đổi mật khẩu
              </button>
            </div>
            {/* MFA Section Removed */}
          </div>
        </div>

        {/* Notification Preferences Section Removed */}

        {/* Section: Language & Interface */}
        <div> {/* Last section doesn't need bottom border/margin */}
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Giao diện</h3>
          <div className="space-y-4">
            {/* <div className="flex items-center justify-between">
              <label htmlFor="language-select" className="text-sm text-gray-700 dark:text-gray-300">Ngôn ngữ</label>
              <select
                id="language-select"
                value={language}
                onChange={handleLanguageChange}
                className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
              >
                <option value="vi">Tiếng Việt</option>
                <option value="en">English</option>
              </select>
            </div> */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Chế độ tối (Dark Mode)</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={handleDarkModeToggle}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
           {/* Save Button for Language */}
           <div className="mt-6 text-right">
             {/* <button
               onClick={handleSaveChanges}
               className="px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm transition duration-150 ease-in-out"
             >
               Lưu thay đổi
             </button> */}
           </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {isChangePasswordModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white dark:bg-gray-800">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 mb-4">Đổi mật khẩu</h3>
            <form onSubmit={handleChangePasswordSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mật khẩu cũ</label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mật khẩu mới</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Xác nhận mật khẩu mới</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-gray-200"
                  />
                </div>
                {passwordError && <p className="text-sm text-red-600 dark:text-red-400">{passwordError}</p>}
                {passwordSuccess && <p className="text-sm text-green-600 dark:text-green-400">{passwordSuccess}</p>}
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeChangePasswordModal}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 text-sm"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  Lưu mật khẩu mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;