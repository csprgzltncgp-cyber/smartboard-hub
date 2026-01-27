import { useState, useRef, useEffect } from "react";
import { X, ChevronDown, Search } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Option {
  id: string;
  label: string;
}

interface MultiSelectFieldProps {
  label: string;
  options: Option[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
  badgeColor?: "teal" | "red" | "orange";
}

export const MultiSelectField = ({
  label,
  options,
  selectedIds,
  onChange,
  placeholder = "Válassz...",
  badgeColor = "teal",
}: MultiSelectFieldProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedOptions = options.filter((opt) => selectedIds.includes(opt.id));
  const availableOptions = filteredOptions.filter((opt) => !selectedIds.includes(opt.id));

  const handleSelect = (id: string) => {
    onChange([...selectedIds, id]);
    setSearchQuery("");
  };

  const handleRemove = (id: string) => {
    onChange(selectedIds.filter((sid) => sid !== id));
  };

  const getBadgeClasses = () => {
    switch (badgeColor) {
      case "red":
        return "bg-red-500 text-white hover:bg-red-600";
      case "orange":
        return "bg-orange-500 text-white hover:bg-orange-600";
      default:
        return "bg-cgp-teal text-white hover:bg-cgp-teal/90";
    }
  };

  return (
    <div className="space-y-2" ref={containerRef}>
      <Label>{label}</Label>
      <div className="relative">
        {/* Selected items display + dropdown trigger */}
        <div
          className="min-h-[42px] p-2 border rounded-lg cursor-pointer flex flex-wrap gap-1 items-center bg-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedOptions.length > 0 ? (
            <>
              {selectedOptions.map((opt) => (
                <Badge
                  key={opt.id}
                  className={`${getBadgeClasses()} gap-1 pr-1`}
                >
                  {opt.label}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(opt.id);
                    }}
                    className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </>
          ) : (
            <span className="text-muted-foreground text-sm">{placeholder}</span>
          )}
          <ChevronDown className="h-4 w-4 ml-auto text-muted-foreground" />
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-64 overflow-hidden">
            {/* Search input */}
            <div className="p-2 border-b">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Keresés..."
                  className="pl-8 h-8"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>

            {/* Options list */}
            <div className="max-h-48 overflow-y-auto">
              {availableOptions.length > 0 ? (
                availableOptions.map((opt) => (
                  <div
                    key={opt.id}
                    className="px-3 py-2 hover:bg-muted cursor-pointer text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(opt.id);
                    }}
                  >
                    {opt.label}
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-muted-foreground text-sm">
                  {searchQuery ? "Nincs találat" : "Minden elem kiválasztva"}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
