-- Additive migration: retain existing records, categories and legacy statuses.
alter table public.medical_cases
 add column duration text not null default '',
 add column previous_surgeries text not null default '',
 add column preferred_goal text not null default '' check(preferred_goal in ('','Treatment','Second Opinion','Surgery Evaluation','Diagnosis Review','Other'));
grant insert(duration,previous_surgeries,preferred_goal) on public.medical_cases to authenticated;
alter table public.medical_cases drop constraint medical_cases_status_check;
alter table public.medical_cases add constraint medical_cases_status_check check(status in ('Draft','Records Submitted','Case Preparation','Ready for Hospital Review','Under Review','Additional Information Required','Hospital Review','Plan Available','Patient Decision','Travel Confirmed','In China','Treatment Completed','Follow-up','Closed','Completed'));
alter table public.medical_files drop constraint medical_files_category_check;
alter table public.medical_files add constraint medical_files_category_check check(category in ('Medical Report','Lab Test','CT','MRI','Pathology','Ultrasound','Prescription','Discharge Summary','Diagnosis','Blood Test','Surgical Record','Other'));
