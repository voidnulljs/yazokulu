-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Drop existing tables if any (cascade to remove relations)
drop table if exists public.yedek_listesi cascade;
drop table if exists public.notlar cascade;
drop table if exists public.islemler cascade;
drop table if exists public.bakiyeler cascade;
drop table if exists public.ders_kayitlari cascade;
drop table if exists public.ders_talepleri cascade;
drop table if exists public.dersler cascade;
drop table if exists public.ogretmenler cascade;
drop table if exists public.ogrenciler cascade;

-- Create tables
create table public.ogrenciler (
  id uuid references auth.users not null primary key,
  ad_soyad text not null,
  ogrenci_no text unique,
  created_at timestamptz default now()
);

create table public.ogretmenler (
  id uuid references auth.users not null primary key,
  ad_soyad text not null,
  unvan text,
  created_at timestamptz default now()
);

create table public.dersler (
  id uuid default uuid_generate_v4() primary key,
  ad text not null,
  kod text not null,
  kontenjan int default 0,
  fiyat decimal(10,2) default 0,
  min_talep int default 0,
  durum text check (durum in ('taslak', 'acik', 'iptal')) default 'taslak',
  ogretmen_id uuid references public.ogretmenler(id),
  created_at timestamptz default now()
);

create table public.ders_talepleri (
  id uuid default uuid_generate_v4() primary key,
  ders_id uuid references public.dersler(id) on delete cascade,
  ogrenci_id uuid references public.ogrenciler(id) on delete cascade,
  tarih timestamptz default now(),
  unique(ders_id, ogrenci_id)
);

create table public.ders_kayitlari (
  id uuid default uuid_generate_v4() primary key,
  ders_id uuid references public.dersler(id) on delete cascade,
  ogrenci_id uuid references public.ogrenciler(id) on delete cascade,
  tarih timestamptz default now(),
  not_degeri integer,
  not_aciklamasi text,
  unique(ders_id, ogrenci_id)
);

create table public.bakiyeler (
  ogrenci_id uuid references public.ogrenciler(id) on delete cascade primary key,
  miktar decimal(10,2) default 0,
  updated_at timestamptz default now()
);

create table public.islemler (
  id uuid default uuid_generate_v4() primary key,
  ogrenci_id uuid references public.ogrenciler(id) on delete cascade,
  tur text check (tur in ('yukleme', 'harcama', 'iade')),
  miktar decimal(10,2) not null,
  aciklama text,
  tarih timestamptz default now()
);

create table public.notlar (
  id uuid default uuid_generate_v4() primary key,
  ders_id uuid references public.dersler(id) on delete cascade,
  ogrenci_id uuid references public.ogrenciler(id) on delete cascade,
  vize int check (vize >= 0 and vize <= 100),
  final int check (final >= 0 and final <= 100),
  ortalama decimal(5,2),
  harf_notu text,
  unique(ders_id, ogrenci_id)
);

create table public.yedek_listesi (
  id uuid default uuid_generate_v4() primary key,
  ders_id uuid references public.dersler(id) on delete cascade,
  ogrenci_id uuid references public.ogrenciler(id) on delete cascade,
  sira int,
  tarih timestamptz default now(),
  unique(ders_id, ogrenci_id)
);

-- Enable RLS
alter table public.ogrenciler enable row level security;
alter table public.ogretmenler enable row level security;
alter table public.dersler enable row level security;
alter table public.ders_talepleri enable row level security;
alter table public.ders_kayitlari enable row level security;
alter table public.bakiyeler enable row level security;
alter table public.islemler enable row level security;
alter table public.notlar enable row level security;
alter table public.yedek_listesi enable row level security;

-- Create permissive policies for all tables (since auth is removed/simplified)
create policy "Public Access Ogrenciler" on public.ogrenciler for all using (true);
create policy "Public Access Ogretmenler" on public.ogretmenler for all using (true);
create policy "Public Access Dersler" on public.dersler for all using (true);
create policy "Public Access Ders Talepleri" on public.ders_talepleri for all using (true);
create policy "Public Access Ders Kayitlari" on public.ders_kayitlari for all using (true);
create policy "Public Access Bakiyeler" on public.bakiyeler for all using (true);
create policy "Public Access Islemler" on public.islemler for all using (true);
create policy "Public Access Notlar" on public.notlar for all using (true);
create policy "Public Access Yedek Listesi" on public.yedek_listesi for all using (true);

-- Functions & Triggers

-- Handle New User
create or replace function public.handle_new_user()
returns trigger as $$
begin
  if new.raw_user_meta_data->>'role' = 'ogretmen' then
    insert into public.ogretmenler (id, ad_soyad, unvan)
    values (new.id, new.raw_user_meta_data->>'ad_soyad', new.raw_user_meta_data->>'unvan');
  else
    insert into public.ogrenciler (id, ad_soyad, ogrenci_no)
    values (new.id, new.raw_user_meta_data->>'ad_soyad', new.raw_user_meta_data->>'ogrenci_no');
    -- Initialize balance
    insert into public.bakiyeler (ogrenci_id, miktar) values (new.id, 0);
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Update Balance on Islem
create or replace function public.update_balance()
returns trigger as $$
begin
  if new.tur = 'yukleme' or new.tur = 'iade' then
    update public.bakiyeler set miktar = miktar + new.miktar where ogrenci_id = new.ogrenci_id;
  elsif new.tur = 'harcama' then
    update public.bakiyeler set miktar = miktar - new.miktar where ogrenci_id = new.ogrenci_id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_islem_created on public.islemler;
create trigger on_islem_created
  after insert on public.islemler
  for each row execute procedure public.update_balance();

-- Course Registration Function (Handles logic)
create or replace function public.ders_kayit_ol(p_ders_id uuid, p_ogrenci_id uuid)
returns json as $$
declare
  v_ders public.dersler%rowtype;
  v_bakiye decimal;
  v_kayit_sayisi int;
begin
  -- Get course info
  select * into v_ders from public.dersler where id = p_ders_id;
  if not found then return json_build_object('success', false, 'message', 'Ders bulunamadı'); end if;
  
  if v_ders.durum != 'acik' then return json_build_object('success', false, 'message', 'Ders kayıta açık değil'); end if;

  -- Check if already registered
  if exists (select 1 from public.ders_kayitlari where ders_id = p_ders_id and ogrenci_id = p_ogrenci_id) then
    return json_build_object('success', false, 'message', 'Zaten kayıtlısınız');
  end if;

  -- Check quota
  select count(*) into v_kayit_sayisi from public.ders_kayitlari where ders_id = p_ders_id;
  
  if v_kayit_sayisi >= v_ders.kontenjan then
    -- Add to waitlist
    insert into public.yedek_listesi (ders_id, ogrenci_id, sira)
    values (p_ders_id, p_ogrenci_id, (select count(*) + 1 from public.yedek_listesi where ders_id = p_ders_id))
    on conflict do nothing;
    return json_build_object('success', true, 'message', 'Kontenjan dolu, yedek listeye eklendiniz');
  end if;

  -- Check balance
  select miktar into v_bakiye from public.bakiyeler where ogrenci_id = p_ogrenci_id;
  if v_bakiye < v_ders.fiyat then
    return json_build_object('success', false, 'message', 'Yetersiz bakiye');
  end if;

  -- Register
  insert into public.ders_kayitlari (ders_id, ogrenci_id) values (p_ders_id, p_ogrenci_id);
  
  -- Deduct balance
  insert into public.islemler (ogrenci_id, tur, miktar, aciklama)
  values (p_ogrenci_id, 'harcama', v_ders.fiyat, v_ders.ad || ' ders kaydı');

  return json_build_object('success', true, 'message', 'Kayıt başarılı');
end;
$$ language plpgsql security definer;
