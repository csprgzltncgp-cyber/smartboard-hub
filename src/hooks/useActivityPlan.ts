import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Country, 
  Company, 
  UserClientAssignment, 
  ActivityPlan, 
  ActivityPlanEvent,
  ActivityEventType,
  ActivityEventStatus,
  PeriodType,
  MeetingMood
} from "@/types/activityPlan";
import { toast } from "sonner";

// Countries
export const useCountries = () => {
  return useQuery({
    queryKey: ["countries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("countries")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as Country[];
    },
  });
};

// Companies
export const useCompanies = (countryId?: string) => {
  return useQuery({
    queryKey: ["companies", countryId],
    queryFn: async () => {
      let query = supabase
        .from("companies")
        .select("*, country:countries(*)")
        .order("name");
      
      if (countryId) {
        query = query.eq("country_id", countryId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Company[];
    },
  });
};

export const useCreateCompany = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (company: Omit<Company, "id" | "created_at" | "updated_at" | "country">) => {
      const { data, error } = await supabase
        .from("companies")
        .insert(company)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast.success("Cég létrehozva");
    },
    onError: (error) => {
      toast.error("Hiba történt: " + error.message);
    },
  });
};

// User Client Assignments
export const useUserClientAssignments = (userId?: string) => {
  return useQuery({
    queryKey: ["user_client_assignments", userId],
    queryFn: async () => {
      let query = supabase
        .from("user_client_assignments")
        .select("*, company:companies(*, country:countries(*))");
      
      if (userId) {
        query = query.eq("user_id", userId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as UserClientAssignment[];
    },
    enabled: userId === undefined ? false : true,
  });
};

// All User Client Assignments (for Client Directors)
export const useAllUserClientAssignments = () => {
  return useQuery({
    queryKey: ["all_user_client_assignments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_client_assignments")
        .select("*, company:companies(*, country:countries(*)), user:app_users!user_client_assignments_user_id_fkey(id, name, username)")
        .order("user_id");
      
      if (error) throw error;
      return data as unknown as (UserClientAssignment & { user: { id: string; name: string; username: string } })[];
    },
  });
};

// Users with assigned clients (for colleague selector)
export const useUsersWithClients = () => {
  return useQuery({
    queryKey: ["users_with_clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_client_assignments")
        .select("user:app_users!user_client_assignments_user_id_fkey(id, name, username)")
        .order("user_id");
      
      if (error) throw error;
      
      // Get unique users
      const uniqueUsers = new Map<string, { id: string; name: string; username: string }>();
      (data as unknown as { user: { id: string; name: string; username: string } }[])?.forEach(item => {
        if (item.user && !uniqueUsers.has(item.user.id)) {
          uniqueUsers.set(item.user.id, item.user);
        }
      });
      
      return Array.from(uniqueUsers.values());
    },
  });
};

export const useAssignClientToUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, companyId, assignedBy }: { userId: string; companyId: string; assignedBy?: string }) => {
      const { data, error } = await supabase
        .from("user_client_assignments")
        .insert({
          user_id: userId,
          company_id: companyId,
          assigned_by: assignedBy,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_client_assignments"] });
      toast.success("Ügyfél hozzárendelve");
    },
    onError: (error) => {
      toast.error("Hiba történt: " + error.message);
    },
  });
};

export const useRemoveClientFromUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (assignmentId: string) => {
      const { error } = await supabase
        .from("user_client_assignments")
        .delete()
        .eq("id", assignmentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_client_assignments"] });
      toast.success("Ügyfél eltávolítva");
    },
    onError: (error) => {
      toast.error("Hiba történt: " + error.message);
    },
  });
};

export const useTransferClients = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ fromUserId, toUserId }: { fromUserId: string; toUserId: string }) => {
      const { error } = await supabase
        .from("user_client_assignments")
        .update({ user_id: toUserId })
        .eq("user_id", fromUserId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_client_assignments"] });
      toast.success("Ügyfelek átadva");
    },
    onError: (error) => {
      toast.error("Hiba történt: " + error.message);
    },
  });
};

// Activity Plans
export const useActivityPlans = (userId?: string, companyId?: string) => {
  return useQuery({
    queryKey: ["activity_plans", userId, companyId],
    queryFn: async () => {
      let query = supabase
        .from("activity_plans")
        .select("*, company:companies(*, country:countries(*))")
        .order("period_start", { ascending: false });
      
      if (userId) {
        query = query.eq("user_id", userId);
      }
      if (companyId) {
        query = query.eq("company_id", companyId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as ActivityPlan[];
    },
  });
};

export const useActivityPlan = (planId?: string) => {
  return useQuery({
    queryKey: ["activity_plan", planId],
    queryFn: async () => {
      if (!planId) return null;
      
      const { data, error } = await supabase
        .from("activity_plans")
        .select("*, company:companies(*, country:countries(*))")
        .eq("id", planId)
        .maybeSingle();
      if (error) throw error;
      return data as ActivityPlan | null;
    },
    enabled: !!planId,
  });
};

export const useCreateActivityPlan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (plan: {
      user_id: string;
      company_id: string;
      title: string;
      period_type: PeriodType;
      period_start: string;
      period_end: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from("activity_plans")
        .insert(plan)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activity_plans"] });
      toast.success("Activity Plan létrehozva");
    },
    onError: (error) => {
      toast.error("Hiba történt: " + error.message);
    },
  });
};

export const useUpdateActivityPlan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ActivityPlan> & { id: string }) => {
      const { data, error } = await supabase
        .from("activity_plans")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activity_plans"] });
      queryClient.invalidateQueries({ queryKey: ["activity_plan"] });
      toast.success("Activity Plan frissítve");
    },
    onError: (error) => {
      toast.error("Hiba történt: " + error.message);
    },
  });
};

// Activity Plan Events
export const useActivityPlanEvents = (planId?: string) => {
  return useQuery({
    queryKey: ["activity_plan_events", planId],
    queryFn: async () => {
      if (!planId) return [];
      
      const { data, error } = await supabase
        .from("activity_plan_events")
        .select("*")
        .eq("activity_plan_id", planId)
        .order("event_date", { ascending: true });
      if (error) throw error;
      return data as ActivityPlanEvent[];
    },
    enabled: !!planId,
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (event: {
      activity_plan_id: string;
      event_type: ActivityEventType;
      custom_type_name?: string;
      title: string;
      description?: string;
      event_date: string;
      event_time?: string;
      is_free?: boolean;
      price?: number;
      notes?: string;
      meeting_location?: string;
      meeting_type?: 'personal' | 'online';
    }) => {
      const { data, error } = await supabase
        .from("activity_plan_events")
        .insert(event)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activity_plan_events"] });
      toast.success("Esemény létrehozva");
    },
    onError: (error) => {
      toast.error("Hiba történt: " + error.message);
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ActivityPlanEvent> & { id: string }) => {
      // Handle status-related timestamp updates
      const updateData: Record<string, unknown> = { ...updates };
      if (updates.status === 'completed' && !updates.completed_at) {
        updateData.completed_at = new Date().toISOString();
      }
      if (updates.status === 'archived' && !updates.archived_at) {
        updateData.archived_at = new Date().toISOString();
      }
      
      const { data, error } = await supabase
        .from("activity_plan_events")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activity_plan_events"] });
      toast.success("Esemény frissítve");
    },
    onError: (error) => {
      toast.error("Hiba történt: " + error.message);
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase
        .from("activity_plan_events")
        .delete()
        .eq("id", eventId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activity_plan_events"] });
      toast.success("Esemény törölve");
    },
    onError: (error) => {
      toast.error("Hiba történt: " + error.message);
    },
  });
};
