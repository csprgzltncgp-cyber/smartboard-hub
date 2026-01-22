import { useState } from "react";
import { CrmLead, CrmMeeting, CrmContact, ContactType, MeetingMood } from "@/types/crm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, Mail, Video, Phone, MessageSquare, 
  Smile, Meh, HelpCircle, Frown, 
  FileX, Calendar, ThumbsUp,
  Edit, Trash2, Save, X,
  Bell, Users, FileText
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CrmLeadDetailsProps {
  lead: CrmLead;
  onUpdate?: (lead: CrmLead) => void;
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
    case 'negative': return Frown;
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

const contactTypes: { type: ContactType; icon: React.ReactNode; label: string }[] = [
  { type: 'email', icon: <Mail className="w-4 h-4" />, label: 'Email' },
  { type: 'video', icon: <Video className="w-4 h-4" />, label: 'Video' },
  { type: 'phone', icon: <Phone className="w-4 h-4" />, label: 'Phone' },
  { type: 'in_person', icon: <Users className="w-4 h-4" />, label: 'In Person' },
];

const moodIcons: { mood: MeetingMood; icon: React.ReactNode; color: string }[] = [
  { mood: 'happy', icon: <Smile className="w-4 h-4" />, color: 'bg-green-100 text-green-600' },
  { mood: 'neutral', icon: <Meh className="w-4 h-4" />, color: 'bg-amber-100 text-amber-600' },
  { mood: 'confused', icon: <HelpCircle className="w-4 h-4" />, color: 'bg-blue-100 text-blue-600' },
  { mood: 'negative', icon: <Frown className="w-4 h-4" />, color: 'bg-red-100 text-red-600' },
];

const CrmLeadDetails = ({ lead, onUpdate }: CrmLeadDetailsProps) => {
  const [activeForm, setActiveForm] = useState<'meeting' | 'contact' | 'details' | 'note' | null>(null);
  
  // Form states
  const [meetingForm, setMeetingForm] = useState({
    date: '', time: '', contactName: '', contactTitle: '',
    contactType: 'email' as ContactType, pillars: 3, sessions: 4,
    mood: undefined as MeetingMood | undefined,
  });
  
  const [contactForm, setContactForm] = useState({
    name: '', title: '', gender: 'male' as 'male' | 'female', phone: '', email: '',
  });
  
  const [detailsForm, setDetailsForm] = useState({
    city: lead.details.city, country: lead.details.country,
    industry: lead.details.industry, headcount: lead.details.headcount,
  });
  
  const [noteForm, setNoteForm] = useState('');

  const handleAddMeeting = () => {
    if (!meetingForm.date || !meetingForm.contactName) return;
    
    const newMeeting: CrmMeeting = {
      id: `m-${Date.now()}`,
      ...meetingForm,
      contactId: '',
    };
    
    const updatedLead = {
      ...lead,
      meetings: [...lead.meetings, newMeeting],
      updatedAt: new Date().toISOString(),
    };
    
    onUpdate?.(updatedLead);
    setMeetingForm({ date: '', time: '', contactName: '', contactTitle: '', contactType: 'email', pillars: 3, sessions: 4, mood: undefined });
    setActiveForm(null);
  };

  const handleAddContact = () => {
    if (!contactForm.name) return;
    
    const newContact: CrmContact = {
      id: `c-${Date.now()}`,
      ...contactForm,
      isPrimary: lead.contacts.length === 0,
    };
    
    const updatedLead = {
      ...lead,
      contacts: [...lead.contacts, newContact],
      updatedAt: new Date().toISOString(),
    };
    
    onUpdate?.(updatedLead);
    setContactForm({ name: '', title: '', gender: 'male', phone: '', email: '' });
    setActiveForm(null);
  };

  const handleUpdateDetails = () => {
    const updatedLead = {
      ...lead,
      details: { ...lead.details, ...detailsForm },
      updatedAt: new Date().toISOString(),
    };
    
    onUpdate?.(updatedLead);
    setActiveForm(null);
  };

  const handleAddNote = () => {
    if (!noteForm.trim()) return;
    
    const newNote = {
      id: `n-${Date.now()}`,
      content: noteForm,
      createdAt: new Date().toISOString(),
      createdBy: lead.assignedTo,
    };
    
    const updatedLead = {
      ...lead,
      notes: [...lead.notes, newNote],
      updatedAt: new Date().toISOString(),
    };
    
    onUpdate?.(updatedLead);
    setNoteForm('');
    setActiveForm(null);
  };

  return (
    <div className="bg-background p-4 space-y-4 border-t border-border">
      {/* Action Buttons Row */}
      <div className="flex gap-2 flex-wrap">
        <Button 
          onClick={() => setActiveForm(activeForm === 'meeting' ? null : 'meeting')}
          variant={activeForm === 'meeting' ? 'default' : 'outline'}
          className="rounded-none"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Add meeting
        </Button>
        <Button 
          onClick={() => setActiveForm(activeForm === 'contact' ? null : 'contact')}
          variant={activeForm === 'contact' ? 'default' : 'outline'}
          className="rounded-none"
        >
          <Users className="w-4 h-4 mr-2" />
          Add contact
        </Button>
        <Button 
          onClick={() => setActiveForm(activeForm === 'details' ? null : 'details')}
          variant={activeForm === 'details' ? 'default' : 'outline'}
          className="rounded-none"
        >
          <FileText className="w-4 h-4 mr-2" />
          Add details
        </Button>
        <Button 
          onClick={() => setActiveForm(activeForm === 'note' ? null : 'note')}
          variant={activeForm === 'note' ? 'default' : 'outline'}
          className="rounded-none"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add note
        </Button>
      </div>

      {/* Meeting Form */}
      {activeForm === 'meeting' && (
        <div className="p-4 bg-muted/30 rounded-sm space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-calibri-bold">New Meeting</h4>
            <button onClick={() => setActiveForm(null)}><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input type="date" value={meetingForm.date} onChange={(e) => setMeetingForm(p => ({ ...p, date: e.target.value }))} placeholder="Date" />
            <Input type="time" value={meetingForm.time} onChange={(e) => setMeetingForm(p => ({ ...p, time: e.target.value }))} placeholder="Time" />
            <Input value={meetingForm.contactName} onChange={(e) => setMeetingForm(p => ({ ...p, contactName: e.target.value }))} placeholder="Contact name" />
            <Input value={meetingForm.contactTitle} onChange={(e) => setMeetingForm(p => ({ ...p, contactTitle: e.target.value }))} placeholder="Title" />
          </div>
          <div className="flex gap-2">
            {contactTypes.map(({ type, icon, label }) => (
              <button key={type} onClick={() => setMeetingForm(p => ({ ...p, contactType: type }))}
                className={cn("p-2 rounded flex items-center gap-1 text-sm", meetingForm.contactType === type ? "bg-primary text-primary-foreground" : "bg-muted")}>
                {icon} {label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {moodIcons.map(({ mood, icon, color }) => (
              <button key={mood} onClick={() => setMeetingForm(p => ({ ...p, mood }))}
                className={cn("p-2 rounded", meetingForm.mood === mood ? color : "bg-muted")}>
                {icon}
              </button>
            ))}
          </div>
          <Button onClick={handleAddMeeting} className="bg-primary"><Save className="w-4 h-4 mr-2" /> Save</Button>
        </div>
      )}

      {/* Contact Form */}
      {activeForm === 'contact' && (
        <div className="p-4 bg-muted/30 rounded-sm space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-calibri-bold">New Contact</h4>
            <button onClick={() => setActiveForm(null)}><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input value={contactForm.name} onChange={(e) => setContactForm(p => ({ ...p, name: e.target.value }))} placeholder="Name" />
            <Input value={contactForm.title} onChange={(e) => setContactForm(p => ({ ...p, title: e.target.value }))} placeholder="Title" />
            <Input value={contactForm.phone} onChange={(e) => setContactForm(p => ({ ...p, phone: e.target.value }))} placeholder="Phone" />
            <Input value={contactForm.email} onChange={(e) => setContactForm(p => ({ ...p, email: e.target.value }))} placeholder="Email" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setContactForm(p => ({ ...p, gender: 'female' }))}
              className={cn("px-3 py-1 rounded", contactForm.gender === 'female' ? "bg-pink-500 text-white" : "bg-muted")}>♀ Female</button>
            <button onClick={() => setContactForm(p => ({ ...p, gender: 'male' }))}
              className={cn("px-3 py-1 rounded", contactForm.gender === 'male' ? "bg-blue-500 text-white" : "bg-muted")}>♂ Male</button>
          </div>
          <Button onClick={handleAddContact} className="bg-primary"><Save className="w-4 h-4 mr-2" /> Save</Button>
        </div>
      )}

      {/* Details Form */}
      {activeForm === 'details' && (
        <div className="p-4 bg-muted/30 rounded-sm space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-calibri-bold">Company Details</h4>
            <button onClick={() => setActiveForm(null)}><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input value={detailsForm.city} onChange={(e) => setDetailsForm(p => ({ ...p, city: e.target.value }))} placeholder="City" />
            <Input value={detailsForm.country} onChange={(e) => setDetailsForm(p => ({ ...p, country: e.target.value }))} placeholder="Country" />
            <Input value={detailsForm.industry} onChange={(e) => setDetailsForm(p => ({ ...p, industry: e.target.value }))} placeholder="Industry" />
            <Input type="number" value={detailsForm.headcount} onChange={(e) => setDetailsForm(p => ({ ...p, headcount: parseInt(e.target.value) || 0 }))} placeholder="Headcount" />
          </div>
          <Button onClick={handleUpdateDetails} className="bg-primary"><Save className="w-4 h-4 mr-2" /> Save</Button>
        </div>
      )}

      {/* Note Form */}
      {activeForm === 'note' && (
        <div className="p-4 bg-muted/30 rounded-sm space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-calibri-bold">New Note</h4>
            <button onClick={() => setActiveForm(null)}><X className="w-4 h-4" /></button>
          </div>
          <Textarea value={noteForm} onChange={(e) => setNoteForm(e.target.value)} placeholder="Write a note..." rows={3} />
          <Button onClick={handleAddNote} className="bg-primary"><Save className="w-4 h-4 mr-2" /> Save</Button>
        </div>
      )}

      {/* Existing Meetings */}
      {lead.meetings.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-calibri-bold text-sm text-muted-foreground">Meetings ({lead.meetings.length})</h4>
          {lead.meetings.map((meeting, index) => {
            const ContactIcon = getContactTypeIcon(meeting.contactType);
            const MoodIcon = getMoodIcon(meeting.mood);
            return (
              <div key={meeting.id} className={cn("flex items-center gap-3 p-3 rounded-sm", index === 0 ? "bg-primary/10" : "bg-muted/30")}>
                <div className="bg-primary p-2 rounded-sm"><Edit className="w-4 h-4 text-primary-foreground" /></div>
                <span className="text-sm">{meeting.date} {meeting.time && `- ${meeting.time}`}</span>
                <ContactIcon className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">{meeting.contactName}</span>
                <span className="text-sm text-muted-foreground">{meeting.pillars} PILL/{meeting.sessions} SESS</span>
                {MoodIcon && <div className={cn("p-1 rounded-sm", meeting.mood === 'happy' ? "bg-green-100" : "bg-muted")}><MoodIcon className="w-4 h-4" /></div>}
              </div>
            );
          })}
        </div>
      )}

      {/* Existing Contacts */}
      {lead.contacts.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-calibri-bold text-sm text-muted-foreground">Contacts ({lead.contacts.length})</h4>
          {lead.contacts.map((contact) => (
            <div key={contact.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-sm">
              <span className="text-sm font-medium">{contact.name}</span>
              <span className="text-sm text-muted-foreground">{contact.title}</span>
              {contact.phone && <span className="text-sm text-muted-foreground">{contact.phone}</span>}
              {contact.email && <span className="text-sm text-muted-foreground">{contact.email}</span>}
            </div>
          ))}
        </div>
      )}

      {/* Company Details Display */}
      {(lead.details.city || lead.details.industry || lead.details.headcount > 0) && (
        <div className="space-y-2">
          <h4 className="font-calibri-bold text-sm text-muted-foreground">Details</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {lead.details.city && <div className="p-2 bg-muted/30 rounded-sm">City: {lead.details.city}</div>}
            {lead.details.country && <div className="p-2 bg-muted/30 rounded-sm">Country: {lead.details.country}</div>}
            {lead.details.industry && <div className="p-2 bg-muted/30 rounded-sm">Industry: {lead.details.industry}</div>}
            {lead.details.headcount > 0 && <div className="p-2 bg-muted/30 rounded-sm">Headcount: {lead.details.headcount}</div>}
          </div>
        </div>
      )}

      {/* Existing Notes */}
      {lead.notes.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-calibri-bold text-sm text-muted-foreground">Notes ({lead.notes.length})</h4>
          {lead.notes.map((note) => (
            <div key={note.id} className="p-3 bg-muted/30 rounded-sm">
              <p className="text-sm">{note.content}</p>
              <span className="text-xs text-muted-foreground">{new Date(note.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CrmLeadDetails;
