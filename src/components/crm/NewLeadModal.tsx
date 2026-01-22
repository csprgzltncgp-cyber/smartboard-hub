import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, X, Mail, Video, Phone, Users, 
  Smile, Meh, Frown, HelpCircle,
  Hourglass, Calculator, Handshake, FileSignature, XCircle,
  Calendar, FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CrmLead, ContactType, MeetingMood, LeadStatus } from "@/types/crm";
import { mockColleagues } from "@/data/crmMockData";

interface NewLeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (lead: CrmLead) => void;
  initialLead?: CrmLead;
  mode?: 'create' | 'edit';
}

const statusIcons: { status: LeadStatus; icon: React.ReactNode; label: string; color: string }[] = [
  { status: 'lead', icon: <Hourglass className="w-4 h-4" />, label: 'Lead', color: 'bg-cgp-teal-light' },
  { status: 'offer', icon: <Calculator className="w-4 h-4" />, label: 'Offer', color: 'bg-cgp-badge-new' },
  { status: 'deal', icon: <Handshake className="w-4 h-4" />, label: 'Deal', color: 'bg-cgp-badge-lastday' },
  { status: 'signed', icon: <FileSignature className="w-4 h-4" />, label: 'Signed', color: 'bg-cgp-task-completed-purple' },
  { status: 'cancelled', icon: <XCircle className="w-4 h-4" />, label: 'Cancelled', color: 'bg-destructive' },
];

const contactTypes: { type: ContactType; icon: React.ReactNode; label: string }[] = [
  { type: 'email', icon: <Mail className="w-4 h-4" />, label: 'Email' },
  { type: 'video', icon: <Video className="w-4 h-4" />, label: 'Video' },
  { type: 'phone', icon: <Phone className="w-4 h-4" />, label: 'Phone' },
  { type: 'in_person', icon: <Users className="w-4 h-4" />, label: 'In Person' },
];

const moodIcons: { mood: MeetingMood; icon: React.ReactNode; label: string; color: string }[] = [
  { mood: 'happy', icon: <Smile className="w-4 h-4" />, label: 'Happy', color: 'bg-green-100 text-green-600' },
  { mood: 'neutral', icon: <Meh className="w-4 h-4" />, label: 'Neutral', color: 'bg-amber-100 text-amber-600' },
  { mood: 'confused', icon: <HelpCircle className="w-4 h-4" />, label: 'Confused', color: 'bg-blue-100 text-blue-600' },
  { mood: 'negative', icon: <Frown className="w-4 h-4" />, label: 'Negative', color: 'bg-red-100 text-red-600' },
];

const NewLeadModal = ({ open, onOpenChange, onSubmit, initialLead, mode = 'create' }: NewLeadModalProps) => {
  const [formData, setFormData] = useState<Partial<CrmLead>>(initialLead || {
    companyName: '',
    assignedTo: mockColleagues[0]?.name || '',
    assignedToId: mockColleagues[0]?.id || '',
    status: 'lead',
    progress: 0,
    contacts: [],
    meetings: [],
    details: {
      name: '',
      city: '',
      country: 'Hungary',
      industry: '',
      headcount: 0,
      pillars: 3,
      sessions: 4,
    },
    customDetails: [],
    notes: [],
  });

  const [activeSection, setActiveSection] = useState<'meeting' | 'contact' | 'details' | 'notes'>('meeting');

  // Temporary form states for adding items
  const [newMeeting, setNewMeeting] = useState({
    date: '',
    time: '',
    contactName: '',
    contactTitle: '',
    contactType: 'email' as ContactType,
    pillars: 3,
    sessions: 4,
    mood: undefined as MeetingMood | undefined,
    note: '',
  });

  const [newContact, setNewContact] = useState({
    name: '',
    title: '',
    gender: 'male' as 'male' | 'female',
    phone: '',
    email: '',
  });

  const [newNote, setNewNote] = useState('');

  const handleStatusChange = (status: LeadStatus) => {
    setFormData(prev => ({ ...prev, status }));
  };

  const handleAddMeeting = () => {
    if (!newMeeting.date || !newMeeting.contactName) return;
    
    const meeting = {
      id: `m-${Date.now()}`,
      ...newMeeting,
      contactId: '',
    };
    
    setFormData(prev => ({
      ...prev,
      meetings: [...(prev.meetings || []), meeting],
    }));
    
    setNewMeeting({
      date: '',
      time: '',
      contactName: '',
      contactTitle: '',
      contactType: 'email',
      pillars: 3,
      sessions: 4,
      mood: undefined,
      note: '',
    });
  };

  const handleAddContact = () => {
    if (!newContact.name) return;
    
    const contact = {
      id: `c-${Date.now()}`,
      ...newContact,
      isPrimary: (formData.contacts?.length || 0) === 0,
    };
    
    setFormData(prev => ({
      ...prev,
      contacts: [...(prev.contacts || []), contact],
    }));
    
    setNewContact({
      name: '',
      title: '',
      gender: 'male',
      phone: '',
      email: '',
    });
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    
    const note = {
      id: `n-${Date.now()}`,
      content: newNote,
      createdAt: new Date().toISOString(),
      createdBy: formData.assignedTo || '',
    };
    
    setFormData(prev => ({
      ...prev,
      notes: [...(prev.notes || []), note],
    }));
    
    setNewNote('');
  };

  const handleSubmit = () => {
    if (!formData.companyName) return;
    
    const lead: CrmLead = {
      id: initialLead?.id || `lead-${Date.now()}`,
      companyName: formData.companyName || '',
      assignedTo: formData.assignedTo || '',
      assignedToId: formData.assignedToId || '',
      status: formData.status || 'lead',
      progress: formData.progress || 0,
      contacts: formData.contacts || [],
      meetings: formData.meetings || [],
      details: formData.details || {
        name: formData.companyName || '',
        city: '',
        country: 'Hungary',
        industry: '',
        headcount: 0,
        pillars: 3,
        sessions: 4,
      },
      customDetails: formData.customDetails || [],
      notes: formData.notes || [],
      createdAt: initialLead?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    onSubmit(lead);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-4 bg-primary text-primary-foreground">
          <DialogTitle className="font-calibri-bold text-lg">
            {mode === 'create' ? 'New Lead' : 'Edit Lead'}
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Header: Company Name & Status */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label className="text-sm font-calibri-bold mb-2 block">Company Name</Label>
              <Input
                value={formData.companyName}
                onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value, details: { ...prev.details!, name: e.target.value } }))}
                placeholder="Enter company name"
                className="border-border"
              />
            </div>
            
            <div>
              <Label className="text-sm font-calibri-bold mb-2 block">Assigned to</Label>
              <Select 
                value={formData.assignedToId} 
                onValueChange={(v) => {
                  const colleague = mockColleagues.find(c => c.id === v);
                  setFormData(prev => ({ ...prev, assignedToId: v, assignedTo: colleague?.name || '' }));
                }}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mockColleagues.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Icons */}
            <div>
              <Label className="text-sm font-calibri-bold mb-2 block">Status</Label>
              <div className="flex gap-1">
                {statusIcons.map(({ status, icon, label, color }) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    title={label}
                    className={cn(
                      "p-2 rounded transition-all",
                      formData.status === status 
                        ? `${color} text-white` 
                        : "bg-muted hover:bg-muted-foreground/20"
                    )}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section Tabs */}
          <div className="flex border-b border-border">
            {[
              { id: 'meeting' as const, label: 'Meeting', icon: <Calendar className="w-4 h-4" /> },
              { id: 'contact' as const, label: 'Contact Information', icon: <Users className="w-4 h-4" /> },
              { id: 'details' as const, label: 'Details', icon: <FileText className="w-4 h-4" /> },
              { id: 'notes' as const, label: 'Notes', icon: <FileText className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-calibri-bold border-b-2 transition-colors",
                  activeSection === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Meeting Section */}
          {activeSection === 'meeting' && (
            <div className="space-y-4">
              <h3 className="font-calibri-bold text-lg">Add Meeting</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm mb-1 block">Date</Label>
                  <Input 
                    type="date" 
                    value={newMeeting.date}
                    onChange={(e) => setNewMeeting(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label className="text-sm mb-1 block">Time</Label>
                  <Input 
                    type="time"
                    value={newMeeting.time}
                    onChange={(e) => setNewMeeting(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm mb-1 block">Contact Name</Label>
                  <Input 
                    value={newMeeting.contactName}
                    onChange={(e) => setNewMeeting(prev => ({ ...prev, contactName: e.target.value }))}
                    placeholder="Name of contact"
                  />
                </div>
                <div>
                  <Label className="text-sm mb-1 block">Title</Label>
                  <Input 
                    value={newMeeting.contactTitle}
                    onChange={(e) => setNewMeeting(prev => ({ ...prev, contactTitle: e.target.value }))}
                    placeholder="e.g. HR Director"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm mb-2 block">Contact Type</Label>
                <div className="flex gap-2">
                  {contactTypes.map(({ type, icon, label }) => (
                    <button
                      key={type}
                      onClick={() => setNewMeeting(prev => ({ ...prev, contactType: type }))}
                      title={label}
                      className={cn(
                        "p-3 rounded transition-all flex items-center gap-2",
                        newMeeting.contactType === type
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted-foreground/20"
                      )}
                    >
                      {icon}
                      <span className="text-sm">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm mb-1 block">Pillars</Label>
                  <Input 
                    type="number"
                    min={1}
                    max={4}
                    value={newMeeting.pillars}
                    onChange={(e) => setNewMeeting(prev => ({ ...prev, pillars: parseInt(e.target.value) || 3 }))}
                  />
                </div>
                <div>
                  <Label className="text-sm mb-1 block">Sessions</Label>
                  <Input 
                    type="number"
                    min={1}
                    max={10}
                    value={newMeeting.sessions}
                    onChange={(e) => setNewMeeting(prev => ({ ...prev, sessions: parseInt(e.target.value) || 4 }))}
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm mb-2 block">Mood</Label>
                <div className="flex gap-2">
                  {moodIcons.map(({ mood, icon, label, color }) => (
                    <button
                      key={mood}
                      onClick={() => setNewMeeting(prev => ({ ...prev, mood }))}
                      title={label}
                      className={cn(
                        "p-3 rounded transition-all",
                        newMeeting.mood === mood
                          ? color
                          : "bg-muted hover:bg-muted-foreground/20"
                      )}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm mb-1 block">Note</Label>
                <Textarea 
                  value={newMeeting.note}
                  onChange={(e) => setNewMeeting(prev => ({ ...prev, note: e.target.value }))}
                  placeholder="Meeting notes..."
                  rows={3}
                />
              </div>

              <Button onClick={handleAddMeeting} className="bg-primary">
                <Plus className="w-4 h-4 mr-2" />
                Add Meeting
              </Button>

              {/* Existing Meetings List */}
              {(formData.meetings?.length || 0) > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="font-calibri-bold text-sm">Added Meetings</h4>
                  {formData.meetings?.map((meeting, idx) => (
                    <div key={meeting.id} className="p-3 bg-muted/30 rounded flex items-center justify-between">
                      <span className="text-sm">
                        {meeting.date} - {meeting.contactName} ({meeting.contactType})
                      </span>
                      <button 
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          meetings: prev.meetings?.filter((_, i) => i !== idx)
                        }))}
                        className="text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Contact Section */}
          {activeSection === 'contact' && (
            <div className="space-y-4">
              <h3 className="font-calibri-bold text-lg">Add Contact</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm mb-1 block">Name</Label>
                  <Input 
                    value={newContact.name}
                    onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Contact name"
                  />
                </div>
                <div>
                  <Label className="text-sm mb-1 block">Title</Label>
                  <Input 
                    value={newContact.title}
                    onChange={(e) => setNewContact(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. HR Director"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm mb-2 block">Gender</Label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setNewContact(prev => ({ ...prev, gender: 'female' }))}
                    className={cn(
                      "px-4 py-2 rounded transition-all",
                      newContact.gender === 'female'
                        ? "bg-pink-500 text-white"
                        : "bg-muted hover:bg-muted-foreground/20"
                    )}
                  >
                    ♀ Female
                  </button>
                  <button
                    onClick={() => setNewContact(prev => ({ ...prev, gender: 'male' }))}
                    className={cn(
                      "px-4 py-2 rounded transition-all",
                      newContact.gender === 'male'
                        ? "bg-blue-500 text-white"
                        : "bg-muted hover:bg-muted-foreground/20"
                    )}
                  >
                    ♂ Male
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm mb-1 block">Phone</Label>
                  <Input 
                    value={newContact.phone}
                    onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+36 30 123 4567"
                  />
                </div>
                <div>
                  <Label className="text-sm mb-1 block">Email</Label>
                  <Input 
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@company.com"
                  />
                </div>
              </div>

              <Button onClick={handleAddContact} className="bg-primary">
                <Plus className="w-4 h-4 mr-2" />
                Add Contact
              </Button>

              {/* Existing Contacts List */}
              {(formData.contacts?.length || 0) > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="font-calibri-bold text-sm">Added Contacts</h4>
                  {formData.contacts?.map((contact, idx) => (
                    <div key={contact.id} className="p-3 bg-muted/30 rounded flex items-center justify-between">
                      <span className="text-sm">
                        {contact.name} - {contact.title} ({contact.email || contact.phone})
                      </span>
                      <button 
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          contacts: prev.contacts?.filter((_, i) => i !== idx)
                        }))}
                        className="text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Details Section */}
          {activeSection === 'details' && (
            <div className="space-y-4">
              <h3 className="font-calibri-bold text-lg">Company Details</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm mb-1 block">City</Label>
                  <Input 
                    value={formData.details?.city}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      details: { ...prev.details!, city: e.target.value } 
                    }))}
                    placeholder="City"
                  />
                </div>
                <div>
                  <Label className="text-sm mb-1 block">Country</Label>
                  <Input 
                    value={formData.details?.country}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      details: { ...prev.details!, country: e.target.value } 
                    }))}
                    placeholder="Country"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm mb-1 block">Industry</Label>
                  <Input 
                    value={formData.details?.industry}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      details: { ...prev.details!, industry: e.target.value } 
                    }))}
                    placeholder="e.g. IT, Automotive, FMCG"
                  />
                </div>
                <div>
                  <Label className="text-sm mb-1 block">Headcount</Label>
                  <Input 
                    type="number"
                    value={formData.details?.headcount}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      details: { ...prev.details!, headcount: parseInt(e.target.value) || 0 } 
                    }))}
                    placeholder="Number of employees"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm mb-1 block">Service</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="number"
                    value={formData.details?.pillars || 3}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      details: { ...prev.details!, pillars: parseInt(e.target.value) || 0 } 
                    }))}
                    placeholder="Pillars"
                    className="w-20"
                  />
                  <span className="text-muted-foreground">PILL /</span>
                  <Input 
                    type="number"
                    value={formData.details?.sessions || 4}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      details: { ...prev.details!, sessions: parseInt(e.target.value) || 0 } 
                    }))}
                    placeholder="Sessions"
                    className="w-20"
                  />
                  <span className="text-muted-foreground">SESS</span>
                </div>
              </div>
            </div>
          )}

          {/* Notes Section */}
          {activeSection === 'notes' && (
            <div className="space-y-4">
              <h3 className="font-calibri-bold text-lg">Notes</h3>
              
              <Textarea 
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note..."
                rows={4}
              />

              <Button onClick={handleAddNote} className="bg-primary">
                <Plus className="w-4 h-4 mr-2" />
                Add Note
              </Button>

              {/* Existing Notes List */}
              {(formData.notes?.length || 0) > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="font-calibri-bold text-sm">Added Notes</h4>
                  {formData.notes?.map((note, idx) => (
                    <div key={note.id} className="p-3 bg-muted/30 rounded">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-muted-foreground">
                          {new Date(note.createdAt).toLocaleDateString()}
                        </span>
                        <button 
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            notes: prev.notes?.filter((_, i) => i !== idx)
                          }))}
                          className="text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm">{note.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="bg-primary">
              {mode === 'create' ? 'Create Lead' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewLeadModal;
