import { Calendar, Mail, Phone, Video, Users, Clock } from "lucide-react";
import { CrmMeeting, ContactType } from "@/types/crm";

interface MeetingWithCompany extends CrmMeeting {
  companyName: string;
}

interface UpcomingMeetingsPanelProps {
  meetings: MeetingWithCompany[];
}

const getContactIcon = (type: ContactType) => {
  switch (type) {
    case 'email': return <Mail className="w-4 h-4" />;
    case 'phone': return <Phone className="w-4 h-4" />;
    case 'video': return <Video className="w-4 h-4" />;
    case 'in_person': return <Users className="w-4 h-4" />;
  }
};

const getContactLabel = (type: ContactType) => {
  switch (type) {
    case 'email': return 'Email';
    case 'phone': return 'Telefon';
    case 'video': return 'Videó';
    case 'in_person': return 'Személyes';
  }
};

const UpcomingMeetingsPanel = ({ meetings }: UpcomingMeetingsPanelProps) => {
  return (
    <div id="upcoming-meetings-panel" className="mb-8">
      {/* Panel Header */}
      <div className="flex items-end justify-between">
        <h2 className="bg-cgp-teal-light text-white uppercase text-xl md:text-2xl lg:text-3xl px-6 md:px-8 py-4 md:py-5 rounded-t-[25px] font-calibri-bold flex items-center gap-3">
          <Calendar className="w-6 h-6 md:w-8 md:h-8" />
          Közelgő találkozók: {meetings.length}
        </h2>
      </div>

      {/* Panel Content */}
      <div className="bg-cgp-teal-light/20 p-6 md:p-8">
        {meetings.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            Nincs közelgő találkozó.
          </p>
        ) : (
          <div className="space-y-3">
            {meetings.slice(0, 5).map((meeting) => (
              <div
                key={meeting.id}
                className="flex flex-wrap items-center gap-3 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                {/* Meeting Type Icon */}
                <div className="bg-cgp-teal-light text-white p-2 rounded-lg">
                  {getContactIcon(meeting.contactType)}
                </div>

                {/* Meeting Info */}
                <div className="flex-1 min-w-[200px]">
                  <p className="font-calibri-bold text-foreground">
                    {meeting.companyName}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{meeting.contactName}</span>
                    <span className="mx-1">•</span>
                    <span>{meeting.contactTitle}</span>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="font-calibri-bold">{meeting.date}</span>
                  {meeting.time && (
                    <span className="text-muted-foreground">{meeting.time}</span>
                  )}
                </div>

                {/* Meeting Type Badge */}
                <div className="bg-cgp-teal-light/20 text-cgp-teal px-3 py-1 rounded-lg text-sm font-calibri-bold flex items-center gap-1">
                  {getContactIcon(meeting.contactType)}
                  {getContactLabel(meeting.contactType)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingMeetingsPanel;
