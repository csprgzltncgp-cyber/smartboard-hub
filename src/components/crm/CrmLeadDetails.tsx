import { CrmLead, CrmMeeting, CrmContact } from "@/types/crm";
import { Button } from "@/components/ui/button";
import { 
  Plus, Mail, Video, Phone, MessageSquare, 
  Smile, Meh, HelpCircle, Sun, 
  FileX, Calendar, ThumbsUp,
  Edit, Lightbulb, Trash2, Save,
  Bell, FolderOpen
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CrmLeadDetailsProps {
  lead: CrmLead;
}

const getContactTypeIcon = (type: CrmMeeting['contactType']) => {
  switch (type) {
    case 'email': return Mail;
    case 'video': return Video;
    case 'phone': return Phone;
    case 'in_person': return MessageSquare;
  }
};

const getMoodIcon = (mood?: CrmMeeting['mood']) => {
  switch (mood) {
    case 'happy': return Smile;
    case 'neutral': return Meh;
    case 'confused': return HelpCircle;
    case 'negative': return Sun;
    default: return null;
  }
};

const getStatusIcon = (status?: CrmMeeting['status']) => {
  switch (status) {
    case 'cancelled': return FileX;
    case 'scheduled': return Calendar;
    case 'completed': return ThumbsUp;
    case 'thumbs_up': return ThumbsUp;
    default: return null;
  }
};

const CrmLeadDetails = ({ lead }: CrmLeadDetailsProps) => {
  return (
    <div className="bg-white p-4 space-y-6">
      {/* Add Meeting Button */}
      <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-none">
        <Plus className="w-4 h-4 mr-2" />
        Add meeting
      </Button>

      {/* Meetings List */}
      {lead.meetings.length > 0 && (
        <div className="space-y-2">
          {lead.meetings.map((meeting, index) => {
            const ContactIcon = getContactTypeIcon(meeting.contactType);
            const MoodIcon = getMoodIcon(meeting.mood);
            const StatusIcon = getStatusIcon(meeting.status);
            const isNext = index === 0;

            return (
              <div 
                key={meeting.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-sm",
                  isNext ? "bg-primary/10" : "bg-muted/30"
                )}
              >
                <div className="bg-primary p-2 rounded-sm">
                  <Edit className="w-4 h-4 text-primary-foreground" />
                </div>
                
                <div className="flex-1 grid grid-cols-6 gap-4 items-center text-sm">
                  <span className="text-foreground">
                    {isNext ? 'Next contact:' : 'Date of contact:'} {meeting.date}
                    {meeting.time && ` - ${meeting.time}`}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <ContactIcon className="w-4 h-4 text-primary" />
                  </div>
                  
                  <span className="text-muted-foreground">
                    Name of contact: {meeting.contactName}
                  </span>
                  
                  <span className="text-muted-foreground">
                    {meeting.contactTitle}
                  </span>
                  
                  <span className="text-muted-foreground">
                    {meeting.pillars} PILL/{meeting.sessions} SESS
                  </span>
                  
                  <div className="flex items-center gap-2">
                    {MoodIcon && (
                      <div className={cn(
                        "p-1.5 rounded-sm",
                        meeting.mood === 'happy' ? "bg-green-100" : "bg-muted"
                      )}>
                        <MoodIcon className="w-4 h-4" />
                      </div>
                    )}
                    {StatusIcon && (
                      <div className={cn(
                        "p-1.5 rounded-sm",
                        meeting.status === 'completed' ? "bg-green-100" : "bg-muted"
                      )}>
                        <StatusIcon className="w-4 h-4" />
                      </div>
                    )}
                    {meeting.hasNotification && (
                      <Bell className="w-4 h-4 text-destructive" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Contact Button */}
      <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-none">
        <Plus className="w-4 h-4 mr-2" />
        Add contact
      </Button>

      {/* Contacts List */}
      {lead.contacts.length > 0 && (
        <div className="space-y-2">
          {lead.contacts.map((contact) => (
            <div 
              key={contact.id}
              className="flex items-center gap-3 p-3 bg-muted/30 rounded-sm"
            >
              <span className="flex-1 text-sm">
                Name of contact: {contact.name}
              </span>
              <div className="flex items-center gap-2">
                <Edit className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">
                {contact.title}
              </span>
              <span className="text-sm text-muted-foreground">
                Phone: {contact.phone}
              </span>
              <span className="text-sm text-muted-foreground">
                Email: {contact.email}
              </span>
              <div className="flex items-center gap-2">
                <Lightbulb className={cn(
                  "w-4 h-4",
                  contact.gender === 'female' ? "text-pink-500" : "text-blue-500"
                )} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Details Button */}
      <div className="flex gap-2">
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-none">
          <Plus className="w-4 h-4 mr-2" />
          Add details
        </Button>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-none p-2">
          <FolderOpen className="w-4 h-4" />
        </Button>
      </div>

      {/* Company Details */}
      <div className="space-y-2">
        <div className="p-3 bg-muted/30 rounded-sm text-sm">
          Name of company: {lead.details.name}
        </div>
        <div className="p-3 bg-muted/30 rounded-sm text-sm">
          City of company: {lead.details.city}
        </div>
        <div className="p-3 bg-muted/30 rounded-sm text-sm">
          Country of company: {lead.details.country}
        </div>
        <div className="p-3 bg-muted/30 rounded-sm text-sm">
          Industry: {lead.details.industry}
        </div>
        <div className="p-3 bg-muted/30 rounded-sm text-sm">
          Headcount: {lead.details.headcount}
        </div>
        <div className="p-3 bg-muted/30 rounded-sm text-sm flex items-center gap-4">
          <span>Service:</span>
          <span className="bg-primary/10 px-3 py-1 text-primary">
            {lead.details.service}
          </span>
        </div>
      </div>

      {/* Notes Section */}
      {lead.notes.length > 0 && (
        <div className="space-y-2">
          <Button variant="outline" className="rounded-none border-primary text-primary">
            <Plus className="w-4 h-4 mr-2" />
            Add note
          </Button>
          
          <div className="p-4 bg-muted/30 rounded-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="font-medium text-sm">Note:</span>
              <div className="flex gap-2">
                <button className="p-1 bg-primary text-primary-foreground rounded-sm">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="p-1 bg-destructive text-destructive-foreground rounded-sm">
                  <Trash2 className="w-4 h-4" />
                </button>
                <button className="p-1 bg-primary text-primary-foreground rounded-sm">
                  <Save className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {lead.notes[0].content}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrmLeadDetails;
