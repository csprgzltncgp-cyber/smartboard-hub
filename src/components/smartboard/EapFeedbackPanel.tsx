import { MessageSquare, User, Calendar, Reply } from "lucide-react";
import { EapFeedback } from "@/data/operativeMockData";
import { useNavigate } from "react-router-dom";

interface EapFeedbackPanelProps {
  feedbacks: EapFeedback[];
}

const EapFeedbackPanel = ({ feedbacks }: EapFeedbackPanelProps) => {
  const navigate = useNavigate();
  
  // Only show unanswered feedbacks
  const unanswered = feedbacks.filter(f => !f.isAnswered);

  if (unanswered.length === 0) return null;

  return (
    <div id="eap-feedback-panel" className="mb-8">
      {/* Panel Header */}
      <div className="flex items-end justify-between">
        <h2 className="bg-cgp-badge-lastday text-white uppercase text-xl md:text-2xl lg:text-3xl px-6 md:px-8 py-4 md:py-5 rounded-t-[25px] font-calibri-bold flex items-center gap-3">
          <MessageSquare className="w-6 h-6 md:w-8 md:h-8" />
          Olvasatlan EAP feedbackek: {unanswered.length}
        </h2>
        <button
          onClick={() => navigate("/dashboard/eap-online")}
          className="text-cgp-link hover:text-cgp-link-hover hover:underline pb-2 text-sm"
        >
          EAP Online →
        </button>
      </div>

      {/* Panel Content */}
      <div className="bg-cgp-badge-lastday/20 p-6 md:p-8">
        <div className="space-y-3">
          {unanswered.map((feedback) => (
            <div
              key={feedback.id}
              className="flex flex-wrap items-center gap-4 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer border"
              onClick={() => navigate("/dashboard/eap-online")}
            >
              {/* Icon */}
              <div className="bg-cgp-badge-lastday text-white p-2 rounded-lg">
                <MessageSquare className="w-5 h-5" />
              </div>

              {/* Feedback Info */}
              <div className="flex-1 min-w-[200px]">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{feedback.userName}</span>
                </div>
                <p className="text-foreground line-clamp-2">{feedback.message}</p>
              </div>

              {/* Date */}
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                {feedback.date}
              </div>

              {/* Reply button */}
              <button 
                className="flex items-center gap-2 bg-cgp-teal text-white px-4 py-2 rounded-xl hover:bg-cgp-teal/80 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/dashboard/eap-online");
                }}
              >
                <Reply className="w-4 h-4" />
                Válasz
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EapFeedbackPanel;
