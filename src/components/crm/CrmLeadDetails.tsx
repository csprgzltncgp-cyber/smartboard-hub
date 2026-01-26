import { useState } from "react";
import { CrmLead, CrmMeeting, CrmContact, ContactType, MeetingMood, LeadStatus } from "@/types/crm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, Mail, Video, Phone, MessageSquare, 
  Smile, Meh, HelpCircle, Frown, 
  Hourglass, Calculator, Handshake, FileSignature, Calendar,
  Edit, Trash2, Save, X,
  Bell, Users, FileText, Building2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CrmLeadDetailsProps {
  lead: CrmLead;
  onUpdate?: (lead: CrmLead) => void;
  onChangeStatus?: (leadId: string, newStatus: LeadStatus) => void;
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

// Lead status icons and colors for the status selector
const leadStatusConfig: { status: LeadStatus; icon: React.ReactNode; label: string; activeClass: string }[] = [
  { status: 'lead', icon: <Hourglass className="w-4 h-4" />, label: 'Lead', activeClass: 'bg-cgp-teal-light text-white' },
  { status: 'offer', icon: <Calculator className="w-4 h-4" />, label: 'Ajánlat', activeClass: 'bg-cgp-badge-new text-white' },
  { status: 'deal', icon: <Handshake className="w-4 h-4" />, label: 'Tárgyalás', activeClass: 'bg-cgp-badge-lastday text-white' },
  { status: 'signed', icon: <FileSignature className="w-4 h-4" />, label: 'Aláírt', activeClass: 'bg-cgp-task-completed-purple text-white' },
];

const contactTypes: { type: ContactType; icon: React.ReactNode; label: string }[] = [
  { type: 'email', icon: <Mail className="w-4 h-4" />, label: 'Email' },
  { type: 'video', icon: <Video className="w-4 h-4" />, label: 'Videó' },
  { type: 'phone', icon: <Phone className="w-4 h-4" />, label: 'Telefon' },
  { type: 'in_person', icon: <Users className="w-4 h-4" />, label: 'Személyes' },
];

const moodIcons: { mood: MeetingMood; icon: React.ReactNode; color: string }[] = [
  { mood: 'happy', icon: <Smile className="w-4 h-4" />, color: 'bg-green-100 text-green-600' },
  { mood: 'neutral', icon: <Meh className="w-4 h-4" />, color: 'bg-amber-100 text-amber-600' },
  { mood: 'confused', icon: <HelpCircle className="w-4 h-4" />, color: 'bg-blue-100 text-blue-600' },
  { mood: 'negative', icon: <Frown className="w-4 h-4" />, color: 'bg-red-100 text-red-600' },
];

const CrmLeadDetails = ({ lead, onUpdate, onChangeStatus }: CrmLeadDetailsProps) => {
  const [activeForm, setActiveForm] = useState<'meeting' | 'contact' | 'details' | 'note' | null>(null);
  const [editingMeetingId, setEditingMeetingId] = useState<string | null>(null);
  
  // Form states (status removed - now at lead level)
  const [meetingForm, setMeetingForm] = useState({
    date: '', time: '', contactName: '', address: '',
    contactType: 'email' as ContactType, pillars: 3, sessions: 4,
    mood: undefined as MeetingMood | undefined,
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
    headcount: lead.details.headcount > 0 ? lead.details.headcount : Number.NaN,
    pillars: lead.details.pillars > 0 ? lead.details.pillars : Number.NaN,
    sessions: lead.details.sessions > 0 ? lead.details.sessions : Number.NaN,
  });
  
  const [noteForm, setNoteForm] = useState('');

  // Reset meeting form
  const resetMeetingForm = () => {
    setMeetingForm({ date: '', time: '', contactName: '', address: '', contactType: 'email', pillars: 3, sessions: 4, mood: undefined, hasNotification: false, note: '' });
    setEditingMeetingId(null);
    setActiveForm(null);
  };

  // Handle lead status change (moves lead to different tab)
  const handleStatusChange = (newStatus: LeadStatus) => {
    if (onChangeStatus) {
      onChangeStatus(lead.id, newStatus);
      return;
    }

    const updatedLead = {
      ...lead,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };
    onUpdate?.(updatedLead);
  };

  // Handle sending to Companies (Incoming company)
  const handleSendToCompanies = () => {
    if (onChangeStatus) {
      onChangeStatus(lead.id, 'incoming_company' as LeadStatus);
      return;
    }

    const updatedLead = {
      ...lead,
      status: 'incoming_company' as LeadStatus,
      updatedAt: new Date().toISOString(),
    };
    onUpdate?.(updatedLead);
  };

  // Start editing a meeting
  const handleEditMeeting = (meeting: CrmMeeting) => {
    setEditingMeetingId(meeting.id);
    setMeetingForm({
      date: meeting.date,
      time: meeting.time,
      contactName: meeting.contactName,
      address: meeting.contactTitle || '',
      contactType: meeting.contactType,
      pillars: meeting.pillars,
      sessions: meeting.sessions,
      mood: meeting.mood,
      hasNotification: meeting.hasNotification || false,
      note: meeting.note || '',
    });
    setActiveForm('meeting');
  };

  // Delete a meeting
  const handleDeleteMeeting = (meetingId: string) => {
    const updatedLead = {
      ...lead,
      meetings: lead.meetings.filter(m => m.id !== meetingId),
      updatedAt: new Date().toISOString(),
    };
    onUpdate?.(updatedLead);
  };

  // Save meeting (add or update) - status no longer set here, it's at lead level
  const handleSaveMeeting = () => {
    if (!meetingForm.date || !meetingForm.contactName) return;
    
    if (editingMeetingId) {
      // Update existing meeting
      const updatedLead = {
        ...lead,
        meetings: lead.meetings.map(m => 
          m.id === editingMeetingId 
            ? {
                ...m,
                date: meetingForm.date,
                time: meetingForm.time,
                contactName: meetingForm.contactName,
                contactTitle: meetingForm.address,
                contactType: meetingForm.contactType,
                pillars: meetingForm.pillars,
                sessions: meetingForm.sessions,
                mood: meetingForm.mood,
                hasNotification: meetingForm.hasNotification,
                note: meetingForm.note,
              }
            : m
        ),
        updatedAt: new Date().toISOString(),
      };
      onUpdate?.(updatedLead);
    } else {
      // Add new meeting
      const newMeeting: CrmMeeting = {
        id: `m-${Date.now()}`,
        date: meetingForm.date,
        time: meetingForm.time,
        contactId: '',
        contactName: meetingForm.contactName,
        contactTitle: meetingForm.address,
        contactType: meetingForm.contactType,
        pillars: meetingForm.pillars,
        sessions: meetingForm.sessions,
        mood: meetingForm.mood,
        hasNotification: meetingForm.hasNotification,
        note: meetingForm.note,
      };
      
      const updatedLead = {
        ...lead,
        meetings: [...lead.meetings, newMeeting],
        updatedAt: new Date().toISOString(),
      };
      onUpdate?.(updatedLead);
    }
    
    resetMeetingForm();
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

  // Handle opening the meeting form for new entries
  const handleOpenMeetingForm = () => {
    if (activeForm === 'meeting') {
      resetMeetingForm();
    } else {
      setEditingMeetingId(null);
      setMeetingForm({ date: '', time: '', contactName: '', address: '', contactType: 'email', pillars: 3, sessions: 4, mood: undefined, hasNotification: false, note: '' });
      setActiveForm('meeting');
    }
  };

  return (
    <div className="bg-background p-4 space-y-4 border-t border-border">
      {/* Lead Status Selector Row */}
      <div className="flex items-center gap-2 pb-3 border-b border-border">
        <span className="text-sm font-medium text-muted-foreground mr-2">Státusz:</span>
        <div className="flex gap-1">
          {leadStatusConfig.map(({ status, icon, label, activeClass }) => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              className={cn(
                "p-2 rounded flex items-center gap-1.5 text-sm transition-colors",
                lead.status === status ? activeClass : "bg-muted hover:bg-muted/80"
              )}
              title={label}
            >
              {icon}
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Incoming Company Button - only show when status is signed */}
        {lead.status === 'signed' && (
          <Button
            onClick={handleSendToCompanies}
            className="ml-4 bg-cgp-teal hover:bg-cgp-teal-hover text-white rounded-xl gap-2"
            size="sm"
          >
            <Building2 className="w-4 h-4" />
            Új érkező
          </Button>
        )}

        {/* Incoming Company Badge - show when already sent */}
        {lead.status === 'incoming_company' && (
          <span className="ml-4 inline-flex items-center gap-2 px-3 py-1.5 bg-cgp-teal/20 text-cgp-teal rounded-xl text-sm font-medium">
            <Building2 className="w-4 h-4" />
            Új érkező
          </span>
        )}
      </div>

      {/* Action Buttons Row */}
      <div className="flex gap-2 flex-wrap">
        <Button 
          onClick={handleOpenMeetingForm}
          variant={activeForm === 'meeting' ? 'default' : 'outline'}
          className="rounded-xl"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Találkozó
        </Button>
        <Button 
          onClick={() => setActiveForm(activeForm === 'contact' ? null : 'contact')}
          variant={activeForm === 'contact' ? 'default' : 'outline'}
          className="rounded-xl"
        >
          <Users className="w-4 h-4 mr-2" />
          Kapcsolattartó
        </Button>
        <Button 
          onClick={() => setActiveForm(activeForm === 'details' ? null : 'details')}
          variant={activeForm === 'details' ? 'default' : 'outline'}
          className="rounded-xl"
        >
          <FileText className="w-4 h-4 mr-2" />
          Részletek
        </Button>
        <Button 
          onClick={() => setActiveForm(activeForm === 'note' ? null : 'note')}
          variant={activeForm === 'note' ? 'default' : 'outline'}
          className="rounded-xl"
        >
          <Plus className="w-4 h-4 mr-2" />
          Feljegyzés
        </Button>
      </div>

      {/* Meeting Form */}
      {activeForm === 'meeting' && (
        <div className="p-4 bg-muted/30 rounded-sm space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-calibri-bold">{editingMeetingId ? 'Találkozó szerkesztése' : 'Új találkozó'}</h4>
            <button onClick={resetMeetingForm}><X className="w-4 h-4" /></button>
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

              {/* Contact Name */}
              <div className="flex items-center border-b border-border pb-2">
                <Input value={meetingForm.contactName} onChange={(e) => setMeetingForm(p => ({ ...p, contactName: e.target.value }))} className="flex-1 border-0 shadow-none" placeholder="Kapcsolattartó neve" />
              </div>

              {/* Address (meeting location) */}
              <div className="flex items-center border-b border-border pb-2">
                <Input value={meetingForm.address} onChange={(e) => setMeetingForm(p => ({ ...p, address: e.target.value }))} className="flex-1 border-0 shadow-none" placeholder="Helyszín (cím)" />
              </div>

              {/* Contact Type */}
              <div className="flex items-center border-b border-border pb-2">
                <span className="w-28 text-sm font-medium">Kapcsolat típus</span>
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
                  <span className="text-sm text-muted-foreground">Pillér /</span>
                  <Input type="number" value={meetingForm.sessions} onChange={(e) => setMeetingForm(p => ({ ...p, sessions: parseInt(e.target.value) || 0 }))} className="w-16 border-0 shadow-none" />
                  <span className="text-sm text-muted-foreground">Alkalom</span>
                </div>
              </div>

              {/* Mood */}
              <div className="flex items-center border-b border-border pb-2">
                <span className="w-28 text-sm font-medium">Hangulat</span>
                <div className="flex gap-1 flex-1">
                  {moodIcons.map(({ mood, icon }) => (
                    <button key={mood} onClick={() => setMeetingForm(p => ({ ...p, mood }))}
                      className={cn("p-2 rounded", meetingForm.mood === mood ? "bg-primary text-primary-foreground" : "bg-muted")}>
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add notification */}
              <div className="flex items-center border-b border-border pb-2">
                <span className="w-28 text-sm font-medium">Értesítés</span>
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
                <span className="text-sm font-medium">Jegyzet</span>
                <div className="flex gap-1">
                  <button className="p-1 hover:bg-muted rounded"><Plus className="w-4 h-4" /></button>
                  <button className="p-1 hover:bg-muted rounded"><FileText className="w-4 h-4" /></button>
                </div>
              </div>
              <Textarea 
                value={meetingForm.note} 
                onChange={(e) => setMeetingForm(p => ({ ...p, note: e.target.value }))} 
                placeholder="Találkozóval kapcsolatos jegyzetek..." 
                rows={8}
                className="resize-none"
              />
            </div>
          </div>

          <Button onClick={handleSaveMeeting} className="bg-primary w-full"><Save className="w-4 h-4 mr-2" /> {editingMeetingId ? 'Mentés' : 'Mentés'}</Button>
        </div>
      )}

      {/* Contact Form */}
      {activeForm === 'contact' && (
        <div className="p-4 bg-muted/30 rounded-sm space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-calibri-bold">Új kapcsolattartó</h4>
            <button onClick={() => setActiveForm(null)}><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input value={contactForm.name} onChange={(e) => setContactForm(p => ({ ...p, name: e.target.value }))} placeholder="Név" />
            <Input value={contactForm.title} onChange={(e) => setContactForm(p => ({ ...p, title: e.target.value }))} placeholder="Beosztás" />
            <Input value={contactForm.phone} onChange={(e) => setContactForm(p => ({ ...p, phone: e.target.value }))} placeholder="Telefon" />
            <Input value={contactForm.email} onChange={(e) => setContactForm(p => ({ ...p, email: e.target.value }))} placeholder="Email" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setContactForm(p => ({ ...p, gender: 'female' }))}
              className={cn("px-3 py-1 rounded", contactForm.gender === 'female' ? "bg-pink-500 text-white" : "bg-muted")}>♀ Nő</button>
            <button onClick={() => setContactForm(p => ({ ...p, gender: 'male' }))}
              className={cn("px-3 py-1 rounded", contactForm.gender === 'male' ? "bg-blue-500 text-white" : "bg-muted")}>♂ Férfi</button>
          </div>
          <Button onClick={handleAddContact} className="bg-primary"><Save className="w-4 h-4 mr-2" /> Mentés</Button>
        </div>
      )}

      {/* Details Form */}
      {activeForm === 'details' && (
        <div className="p-4 bg-muted/30 rounded-sm space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-calibri-bold">Részletek</h4>
            <button onClick={() => setActiveForm(null)}><X className="w-4 h-4" /></button>
          </div>
          <div className="space-y-2">
            <div className="flex items-center border-b border-border pb-2">
              <span className="w-24 text-sm font-medium">Név:</span>
              <Input value={detailsForm.name} onChange={(e) => setDetailsForm(p => ({ ...p, name: e.target.value }))} className="flex-1 border-0 shadow-none" placeholder="Cégnév" />
            </div>
            <div className="flex items-center border-b border-border pb-2">
              <span className="w-24 text-sm font-medium">Város:</span>
              <Input value={detailsForm.city} onChange={(e) => setDetailsForm(p => ({ ...p, city: e.target.value }))} className="flex-1 border-0 shadow-none" placeholder="Város" />
            </div>
            <div className="flex items-center border-b border-border pb-2">
              <span className="w-24 text-sm font-medium">Ország:</span>
              <Input value={detailsForm.country} onChange={(e) => setDetailsForm(p => ({ ...p, country: e.target.value }))} className="flex-1 border-0 shadow-none" placeholder="Ország" />
            </div>
            <div className="flex items-center border-b border-border pb-2">
              <span className="w-24 text-sm font-medium">Iparág:</span>
              <Input value={detailsForm.industry} onChange={(e) => setDetailsForm(p => ({ ...p, industry: e.target.value }))} className="flex-1 border-0 shadow-none" placeholder="Iparág" />
            </div>
            <div className="flex items-center border-b border-border pb-2">
              <span className="w-24 text-sm font-medium">Létszám:</span>
              <Input
                type="number"
                value={Number.isFinite(detailsForm.headcount) ? detailsForm.headcount : ''}
                onChange={(e) => {
                  const raw = e.target.value;
                  setDetailsForm((p) => ({
                    ...p,
                    headcount: raw === '' ? Number.NaN : parseInt(raw, 10),
                  }));
                }}
                className="flex-1 border-0 shadow-none"
                placeholder="Létszám"
              />
            </div>
            <div className="flex items-center border-b border-border pb-2">
              <span className="w-24 text-sm font-medium">Szolgáltatás:</span>
              <div className="flex-1 flex items-center gap-2">
                <Input
                  type="number"
                  value={Number.isFinite(detailsForm.pillars) ? detailsForm.pillars : ''}
                  onChange={(e) => {
                    const raw = e.target.value;
                    setDetailsForm((p) => ({
                      ...p,
                      pillars: raw === '' ? Number.NaN : parseInt(raw, 10),
                    }));
                  }}
                  className="w-16 border-0 shadow-none"
                  placeholder="Pillér"
                />
                <span className="text-sm text-muted-foreground">Pillér /</span>
                <Input
                  type="number"
                  value={Number.isFinite(detailsForm.sessions) ? detailsForm.sessions : ''}
                  onChange={(e) => {
                    const raw = e.target.value;
                    setDetailsForm((p) => ({
                      ...p,
                      sessions: raw === '' ? Number.NaN : parseInt(raw, 10),
                    }));
                  }}
                  className="w-16 border-0 shadow-none"
                  placeholder="Alkalom"
                />
                <span className="text-sm text-muted-foreground">Alkalom</span>
              </div>
            </div>
          </div>
          <Button onClick={handleUpdateDetails} className="bg-primary w-full"><Save className="w-4 h-4 mr-2" /> Mentés</Button>
        </div>
      )}

      {/* Note Form */}
      {activeForm === 'note' && (
        <div className="p-4 bg-muted/30 rounded-sm space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-calibri-bold">Új feljegyzés</h4>
            <button onClick={() => setActiveForm(null)}><X className="w-4 h-4" /></button>
          </div>
          <Textarea value={noteForm} onChange={(e) => setNoteForm(e.target.value)} placeholder="Írj egy feljegyzést..." rows={3} />
          <Button onClick={handleAddNote} className="bg-primary"><Save className="w-4 h-4 mr-2" /> Mentés</Button>
        </div>
      )}

      {/* Existing Meetings */}
      {lead.meetings.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-calibri-bold text-sm text-muted-foreground">Találkozók ({lead.meetings.length})</h4>
          {lead.meetings.map((meeting, index) => {
            const ContactIcon = getContactTypeIcon(meeting.contactType);
            const MoodIcon = getMoodIcon(meeting.mood);
            return (
              <div key={meeting.id} className={cn("flex items-center gap-3 p-3 rounded-sm", index === 0 ? "bg-primary/10" : "bg-muted/30")}>
                <button 
                  onClick={() => handleEditMeeting(meeting)}
                  className="bg-primary p-2 rounded-sm hover:bg-primary/80 transition-colors"
                  title="Találkozó szerkesztése"
                >
                  <Edit className="w-4 h-4 text-primary-foreground" />
                </button>
                <span className="text-sm">{meeting.date} {meeting.time && `- ${meeting.time}`}</span>
                <ContactIcon className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">{meeting.contactName}</span>
                <span className="text-sm text-muted-foreground">{meeting.pillars} PILL/{meeting.sessions} SESS</span>
                {MoodIcon !== null && <div className={cn("p-1 rounded-sm", meeting.mood === 'happy' ? "bg-green-100" : "bg-muted")}><MoodIcon className="w-4 h-4" /></div>}
                <button 
                  onClick={() => handleDeleteMeeting(meeting.id)}
                  className="ml-auto p-1 hover:bg-destructive/20 rounded text-muted-foreground hover:text-destructive transition-colors"
                  title="Találkozó törlése"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Existing Contacts */}
      {lead.contacts.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-calibri-bold text-sm text-muted-foreground">Kapcsolattartók ({lead.contacts.length})</h4>
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
      {(lead.details.city || lead.details.industry || (Number.isFinite(lead.details.headcount) && lead.details.headcount > 0) || (Number.isFinite(lead.details.pillars) && lead.details.pillars > 0) || (Number.isFinite(lead.details.sessions) && lead.details.sessions > 0)) && (
        <div className="space-y-2">
          <h4 className="font-calibri-bold text-sm text-muted-foreground">Részletek</h4>
          <div className="space-y-1 text-sm bg-muted/30 p-3 rounded-sm">
            {lead.companyName && <div className="border-b border-border pb-1">Név: {lead.companyName}</div>}
            {lead.details.city && <div className="border-b border-border pb-1">Város: {lead.details.city}</div>}
            {lead.details.country && <div className="border-b border-border pb-1">Ország: {lead.details.country}</div>}
            {lead.details.industry && <div className="border-b border-border pb-1">Iparág: {lead.details.industry}</div>}
            {Number.isFinite(lead.details.headcount) && lead.details.headcount > 0 && (
              <div className="border-b border-border pb-1">Létszám: {lead.details.headcount}</div>
            )}
            {(Number.isFinite(lead.details.pillars) || Number.isFinite(lead.details.sessions)) && (
              <div>
                Szolgáltatás:
                {Number.isFinite(lead.details.pillars) && lead.details.pillars > 0 ? ` ${lead.details.pillars}` : ' —'}
                {' '}Pillér /{' '}
                {Number.isFinite(lead.details.sessions) && lead.details.sessions > 0 ? ` ${lead.details.sessions}` : ' —'}
                {' '}Alkalom
              </div>
            )}
          </div>
        </div>
      )}

      {/* Existing Notes */}
      {lead.notes.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-calibri-bold text-sm text-muted-foreground">Feljegyzések ({lead.notes.length})</h4>
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
