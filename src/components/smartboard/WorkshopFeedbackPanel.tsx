import { MessageSquare, Star, User, Building2, Calendar, AlertTriangle } from "lucide-react";
import { WorkshopFeedback } from "@/data/operativeMockData";
import { useNavigate } from "react-router-dom";

interface WorkshopFeedbackPanelProps {
  feedbacks: WorkshopFeedback[];
}

const WorkshopFeedbackPanel = ({ feedbacks }: WorkshopFeedbackPanelProps) => {
  const navigate = useNavigate();

  // Sort by rating (lowest first) and highlight low ratings
  const sortedFeedbacks = [...feedbacks].sort((a, b) => a.rating - b.rating);

  if (feedbacks.length === 0) return null;

  return (
    <div id="workshop-feedback-panel" className="mb-8">
      {/* Panel Header */}
      <div className="flex items-end justify-between">
        <h2 className="bg-cgp-badge-lastday text-white uppercase text-xl md:text-2xl lg:text-3xl px-6 md:px-8 py-4 md:py-5 rounded-t-[25px] font-calibri-bold flex items-center gap-3">
          <MessageSquare className="w-6 h-6 md:w-8 md:h-8" />
          Workshop feedbackek: {feedbacks.length}
        </h2>
        <button
          onClick={() => navigate("/dashboard/feedback")}
          className="text-cgp-link hover:text-cgp-link-hover hover:underline pb-2 text-sm"
        >
          Összes feedback →
        </button>
      </div>

      {/* Panel Content */}
      <div className="bg-cgp-badge-lastday/20 p-6 md:p-8">
        <div className="space-y-3">
          {sortedFeedbacks.map((feedback) => (
            <div
              key={feedback.id}
              className={`flex flex-wrap items-center gap-4 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer border ${
                feedback.isLowRating ? 'border-cgp-badge-overdue/50' : ''
              }`}
              onClick={() => navigate("/dashboard/feedback")}
            >
              {/* Icon */}
              <div className={`p-2 rounded-lg ${feedback.isLowRating ? 'bg-cgp-badge-overdue text-white' : 'bg-cgp-badge-new text-white'}`}>
                <MessageSquare className="w-5 h-5" />
              </div>

              {/* Workshop Info */}
              <div className="flex-1 min-w-[200px]">
                <p className="font-calibri-bold text-foreground">{feedback.workshopTitle}</p>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {feedback.expertName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    {feedback.companyName}
                  </span>
                </div>
              </div>

              {/* Date */}
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                {feedback.date}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <Star className={`w-5 h-5 ${feedback.isLowRating ? 'text-cgp-badge-overdue fill-cgp-badge-overdue' : 'text-cgp-badge-new fill-cgp-badge-new'}`} />
                <span className={`text-xl font-calibri-bold ${feedback.isLowRating ? 'text-cgp-badge-overdue' : 'text-cgp-badge-new'}`}>
                  {feedback.rating.toFixed(1)}
                </span>
              </div>

              {/* Warning for low ratings */}
              {feedback.isLowRating && (
                <AlertTriangle className="w-5 h-5 text-cgp-badge-overdue" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkshopFeedbackPanel;
