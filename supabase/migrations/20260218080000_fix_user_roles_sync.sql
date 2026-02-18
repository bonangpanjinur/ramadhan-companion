-- 1. Perbaiki fungsi handle_new_user agar otomatis memberikan role 'user'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Insert ke profiles
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  
  -- Insert ke ramadhan_settings
  INSERT INTO public.ramadhan_settings (user_id) VALUES (NEW.id);
  
  -- Insert ke user_roles (Default role: 'user')
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- 2. Sinkronisasi user yang sudah ada namun belum memiliki role di user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'user'::public.app_role
FROM public.profiles
WHERE id NOT IN (SELECT user_id FROM public.user_roles)
ON CONFLICT (user_id, role) DO NOTHING;
