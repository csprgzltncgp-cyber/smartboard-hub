import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Company,
  CountryDifferentiate,
  CompanyCountrySettings,
  BillingData,
  InvoicingData,
  InvoiceItem,
  InvoiceComment,
} from '@/types/company';

// Type for database company row
interface DbCompany {
  id: string;
  name: string;
  country_id: string;
  address: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  connected_company_id: string | null;
  lead_account_user_id: string | null;
  contract_holder_type: string | null;
  created_at: string;
  updated_at: string;
}

interface DbCompanyCountry {
  id: string;
  company_id: string;
  country_id: string;
}

interface DbCountryDifferentiate {
  id: string;
  company_id: string;
  contract_holder: boolean;
  org_id: boolean;
  contract_date: boolean;
  reporting: boolean;
  invoicing: boolean;
}

interface DbCountrySettings {
  id: string;
  company_id: string;
  country_id: string;
  contract_date: string | null;
  contract_end_date: string | null;
  org_id: string | null;
  reporting_data: any;
}

interface DbBillingData {
  id: string;
  company_id: string;
  country_id: string | null;
  billing_name: string | null;
  billing_address: string | null;
  billing_city: string | null;
  billing_postal_code: string | null;
  billing_country_id: string | null;
  tax_number: string | null;
  eu_tax_number: string | null;
  payment_deadline: number | null;
  billing_frequency: number | null;
  invoice_language: string | null;
  currency: string | null;
  vat_rate: number | null;
  send_invoice_by_post: boolean;
  send_invoice_by_email: boolean;
  upload_invoice_online: boolean;
  invoice_online_url: string | null;
  post_address: string | null;
  post_city: string | null;
  post_postal_code: string | null;
  post_country_id: string | null;
  contact_holder_name: string | null;
  show_contact_holder_name_on_post: boolean;
  custom_email_subject: string | null;
}

interface DbInvoiceItem {
  id: string;
  company_id: string;
  country_id: string | null;
  name: string;
  amount: number;
}

interface DbInvoiceComment {
  id: string;
  company_id: string;
  country_id: string | null;
  comment: string;
}

export interface CompanyWithDetails extends Company {
  countryDifferentiates: CountryDifferentiate;
  countrySettings: CompanyCountrySettings[];
  billingData: BillingData | null;
  invoicingData: InvoicingData | null;
  invoiceItems: InvoiceItem[];
  invoiceComments: InvoiceComment[];
}

// Map database billing frequency (1=monthly, 3=quarterly, 12=yearly) to string
const mapBillingFrequency = (freq: number | null): "monthly" | "quarterly" | "yearly" | null => {
  if (freq === 1) return "monthly";
  if (freq === 3) return "quarterly";
  if (freq === 12) return "yearly";
  return null;
};

const mapBillingFrequencyToDb = (freq: string | null): number => {
  if (freq === "monthly") return 1;
  if (freq === "quarterly") return 3;
  if (freq === "yearly") return 12;
  return 1;
};

export const useCompaniesDb = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [countries, setCountries] = useState<{ id: string; code: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch countries
  const fetchCountries = useCallback(async () => {
    const { data, error } = await supabase
      .from('countries')
      .select('id, code, name')
      .order('name');
    
    if (error) {
      console.error('[Companies] Failed to fetch countries:', error);
      return [];
    }
    
    setCountries(data || []);
    return data || [];
  }, []);

  // Fetch all companies with their country associations
  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch companies
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .order('name');
      
      if (companiesError) throw companiesError;

      // Fetch company-country associations
      const { data: companyCountriesData, error: ccError } = await supabase
        .from('company_countries')
        .select('company_id, country_id');
      
      if (ccError) throw ccError;

      // Build company objects with country_ids
      const companiesWithCountries: Company[] = (companiesData || []).map((c: DbCompany) => {
        const countryIds = (companyCountriesData || [])
          .filter((cc: DbCompanyCountry) => cc.company_id === c.id)
          .map((cc: DbCompanyCountry) => cc.country_id);
        
        return {
          id: c.id,
          name: c.name,
          active: true, // TODO: add active column to companies table
          country_ids: countryIds.length > 0 ? countryIds : [c.country_id],
          contract_holder_id: c.contract_holder_type === 'cgp' ? '2' : c.contract_holder_type === 'telus' ? '1' : null,
          org_id: null,
          contract_start: null,
          contract_end: null,
          contract_reminder_email: c.contact_email,
          lead_account_id: c.lead_account_user_id,
          contract_file_url: null,
          contract_price: null,
          contract_price_type: null,
          contract_currency: null,
          pillar_count: null,
          session_count: null,
          consultation_types: [],
          consultation_durations: [],
          consultation_formats: [],
          industry: null,
          is_connected: !!c.connected_company_id,
          connected_company_id: c.connected_company_id,
          created_at: c.created_at,
          updated_at: c.updated_at,
        };
      });

      setCompanies(companiesWithCountries);
      setError(null);
    } catch (e: any) {
      console.error('[Companies] Failed to fetch companies:', e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch single company with all details
  const getCompanyById = useCallback(async (id: string): Promise<CompanyWithDetails | null> => {
    try {
      // Fetch company
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (companyError) throw companyError;
      if (!companyData) return null;

      // Fetch country associations
      const { data: countryAssocs } = await supabase
        .from('company_countries')
        .select('country_id')
        .eq('company_id', id);

      // Fetch country differentiates
      const { data: diffData } = await supabase
        .from('company_country_differentiates')
        .select('*')
        .eq('company_id', id)
        .maybeSingle();

      // Fetch country settings
      const { data: settingsData } = await supabase
        .from('company_country_settings')
        .select('*')
        .eq('company_id', id);

      // Fetch billing data (global - where country_id is null)
      const { data: billingData } = await supabase
        .from('company_billing_data')
        .select('*')
        .eq('company_id', id)
        .is('country_id', null)
        .maybeSingle();

      // Fetch billing emails if billing data exists
      let billingEmails: string[] = [];
      if (billingData) {
        const { data: emailsData } = await supabase
          .from('company_billing_emails')
          .select('email')
          .eq('billing_data_id', billingData.id);
        billingEmails = (emailsData || []).map((e: { email: string }) => e.email);
      }

      // Fetch invoice items (global)
      const { data: itemsData } = await supabase
        .from('company_invoice_items')
        .select('*')
        .eq('company_id', id)
        .is('country_id', null);

      // Fetch invoice comments (global)
      const { data: commentsData } = await supabase
        .from('company_invoice_comments')
        .select('*')
        .eq('company_id', id)
        .is('country_id', null);

      const countryIds = (countryAssocs || []).map((ca: { country_id: string }) => ca.country_id);

      const company: CompanyWithDetails = {
        id: companyData.id,
        name: companyData.name,
        active: true,
        country_ids: countryIds.length > 0 ? countryIds : [companyData.country_id],
        contract_holder_id: companyData.contract_holder_type === 'cgp' ? '2' : companyData.contract_holder_type === 'telus' ? '1' : null,
        org_id: null,
        contract_start: null,
        contract_end: null,
        contract_reminder_email: companyData.contact_email,
        lead_account_id: companyData.lead_account_user_id,
        contract_file_url: null,
        contract_price: null,
        contract_price_type: null,
        contract_currency: null,
        pillar_count: null,
        session_count: null,
        consultation_types: [],
        consultation_durations: [],
        consultation_formats: [],
        industry: null,
        is_connected: !!companyData.connected_company_id,
        connected_company_id: companyData.connected_company_id,
        created_at: companyData.created_at,
        updated_at: companyData.updated_at,
        countryDifferentiates: diffData ? {
          contract_holder: diffData.contract_holder,
          org_id: diffData.org_id,
          contract_date: diffData.contract_date,
          reporting: diffData.reporting,
          invoicing: diffData.invoicing,
          contract_date_reminder_email: false,
        } : {
          contract_holder: false,
          org_id: false,
          contract_date: false,
          reporting: false,
          invoicing: false,
          contract_date_reminder_email: false,
        },
        countrySettings: (settingsData || []).map((s: DbCountrySettings) => ({
          id: s.id,
          company_id: s.company_id,
          country_id: s.country_id,
          contract_holder_id: null,
          org_id: s.org_id,
          contract_start: s.contract_date,
          contract_end: s.contract_end_date,
          contract_reminder_email: null,
          head_count: null,
          activity_plan_user_id: null,
          client_username: null,
          client_password_set: false,
          client_language_id: null,
          all_country_access: false,
        })),
        billingData: billingData ? {
          id: billingData.id,
          company_id: billingData.company_id,
          country_id: billingData.country_id,
          admin_identifier: null,
          name: billingData.billing_name,
          is_name_shown: true,
          country: null,
          postal_code: billingData.billing_postal_code,
          city: billingData.billing_city,
          street: billingData.billing_address,
          house_number: null,
          is_address_shown: true,
          po_number: null,
          is_po_number_shown: false,
          is_po_number_changing: false,
          is_po_number_required: false,
          tax_number: billingData.tax_number,
          community_tax_number: billingData.eu_tax_number,
          is_tax_number_shown: true,
          group_id: null,
          payment_deadline: billingData.payment_deadline,
          is_payment_deadline_shown: true,
          invoicing_inactive: false,
          invoicing_inactive_from: null,
          invoicing_inactive_to: null,
        } : null,
        invoicingData: billingData ? {
          id: billingData.id,
          company_id: billingData.company_id,
          country_id: billingData.country_id,
          billing_frequency: mapBillingFrequency(billingData.billing_frequency),
          invoice_language: billingData.invoice_language,
          currency: billingData.currency?.toLowerCase() || null,
          vat_rate: billingData.vat_rate,
          inside_eu: true,
          outside_eu: false,
          send_invoice_by_post: billingData.send_invoice_by_post,
          send_completion_certificate_by_post: false,
          post_code: billingData.post_postal_code,
          city: billingData.post_city,
          street: billingData.post_address,
          house_number: null,
          send_invoice_by_email: billingData.send_invoice_by_email,
          send_completion_certificate_by_email: false,
          custom_email_subject: billingData.custom_email_subject,
          invoice_emails: billingEmails,
          upload_invoice_online: billingData.upload_invoice_online,
          invoice_online_url: billingData.invoice_online_url,
          upload_completion_certificate_online: false,
          completion_certificate_online_url: null,
          contact_holder_name: billingData.contact_holder_name,
          show_contact_holder_name_on_post: billingData.show_contact_holder_name_on_post,
        } : null,
        invoiceItems: (itemsData || []).map((item: DbInvoiceItem) => ({
          id: item.id,
          invoicing_data_id: billingData?.id || '',
          item_name: item.name,
          item_type: 'amount' as const,
          amount_name: null,
          amount_value: String(item.amount),
          volume_name: null,
          volume_value: null,
          is_amount_changing: false,
          is_volume_changing: false,
          show_by_item: true,
          show_activity_id: false,
          with_timestamp: false,
          comment: null,
          data_request_email: null,
          data_request_salutation: null,
        })),
        invoiceComments: (commentsData || []).map((c: DbInvoiceComment) => ({
          id: c.id,
          invoicing_data_id: billingData?.id || '',
          comment: c.comment,
        })),
      };

      return company;
    } catch (e: any) {
      console.error('[Companies] Failed to get company by id:', e);
      return null;
    }
  }, []);

  // Create a new company
  const createCompany = useCallback(async (data: {
    name: string;
    countryIds: string[];
    contractHolderType?: 'telus' | 'cgp' | null;
    connectedCompanyId?: string | null;
    leadAccountUserId?: string | null;
  }): Promise<Company | null> => {
    try {
      // Insert company (use first country as primary)
      const { data: newCompany, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: data.name,
          country_id: data.countryIds[0],
          contract_holder_type: data.contractHolderType || null,
          connected_company_id: data.connectedCompanyId || null,
          lead_account_user_id: data.leadAccountUserId || null,
        })
        .select()
        .single();
      
      if (companyError) throw companyError;

      // Insert company-country associations
      if (data.countryIds.length > 0) {
        const countryAssocs = data.countryIds.map(countryId => ({
          company_id: newCompany.id,
          country_id: countryId,
        }));
        
        const { error: ccError } = await supabase
          .from('company_countries')
          .insert(countryAssocs);
        
        if (ccError) console.error('[Companies] Failed to insert country associations:', ccError);
      }

      // Insert default country differentiates
      await supabase
        .from('company_country_differentiates')
        .insert({
          company_id: newCompany.id,
          contract_holder: false,
          org_id: false,
          contract_date: false,
          reporting: false,
          invoicing: false,
        });

      const company: Company = {
        id: newCompany.id,
        name: newCompany.name,
        active: true,
        country_ids: data.countryIds,
        contract_holder_id: data.contractHolderType === 'cgp' ? '2' : data.contractHolderType === 'telus' ? '1' : null,
        org_id: null,
        contract_start: null,
        contract_end: null,
        contract_reminder_email: null,
        lead_account_id: data.leadAccountUserId || null,
        contract_file_url: null,
        contract_price: null,
        contract_price_type: null,
        contract_currency: null,
        pillar_count: null,
        session_count: null,
        consultation_types: [],
        consultation_durations: [],
        consultation_formats: [],
        industry: null,
        is_connected: !!data.connectedCompanyId,
        connected_company_id: data.connectedCompanyId || null,
        created_at: newCompany.created_at,
        updated_at: newCompany.updated_at,
      };

      setCompanies(prev => [...prev, company]);
      return company;
    } catch (e: any) {
      console.error('[Companies] Failed to create company:', e);
      return null;
    }
  }, []);

  // Update company
  const updateCompany = useCallback(async (
    id: string,
    data: Partial<{
      name: string;
      countryIds: string[];
      contractHolderType: 'telus' | 'cgp' | null;
      connectedCompanyId: string | null;
      leadAccountUserId: string | null;
      countryDifferentiates: CountryDifferentiate;
      billingData: Partial<BillingData>;
      invoicingData: Partial<InvoicingData>;
      invoiceItems: InvoiceItem[];
      invoiceComments: InvoiceComment[];
    }>
  ): Promise<boolean> => {
    try {
      // Update company basic data
      const updateData: any = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.contractHolderType !== undefined) updateData.contract_holder_type = data.contractHolderType;
      if (data.connectedCompanyId !== undefined) updateData.connected_company_id = data.connectedCompanyId;
      if (data.leadAccountUserId !== undefined) updateData.lead_account_user_id = data.leadAccountUserId;
      if (data.countryIds && data.countryIds.length > 0) updateData.country_id = data.countryIds[0];

      if (Object.keys(updateData).length > 0) {
        const { error } = await supabase
          .from('companies')
          .update(updateData)
          .eq('id', id);
        
        if (error) throw error;
      }

      // Update country associations
      if (data.countryIds) {
        // Delete existing associations
        await supabase
          .from('company_countries')
          .delete()
          .eq('company_id', id);
        
        // Insert new associations
        const countryAssocs = data.countryIds.map(countryId => ({
          company_id: id,
          country_id: countryId,
        }));
        
        await supabase
          .from('company_countries')
          .insert(countryAssocs);
      }

      // Update country differentiates
      if (data.countryDifferentiates) {
        await supabase
          .from('company_country_differentiates')
          .upsert({
            company_id: id,
            contract_holder: data.countryDifferentiates.contract_holder,
            org_id: data.countryDifferentiates.org_id,
            contract_date: data.countryDifferentiates.contract_date,
            reporting: data.countryDifferentiates.reporting,
            invoicing: data.countryDifferentiates.invoicing,
          }, { onConflict: 'company_id' });
      }

      // Update billing data - always create/update if either billingData or invoicingData exists (even empty objects trigger this)
      if (data.billingData !== undefined || data.invoicingData !== undefined) {
        const billingUpsert: any = {
          company_id: id,
          country_id: null,
        };
        
        if (data.billingData) {
          billingUpsert.billing_name = data.billingData.name;
          billingUpsert.billing_address = data.billingData.street;
          billingUpsert.billing_city = data.billingData.city;
          billingUpsert.billing_postal_code = data.billingData.postal_code;
          billingUpsert.tax_number = data.billingData.tax_number;
          billingUpsert.eu_tax_number = data.billingData.community_tax_number;
          billingUpsert.payment_deadline = data.billingData.payment_deadline;
        }
        
        if (data.invoicingData) {
          billingUpsert.billing_frequency = mapBillingFrequencyToDb(data.invoicingData.billing_frequency || null);
          billingUpsert.invoice_language = data.invoicingData.invoice_language;
          billingUpsert.currency = data.invoicingData.currency?.toUpperCase();
          billingUpsert.vat_rate = data.invoicingData.vat_rate;
          billingUpsert.send_invoice_by_post = data.invoicingData.send_invoice_by_post;
          billingUpsert.send_invoice_by_email = data.invoicingData.send_invoice_by_email;
          billingUpsert.upload_invoice_online = data.invoicingData.upload_invoice_online;
          billingUpsert.invoice_online_url = data.invoicingData.invoice_online_url;
          billingUpsert.post_address = data.invoicingData.street;
          billingUpsert.post_city = data.invoicingData.city;
          billingUpsert.post_postal_code = data.invoicingData.post_code;
          billingUpsert.contact_holder_name = data.invoicingData.contact_holder_name;
          billingUpsert.show_contact_holder_name_on_post = data.invoicingData.show_contact_holder_name_on_post;
          billingUpsert.custom_email_subject = data.invoicingData.custom_email_subject;
        }

        // Check if billing data exists
        const { data: existing } = await supabase
          .from('company_billing_data')
          .select('id')
          .eq('company_id', id)
          .is('country_id', null)
          .maybeSingle();

        if (existing) {
          await supabase
            .from('company_billing_data')
            .update(billingUpsert)
            .eq('id', existing.id);
        } else {
          await supabase
            .from('company_billing_data')
            .insert(billingUpsert);
        }
      }

      // Update invoice items (global - where country_id is null)
      if (data.invoiceItems !== undefined) {
        // Delete existing items (global)
        await supabase
          .from('company_invoice_items')
          .delete()
          .eq('company_id', id)
          .is('country_id', null);
        
        // Insert new items
        if (data.invoiceItems.length > 0) {
          const itemsToInsert = data.invoiceItems.map(item => ({
            company_id: id,
            country_id: null,
            name: item.item_name,
            amount: parseFloat(item.amount_value || '0') || 0,
          }));
          
          const { error: itemsError } = await supabase
            .from('company_invoice_items')
            .insert(itemsToInsert);
          
          if (itemsError) {
            console.error('[Companies] Failed to insert invoice items:', itemsError);
          }
        }
      }

      // Update invoice comments (global - where country_id is null)
      if (data.invoiceComments !== undefined) {
        // Delete existing comments (global)
        await supabase
          .from('company_invoice_comments')
          .delete()
          .eq('company_id', id)
          .is('country_id', null);
        
        // Insert new comments
        if (data.invoiceComments.length > 0) {
          const commentsToInsert = data.invoiceComments.map(comment => ({
            company_id: id,
            country_id: null,
            comment: comment.comment,
          }));
          
          const { error: commentsError } = await supabase
            .from('company_invoice_comments')
            .insert(commentsToInsert);
          
          if (commentsError) {
            console.error('[Companies] Failed to insert invoice comments:', commentsError);
          }
        }
      }

      await fetchCompanies();
      return true;
    } catch (e: any) {
      console.error('[Companies] Failed to update company:', e);
      return false;
    }
  }, [fetchCompanies]);

  // Delete company
  const deleteCompany = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setCompanies(prev => prev.filter(c => c.id !== id));
      return true;
    } catch (e: any) {
      console.error('[Companies] Failed to delete company:', e);
      return false;
    }
  }, []);

  // Initialize
  useEffect(() => {
    const init = async () => {
      await fetchCountries();
      await fetchCompanies();
    };
    init();
  }, [fetchCountries, fetchCompanies]);

  return {
    companies,
    countries,
    loading,
    error,
    fetchCompanies,
    fetchCountries,
    getCompanyById,
    createCompany,
    updateCompany,
    deleteCompany,
  };
};
