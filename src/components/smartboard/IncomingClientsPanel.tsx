import { Building2, Calendar, MapPin, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { hu } from "date-fns/locale";

export interface IncomingClient {
  id: string;
  companyName: string;
  country: string;
  signedDate: string;
  salesPerson: string;
}

interface IncomingClientsPanelProps {
  clients: IncomingClient[];
}

const IncomingClientsPanel = ({ clients }: IncomingClientsPanelProps) => {
  const navigate = useNavigate();

  return (
    <div id="incoming-clients-panel" className="mb-8">
      {/* Panel Header */}
      <div className="flex items-end justify-between">
        <h2 className="bg-cgp-badge-new text-white uppercase text-xl md:text-2xl lg:text-3xl px-6 md:px-8 py-4 md:py-5 rounded-t-[25px] font-calibri-bold flex items-center gap-3">
          <Building2 className="w-6 h-6 md:w-8 md:h-8" />
          Új érkező ügyfelek: {clients.length}
        </h2>
        <button
          onClick={() => navigate("/dashboard/my-clients")}
          className="text-cgp-link hover:text-cgp-link-hover hover:underline pb-2 text-sm"
        >
          Megnyitás az Ügyfeleim-ben →
        </button>
      </div>

      {/* Panel Content */}
      <div className="bg-cgp-badge-new/20 p-6 md:p-8">
        {clients.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            Nincs új érkező ügyfél.
          </p>
        ) : (
          <div className="space-y-3">
            {clients.map((client) => (
              <div
                key={client.id}
                className="flex flex-wrap items-center gap-3 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate("/dashboard/my-clients")}
              >
                {/* Company Icon */}
                <div className="bg-cgp-badge-new text-white p-2 rounded-lg">
                  <Star className="w-5 h-5" />
                </div>

                {/* Company Info */}
                <div className="flex-1 min-w-[200px]">
                  <p className="font-calibri-bold text-foreground">
                    {client.companyName}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span>{client.country}</span>
                    <span className="mx-1">•</span>
                    <Calendar className="w-3 h-3" />
                    <span>
                      {format(parseISO(client.signedDate), "yyyy. MMM d.", { locale: hu })}
                    </span>
                  </div>
                </div>

                {/* Sales Person */}
                <div className="text-sm text-muted-foreground">
                  Sales: <span className="font-medium">{client.salesPerson}</span>
                </div>

                {/* New Badge */}
                <span className="bg-cgp-badge-new text-white px-4 py-2 flex items-center gap-2 font-calibri-bold text-sm">
                  <Star className="w-4 h-4" />
                  ÚJ
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default IncomingClientsPanel;
