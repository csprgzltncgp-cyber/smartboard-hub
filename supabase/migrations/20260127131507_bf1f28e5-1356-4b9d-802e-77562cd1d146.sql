-- Create custom_invoice_items table for extra expert compensation
CREATE TABLE public.custom_invoice_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  expert_id UUID NOT NULL REFERENCES public.experts(id) ON DELETE CASCADE,
  country_id UUID NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.custom_invoice_items ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (admin app, no auth)
CREATE POLICY "Allow all operations on custom_invoice_items"
ON public.custom_invoice_items
FOR ALL
USING (true)
WITH CHECK (true);

-- Add updated_at trigger
CREATE TRIGGER update_custom_invoice_items_updated_at
BEFORE UPDATE ON public.custom_invoice_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();