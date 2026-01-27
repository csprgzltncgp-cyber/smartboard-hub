import { useState, useEffect, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Specialization {
  id: string;
  name: string;
  parent_id: string | null;
}

interface HierarchicalSpecializationSelectProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export const HierarchicalSpecializationSelect = ({
  selectedIds,
  onChange,
}: HierarchicalSpecializationSelectProps) => {
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSpecializations();
  }, []);

  const fetchSpecializations = async () => {
    try {
      const { data, error } = await supabase
        .from("specializations")
        .select("id, name, parent_id")
        .order("name");

      if (error) throw error;
      if (data) {
        setSpecializations(data);
        // Auto-expand parents that have selected children
        const selectedParents = new Set<string>();
        data.forEach((spec) => {
          if (selectedIds.includes(spec.id) && spec.parent_id) {
            selectedParents.add(spec.parent_id);
          }
        });
        setExpandedParents(selectedParents);
      }
    } catch (error) {
      console.error("Error fetching specializations:", error);
    } finally {
      setLoading(false);
    }
  };

  // Separate parent categories (parent_id = null) and children
  const { parentCategories, childrenByParent } = useMemo(() => {
    const parents = specializations.filter((s) => s.parent_id === null);
    const children: Record<string, Specialization[]> = {};
    
    specializations.forEach((s) => {
      if (s.parent_id) {
        if (!children[s.parent_id]) {
          children[s.parent_id] = [];
        }
        children[s.parent_id].push(s);
      }
    });

    return { parentCategories: parents, childrenByParent: children };
  }, [specializations]);

  const toggleParent = (parentId: string) => {
    const newExpanded = new Set(expandedParents);
    if (newExpanded.has(parentId)) {
      newExpanded.delete(parentId);
    } else {
      newExpanded.add(parentId);
    }
    setExpandedParents(newExpanded);
  };

  const handleParentToggle = (parentId: string, checked: boolean) => {
    const children = childrenByParent[parentId] || [];
    const childIds = children.map((c) => c.id);

    if (checked) {
      // Add parent to expanded set and add parent to selection
      setExpandedParents((prev) => new Set([...prev, parentId]));
      // Don't auto-select children, just the parent category indicator
      if (!selectedIds.includes(parentId)) {
        onChange([...selectedIds, parentId]);
      }
    } else {
      // Remove parent and all its children from selection
      const newSelection = selectedIds.filter(
        (id) => id !== parentId && !childIds.includes(id)
      );
      onChange(newSelection);
    }
  };

  const handleChildToggle = (childId: string, parentId: string, checked: boolean) => {
    if (checked) {
      // Add the child, and also ensure parent is in selection
      const newSelection = [...selectedIds];
      if (!newSelection.includes(childId)) {
        newSelection.push(childId);
      }
      if (!newSelection.includes(parentId)) {
        newSelection.push(parentId);
      }
      onChange(newSelection);
    } else {
      // Remove the child
      const newSelection = selectedIds.filter((id) => id !== childId);
      
      // Check if any other children of this parent are still selected
      const children = childrenByParent[parentId] || [];
      const hasOtherSelectedChildren = children.some(
        (c) => c.id !== childId && newSelection.includes(c.id)
      );
      
      // If no children selected, also remove parent
      if (!hasOtherSelectedChildren) {
        onChange(newSelection.filter((id) => id !== parentId));
      } else {
        onChange(newSelection);
      }
    }
  };

  const removeSelection = (id: string) => {
    const spec = specializations.find((s) => s.id === id);
    if (!spec) return;

    if (spec.parent_id === null) {
      // It's a parent - remove it and all children
      handleParentToggle(id, false);
    } else {
      // It's a child
      handleChildToggle(id, spec.parent_id, false);
    }
  };

  // Get selected items for display (only show children, not parent categories)
  const selectedItems = specializations.filter(
    (s) => selectedIds.includes(s.id) && s.parent_id !== null
  );

  // Also show parent categories that are selected
  const selectedParentItems = specializations.filter(
    (s) => selectedIds.includes(s.id) && s.parent_id === null
  );

  if (loading) {
    return (
      <div className="space-y-2">
        <Label>Szakterületek és specializációk</Label>
        <div className="text-sm text-muted-foreground">Betöltés...</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Label>Szakterületek és specializációk</Label>

      {/* Selected items display */}
      {(selectedItems.length > 0 || selectedParentItems.length > 0) && (
        <div className="flex flex-wrap gap-1.5 p-2 border rounded-lg bg-muted/30">
          {selectedParentItems.map((item) => (
            <Badge
              key={item.id}
              className="bg-cgp-teal text-white hover:bg-cgp-teal/90 gap-1 pr-1"
            >
              {item.name}
              <button
                type="button"
                onClick={() => removeSelection(item.id)}
                className="ml-1 hover:bg-white/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {selectedItems.map((item) => {
            const parent = specializations.find((s) => s.id === item.parent_id);
            return (
              <Badge
                key={item.id}
                variant="secondary"
                className="gap-1 pr-1"
              >
                <span className="text-xs text-muted-foreground">{parent?.name}:</span>
                {item.name}
                <button
                  type="button"
                  onClick={() => removeSelection(item.id)}
                  className="ml-1 hover:bg-foreground/10 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}

      {/* Hierarchical selection */}
      <div className="border rounded-lg divide-y">
        {parentCategories.map((parent) => {
          const children = childrenByParent[parent.id] || [];
          const isExpanded = expandedParents.has(parent.id);
          const isParentSelected = selectedIds.includes(parent.id);
          const selectedChildrenCount = children.filter((c) =>
            selectedIds.includes(c.id)
          ).length;

          return (
            <div key={parent.id}>
              {/* Parent row */}
              <div
                className={`flex items-center gap-3 p-3 hover:bg-muted/30 cursor-pointer ${
                  isParentSelected ? "bg-cgp-teal/5" : ""
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleParent(parent.id)}
                  className="p-0.5 hover:bg-muted rounded"
                >
                  {children.length > 0 ? (
                    isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )
                  ) : (
                    <div className="w-4 h-4" />
                  )}
                </button>
                <Checkbox
                  checked={isParentSelected}
                  onCheckedChange={(checked) =>
                    handleParentToggle(parent.id, checked as boolean)
                  }
                />
                <span
                  className="flex-1 font-medium cursor-pointer"
                  onClick={() => toggleParent(parent.id)}
                >
                  {parent.name}
                </span>
                {selectedChildrenCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {selectedChildrenCount} kiválasztva
                  </Badge>
                )}
              </div>

              {/* Children */}
              {isExpanded && children.length > 0 && (
                <div className="bg-muted/20 divide-y divide-muted">
                  {children.map((child) => (
                    <div
                      key={child.id}
                      className="flex items-center gap-3 p-3 pl-12 hover:bg-muted/40 cursor-pointer"
                      onClick={() =>
                        handleChildToggle(
                          child.id,
                          parent.id,
                          !selectedIds.includes(child.id)
                        )
                      }
                    >
                      <Checkbox
                        checked={selectedIds.includes(child.id)}
                        onCheckedChange={(checked) =>
                          handleChildToggle(child.id, parent.id, checked as boolean)
                        }
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="text-sm">{child.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {parentCategories.length === 0 && (
        <div className="text-sm text-muted-foreground text-center py-4">
          Nincsenek elérhető szakterületek.
        </div>
      )}
    </div>
  );
};
