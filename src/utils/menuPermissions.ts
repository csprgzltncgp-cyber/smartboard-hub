import { User } from "@/types/user";
import { SMARTBOARDS, SmartboardMenuItem } from "@/config/smartboards";

// Map menu paths to smartboard menu item IDs
const pathToSmartboardMenuMap: Record<string, string[]> = {
  // Account menük
  "/dashboard/companies": ["account_companies"],
  "/dashboard/settings/companies": ["account_companies"],
  "/dashboard/company-permissions": ["account_company_permissions"],
  "/dashboard/settings/permissions": ["account_company_permissions"],
  "/dashboard/inputs": ["account_inputs", "op_inputs"],
  "/dashboard/my-clients": ["account_my_clients"],
  "/dashboard/activity-plan": ["account_my_clients"],
  "/dashboard/reports": ["account_reports", "dig_reports"],
  "/dashboard/ws-ci-o": ["account_ws_ci_o"],
  "/dashboard/outsources": ["account_ws_ci_o"],
  
  // Operatív menük
  "/dashboard/experts": ["op_experts_list", "opr_experts"],
  "/dashboard/settings/experts": ["op_experts_list", "opr_experts"],
  "/dashboard/expert-search": ["op_expert_search"],
  "/dashboard/affiliate-search": ["op_expert_search"],
  "/dashboard/notifications": ["op_notifications"],
  "/dashboard/all-cases": ["op_all_cases"],
  "/dashboard/cases/closed": ["op_all_cases"],
  "/dashboard/operators": ["op_operators"],
  "/dashboard/settings/operators": ["op_operators"],
  "/dashboard/training": ["op_training"],
  "/dashboard/settings/training": ["op_training"],
  "/dashboard/countries": ["op_countries"],
  "/dashboard/settings/countries": ["op_countries"],
  "/dashboard/cities": ["op_cities"],
  "/dashboard/settings/cities": ["op_cities"],
  "/dashboard/inventory": ["op_inventory", "fin_inventory"],
  "/dashboard/assets": ["op_inventory", "fin_inventory"],
  
  // Sales menük
  "/dashboard/crm": ["sales_crm"],
  
  // Pénzügyi menük
  "/dashboard/invoices": ["fin_invoices"],
  
  // Digital menük
  "/dashboard/eap-online": ["dig_eap_online"],
  "/dashboard/digital/eap-online": ["dig_eap_online"],
  "/dashboard/blog": ["dig_blog"],
  "/dashboard/digital/blog": ["dig_blog"],
  "/dashboard/business-breakfast": ["dig_breakfast"],
  "/dashboard/digital/business-breakfast": ["dig_breakfast"],
  "/dashboard/lottery": ["dig_lottery"],
  "/dashboard/digital/prizegame": ["dig_lottery"],
  "/dashboard/risk-assessment": ["dig_risk"],
  "/dashboard/digital/psychosocial-risk-assessment": ["dig_risk"],
  "/dashboard/data": ["dig_data"],
  "/dashboard/digital/data": ["dig_data"],
  
  // Operátor menük
  "/dashboard/cases-in-progress": ["opr_cases_in_progress"],
  "/dashboard/cases/in-progress": ["opr_cases_in_progress"],
  "/dashboard/chat": ["opr_chat"],
  "/dashboard/case-dispatch": ["opr_dispatch"],
  "/dashboard/eap-messages": ["opr_eap_messages"],
  "/dashboard/qa": ["opr_qa"],
  
  // Always visible
  "/dashboard": [], // TODO page - always visible
  "/dashboard/users": ["admin_all"], // Admin only
};

// Get all enabled menu item IDs for a user
export const getUserEnabledMenuItems = (user: User): string[] => {
  const enabledItems: string[] = [];
  
  // Check if user has admin smartboard - if so, all menus are available
  const hasAdmin = user.smartboardPermissions.some(p => p.smartboardId === "admin");
  if (hasAdmin) {
    // Return all possible menu IDs
    SMARTBOARDS.forEach(sb => {
      sb.menuItems.forEach(item => {
        enabledItems.push(item.id);
      });
    });
    return enabledItems;
  }
  
  // Collect enabled menu items from all assigned smartboards
  user.smartboardPermissions.forEach(permission => {
    enabledItems.push(...permission.enabledMenuItems);
  });
  
  // Always add search smartboard items
  const searchSmartboard = SMARTBOARDS.find(sb => sb.id === "search");
  if (searchSmartboard) {
    searchSmartboard.menuItems.forEach(item => {
      if (!enabledItems.includes(item.id)) {
        enabledItems.push(item.id);
      }
    });
  }
  
  return enabledItems;
};

// Check if a menu path is accessible for a user
export const isMenuAccessible = (path: string, user: User | null): boolean => {
  // Always accessible paths
  if (path === "/dashboard") return true;
  
  // If no user, no access
  if (!user) return false;
  
  // Check if user has admin - admin sees everything
  const hasAdmin = user.smartboardPermissions.some(p => p.smartboardId === "admin");
  if (hasAdmin) return true;
  
  // Get the required menu item IDs for this path
  const requiredMenuIds = pathToSmartboardMenuMap[path];
  
  // If path is not mapped, hide it (conservative approach)
  if (!requiredMenuIds) return false;
  
  // If empty array, it's always visible
  if (requiredMenuIds.length === 0) return true;
  
  // Get user's enabled menu items
  const userMenuItems = getUserEnabledMenuItems(user);
  
  // Check if user has ANY of the required menu items
  return requiredMenuIds.some(id => userMenuItems.includes(id));
};

// Filter menu items based on user permissions
export const filterMenuItems = <T extends { path: string }>(
  menuItems: T[],
  user: User | null
): T[] => {
  return menuItems.filter(item => isMenuAccessible(item.path, user));
};
