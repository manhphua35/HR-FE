import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import axios from 'axios';
import { API_URL } from '../../../config/index';

interface Department {
  id: number;
  name: string;
}

interface Role {
  id: number;
  name: string;
  roleType: string;
}

interface UserProfile {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phone: string;
  address: string;
  department: Department;
  role: Role;
  hireDate: string;
  remainingLeaves: number;
  baseSalary: number;
  isActive: boolean;
  avatar?: string;
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchUserProfile();
    }
  }, [isOpen, isAuthenticated]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('accessToken');
      
      const response = await axios.get(`${API_URL}/profile/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setProfile(response.data);
    } catch (err: any) {
      console.error('Lỗi khi lấy thông tin hồ sơ:', err);
      setError('Không thể tải thông tin hồ sơ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Thông tin cá nhân</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          ) : profile ? (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
                <img
                  src={profile.avatar || '/logo192.png'}
                  alt={profile.fullName || profile.username}
                  className="w-24 h-24 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-2xl font-bold">{profile.fullName || profile.username}</h3>
                  <p className="text-gray-600">{profile.role?.name || 'Không có vai trò'}</p>
                  <p className="text-gray-600">{profile.department?.name || 'Không có phòng ban'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Thông tin cơ bản</h4>
                  <div className="space-y-2">
                    <div className="flex">
                      <span className="w-32 text-gray-500">Tên đăng nhập:</span>
                      <span>{profile.username}</span>
                    </div>
                    <div className="flex">
                      <span className="w-32 text-gray-500">Email:</span>
                      <span>{profile.email}</span>
                    </div>
                    <div className="flex">
                      <span className="w-32 text-gray-500">Số điện thoại:</span>
                      <span>{profile.phone || 'Chưa cập nhật'}</span>
                    </div>
                    <div className="flex">
                      <span className="w-32 text-gray-500">Địa chỉ:</span>
                      <span>{profile.address || 'Chưa cập nhật'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Thông tin công việc</h4>
                  <div className="space-y-2">
                    <div className="flex">
                      <span className="w-32 text-gray-500">Ngày vào làm:</span>
                      <span>{formatDate(profile.hireDate)}</span>
                    </div>
                    <div className="flex">
                      <span className="w-32 text-gray-500">Lương cơ bản:</span>
                      <span>{profile.baseSalary.toLocaleString('vi-VN')} VND</span>
                    </div>
                    <div className="flex">
                      <span className="w-32 text-gray-500">Ngày phép còn:</span>
                      <span>{profile.remainingLeaves} ngày</span>
                    </div>
                    <div className="flex">
                      <span className="w-32 text-gray-500">Trạng thái:</span>
                      <span className={`px-2 py-1 rounded text-sm ${profile.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {profile.isActive ? 'Đang làm việc' : 'Đã nghỉ việc'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t mt-6">
                <button
                  onClick={onClose}
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                >
                  Đóng
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">Không tìm thấy thông tin người dùng</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
