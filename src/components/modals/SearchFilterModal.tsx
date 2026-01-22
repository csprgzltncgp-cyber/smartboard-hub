import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
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
  FileText
} from "lucide-react";

interface SearchFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchFilterModal = ({ isOpen, onClose }: SearchFilterModalProps) => {
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
    { id: "experts", label: "Szakértők", icon: Users, placeholder: "Név alapján..." },
    { id: "cases", label: "Esetek", icon: FileText, placeholder: "Esetszám alapján..." },
    { id: "companies", label: "Ügyfelek", icon: Building2, placeholder: "Cégnév alapján..." },
    { id: "countries", label: "Országok", icon: Globe, placeholder: "Országnév alapján..." },
  ];

  const handleSearch = () => {
    // TODO: Implement search logic
    console.log("Search:", { category: searchCategory, query: searchQuery });
  };

  const handleFilter = () => {
    // TODO: Implement filter logic
    console.log("Filter:", { 
      period: filterPeriod, 
      country: filterCountry, 
      company: filterCompany,
      expert: filterExpert,
      channel: filterChannel,
      problemType: filterProblemType
    });
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Search className="w-6 h-6 text-cgp-teal" />
            Keresés / Szűrés
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="search" className="w-full">
          <TabsList className="w-full grid grid-cols-5 mb-6">
            <TabsTrigger value="compare" className="flex items-center gap-2">
              <GitCompare className="w-4 h-4" />
              <span className="hidden sm:inline">Összehasonlítás</span>
            </TabsTrigger>
            <TabsTrigger value="dimension" className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">Dimenzió</span>
            </TabsTrigger>
            <TabsTrigger value="trend" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Trend</span>
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Keresés</span>
            </TabsTrigger>
            <TabsTrigger value="filter" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Szűrés</span>
            </TabsTrigger>
          </TabsList>

          {/* Összehasonlítás Tab */}
          <TabsContent value="compare" className="space-y-4">
            <div className="bg-muted/30 rounded-xl p-6">
              <h3 className="font-calibri-bold text-lg mb-2 flex items-center gap-2">
                <GitCompare className="w-5 h-5 text-cgp-teal" />
                Összehasonlítás
              </h3>
              <p className="text-muted-foreground mb-4">
                Az adatok egymás melletti vizsgálatát teszi lehetővé különböző dimenziók szerint. 
                Például összehasonlíthatók cégek, szakértők, időszakok, igénybevételi mutatók vagy 
                problématípusok, de bármely más kiválasztott kategória is egymás mellé tehető.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Első összehasonlítandó elem</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Válassz kategóriát..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="company">Cég</SelectItem>
                      <SelectItem value="expert">Szakértő</SelectItem>
                      <SelectItem value="period">Időszak</SelectItem>
                      <SelectItem value="country">Ország</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Második összehasonlítandó elem</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Válassz kategóriát..." />
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

              <Button className="mt-4 rounded-xl bg-cgp-teal hover:bg-cgp-teal/90">
                <BarChart3 className="w-4 h-4 mr-2" />
                Összehasonlítás indítása
              </Button>
            </div>
          </TabsContent>

          {/* Dimenzió Tab */}
          <TabsContent value="dimension" className="space-y-4">
            <div className="bg-muted/30 rounded-xl p-6">
              <h3 className="font-calibri-bold text-lg mb-2 flex items-center gap-2">
                <Layers className="w-5 h-5 text-cgp-teal" />
                Dimenzió szerinti bontás
              </h3>
              <p className="text-muted-foreground mb-4">
                Lehetővé teszi az adatok részletes bontását és kategóriák szerinti elemzését. 
                Például egy adott országban vagy cégnél egy meghatározott időszakban történt esetek száma, 
                valamint azok megoszlása pszichológiai, pénzügyi, jogi és más kategóriák között.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Ország</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Válassz országot..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hungary">Magyarország</SelectItem>
                      <SelectItem value="germany">Németország</SelectItem>
                      <SelectItem value="austria">Ausztria</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Cég</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Válassz céget..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Összes cég</SelectItem>
                      <SelectItem value="audi">Audi</SelectItem>
                      <SelectItem value="samsung">Samsung</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Időszak</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Válassz időszakot..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="month">Elmúlt hónap</SelectItem>
                      <SelectItem value="quarter">Elmúlt negyedév</SelectItem>
                      <SelectItem value="year">Elmúlt év</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button className="mt-4 rounded-xl bg-cgp-teal hover:bg-cgp-teal/90">
                <Layers className="w-4 h-4 mr-2" />
                Bontás megjelenítése
              </Button>
            </div>
          </TabsContent>

          {/* Trend Tab */}
          <TabsContent value="trend" className="space-y-4">
            <div className="bg-muted/30 rounded-xl p-6">
              <h3 className="font-calibri-bold text-lg mb-2 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cgp-teal" />
                Trend-elemzés
              </h3>
              <p className="text-muted-foreground mb-4">
                Az adatok időbeli alakulását, folyamatokat és tendenciákat szemléltet diagramok és 
                számadatok segítségével. Például megmutatja, hogyan változott az igénybevétel időben 
                különböző dimenziók (ország, ügyfél, iparág, csatorna stb.) mentén.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Dimenzió</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Válassz dimenziót..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="country">Ország</SelectItem>
                      <SelectItem value="client">Ügyfél</SelectItem>
                      <SelectItem value="industry">Iparág</SelectItem>
                      <SelectItem value="channel">Csatorna</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Időtartam</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Válassz időtartamot..." />
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

              <Button className="mt-4 rounded-xl bg-cgp-teal hover:bg-cgp-teal/90">
                <TrendingUp className="w-4 h-4 mr-2" />
                Trend megjelenítése
              </Button>
            </div>
          </TabsContent>

          {/* Keresés Tab */}
          <TabsContent value="search" className="space-y-4">
            <div className="bg-muted/30 rounded-xl p-6">
              <h3 className="font-calibri-bold text-lg mb-2 flex items-center gap-2">
                <Search className="w-5 h-5 text-cgp-teal" />
                Keresés
              </h3>
              <p className="text-muted-foreground mb-4">
                Először válaszd ki a keresés kategóriáját, majd írd be a keresett adatot.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {searchCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSearchCategory(cat.id)}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                      searchCategory === cat.id
                        ? "border-cgp-teal bg-cgp-teal/10 text-cgp-teal"
                        : "border-muted hover:border-cgp-teal/50"
                    }`}
                  >
                    <cat.icon className="w-6 h-6" />
                    <span className="text-sm font-medium">{cat.label}</span>
                  </button>
                ))}
              </div>

              {searchCategory && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder={searchCategories.find(c => c.id === searchCategory)?.placeholder}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleSearch}
                      className="rounded-xl bg-cgp-teal hover:bg-cgp-teal/90"
                    >
                      <Search className="w-4 h-4 mr-2" />
                      Keresés
                    </Button>
                  </div>
                  
                  {/* Search results placeholder */}
                  <div className="border rounded-xl p-4 bg-background">
                    <p className="text-muted-foreground text-center py-8">
                      Kezdj el gépelni a kereséshez...
                    </p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Szűrés Tab */}
          <TabsContent value="filter" className="space-y-4">
            <div className="bg-muted/30 rounded-xl p-6">
              <h3 className="font-calibri-bold text-lg mb-2 flex items-center gap-2">
                <Filter className="w-5 h-5 text-cgp-teal" />
                Szűrés
              </h3>
              <p className="text-muted-foreground mb-4">
                Szabadon kombinálhatod a kiválasztott kategóriákat és feltételeket, 
                így pontosan meghatározhatod, milyen adatokat szeretnél megjeleníteni.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Időszak
                  </Label>
                  <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Válassz..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Ma</SelectItem>
                      <SelectItem value="week">Ez a hét</SelectItem>
                      <SelectItem value="month">Ez a hónap</SelectItem>
                      <SelectItem value="quarter">Ez a negyedév</SelectItem>
                      <SelectItem value="year">Ez az év</SelectItem>
                      <SelectItem value="custom">Egyéni...</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Ország
                  </Label>
                  <Select value={filterCountry} onValueChange={setFilterCountry}>
                    <SelectTrigger>
                      <SelectValue placeholder="Válassz..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Összes ország</SelectItem>
                      <SelectItem value="hungary">Magyarország</SelectItem>
                      <SelectItem value="germany">Németország</SelectItem>
                      <SelectItem value="austria">Ausztria</SelectItem>
                      <SelectItem value="romania">Románia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Ügyfél / Cég
                  </Label>
                  <Select value={filterCompany} onValueChange={setFilterCompany}>
                    <SelectTrigger>
                      <SelectValue placeholder="Válassz..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Összes cég</SelectItem>
                      <SelectItem value="audi">Audi</SelectItem>
                      <SelectItem value="samsung">Samsung</SelectItem>
                      <SelectItem value="tesco">Tesco</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Szakértő
                  </Label>
                  <Select value={filterExpert} onValueChange={setFilterExpert}>
                    <SelectTrigger>
                      <SelectValue placeholder="Válassz..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Összes szakértő</SelectItem>
                      <SelectItem value="expert1">Dr. Kiss János</SelectItem>
                      <SelectItem value="expert2">Dr. Nagy Anna</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Csatorna
                  </Label>
                  <Select value={filterChannel} onValueChange={setFilterChannel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Válassz..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Összes csatorna</SelectItem>
                      <SelectItem value="phone">Telefon</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="chat">Chat</SelectItem>
                      <SelectItem value="app">Mobilalkalmazás</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Problématípus
                  </Label>
                  <Select value={filterProblemType} onValueChange={setFilterProblemType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Válassz..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Összes típus</SelectItem>
                      <SelectItem value="psychological">Pszichológiai</SelectItem>
                      <SelectItem value="financial">Pénzügyi</SelectItem>
                      <SelectItem value="legal">Jogi</SelectItem>
                      <SelectItem value="work">Munkahelyi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <Button 
                  onClick={handleFilter}
                  className="rounded-xl bg-cgp-teal hover:bg-cgp-teal/90"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Szűrés alkalmazása
                </Button>
                <Button 
                  variant="outline" 
                  onClick={resetFilters}
                  className="rounded-xl"
                >
                  Szűrők törlése
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default SearchFilterModal;
