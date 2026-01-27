import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DashboardLayout from "./components/layout/DashboardLayout";
import NotFound from "./pages/NotFound";
import UserList from "./pages/users/UserList";
import UserForm from "./pages/users/UserForm";
import UserPermissions from "./pages/users/UserPermissions";
import OperatorList from "./pages/operators/OperatorList";
import OperatorForm from "./pages/operators/OperatorForm";
import OperatorPermissions from "./pages/operators/OperatorPermissions";
import InputsPage from "./pages/inputs/InputsPage";
import CrmPage from "./pages/crm/CrmPage";
import CaseDispatchPage from "./pages/cases/CaseDispatchPage";
import SalesSmartboard from "./pages/smartboard/SalesSmartboard";
import AccountSmartboard from "./pages/smartboard/AccountSmartboard";
import SmartboardRouter from "./pages/smartboard/SmartboardRouter";
import MyClientsPage from "./pages/my-clients/MyClientsPage";
import ClientActivityPage from "./pages/my-clients/ClientActivityPage";
import DataPage from "./pages/data/DataPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<SmartboardRouter />} />
              <Route path="todo" element={<Dashboard />} />
              <Route path="users" element={<UserList />} />
              <Route path="users/new" element={<UserForm />} />
              <Route path="users/:userId/edit" element={<UserForm />} />
              <Route path="users/:userId/permissions" element={<UserPermissions />} />
              <Route path="settings/operators" element={<OperatorList />} />
              <Route path="settings/operators/new" element={<OperatorForm />} />
              <Route path="settings/operators/:operatorId/permissions" element={<OperatorPermissions />} />
              <Route path="inputs" element={<InputsPage />} />
              <Route path="crm" element={<CrmPage />} />
              <Route path="smartboard/sales" element={<SalesSmartboard />} />
              <Route path="smartboard/account" element={<AccountSmartboard />} />
              <Route path="case-dispatch" element={<CaseDispatchPage />} />
              <Route path="my-clients" element={<MyClientsPage />} />
              <Route path="my-clients/:companyId" element={<ClientActivityPage />} />
              <Route path="data" element={<DataPage />} />
              <Route path="digital/data" element={<DataPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
