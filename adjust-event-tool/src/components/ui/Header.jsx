import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../AppIcon';
import Button from './Button';

const Header = () => {
  const navigate = useNavigate();
  const { user, userProfile, signOut, loading } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo/Brand */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
            <Icon name="Gamepad2" size={20} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">KSG Event Tester</h1>
        </div>

        {/* User Section */}
        {user && !loading && (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 bg-gray-50 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors"
            >
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                <Icon name="User" size={16} className="text-blue-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">
                  {userProfile?.full_name || user?.email?.split('@')?.[0]}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {userProfile?.role || 'User'}
                </p>
              </div>
              <Icon 
                name={showUserMenu ? "ChevronUp" : "ChevronDown"} 
                size={16} 
                className="text-gray-400" 
              />
            </button>

            {showUserMenu && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-10"
                  onClick={() => setShowUserMenu(false)}
                />
                
                {/* Menu */}
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                  <div className="p-4 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">
                      {userProfile?.full_name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                    <div className="mt-1">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                        {userProfile?.role || 'tester'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-2">
                    <Button
                      variant="ghost"
                      onClick={handleSignOut}
                      className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <Icon name="LogOut" size={16} className="mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;