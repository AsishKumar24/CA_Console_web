import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ScrollToTop } from "./components/common/ScrollToTop";

import AppLayout from "./layout/AppLayout";

// Pages
import Home from "./pages/Dashboard/Home";
// Auth pages
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import ForgotPassword from "./pages/AuthPages/ForgotPassword";
import ResetPassword from "./pages/AuthPages/ResetPassword";
import NotFound from "./pages/OtherPage/NotFound";

// Route guards
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";
import CreateClient from "./pages/clients/CreateClient";
import SearchClient from "./pages/clients/SearchClient";
import ClientList from "./pages/clients/ClientList";
import ClientDetails from "./pages/clients/ClientDetails";
import TasksPage from "./pages/tasks/TaskPage";
import TaskDetails from "./pages/tasks/TaskDetails";
import MyTasks from "./pages/tasks/MyTasks";
import AdminTaskBoard from "./pages/tasks/AdminTaskBoard";
import AllTasks from "./pages/tasks/AllTasks";
import ArchivedTasks from "./pages/tasks/ArchivedTasks";
import InactiveCleanup from "./pages/management/InactiveCleanup";
import InactiveStaffTasks from "./pages/management/InactiveStaffTasks";
import PaymentSettings from "./pages/billing/PaymentSettings";
import TaskBilling from "./pages/billing/TaskBilling";
import BillingDashboard from "./pages/billing/BillingDashboard";
import OverdueItems from "./pages/Dashboard/OverdueItems";
import ProfilePage from './pages/ProfilePage';

export default function App() {
  return (
    <Router>
      <ScrollToTop />

      <Routes>
        {/* ========== PUBLIC (ONLY SIGNIN) ========== */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* 🔐 Auth protected */}
        <Route element={<ProtectedRoute />}>
          {/* 🧱 Persistent layout */}
          <Route element={<AppLayout />}>
            <Route index path="/" element={<Home />} />
           <Route path="/profile" element={
 
     <ProfilePage />
 } />

            {/* Staff & Admin: My Tasks and Task Details */}
            <Route path="/my-tasks" element={<MyTasks />} />
            <Route path="/tasks/archived" element={<ArchivedTasks />} />
            <Route path="/tasks/:taskId" element={<TaskDetails />} />

            {/* Staff & Admin: Clients */}
            <Route path="/clients" element={<ClientList />} />
            <Route path="/clients/:id" element={<ClientDetails />} />
          </Route>

          {/* ===== ADMIN ONLY ===== */}
          <Route element={<AdminRoute />}>
            <Route path="/signup" element={<SignUp />} />
            <Route element={<AppLayout />}>
              <Route path="/clients/create" element={<CreateClient />} />
              <Route path="/clients/search" element={<SearchClient />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/tasks/list" element={<AllTasks />} />
              <Route path="/my-task-board" element={<AdminTaskBoard />} />

              {/* Billing Routes - Admin Only */}
              <Route path="/billing" element={<BillingDashboard />} />
              <Route path="/billing/settings" element={<PaymentSettings />} />
              <Route path="/billing/task/:taskId" element={<TaskBilling />} />

              {/* Overdue Items */}
              <Route path="/dashboard/overdue" element={<OverdueItems />} />
              <Route path="/management/cleanup" element={<InactiveCleanup />} />
              <Route path="/management/staff-tasks" element={<InactiveStaffTasks />} />
            </Route>
          </Route>
        </Route>

        {/* ========== FALLBACK ========== */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
