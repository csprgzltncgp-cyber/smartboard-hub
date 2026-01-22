import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DashboardLayout from "./components/layout/DashboardLayout";
import NotFound from "./pages/NotFound";
import UserList from "./pages/users/UserList";
import UserForm from "./pages/users/UserForm";
import UserPermissions from "./pages/users/UserPermissions";
import SettingsMenu from "./pages/settings/SettingsMenu";
import DigitalMenu from "./pages/digital/DigitalMenu";
import OperatorList from "./pages/operators/OperatorList";
import OperatorForm from "./pages/operators/OperatorForm";
import OperatorPermissions from "./pages/operators/OperatorPermissions";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="users" element={<UserList />} />
            <Route path="users/new" element={<UserForm />} />
            <Route path="users/:userId/permissions" element={<UserPermissions />} />
            <Route path="settings" element={<SettingsMenu />} />
            <Route path="settings/operators" element={<OperatorList />} />
            <Route path="settings/operators/new" element={<OperatorForm />} />
            <Route path="settings/operators/:operatorId/permissions" element={<OperatorPermissions />} />
            <Route path="digital" element={<DigitalMenu />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
