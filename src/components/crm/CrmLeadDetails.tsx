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
    date: '', time: '', title: '', contactName: '', contactTitle: '',
    contactType: 'email' as ContactType, pillars: 3, sessions: 4,
    mood: undefined as MeetingMood | undefined,
    status: undefined as 'cancelled' | 'scheduled' | 'completed' | 'thumbs_up' | undefined,
    hasNotification: false,
    note: '',
  });
  
  const [contactForm, setContactForm] = useState({
    name: '', title: '', gender: 'male' as 'male' | 'female', phone: '', email: '',
  });
  
  const [detailsForm, setDetailsForm] = useState({
    name: lead.companyName,
    city: lead.details.city, 
    country: lead.details.country,
    industry: lead.details.industry, 
    headcount: lead.details.headcount,
    pillars: lead.details.pillars || 0,
    sessions: lead.details.sessions || 0,
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
    setMeetingForm({ date: '', time: '', title: '', contactName: '', contactTitle: '', contactType: 'email', pillars: 3, sessions: 4, mood: undefined, status: undefined, hasNotification: false, note: '' });
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
      companyName: detailsForm.name,
      details: { 
        ...lead.details, 
        city: detailsForm.city,
        country: detailsForm.country,
        industry: detailsForm.industry,
        headcount: detailsForm.headcount,
        pillars: detailsForm.pillars,
        sessions: detailsForm.sessions,
      },
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
        <div className="p-4 bg-muted/30 rounded-sm space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-calibri-bold">Edit meeting</h4>
            <button onClick={() => setActiveForm(null)}><X className="w-4 h-4" /></button>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-3">
              {/* Date/Time */}
              <div className="flex items-center border-b border-border pb-2">
                <div className="flex gap-2 flex-1">
                  <Input type="date" value={meetingForm.date} onChange={(e) => setMeetingForm(p => ({ ...p, date: e.target.value }))} className="flex-1 border-0 shadow-none" />
                  <span className="text-muted-foreground">-</span>
                  <Input type="time" value={meetingForm.time} onChange={(e) => setMeetingForm(p => ({ ...p, time: e.target.value }))} className="flex-1 border-0 shadow-none" />
                </div>
              </div>

              {/* Title */}
              <div className="flex items-center border-b border-border pb-2">
                <Input value={meetingForm.title} onChange={(e) => setMeetingForm(p => ({ ...p, title: e.target.value }))} className="flex-1 border-0 shadow-none" placeholder="Meeting title" />
              </div>
              
              {/* Contact Name */}
              <div className="flex items-center border-b border-border pb-2">
                <Input value={meetingForm.contactName} onChange={(e) => setMeetingForm(p => ({ ...p, contactName: e.target.value }))} className="flex-1 border-0 shadow-none" placeholder="Contact name" />
              </div>

              {/* Contact Title */}
              <div className="flex items-center border-b border-border pb-2">
                <Input value={meetingForm.contactTitle} onChange={(e) => setMeetingForm(p => ({ ...p, contactTitle: e.target.value }))} className="flex-1 border-0 shadow-none" placeholder="Title (e.g. HR director)" />
              </div>

              {/* Contact Type */}
              <div className="flex items-center border-b border-border pb-2">
                <span className="w-28 text-sm font-medium">Contact type</span>
                <div className="flex gap-1 flex-1">
                  {contactTypes.map(({ type, icon }) => (
                    <button key={type} onClick={() => setMeetingForm(p => ({ ...p, contactType: type }))}
                      className={cn("p-2 rounded", meetingForm.contactType === type ? "bg-primary text-primary-foreground" : "bg-muted")}>
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pillars/Sessions */}
              <div className="flex items-center border-b border-border pb-2">
                <div className="flex items-center gap-2 flex-1">
                  <Input type="number" value={meetingForm.pillars} onChange={(e) => setMeetingForm(p => ({ ...p, pillars: parseInt(e.target.value) || 0 }))} className="w-16 border-0 shadow-none" />
                  <span className="text-sm text-muted-foreground">Pillars /</span>
                  <Input type="number" value={meetingForm.sessions} onChange={(e) => setMeetingForm(p => ({ ...p, sessions: parseInt(e.target.value) || 0 }))} className="w-16 border-0 shadow-none" />
                  <span className="text-sm text-muted-foreground">Sessions</span>
                </div>
              </div>

              {/* Mood */}
              <div className="flex items-center border-b border-border pb-2">
                <span className="w-28 text-sm font-medium">Mood</span>
                <div className="flex gap-1 flex-1">
                  {moodIcons.map(({ mood, icon }) => (
                    <button key={mood} onClick={() => setMeetingForm(p => ({ ...p, mood }))}
                      className={cn("p-2 rounded", meetingForm.mood === mood ? "bg-primary text-primary-foreground" : "bg-muted")}>
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center border-b border-border pb-2">
                <span className="w-28 text-sm font-medium">Status</span>
                <div className="flex gap-1 flex-1">
                  <button onClick={() => setMeetingForm(p => ({ ...p, status: 'cancelled' }))}
                    className={cn("p-2 rounded", meetingForm.status === 'cancelled' ? "bg-primary text-primary-foreground" : "bg-muted")}>
                    <FileX className="w-4 h-4" />
                  </button>
                  <button onClick={() => setMeetingForm(p => ({ ...p, status: 'scheduled' }))}
                    className={cn("p-2 rounded", meetingForm.status === 'scheduled' ? "bg-primary text-primary-foreground" : "bg-muted")}>
                    <Calendar className="w-4 h-4" />
                  </button>
                  <button onClick={() => setMeetingForm(p => ({ ...p, status: 'completed' }))}
                    className={cn("p-2 rounded", meetingForm.status === 'completed' ? "bg-primary text-primary-foreground" : "bg-muted")}>
                    <ThumbsUp className="w-4 h-4" />
                  </button>
                  <button onClick={() => setMeetingForm(p => ({ ...p, status: 'thumbs_up' }))}
                    className={cn("p-2 rounded", meetingForm.status === 'thumbs_up' ? "bg-primary text-primary-foreground" : "bg-muted")}>
                    <ThumbsUp className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Add notification */}
              <div className="flex items-center border-b border-border pb-2">
                <span className="w-28 text-sm font-medium">Add notification</span>
                <button 
                  onClick={() => setMeetingForm(p => ({ ...p, hasNotification: !p.hasNotification }))}
                  className={cn("p-2 rounded", meetingForm.hasNotification ? "bg-primary text-primary-foreground" : "bg-muted")}>
                  <Bell className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Column - Note */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Note</span>
                <div className="flex gap-1">
                  <button className="p-1 hover:bg-muted rounded"><Plus className="w-4 h-4" /></button>
                  <button className="p-1 hover:bg-muted rounded"><FileText className="w-4 h-4" /></button>
                </div>
              </div>
              <Textarea 
                value={meetingForm.note} 
                onChange={(e) => setMeetingForm(p => ({ ...p, note: e.target.value }))} 
                placeholder="Add meeting notes..." 
                rows={8}
                className="resize-none"
              />
            </div>
          </div>

          <Button onClick={handleAddMeeting} className="bg-primary w-full"><Save className="w-4 h-4 mr-2" /> Save</Button>
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
            <h4 className="font-calibri-bold">Details</h4>
            <button onClick={() => setActiveForm(null)}><X className="w-4 h-4" /></button>
          </div>
          <div className="space-y-2">
            <div className="flex items-center border-b border-border pb-2">
              <span className="w-24 text-sm font-medium">Name:</span>
              <Input value={detailsForm.name} onChange={(e) => setDetailsForm(p => ({ ...p, name: e.target.value }))} className="flex-1 border-0 shadow-none" placeholder="Company name" />
            </div>
            <div className="flex items-center border-b border-border pb-2">
              <span className="w-24 text-sm font-medium">City:</span>
              <Input value={detailsForm.city} onChange={(e) => setDetailsForm(p => ({ ...p, city: e.target.value }))} className="flex-1 border-0 shadow-none" placeholder="City" />
            </div>
            <div className="flex items-center border-b border-border pb-2">
              <span className="w-24 text-sm font-medium">Country:</span>
              <Input value={detailsForm.country} onChange={(e) => setDetailsForm(p => ({ ...p, country: e.target.value }))} className="flex-1 border-0 shadow-none" placeholder="Country" />
            </div>
            <div className="flex items-center border-b border-border pb-2">
              <span className="w-24 text-sm font-medium">Industry:</span>
              <Input value={detailsForm.industry} onChange={(e) => setDetailsForm(p => ({ ...p, industry: e.target.value }))} className="flex-1 border-0 shadow-none" placeholder="Industry" />
            </div>
            <div className="flex items-center border-b border-border pb-2">
              <span className="w-24 text-sm font-medium">Headcount:</span>
              <Input type="number" value={detailsForm.headcount} onChange={(e) => setDetailsForm(p => ({ ...p, headcount: parseInt(e.target.value) || 0 }))} className="flex-1 border-0 shadow-none" placeholder="Headcount" />
            </div>
            <div className="flex items-center border-b border-border pb-2">
              <span className="w-24 text-sm font-medium">Service:</span>
              <div className="flex-1 flex items-center gap-2">
                <Input type="number" value={detailsForm.pillars} onChange={(e) => setDetailsForm(p => ({ ...p, pillars: parseInt(e.target.value) || 0 }))} className="w-16 border-0 shadow-none" placeholder="0" />
                <span className="text-sm text-muted-foreground">Piller /</span>
                <Input type="number" value={detailsForm.sessions} onChange={(e) => setDetailsForm(p => ({ ...p, sessions: parseInt(e.target.value) || 0 }))} className="w-16 border-0 shadow-none" placeholder="0" />
                <span className="text-sm text-muted-foreground">Sessions</span>
              </div>
            </div>
          </div>
          <Button onClick={handleUpdateDetails} className="bg-primary w-full"><Save className="w-4 h-4 mr-2" /> Save</Button>
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
      {(lead.details.city || lead.details.industry || lead.details.headcount > 0 || lead.details.pillars || lead.details.sessions) && (
        <div className="space-y-2">
          <h4 className="font-calibri-bold text-sm text-muted-foreground">Details</h4>
          <div className="space-y-1 text-sm bg-muted/30 p-3 rounded-sm">
            {lead.companyName && <div className="border-b border-border pb-1">Name: {lead.companyName}</div>}
            {lead.details.city && <div className="border-b border-border pb-1">City: {lead.details.city}</div>}
            {lead.details.country && <div className="border-b border-border pb-1">Country: {lead.details.country}</div>}
            {lead.details.industry && <div className="border-b border-border pb-1">Industry: {lead.details.industry}</div>}
            {lead.details.headcount > 0 && <div className="border-b border-border pb-1">Headcount: {lead.details.headcount}</div>}
            {(lead.details.pillars || lead.details.sessions) && (
              <div>Service: {lead.details.pillars || 0} Piller / {lead.details.sessions || 0} Sessions</div>
            )}
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
