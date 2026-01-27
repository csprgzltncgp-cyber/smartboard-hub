// SmartBoard configuration - defines all available smartboards and their menu items

export interface SmartboardMenuItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
}

export interface SmartboardConfig {
  id: string;
  name: string;
  description: string;
  menuItems: SmartboardMenuItem[];
  panels: string[]; // Panel descriptions for reference
  alwaysEnabled?: boolean; // If true, this smartboard is always enabled for all users
}

export const SMARTBOARDS: SmartboardConfig[] = [
  // Admin at the top - valamennyi menüpont
  {
    id: "admin",
    name: "Admin",
    description: "Adminisztrátori funkciók - valamennyi menüpont elérhető",
    menuItems: [
      { id: "admin_all", label: "Valamennyi menüpont", path: "/dashboard" },
    ],
    panels: [
      "Valamennyi menüpont elérhető",
    ],
  },
  {
    id: "account",
    name: "Account",
    description: "Ügyfélkezelés és account management",
    menuItems: [
      { id: "account_companies", label: "Cégek", path: "/dashboard/companies" },
      { id: "account_company_permissions", label: "Cég jogosultságok listája", path: "/dashboard/company-permissions" },
      { id: "account_inputs", label: "Inputok", path: "/dashboard/inputs" },
      { id: "account_my_clients", label: "Ügyfeleim", path: "/dashboard/my-clients" },
      { id: "account_reports", label: "Riportok", path: "/dashboard/reports" },
      { id: "account_ws_ci_o", label: "WS/CI/O", path: "/dashboard/ws-ci-o" },
    ],
    panels: [
      "Cégek kezelése",
      "Cég jogosultságok listája",
      "Inputok kezelése",
      "Ügyfeleim",
      "Riportok",
      "WS/CI/O események",
    ],
  },
  {
    id: "operative",
    name: "Operatív",
    description: "Operatív feladatok és esetkezelés",
    menuItems: [
      { id: "op_experts_list", label: "Szakértők", path: "/dashboard/experts" },
      { id: "op_expert_search", label: "Szakértők keresése", path: "/dashboard/expert-search" },
      { id: "op_notifications", label: "Értesítések", path: "/dashboard/notifications" },
      { id: "op_all_cases", label: "Összes eset", path: "/dashboard/all-cases" },
      { id: "op_operators", label: "Operátorok", path: "/dashboard/operators" },
      { id: "op_training", label: "Training dashboard", path: "/dashboard/training" },
      { id: "op_inputs", label: "Inputok", path: "/dashboard/inputs" },
      { id: "op_countries", label: "Országok", path: "/dashboard/countries" },
      { id: "op_cities", label: "Városok", path: "/dashboard/cities" },
      { id: "op_inventory", label: "Leltár", path: "/dashboard/inventory" },
    ],
    panels: [
      "Szakértők listája",
      "Szakértők keresése",
      "Értesítések",
      "Összes eset",
      "Operátorok kezelése",
      "Training dashboard",
      "Inputok",
      "Országok",
      "Városok",
      "Leltár",
    ],
  },
  {
    id: "sales",
    name: "Sales",
    description: "Értékesítés és ügyfélszerzés",
    menuItems: [
      { id: "sales_smartboard", label: "Sales SmartBoard", path: "/dashboard/smartboard/sales" },
      { id: "sales_crm", label: "CRM", path: "/dashboard/crm" },
    ],
    panels: [
      "Szerződés lejár - figyelmeztetés 30 napon belül lejáró szerződésekre",
      "CRM Összefoglaló - Leadek, ajánlatok, tárgyalások, aláírt szerződések",
      "Közelgő találkozók - ütemezett megbeszélések listája",
    ],
  },
  {
    id: "financial",
    name: "Pénzügyi",
    description: "Pénzügyi műveletek és számlázás",
    menuItems: [
      { id: "fin_invoices", label: "Számlák", path: "/dashboard/invoices" },
      { id: "fin_inventory", label: "Leltár", path: "/dashboard/inventory" },
    ],
    panels: [
      "Számlák kezelése",
      "Leltár",
    ],
  },
  {
    id: "digital",
    name: "Digital",
    description: "Digitális platformok és tartalmak",
    menuItems: [
      { id: "dig_eap_online", label: "EAP Online", path: "/dashboard/eap-online" },
      { id: "dig_blog", label: "Blog", path: "/dashboard/blog" },
      { id: "dig_breakfast", label: "Business Breakfast", path: "/dashboard/business-breakfast" },
      { id: "dig_lottery", label: "Nyereményjáték", path: "/dashboard/lottery" },
      { id: "dig_risk", label: "Pszichoszociális kockázatfelmérés", path: "/dashboard/risk-assessment" },
      { id: "dig_data", label: "Adatok", path: "/dashboard/data" },
      { id: "dig_reports", label: "Riportok", path: "/dashboard/reports" },
    ],
    panels: [
      "EAP Online",
      "Blog kezelése",
      "Business Breakfast",
      "Nyereményjáték",
      "Pszichoszociális kockázatfelmérés",
      "Adatok",
      "Riportok",
    ],
  },
  {
    id: "operator",
    name: "Operátor",
    description: "Operátor munkaállomás",
    menuItems: [
      { id: "opr_cases_in_progress", label: "Folyamatban lévő esetek", path: "/dashboard/cases-in-progress" },
      { id: "opr_experts", label: "Szakértők", path: "/dashboard/experts" },
      { id: "opr_chat", label: "Chat", path: "/dashboard/chat" },
      { id: "opr_dispatch", label: "Eset kiközvetítése", path: "/dashboard/case-dispatch" },
      { id: "opr_eap_messages", label: "EAP Online - üzenetek", path: "/dashboard/eap-messages" },
      { id: "opr_qa", label: "Q&A (Kisokos)", path: "/dashboard/qa" },
    ],
    panels: [
      "Folyamatban lévő esetek",
      "Szakértők",
      "Chat",
      "Eset kiközvetítése",
      "EAP Online - üzenetek",
      "Q&A (Kisokos)",
    ],
  },
  {
    id: "expert",
    name: "Szakértő",
    description: "Szakértő munkaállomás",
    menuItems: [
      { id: "exp_24h", label: "24 órás esetek", path: "/dashboard/expert/24h" },
      { id: "exp_5day", label: "5 napos esetek", path: "/dashboard/expert/5day" },
      { id: "exp_2month", label: "2 hónapos esetek", path: "/dashboard/expert/2month" },
      { id: "exp_3month", label: "3 hónapos esetek", path: "/dashboard/expert/3month" },
      { id: "exp_workshop", label: "Soron következő Workshop/CI vagy O", path: "/dashboard/expert/workshop" },
      { id: "exp_chat", label: "Chat", path: "/dashboard/expert/chat" },
      { id: "exp_invoice", label: "Számla feltöltése", path: "/dashboard/expert/invoice" },
    ],
    panels: [
      "24 órás esetek",
      "5 napos esetek",
      "2 hónapos esetek",
      "3 hónapos esetek",
      "Soron következő Workshop/CI vagy O",
      "Chat",
      "Aktuális számla feltöltése, adminisztrációja",
    ],
  },
  {
    id: "client",
    name: "Ügyfél",
    description: "Ügyfél felület (változatlan, céges profilban kezelt)",
    menuItems: [
      { id: "client_reports", label: "Riportok", path: "/dashboard/client/reports" },
      { id: "client_stats", label: "Statisztikák", path: "/dashboard/client/stats" },
    ],
    panels: [
      "Ügyfél riportok",
      "Statisztikák",
    ],
  },
  // Search/Filter at the bottom, always enabled
  {
    id: "search",
    name: "Keresés/Szűrés",
    description: "Keresési és szűrési funkciók (univerzális, minden SmartBoard része)",
    alwaysEnabled: true,
    menuItems: [
      { id: "search_compare", label: "Összehasonlítás", path: "/dashboard/search/compare" },
      { id: "search_dimension", label: "Dimenzió szerinti bontás", path: "/dashboard/search/dimension" },
      { id: "search_trend", label: "Trend-elemzés", path: "/dashboard/search/trend" },
      { id: "search_search", label: "Keresés", path: "/dashboard/search/search" },
      { id: "search_filter", label: "Szűrés", path: "/dashboard/search/filter" },
    ],
    panels: [
      "Összehasonlítás - adatok egymás melletti vizsgálata",
      "Dimenzió szerinti bontás - kategóriák szerinti elemzés",
      "Trend-elemzés - időbeli alakulás és tendenciák",
      "Keresés - általános keresési felület",
      "Szűrés - átfogó szűrési felület",
    ],
  },
];

// Helper function to get a smartboard by ID
export const getSmartboardById = (id: string): SmartboardConfig | undefined => {
  return SMARTBOARDS.find(sb => sb.id === id);
};

// Helper function to get all menu items for a set of smartboards
export const getMenuItemsForSmartboards = (smartboardIds: string[]): SmartboardMenuItem[] => {
  const items: SmartboardMenuItem[] = [];
  smartboardIds.forEach(sbId => {
    const sb = getSmartboardById(sbId);
    if (sb) {
      items.push(...sb.menuItems);
    }
  });
  return items;
};

// Get smartboards that are always enabled
export const getAlwaysEnabledSmartboards = (): SmartboardConfig[] => {
  return SMARTBOARDS.filter(sb => sb.alwaysEnabled);
};
