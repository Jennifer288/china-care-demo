-- Apply in a new Supabase project. No service-role key is used by the web app.
create extension if not exists pgcrypto;
create table public.users(id uuid primary key references auth.users on delete cascade,email text not null,full_name text not null,country text not null default '',preferred_language text not null default 'en',created_at timestamptz not null default now());
create table public.patient_profiles(user_id uuid primary key references public.users on delete cascade,date_of_birth date,gender text,nationality text,current_country text);
create table public.medical_cases(id uuid primary key default gen_random_uuid(),user_id uuid not null references public.users on delete cascade,full_name text not null,date_of_birth date not null,gender text,nationality text not null,current_country text not null,main_condition text not null,diagnosis text,symptoms text,previous_treatment text,medication text,allergies text,status text not null default 'Draft' check(status in ('Draft','Records Submitted','Under Review','Additional Information Required','Hospital Review','Plan Available','Patient Decision','Travel Confirmed','In China','Completed')),created_at timestamptz not null default now(),submitted_at timestamptz);
create table public.medical_files(id uuid primary key default gen_random_uuid(),case_id uuid not null references public.medical_cases on delete cascade,user_id uuid not null references public.users on delete cascade,file_name text not null,file_type text not null,category text not null check(category in ('Medical Report','Lab Test','CT','MRI','Pathology','Ultrasound','Prescription','Discharge Summary','Other')),storage_path text unique not null,pending_delete boolean not null default false,file_size bigint not null check(file_size between 1 and 20971520),created_at timestamptz not null default now());
create table public.consents(id uuid primary key default gen_random_uuid(),user_id uuid not null references public.users on delete cascade,case_id uuid references public.medical_cases on delete cascade,consent_type text not null,consent_version text not null,accepted_at timestamptz not null default now());
create table public.coordinator_notes(case_id uuid primary key references public.medical_cases on delete cascade,body text not null default '',updated_by uuid references auth.users,updated_at timestamptz not null default now());
create table public.hospitals(id text primary key,name text not null,city text,description text,specialties text[],image text,data_source text not null default 'Demo / Public Information');
create table public.doctors(id text primary key,hospital_id text references public.hospitals,name text not null,title text,department text,specialties text[],languages text[],bio text,image text,is_demo boolean not null default true);
create table public.inquiries(id uuid primary key default gen_random_uuid(),name text not null,email text not null,country text,phone text,message text not null,consent boolean not null check(consent),created_at timestamptz default now());
create index on public.medical_cases(user_id);
create index on public.medical_files(case_id);
create index on public.consents(case_id);

create function public.is_coordinator() returns boolean language sql stable as $$select coalesce(auth.jwt()->'app_metadata'->>'role','')='admin'$$;
create function public.on_signup() returns trigger language plpgsql security definer set search_path=public as $$begin
 insert into public.users(id,email,full_name,country,preferred_language) values(new.id,new.email,coalesce(new.raw_user_meta_data->>'full_name',''),coalesce(new.raw_user_meta_data->>'country',''),coalesce(new.raw_user_meta_data->>'preferred_language','en'));
 insert into public.consents(user_id,consent_type,consent_version) values(new.id,'terms',coalesce(new.raw_user_meta_data->>'terms_version','unspecified'));
 return new; end$$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.on_signup();
create function public.sync_profile() returns trigger language plpgsql security definer set search_path=public as $$begin
 insert into public.patient_profiles values(new.user_id,new.date_of_birth,new.gender,new.nationality,new.current_country) on conflict(user_id) do update set date_of_birth=excluded.date_of_birth,gender=excluded.gender,nationality=excluded.nationality,current_country=excluded.current_country;
 return new; end$$;
create trigger case_profile after insert on public.medical_cases for each row execute function public.sync_profile();

alter table public.users enable row level security;
alter table public.patient_profiles enable row level security;
alter table public.medical_cases enable row level security;
alter table public.medical_files enable row level security;
alter table public.consents enable row level security;
alter table public.coordinator_notes enable row level security;
alter table public.hospitals enable row level security;
alter table public.doctors enable row level security;
alter table public.inquiries enable row level security;
create policy own_user on public.users for select to authenticated using(id=auth.uid());
create policy own_profile on public.patient_profiles for select to authenticated using(user_id=auth.uid());
create policy read_cases on public.medical_cases for select to authenticated using(user_id=auth.uid() or (public.is_coordinator() and status<>'Draft' and exists(select 1 from public.consents c where c.case_id=medical_cases.id and c.consent_type='medical_processing')));
create policy create_draft on public.medical_cases for insert to authenticated with check(user_id=auth.uid() and status='Draft' and submitted_at is null);
create policy read_files on public.medical_files for select to authenticated using(user_id=auth.uid() or (public.is_coordinator() and exists(select 1 from public.medical_cases c where c.id=case_id and c.status<>'Draft')));
create policy insert_files on public.medical_files for insert to authenticated with check(user_id=auth.uid() and exists(select 1 from public.medical_cases c where c.id=case_id and c.user_id=auth.uid() and c.status='Draft') and split_part(storage_path,'/',1)=auth.uid()::text and split_part(storage_path,'/',2)=case_id::text);
create policy delete_files on public.medical_files for delete to authenticated using(user_id=auth.uid() and exists(select 1 from public.medical_cases c where c.id=case_id and c.status='Draft'));
create policy read_consents on public.consents for select to authenticated using(user_id=auth.uid() or public.is_coordinator());
create policy admin_notes on public.coordinator_notes for select to authenticated using(public.is_coordinator());
create policy public_hospitals on public.hospitals for select using(true);
create policy public_doctors on public.doctors for select using(true);
create policy send_inquiry on public.inquiries for insert to anon,authenticated with check(consent=true and length(message) between 10 and 4000);
create policy admin_inquiry on public.inquiries for select to authenticated using(public.is_coordinator());

revoke all on public.users,public.patient_profiles,public.medical_cases,public.medical_files,public.consents,public.coordinator_notes,public.inquiries from anon,authenticated;
grant select on public.users,public.patient_profiles,public.medical_cases,public.medical_files,public.consents,public.coordinator_notes to authenticated;
grant insert(user_id,full_name,date_of_birth,gender,nationality,current_country,main_condition,diagnosis,symptoms,previous_treatment,medication,allergies) on public.medical_cases to authenticated;
grant insert,delete on public.medical_files to authenticated;
grant insert on public.inquiries to anon,authenticated;
grant select on public.inquiries to authenticated;
grant select on public.hospitals,public.doctors to anon,authenticated;

create function public.submit_medical_case(case_uuid uuid,accepted boolean,version text) returns void language plpgsql security definer set search_path=public as $$
declare target public.medical_cases; begin
 select * into target from public.medical_cases where id=case_uuid for update;
 if auth.uid() is null or target.user_id is distinct from auth.uid() or target.status<>'Draft' then raise exception 'Not authorized';end if;
 if accepted is distinct from true or version is distinct from '2026-09-v1' then raise exception 'Explicit consent required';end if;
 if exists(select 1 from public.medical_files where case_id=case_uuid and pending_delete) then raise exception 'Finish pending file deletion before submission';end if;
 if not exists(select 1 from public.medical_files where case_id=case_uuid) then raise exception 'Records required';end if;
 insert into public.consents(user_id,case_id,consent_type,consent_version) values(auth.uid(),case_uuid,'medical_processing',version);
 update public.medical_cases set status='Records Submitted',submitted_at=now() where id=case_uuid;
end$$;
create function public.update_case_coordination(case_uuid uuid,new_status text,notes text) returns void language plpgsql security definer set search_path=public as $$begin
 if not public.is_coordinator() then raise exception 'Not authorized';end if;
 if new_status='Draft' or length(notes)>4000 or not exists(select 1 from public.consents where case_id=case_uuid and consent_type='medical_processing') then raise exception 'Invalid case';end if;
 update public.medical_cases set status=new_status where id=case_uuid and status<>'Draft';
 insert into public.coordinator_notes(case_id,body,updated_by) values(case_uuid,notes,auth.uid()) on conflict(case_id) do update set body=excluded.body,updated_by=excluded.updated_by,updated_at=now();
end$$;
revoke all on function public.submit_medical_case(uuid,boolean,text),public.update_case_coordination(uuid,text,text) from public,anon;
grant execute on function public.submit_medical_case(uuid,boolean,text),public.update_case_coordination(uuid,text,text) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('medical-records','medical-records',false,20971520,array['application/pdf','image/jpeg','image/png','application/zip','application/x-zip-compressed','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document']);
create policy read_private_records on storage.objects for select to authenticated using(bucket_id='medical-records' and ((storage.foldername(name))[1]=auth.uid()::text or (public.is_coordinator() and exists(select 1 from public.medical_files f join public.medical_cases c on c.id=f.case_id where f.storage_path=storage.objects.name and not f.pending_delete and c.status<>'Draft'))));
create policy upload_private_records on storage.objects for insert to authenticated with check(bucket_id='medical-records' and (storage.foldername(name))[1]=auth.uid()::text and exists(select 1 from public.medical_cases c where c.id::text=(storage.foldername(name))[2] and c.user_id=auth.uid() and c.status='Draft'));
create policy delete_private_records on storage.objects for delete to authenticated using(bucket_id='medical-records' and (storage.foldername(name))[1]=auth.uid()::text and (not exists(select 1 from public.medical_files f where f.storage_path=storage.objects.name) or exists(select 1 from public.medical_files f where f.storage_path=storage.objects.name and f.user_id=auth.uid() and f.pending_delete)));

-- Serialize metadata changes against submission. Storage deletion is a retryable
-- two-phase operation: a pending marker prevents submitting a disappearing file.
create function public.guard_file_mutation() returns trigger language plpgsql security definer set search_path=public as $$
declare target public.medical_cases; case_uuid uuid; begin
 case_uuid := case when TG_OP='DELETE' then OLD.case_id else NEW.case_id end;
 select * into target from public.medical_cases where id=case_uuid for update;
 if target.user_id is distinct from auth.uid() or target.status<>'Draft' then raise exception 'Only the owner may modify draft records';end if;
 if TG_OP='DELETE' then return OLD;end if;
 return NEW;
end$$;
create trigger guard_record_metadata before insert or delete on public.medical_files for each row execute function public.guard_file_mutation();
create function public.begin_file_deletion(file_uuid uuid) returns void language plpgsql security definer set search_path=public as $$
declare target public.medical_cases; case_uuid uuid; begin
 select case_id into case_uuid from public.medical_files where id=file_uuid and user_id=auth.uid();
 select * into target from public.medical_cases where id=case_uuid for update;
 if auth.uid() is null or target.user_id is distinct from auth.uid() or target.status<>'Draft' then raise exception 'Not authorized';end if;
 update public.medical_files set pending_delete=true where id=file_uuid and user_id=auth.uid();
end$$;
create function public.complete_file_deletion(file_uuid uuid) returns void language plpgsql security definer set search_path=public as $$
declare target public.medical_cases; case_uuid uuid; begin
 select case_id into case_uuid from public.medical_files where id=file_uuid and user_id=auth.uid();
 select * into target from public.medical_cases where id=case_uuid for update;
 if auth.uid() is null or target.user_id is distinct from auth.uid() or target.status<>'Draft' then raise exception 'Not authorized';end if;
 if exists(select 1 from storage.objects o join public.medical_files f on f.storage_path=o.name where f.id=file_uuid and o.bucket_id='medical-records') then raise exception 'Storage deletion must finish first';end if;
 delete from public.medical_files where id=file_uuid and user_id=auth.uid() and pending_delete;
end$$;
revoke all on function public.begin_file_deletion(uuid),public.complete_file_deletion(uuid) from public,anon;
grant execute on function public.begin_file_deletion(uuid),public.complete_file_deletion(uuid) to authenticated;
