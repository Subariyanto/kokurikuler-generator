-- Schema for Perencanaan Kokurikuler Madrasah Generator
-- Run this in Supabase SQL Editor

-- 1. profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_lengkap TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Admin', 'Koordinator Kokurikuler')),
  nama_madrasah TEXT,
  nomor_hp TEXT,
  email TEXT,
  status_user TEXT DEFAULT 'Aktif',
  kode_aktivasi TEXT,
  tanggal_aktivasi TIMESTAMPTZ,
  terakhir_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. activation_codes
CREATE TABLE IF NOT EXISTS activation_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kode TEXT UNIQUE NOT NULL,
  nama_paket TEXT,
  role_tujuan TEXT NOT NULL,
  nama_madrasah_tujuan TEXT,
  status TEXT DEFAULT 'Aktif',
  tanggal_mulai DATE,
  tanggal_kedaluwarsa DATE,
  jenis_penggunaan TEXT DEFAULT 'Sekali Pakai',
  batas_maksimal_penggunaan INTEGER DEFAULT 1,
  jumlah_terpakai INTEGER DEFAULT 0,
  dibuat_oleh UUID REFERENCES profiles(id),
  catatan TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. activation_code_usage
CREATE TABLE IF NOT EXISTS activation_code_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activation_code_id UUID REFERENCES activation_codes(id),
  kode TEXT,
  user_id UUID REFERENCES profiles(id),
  nama_lengkap TEXT,
  role TEXT,
  nama_madrasah TEXT,
  perangkat TEXT,
  user_agent TEXT,
  tanggal_penggunaan TIMESTAMPTZ DEFAULT now()
);

-- 4. madrasah
CREATE TABLE IF NOT EXISTS madrasah (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_madrasah TEXT NOT NULL,
  nsm TEXT,
  npsn TEXT,
  jenjang TEXT,
  alamat TEXT,
  kecamatan TEXT,
  kabupaten_kota TEXT,
  provinsi TEXT,
  kepala_madrasah TEXT,
  nip_kepala TEXT,
  tahun_pelajaran TEXT,
  semester TEXT,
  logo_url TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. guru
CREATE TABLE IF NOT EXISTS guru (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_guru TEXT NOT NULL,
  nip_nuptk TEXT,
  jabatan TEXT,
  mata_pelajaran_muatan TEXT,
  kelas_diampu TEXT,
  nomor_hp TEXT,
  email TEXT,
  madrasah_id UUID REFERENCES madrasah(id) ON DELETE SET NULL,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. murid
CREATE TABLE IF NOT EXISTS murid (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_murid TEXT NOT NULL,
  nis_nisn TEXT,
  kelas TEXT,
  fase TEXT,
  jenjang TEXT,
  jenis_kelamin TEXT,
  nama_orang_tua TEXT,
  nomor_hp_orang_tua TEXT,
  madrasah_id UUID REFERENCES madrasah(id) ON DELETE SET NULL,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. tim_kokurikuler
CREATE TABLE IF NOT EXISTS tim_kokurikuler (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tahun_pelajaran TEXT,
  nama_kepala_madrasah TEXT,
  koordinator_kokurikuler TEXT,
  guru_fasilitator JSONB,
  tenaga_kependidikan JSONB,
  warga_madrasah_lainnya JSONB,
  mitra_eksternal JSONB,
  madrasah_id UUID REFERENCES madrasah(id) ON DELETE SET NULL,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. analisis_madrasah
CREATE TABLE IF NOT EXISTS analisis_madrasah (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  madrasah_id UUID REFERENCES madrasah(id) ON DELETE SET NULL,
  kesesuaian_kurikulum TEXT,
  minat_bakat_murid TEXT,
  capaian_belum_optimal TEXT,
  dimensi_perlu_diperkuat JSONB,
  panca_cinta_perlu_diperkuat JSONB,
  sumber_daya_fisik JSONB,
  sumber_daya_manusia JSONB,
  sumber_daya_finansial JSONB,
  sumber_daya_lingkungan JSONB,
  kondisi_sosial_budaya TEXT,
  masalah_aktual TEXT,
  potensi_lokal TEXT,
  alasan_pemilihan_kegiatan TEXT,
  narasi_otomatis TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. perencanaan_kokurikuler
CREATE TABLE IF NOT EXISTS perencanaan_kokurikuler (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  madrasah_id UUID REFERENCES madrasah(id) ON DELETE SET NULL,
  nama_kegiatan TEXT NOT NULL,
  jenjang TEXT,
  kelas_fase TEXT,
  semester TEXT,
  tahun_pelajaran TEXT,
  tema_kegiatan TEXT,
  subtema TEXT,
  jenis_kokurikuler TEXT,
  alokasi_waktu TEXT,
  lokasi_kegiatan TEXT,
  guru_koordinator TEXT,
  mata_pelajaran_muatan TEXT,
  jumlah_murid INTEGER,
  produk_hasil TEXT,
  dimensi_profil_lulusan JSONB,
  topik_panca_cinta JSONB,
  materi_integrasi_kbc JSONB,
  analisis_kebutuhan TEXT,
  tujuan_pembelajaran JSONB,
  praktik_pedagogis JSONB,
  lingkungan_pembelajaran JSONB,
  teknologi_digital JSONB,
  kemitraan_pembelajaran JSONB,
  alur_kegiatan JSONB,
  asesmen JSONB,
  rubrik JSONB,
  lembar_observasi JSONB,
  jurnal_pelaksanaan JSONB,
  pelaporan_hasil JSONB,
  evaluasi_tindak_lanjut JSONB,
  status_dokumen TEXT DEFAULT 'Draft',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 10. catatan_pengawas
CREATE TABLE IF NOT EXISTS catatan_pengawas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  perencanaan_id UUID REFERENCES perencanaan_kokurikuler(id) ON DELETE CASCADE,
  pengawas_id UUID REFERENCES profiles(id),
  catatan TEXT,
  rekomendasi TEXT,
  status_tindak_lanjut TEXT DEFAULT 'Belum Ditindaklanjuti',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 11. activity_logs
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  aktivitas TEXT,
  detail TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activation_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE activation_code_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE madrasah ENABLE ROW LEVEL SECURITY;
ALTER TABLE guru ENABLE ROW LEVEL SECURITY;
ALTER TABLE murid ENABLE ROW LEVEL SECURITY;
ALTER TABLE tim_kokurikuler ENABLE ROW LEVEL SECURITY;
ALTER TABLE analisis_madrasah ENABLE ROW LEVEL SECURITY;
ALTER TABLE perencanaan_kokurikuler ENABLE ROW LEVEL SECURITY;
ALTER TABLE catatan_pengawas ENABLE ROW LEVEL SECURITY;

-- Allow anon access for all operations (since app uses client-side auth)
-- In production, tighten these policies
CREATE POLICY "Allow all on profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on activation_codes" ON activation_codes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on activation_code_usage" ON activation_code_usage FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on madrasah" ON madrasah FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on guru" ON guru FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on murid" ON murid FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on tim_kokurikuler" ON tim_kokurikuler FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on analisis_madrasah" ON analisis_madrasah FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on perencanaan_kokurikuler" ON perencanaan_kokurikuler FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on catatan_pengawas" ON catatan_pengawas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on activity_logs" ON activity_logs FOR ALL USING (true) WITH CHECK (true);