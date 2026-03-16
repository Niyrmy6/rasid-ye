/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import OTPVerification from './pages/OTPVerification';
import VerificationSuccess from './pages/VerificationSuccess';
import ForgotPassword from './pages/ForgotPassword';
import NewsFeed from './pages/NewsFeed';
import NewsDetails from './pages/NewsDetails';
import Map from './pages/Map';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import MyReports from './pages/MyReports';
import NewReport from './pages/NewReport';
import ReportSuccess from './pages/ReportSuccess';
import PersonalInfo from './pages/PersonalInfo';
import ContactUs from './pages/ContactUs';
import Journey from './pages/Journey';
import Notifications from './pages/Notifications';
import ReportDetails from './pages/ReportDetails';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<OTPVerification />} />
        <Route path="/verification-success" element={<VerificationSuccess />} />
        <Route path="/news" element={<NewsFeed />} />
        <Route path="/news/:id" element={<NewsDetails />} />
        <Route path="/map" element={<Map />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/my-reports" element={<MyReports />} />
        <Route path="/new-report" element={<NewReport />} />
        <Route path="/report-success" element={<ReportSuccess />} />
        <Route path="/personal-info" element={<PersonalInfo />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/journey" element={<Journey />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/report-details/:id" element={<ReportDetails />} />
      </Routes>
    </BrowserRouter>
  );
}
