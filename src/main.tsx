import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router';
import { Toaster } from 'sonner';
import LandingPage from './features/landing/pages/LandingPage';
import { LoginPage } from './features/auth/pages/LoginPage';
import { SignUpPage } from './features/auth/pages/SignUpPage';
import { OnboardingPage } from './features/onboarding/pages/OnboardingPage';
import { DashboardPage } from './features/dashboard/pages/DashboardPage';
import { MatchSearchPage } from './features/matching/pages/MatchSearchPage';
import { AnonymousChatPage } from './features/chat/pages/AnonymousChatPage';
import { TimeUpPage } from './features/chat/pages/TimeUpPage';
import { FriendsListPage } from './features/friends/pages/FriendsListPage';
import { FriendProfilePage } from './features/friends/pages/FriendProfilePage';
import { PermanentChatPage } from './features/chat/pages/PermanentChatPage';
import { MyProfilePage } from './features/profile/pages/MyProfilePage';
import { SettingsPage } from './features/settings/pages/SettingsPage';
import { NotificationsPage } from './features/notifications/pages/NotificationsPage';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { GuestRoute } from './components/auth/GuestRoute';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/signup" element={<GuestRoute><SignUpPage /></GuestRoute>} />
          <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/match-search" element={<ProtectedRoute><MatchSearchPage /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><AnonymousChatPage /></ProtectedRoute>} />
          <Route path="/time-up" element={<ProtectedRoute><TimeUpPage /></ProtectedRoute>} />
          <Route path="/friends" element={<ProtectedRoute><FriendsListPage /></ProtectedRoute>} />
          <Route path="/friends/:friendId" element={<ProtectedRoute><FriendProfilePage /></ProtectedRoute>} />
          <Route path="/chat/permanent/:chatId" element={<ProtectedRoute><PermanentChatPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><MyProfilePage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
        </Routes>
        <Toaster position="top-center" />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
