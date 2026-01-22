import { CrmTodoItem } from "@/data/crmMockData";
import { Mail, Video, Phone, MessageSquare, Edit } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface TodoListTabProps {
  items: CrmTodoItem[];
}

const getContactTypeIcon = (type: CrmTodoItem['contactType']) => {
  switch (type) {
    case 'email': return Mail;
    case 'video': return Video;
    case 'phone': return Phone;
    case 'in_person': return MessageSquare;
  }
};

const TodoListTab = ({ items }: TodoListTabProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div>
      {/* Todo Items List */}
      <div className="border border-border rounded-sm overflow-hidden">
        {items.map((item) => {
          const ContactIcon = getContactTypeIcon(item.contactType);
          const isExpanded = expandedId === item.id;

          return (
            <div key={item.id} className="border-b border-border last:border-b-0">
              {/* Summary Row */}
              <div 
                className={cn(
                  "flex items-center gap-4 py-3 px-4 cursor-pointer transition-colors",
                  isExpanded ? "bg-primary/10" : "bg-muted/30 hover:bg-muted/50"
                )}
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  isExpanded ? "bg-destructive" : "bg-primary"
                )}>
                  <Edit className="w-4 h-4 text-primary-foreground" />
                </div>
                
                <div className="flex-1 grid grid-cols-5 gap-4 items-center text-sm">
                  <span className="text-foreground">
                    Next contact: {item.nextContactDate} - {item.nextContactTime}
                  </span>
                  
                  <span className="text-muted-foreground">
                    Name of contact: {item.contactName}
                  </span>
                  
                  <span className="text-muted-foreground">
                    {item.contactTitle}
                  </span>
                  
                  <span className="text-muted-foreground">
                    Company: {item.companyName}
                  </span>
                  
                  {/* Contact type icon instead of progress % */}
                  <div className="flex justify-end">
                    <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center">
                      <ContactIcon className="w-4 h-4 text-primary-foreground" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="bg-muted/20 p-4 space-y-3">
                  <div className="grid grid-cols-5 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Country: </span>
                      <span className="text-foreground">{item.country}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">City: </span>
                      <span className="text-foreground">{item.city}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Address: </span>
                      <span className="text-foreground">{item.address}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Phone: </span>
                      <span className="text-foreground">{item.phone}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-5 gap-4 text-sm">
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Email: </span>
                      <span className="text-foreground">{item.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">CGP: </span>
                      <span className="text-foreground">{item.cgpResponsible}</span>
                    </div>
                    <div className="bg-muted px-3 py-1">
                      {item.service}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TodoListTab;
