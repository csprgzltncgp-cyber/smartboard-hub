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
}

export const SMARTBOARDS: SmartboardConfig[] = [
  {
    id: "account",
    name: "Account",
    description: "Ügyfélkezelés és account management",
    menuItems: [
      { id: "account_incoming", label: "Érkező ügyfelek", path: "/dashboard/account/incoming" },
      { id: "account_high_usage", label: "Túl magas igénybevétel", path: "/dashboard/account/high-usage" },
      { id: "account_low_usage", label: "Túl alacsony igénybevétel", path: "/dashboard/account/low-usage" },
      { id: "account_loss", label: "Veszteséges ügyfelek", path: "/dashboard/account/loss" },
      { id: "account_activity", label: "Események a héten", path: "/dashboard/account/activity" },
    ],
    panels: [
      "Érkező ügyfelek",
      "Túl magas igénybevétel – figyelmeztetés a kritikus mértékű használatra",
      "Túl alacsony igénybevétel – azonosítás a szerződés alulhasználatáról",
      "Veszteséges ügyfelek – megmutatja a veszteség okait, részletekbe bontva",
      "Események a héten (Activity Plan) – aktuális heti feladatok és események listázása",
    ],
  },
  {
    id: "operative",
    name: "Operatív",
    description: "Operatív feladatok és esetkezelés",
    menuItems: [
      { id: "op_no_expert", label: "Nincs szakértőhöz kiközvetítve", path: "/dashboard/operative/no-expert" },
      { id: "op_24h", label: "24 órás esetek", path: "/dashboard/operative/24h" },
      { id: "op_rejected", label: "Elutasított esetek", path: "/dashboard/operative/rejected" },
      { id: "op_5day", label: "5 napos esetek", path: "/dashboard/operative/5day" },
      { id: "op_2month", label: "2 hónapos esetek", path: "/dashboard/operative/2month" },
      { id: "op_3month", label: "3 hónapos esetek", path: "/dashboard/operative/3month" },
      { id: "op_abuse", label: "Visszaélés gyanús esetek", path: "/dashboard/operative/abuse" },
      { id: "op_high_fee", label: "Túl magas díjazás/számlázás", path: "/dashboard/operative/high-fee" },
      { id: "op_quality", label: "Minőségi problémák", path: "/dashboard/operative/quality" },
      { id: "op_notifications", label: "Értesítések szakértők felé", path: "/dashboard/operative/notifications" },
      { id: "op_expert_search", label: "Szakértők keresése határidőn kívül", path: "/dashboard/operative/expert-search" },
    ],
    panels: [
      "Nincs szakértőhöz kiközvetítve esetek",
      "24 órás esetek",
      "Elutasított esetek",
      "5 napos esetek",
      "2 hónapos esetek",
      "3 hónapos esetek",
      "Visszaélés gyanús esetek",
      "Túl magas díjazás/számlázás",
      "Minőségi problémák - alacsony elégedettségi indexek",
      "Workshop feedback listája (csak panel)",
      "Értesítések szakértők felé listája",
      "EAP Online feedback-ek listája (csak panel)",
      "Szakértők keresése határidőn kívül lista",
    ],
  },
  {
    id: "sales",
    name: "Sales",
    description: "Értékesítés és ügyfélszerzés",
    menuItems: [
      { id: "sales_leads", label: "Leadek", path: "/dashboard/sales/leads" },
      { id: "sales_meetings", label: "Találkozók listája", path: "/dashboard/sales/meetings" },
      { id: "sales_offers", label: "Ajánlatok listája", path: "/dashboard/sales/offers" },
      { id: "sales_contracts", label: "Szerződés kiküldve", path: "/dashboard/sales/contracts" },
      { id: "sales_incoming", label: "Érkező ügyfelek", path: "/dashboard/sales/incoming" },
      { id: "sales_expiring", label: "Szerződés lejár", path: "/dashboard/sales/expiring" },
      { id: "sales_reminders", label: "Emlékeztetők", path: "/dashboard/sales/reminders" },
    ],
    panels: [
      "Leadek - új cég hozzáadása",
      "Találkozók listája - Új meeting hozzáadása",
      "Ajánlatok listája - státusz jelölés",
      "Szerződés kiküldve lista - státusz jelölés",
      "Érkező ügyfelek - státusz jelölés",
      "Szerződés lejár ügyfelek - státusz jelölés",
      "Emlékeztetők",
    ],
  },
  {
    id: "financial",
    name: "Pénzügyi",
    description: "Pénzügyi műveletek és számlázás",
    menuItems: [
      { id: "fin_billable", label: "Kiszámlázható számlák", path: "/dashboard/financial/billable" },
      { id: "fin_overdue", label: "Lejárt fizetési határidős számlák", path: "/dashboard/financial/overdue" },
      { id: "fin_incoming", label: "Beérkezett számlák ellenőrzése", path: "/dashboard/financial/incoming" },
      { id: "fin_loss", label: "Veszteséges cégek listája", path: "/dashboard/financial/loss" },
      { id: "fin_limit", label: "Limithatár feletti számlák", path: "/dashboard/financial/limit" },
    ],
    panels: [
      "Kiszámlázható számlák – aktuális havi lista",
      "Lejárt fizetési határidős számlák – teljesítés nélkül",
      "Beérkezett számlák ellenőrizendő tételekkel",
      "Veszteséges cégek listája",
      "Limithatár feletti beérkezett számlák",
    ],
  },
  {
    id: "digital",
    name: "Digital",
    description: "Digitális platformok és statisztikák",
    menuItems: [
      { id: "dig_stats", label: "EAP Online / MY EAP / EAP Chat statisztikák", path: "/dashboard/digital/stats" },
      { id: "dig_translations", label: "Fordítási hiányok", path: "/dashboard/digital/translations" },
      { id: "dig_risk", label: "Pszichoszociális kockázatfelmérés", path: "/dashboard/digital/risk" },
      { id: "dig_lottery", label: "Nyereményjáték", path: "/dashboard/digital/lottery" },
      { id: "dig_blog", label: "Blog felvitel", path: "/dashboard/digital/blog" },
      { id: "dig_breakfast", label: "Business Breakfast jelentkezők", path: "/dashboard/digital/breakfast" },
    ],
    panels: [
      "EAP Online / MY EAP / EAP Chat statisztikák",
      "Fordítási hiányok (EAP Online / MY EAP / EAP Chat)",
      "Soron következő pszichoszociális kockázatfelmérés",
      "Soron következő nyereményjáték",
      "Utolsó blogfelvitel a céges weboldalra",
      "Business Breakfast jelentkezők száma",
    ],
  },
  {
    id: "search",
    name: "Keresés/Szűrés",
    description: "Keresési és szűrési funkciók (univerzális, minden SmartBoard része)",
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
  {
    id: "operator",
    name: "Operátor",
    description: "Operátor munkaállomás",
    menuItems: [
      { id: "opr_dispatch", label: "Eset kiközvetítése", path: "/dashboard/operator/dispatch" },
      { id: "opr_chat", label: "Chat", path: "/dashboard/operator/chat" },
      { id: "opr_eap_messages", label: "Beérkezett EAP online üzenetek", path: "/dashboard/operator/eap-messages" },
      { id: "opr_qa", label: "Q&A (Kisokos)", path: "/dashboard/operator/qa" },
    ],
    panels: [
      "Eset kiközvetítése",
      "Chat",
      "Beérkezett EAP online üzenetek",
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
    id: "admin",
    name: "Admin",
    description: "Adminisztrátori funkciók és beállítások",
    menuItems: [
      { id: "admin_users", label: "Felhasználók kezelése", path: "/dashboard/users" },
      { id: "admin_companies", label: "Cégek listája", path: "/dashboard/admin/companies" },
      { id: "admin_permissions", label: "Jogosultságok kezelése", path: "/dashboard/admin/permissions" },
      { id: "admin_countries", label: "Országok listája", path: "/dashboard/admin/countries" },
      { id: "admin_cities", label: "Városok listája", path: "/dashboard/admin/cities" },
      { id: "admin_experts", label: "Szakértők listája", path: "/dashboard/admin/experts" },
      { id: "admin_operators", label: "Operátorok listája", path: "/dashboard/admin/operators" },
      { id: "admin_documents", label: "Dokumentumok listája", path: "/dashboard/admin/documents" },
      { id: "admin_stats", label: "Statisztikák", path: "/dashboard/admin/stats" },
      { id: "admin_settings", label: "Beállítások", path: "/dashboard/admin/settings" },
    ],
    panels: [
      "Felhasználók kezelése",
      "Cégek listája",
      "Jogosultságok kezelése",
      "Országok és városok listája",
      "Szakértők és operátorok kezelése",
      "Dokumentumok",
      "Rendszerstatisztikák",
      "Rendszerbeállítások",
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
