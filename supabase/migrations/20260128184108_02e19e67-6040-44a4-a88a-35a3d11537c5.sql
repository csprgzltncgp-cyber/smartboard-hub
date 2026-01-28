-- Create company_invoice_templates table (DirectInvoiceData megfelelője)
-- Egy cégnek több számlázási sablonja lehet
CREATE TABLE public.company_invoice_templates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    country_id UUID REFERENCES public.countries(id),
    admin_identifier TEXT,
    name TEXT NOT NULL DEFAULT 'Új számla sablon',
    is_name_shown BOOLEAN DEFAULT true,
    country TEXT,
    postal_code TEXT,
    city TEXT,
    street TEXT,
    house_number TEXT,
    is_address_shown BOOLEAN DEFAULT true,
    po_number TEXT,
    is_po_number_shown BOOLEAN DEFAULT true,
    is_po_number_changing BOOLEAN DEFAULT false,
    is_po_number_required BOOLEAN DEFAULT true,
    tax_number TEXT,
    community_tax_number TEXT,
    is_tax_number_shown BOOLEAN DEFAULT true,
    group_id TEXT,
    payment_deadline INTEGER DEFAULT 30,
    is_payment_deadline_shown BOOLEAN DEFAULT true,
    invoicing_inactive BOOLEAN DEFAULT false,
    invoicing_inactive_from DATE,
    invoicing_inactive_to DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.company_invoice_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Allow all operations on company_invoice_templates"
ON public.company_invoice_templates FOR ALL
USING (true)
WITH CHECK (true);

-- Add trigger for updated_at
CREATE TRIGGER update_company_invoice_templates_updated_at
BEFORE UPDATE ON public.company_invoice_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add template_id column to company_invoice_items
ALTER TABLE public.company_invoice_items 
ADD COLUMN template_id UUID REFERENCES public.company_invoice_templates(id) ON DELETE CASCADE;

-- Add template_id column to company_invoice_comments
ALTER TABLE public.company_invoice_comments 
ADD COLUMN template_id UUID REFERENCES public.company_invoice_templates(id) ON DELETE CASCADE;

-- Create index for faster lookups
CREATE INDEX idx_company_invoice_templates_company_country ON public.company_invoice_templates(company_id, country_id);
CREATE INDEX idx_company_invoice_items_template ON public.company_invoice_items(template_id);
CREATE INDEX idx_company_invoice_comments_template ON public.company_invoice_comments(template_id);