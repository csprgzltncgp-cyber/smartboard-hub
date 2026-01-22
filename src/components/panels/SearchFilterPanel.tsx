import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  GitCompare, 
  Layers, 
  TrendingUp, 
  Search, 
  Filter,
  BarChart3,
  Calendar,
  Building2,
  Users,
  Globe,
  Briefcase,
  FileText,
  X
} from "lucide-react";

interface SearchFilterPanelProps {
  onClose: () => void;
}

const SearchFilterPanel = ({ onClose }: SearchFilterPanelProps) => {
  const [searchCategory, setSearchCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Filter states
  const [filterPeriod, setFilterPeriod] = useState<string>("");
  const [filterCountry, setFilterCountry] = useState<string>("");
  const [filterCompany, setFilterCompany] = useState<string>("");
  const [filterExpert, setFilterExpert] = useState<string>("");
  const [filterChannel, setFilterChannel] = useState<string>("");
  const [filterProblemType, setFilterProblemType] = useState<string>("");

  const searchCategories = [
    { id: "freetext", label: "Szabad szavas keresés", icon: Search, placeholder: "Írj be bármit..." },
    { id: "experts", label: "Szakértők", icon: Users, placeholder: "Név alapján..." },
    { id: "cases", label: "Esetek", icon: FileText, placeholder: "Esetszám alapján..." },
    { id: "companies", label: "Ügyfelek", icon: Building2, placeholder: "Cégnév alapján..." },
  ];

  const handleSearch = () => {
    console.log("Search:", { category: searchCategory, query: searchQuery });
    onClose();
  };

  const handleFilter = () => {
    console.log("Filter:", { 
      period: filterPeriod, 
      country: filterCountry, 
      company: filterCompany,
      expert: filterExpert,
      channel: filterChannel,
      problemType: filterProblemType
    });
    onClose();
  };

  const resetFilters = () => {
    setFilterPeriod("");
    setFilterCountry("");
    setFilterCompany("");
    setFilterExpert("");
    setFilterChannel("");
    setFilterProblemType("");
  };

  return (
    <div className="bg-background border rounded-xl shadow-lg z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-cgp-teal/5">
        <h3 className="font-calibri-bold flex items-center gap-2">
          <Search className="w-5 h-5 text-cgp-teal" />
          Keresés / Szűrés
        </h3>
        <button onClick={onClose} className="p-1 hover:bg-muted rounded">
          <X className="w-5 h-5" />
        </button>
      </div>

      <Tabs defaultValue="search" className="w-full">
        <TabsList className="w-full grid grid-cols-5 rounded-none border-b bg-muted/30">
          <TabsTrigger value="compare" className="flex items-center gap-1 text-xs">
            <GitCompare className="w-3 h-3" />
            Összehasonlítás
          </TabsTrigger>
          <TabsTrigger value="dimension" className="flex items-center gap-1 text-xs">
            <Layers className="w-3 h-3" />
            Dimenzió
          </TabsTrigger>
          <TabsTrigger value="trend" className="flex items-center gap-1 text-xs">
            <TrendingUp className="w-3 h-3" />
            Trend
          </TabsTrigger>
          <TabsTrigger value="search" className="flex items-center gap-1 text-xs">
            <Search className="w-3 h-3" />
            Keresés
          </TabsTrigger>
          <TabsTrigger value="filter" className="flex items-center gap-1 text-xs">
            <Filter className="w-3 h-3" />
            Szűrés
          </TabsTrigger>
        </TabsList>

        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {/* Összehasonlítás Tab */}
          <TabsContent value="compare" className="mt-0 space-y-3">
            <p className="text-sm text-muted-foreground">
              Adatok egymás melletti vizsgálata különböző dimenziók szerint.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Első elem</Label>
                <Select>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Válassz..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="company">Cég</SelectItem>
                    <SelectItem value="expert">Szakértő</SelectItem>
                    <SelectItem value="period">Időszak</SelectItem>
                    <SelectItem value="country">Ország</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Második elem</Label>
                <Select>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Válassz..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="company">Cég</SelectItem>
                    <SelectItem value="expert">Szakértő</SelectItem>
                    <SelectItem value="period">Időszak</SelectItem>
                    <SelectItem value="country">Ország</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button size="sm" className="rounded-xl bg-cgp-teal hover:bg-cgp-teal/90">
              <BarChart3 className="w-4 h-4 mr-1" />
              Összehasonlítás
            </Button>
          </TabsContent>

          {/* Dimenzió Tab */}
          <TabsContent value="dimension" className="mt-0 space-y-3">
            <p className="text-sm text-muted-foreground">
              Adatok részletes bontása kategóriák szerint.
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Ország</Label>
                <Select>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Válassz..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hungary">Magyarország</SelectItem>
                    <SelectItem value="germany">Németország</SelectItem>
                    <SelectItem value="austria">Ausztria</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Cég</Label>
                <Select>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Válassz..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Összes</SelectItem>
                    <SelectItem value="audi">Audi</SelectItem>
                    <SelectItem value="samsung">Samsung</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Időszak</Label>
                <Select>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Válassz..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Elmúlt hónap</SelectItem>
                    <SelectItem value="quarter">Elmúlt negyedév</SelectItem>
                    <SelectItem value="year">Elmúlt év</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button size="sm" className="rounded-xl bg-cgp-teal hover:bg-cgp-teal/90">
              <Layers className="w-4 h-4 mr-1" />
              Bontás megjelenítése
            </Button>
          </TabsContent>

          {/* Trend Tab */}
          <TabsContent value="trend" className="mt-0 space-y-3">
            <p className="text-sm text-muted-foreground">
              Adatok időbeli alakulása, tendenciák.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Dimenzió</Label>
                <Select>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Válassz..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="country">Ország</SelectItem>
                    <SelectItem value="client">Ügyfél</SelectItem>
                    <SelectItem value="industry">Iparág</SelectItem>
                    <SelectItem value="channel">Csatorna</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Időtartam</Label>
                <Select>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Válassz..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3months">3 hónap</SelectItem>
                    <SelectItem value="6months">6 hónap</SelectItem>
                    <SelectItem value="1year">1 év</SelectItem>
                    <SelectItem value="2years">2 év</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button size="sm" className="rounded-xl bg-cgp-teal hover:bg-cgp-teal/90">
              <TrendingUp className="w-4 h-4 mr-1" />
              Trend megjelenítése
            </Button>
          </TabsContent>

          {/* Keresés Tab */}
          <TabsContent value="search" className="mt-0 space-y-3">
            <p className="text-sm text-muted-foreground">
              Válaszd ki a kategóriát, majd írd be a keresett adatot.
            </p>
            <div className="grid grid-cols-4 gap-2">
              {searchCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSearchCategory(cat.id)}
                  className={`p-2 rounded-lg border transition-all flex flex-col items-center gap-1 ${
                    searchCategory === cat.id
                      ? "border-cgp-teal bg-cgp-teal/10 text-cgp-teal"
                      : "border-muted hover:border-cgp-teal/50"
                  }`}
                >
                  <cat.icon className="w-4 h-4" />
                  <span className="text-xs">{cat.label}</span>
                </button>
              ))}
            </div>
            {searchCategory && (
              <div className="flex gap-2">
                <Input
                  placeholder={searchCategories.find(c => c.id === searchCategory)?.placeholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 h-9"
                />
                <Button size="sm" onClick={handleSearch} className="rounded-xl bg-cgp-teal hover:bg-cgp-teal/90">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Szűrés Tab */}
          <TabsContent value="filter" className="mt-0 space-y-3">
            <p className="text-sm text-muted-foreground">
              Kombinálható feltételek az adatok szűréséhez.
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Időszak
                </Label>
                <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Válassz..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Ma</SelectItem>
                    <SelectItem value="week">Ez a hét</SelectItem>
                    <SelectItem value="month">Ez a hónap</SelectItem>
                    <SelectItem value="quarter">Ez a negyedév</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1">
                  <Globe className="w-3 h-3" /> Ország
                </Label>
                <Select value={filterCountry} onValueChange={setFilterCountry}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Válassz..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Összes</SelectItem>
                    <SelectItem value="hungary">Magyarország</SelectItem>
                    <SelectItem value="germany">Németország</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1">
                  <Building2 className="w-3 h-3" /> Cég
                </Label>
                <Select value={filterCompany} onValueChange={setFilterCompany}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Válassz..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Összes</SelectItem>
                    <SelectItem value="audi">Audi</SelectItem>
                    <SelectItem value="samsung">Samsung</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1">
                  <Users className="w-3 h-3" /> Szakértő
                </Label>
                <Select value={filterExpert} onValueChange={setFilterExpert}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Válassz..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Összes</SelectItem>
                    <SelectItem value="expert1">Dr. Kiss János</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1">
                  <Briefcase className="w-3 h-3" /> Csatorna
                </Label>
                <Select value={filterChannel} onValueChange={setFilterChannel}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Válassz..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Összes</SelectItem>
                    <SelectItem value="phone">Telefon</SelectItem>
                    <SelectItem value="chat">Chat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1">
                  <FileText className="w-3 h-3" /> Típus
                </Label>
                <Select value={filterProblemType} onValueChange={setFilterProblemType}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Válassz..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Összes</SelectItem>
                    <SelectItem value="psychological">Pszichológiai</SelectItem>
                    <SelectItem value="legal">Jogi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleFilter} className="rounded-xl bg-cgp-teal hover:bg-cgp-teal/90">
                <Filter className="w-4 h-4 mr-1" />
                Szűrés
              </Button>
              <Button size="sm" variant="outline" onClick={resetFilters} className="rounded-xl">
                Törlés
              </Button>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default SearchFilterPanel;
