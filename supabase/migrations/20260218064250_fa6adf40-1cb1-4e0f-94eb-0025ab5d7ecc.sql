
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===========================
-- ENUMS
-- ===========================
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.premium_status AS ENUM ('free', 'premium');
CREATE TYPE public.code_status AS ENUM ('available', 'used');

-- ===========================
-- PROFILES
-- ===========================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  ramadhan_day INTEGER DEFAULT 1,
  quran_target INTEGER DEFAULT 1,
  sedekah_target BIGINT DEFAULT 100000,
  premium_status premium_status DEFAULT 'free',
  premium_activated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ===========================
-- USER ROLES
-- ===========================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (true);

-- Security definer function for role check
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- ===========================
-- APP CONFIG
-- ===========================
CREATE TABLE public.app_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read app_config" ON public.app_config FOR SELECT USING (true);
CREATE POLICY "Admins can manage app_config" ON public.app_config FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- ===========================
-- DAILY IBADAH
-- ===========================
CREATE TABLE public.daily_ibadah (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tanggal DATE NOT NULL,
  subuh BOOLEAN DEFAULT false,
  dzuhur BOOLEAN DEFAULT false,
  ashar BOOLEAN DEFAULT false,
  maghrib BOOLEAN DEFAULT false,
  isya BOOLEAN DEFAULT false,
  tahajud BOOLEAN DEFAULT false,
  dhuha BOOLEAN DEFAULT false,
  rawatib BOOLEAN DEFAULT false,
  witir BOOLEAN DEFAULT false,
  tadarus BOOLEAN DEFAULT false,
  sahur BOOLEAN DEFAULT false,
  buka_tepat_waktu BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, tanggal)
);

ALTER TABLE public.daily_ibadah ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own ibadah" ON public.daily_ibadah FOR ALL USING (auth.uid() = user_id);

-- ===========================
-- QURAN PROGRESS
-- ===========================
CREATE TABLE public.quran_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tanggal DATE NOT NULL,
  halaman_dibaca INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, tanggal)
);

ALTER TABLE public.quran_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own quran" ON public.quran_progress FOR ALL USING (auth.uid() = user_id);

CREATE TABLE public.juz_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  juz_number INTEGER NOT NULL CHECK (juz_number BETWEEN 1 AND 30),
  status TEXT DEFAULT 'belum' CHECK (status IN ('belum', 'proses', 'selesai')),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, juz_number)
);

ALTER TABLE public.juz_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own juz" ON public.juz_progress FOR ALL USING (auth.uid() = user_id);

-- ===========================
-- SEDEKAH LOG
-- ===========================
CREATE TABLE public.sedekah_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nominal BIGINT NOT NULL,
  catatan TEXT,
  tanggal DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.sedekah_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own sedekah" ON public.sedekah_log FOR ALL USING (auth.uid() = user_id);

-- ===========================
-- HEALTH TRACKER
-- ===========================
CREATE TABLE public.health_tracker (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tanggal DATE NOT NULL,
  gelas_air INTEGER DEFAULT 0 CHECK (gelas_air BETWEEN 0 AND 8),
  makan_buah BOOLEAN DEFAULT false,
  olahraga BOOLEAN DEFAULT false,
  jam_tidur NUMERIC(4,1) DEFAULT 7,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, tanggal)
);

ALTER TABLE public.health_tracker ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own health" ON public.health_tracker FOR ALL USING (auth.uid() = user_id);

-- ===========================
-- ACTIVATION CODES
-- ===========================
CREATE TABLE public.activation_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  status code_status DEFAULT 'available',
  used_by UUID REFERENCES auth.users(id),
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.activation_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage codes" ON public.activation_codes FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can read available codes" ON public.activation_codes FOR SELECT USING (true);

-- ===========================
-- DOA COLLECTION
-- ===========================
CREATE TABLE public.doa_collection (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  judul TEXT NOT NULL,
  arab TEXT NOT NULL,
  latin TEXT NOT NULL,
  terjemahan TEXT NOT NULL,
  kategori TEXT DEFAULT 'umum',
  urutan INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.doa_collection ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read doa" ON public.doa_collection FOR SELECT USING (true);
CREATE POLICY "Admins can manage doa" ON public.doa_collection FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.doa_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doa_id UUID NOT NULL REFERENCES public.doa_collection(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, doa_id)
);

ALTER TABLE public.doa_bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own bookmarks" ON public.doa_bookmarks FOR ALL USING (auth.uid() = user_id);

-- ===========================
-- RAMADHAN SETTINGS (per user)
-- ===========================
CREATE TABLE public.ramadhan_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  onboarding_done BOOLEAN DEFAULT false,
  timezone TEXT DEFAULT 'Asia/Jakarta',
  city TEXT DEFAULT 'Jakarta',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.ramadhan_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own settings" ON public.ramadhan_settings FOR ALL USING (auth.uid() = user_id);

-- ===========================
-- TRIGGER: auto-create profile
-- ===========================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  INSERT INTO public.ramadhan_settings (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===========================
-- UPDATE TIMESTAMP TRIGGER
-- ===========================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql
AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_ibadah_updated_at BEFORE UPDATE ON public.daily_ibadah FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_health_updated_at BEFORE UPDATE ON public.health_tracker FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ===========================
-- SEED APP CONFIG
-- ===========================
INSERT INTO public.app_config (key, value, description) VALUES
('premium_price', '25000', 'Harga premium dalam Rupiah'),
('premium_tagline', 'Maksimalkan ibadah Ramadhan-mu', 'Tagline halaman upgrade'),
('saweria_link', 'https://saweria.co/ramadhantracker', 'Link Saweria'),
('trakteer_link', 'https://trakteer.id/ramadhantracker', 'Link Trakteer'),
('app_name', 'Ramadhan Tracker', 'Nama aplikasi'),
('ramadhan_year', '1446', 'Tahun Ramadhan Hijriah'),
('premium_feature_1', 'Tasbih Digital dengan 100+ dzikir', 'Fitur premium 1'),
('premium_feature_2', 'Koleksi Doa Ramadhan lengkap', 'Fitur premium 2'),
('premium_feature_3', 'Grafik & statistik ibadah mingguan', 'Fitur premium 3'),
('premium_feature_4', 'Export laporan PDF ibadah', 'Fitur premium 4'),
('premium_feature_5', 'Reminder waktu sholat personal', 'Fitur premium 5');

-- ===========================
-- SEED DOA COLLECTION
-- ===========================
INSERT INTO public.doa_collection (judul, arab, latin, terjemahan, kategori, urutan) VALUES
('Doa Berbuka Puasa', 'اللَّهُمَّ لَكَ صُمْتُ وَبِكَ آمَنْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ', 'Allahumma laka shumtu wa bika aamantu wa ''ala rizqika afthartu', 'Ya Allah, untuk-Mu aku berpuasa, kepada-Mu aku beriman, dan dengan rezeki-Mu aku berbuka.', 'puasa', 1),
('Doa Sahur', 'وَبِصَوْمِ غَدٍ نَّوَيْتُ مِنْ شَهْرِ رَمَضَانَ', 'Wa bisawmi ghadin nawaitu min shahri ramadhan', 'Saya niat berpuasa esok hari di bulan Ramadhan.', 'puasa', 2),
('Doa Malam Lailatul Qadar', 'اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّى', 'Allahumma innaka ''afuwwun tuhibbul ''afwa fa''fu ''anni', 'Ya Allah, sesungguhnya Engkau Maha Pemaaf, Engkau menyukai maaf, maka maafkanlah aku.', 'malam', 3),
('Doa Setelah Sholat Tarawih', 'اللَّهُمَّ إِنِّي أَسْأَلُكَ رَحْمَتَكَ', 'Allahumma inni as''aluka rahmataka', 'Ya Allah, sesungguhnya aku memohon rahmat-Mu.', 'sholat', 4),
('Doa Khatam Al-Quran', 'اللَّهُمَّ ارْحَمْنِي بِالْقُرْآنِ', 'Allahummarhamniy bil quran', 'Ya Allah, rahmatilah aku dengan Al-Quran.', 'quran', 5),
('Doa Sebelum Tidur', 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا', 'Bismika Allahumma amutu wa ahya', 'Dengan nama-Mu ya Allah, aku mati dan aku hidup.', 'harian', 6),
('Doa Bangun Tidur', 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ', 'Alhamdu lillahil ladzii ahyaana ba''da maa amaatanaa wa ilaihin nusyur', 'Segala puji bagi Allah yang telah menghidupkan kami setelah mematikan kami, dan kepada-Nya kami kembali.', 'harian', 7),
('Doa Memohon Ampunan', 'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ', 'Astaghfirullahal ''adziimal ladzii laa ilaaha illaa huwal hayyul qayyuumu wa atuubu ilaih', 'Aku memohon ampunan kepada Allah Yang Maha Agung, yang tiada Tuhan selain Dia, Yang Maha Hidup lagi Maha Berdiri sendiri, dan aku bertaubat kepada-Nya.', 'dzikir', 8),
('Doa Pagi (Dzikir Pagi)', 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ', 'Ashbahnaa wa ashbahal mulku lillah', 'Kami berpagi hari dan kerajaan milik Allah.', 'dzikir', 9),
('Doa Sore (Dzikir Sore)', 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ', 'Amsaynaa wa amsal mulku lillah', 'Kami bersore hari dan kerajaan milik Allah.', 'dzikir', 10);
