
-- Add admin INSERT/UPDATE/DELETE policy on user_roles
CREATE POLICY "Admins can manage roles" ON public.user_roles 
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Allow profiles to be read by admin (for admin panel)
CREATE POLICY "Admins can view all profiles" ON public.profiles 
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update any profile (for premium toggle)
CREATE POLICY "Admins can update all profiles" ON public.profiles 
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
