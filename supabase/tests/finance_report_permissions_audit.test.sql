-- Financial report permission and audit regression tests.
-- Run as a database owner. The temporary role grant and audit rows are rolled back.

begin;

insert into public.admin_role_permissions(role_id,permission)
select id,'finance.reports.view'
from public.admin_roles
where name='consultant_manager'
on conflict(role_id,permission) do nothing;

select set_config('app.test_finance_manager_id',(
 select ur.user_id::text from public.admin_user_roles ur
 join public.admin_roles r on r.id=ur.role_id where r.name='finance_manager' limit 1
),true);
select set_config('app.test_consultant_manager_id',(
 select ur.user_id::text from public.admin_user_roles ur
 join public.admin_roles r on r.id=ur.role_id where r.name='consultant_manager' limit 1
),true);
select set_config('app.test_appointment_manager_id',(
 select ur.user_id::text from public.admin_user_roles ur
 join public.admin_roles r on r.id=ur.role_id where r.name='appointment_manager' limit 1
),true);
select set_config('app.test_super_admin_id',(
 select ur.user_id::text from public.admin_user_roles ur
 join public.admin_roles r on r.id=ur.role_id where r.name='super_admin' limit 1
),true);

set local role authenticated;

do $tests$
declare
 v_finance uuid := current_setting('app.test_finance_manager_id',true)::uuid;
 v_view_only uuid := current_setting('app.test_consultant_manager_id',true)::uuid;
 v_denied uuid := current_setting('app.test_appointment_manager_id',true)::uuid;
 v_super uuid := current_setting('app.test_super_admin_id',true)::uuid;
 v_failed boolean;
 v_count integer;
 v_state text;
begin
 if v_finance is null or v_view_only is null or v_denied is null or v_super is null then
  raise exception 'Missing test users for role matrix';
 end if;

 -- finance_manager: report view, CSV export, and report RPCs are permitted.
 perform set_config('request.jwt.claim.sub',v_finance::text,true);
 perform set_config('request.jwt.claims',jsonb_build_object('sub',v_finance::text,'role','authenticated')::text,true);
 if not public.has_admin_permission('finance.reports.view') or not public.has_admin_permission('finance.reports.export') then
  raise exception 'finance_manager should have view and export permissions';
 end if;
 perform public.record_report_audit_event('report.view','finance.dashboard','{"from":"2026-11-01","to":"2026-11-03"}'::jsonb);
 perform public.record_report_audit_event('report.export.csv','finance.dashboard','{"format":"csv"}'::jsonb);
 perform public.get_finance_advanced_report(null,null);
 perform public.get_finance_income_breakdown(null,null);
 perform public.get_finance_expense_breakdown(null,null);
 perform public.get_finance_formal_reports(null,null,1::smallint);
 perform public.get_finance_journal_ledger_report(null,null,null);
 perform public.get_advanced_finance_report(null,null,null,null,null);
 perform public.get_finance_ledger(null,null,null,null,null);
 select count(*) into v_count from public.audit_events
  where actor_id=v_finance and event_type in ('report.view','report.export.csv');
 if v_count<>2 then raise exception 'Expected both view and CSV audit events'; end if;

 -- View-only role: reading is allowed, CSV export is denied.
 perform set_config('request.jwt.claim.sub',v_view_only::text,true);
 perform set_config('request.jwt.claims',jsonb_build_object('sub',v_view_only::text,'role','authenticated')::text,true);
 if not public.has_admin_permission('finance.reports.view') or public.has_admin_permission('finance.reports.export') then
  raise exception 'View-only permission split failed';
 end if;
 perform public.get_advanced_finance_report(null,null,null,null,null);
 perform public.record_report_audit_event('report.view','finance.dashboard','{}'::jsonb);
 v_failed:=false;
 begin
  perform public.record_report_audit_event('report.export.csv','finance.dashboard','{"format":"csv"}'::jsonb);
 exception when insufficient_privilege then
  v_failed:=true;
 end;
 if not v_failed then raise exception 'View-only role unexpectedly exported CSV'; end if;
 select count(*) into v_count from public.audit_events
  where actor_id=v_view_only and event_type like 'report.export.%';
 if v_count<>0 then raise exception 'View-only user must not create export events'; end if;

 -- Appointment role: report view and export are both denied.
 perform set_config('request.jwt.claim.sub',v_denied::text,true);
 perform set_config('request.jwt.claims',jsonb_build_object('sub',v_denied::text,'role','authenticated')::text,true);
 if public.has_admin_permission('finance.reports.view') or public.has_admin_permission('finance.reports.export') then
  raise exception 'appointment_manager unexpectedly received report permissions';
 end if;
 v_failed:=false;
 begin
  perform public.record_report_audit_event('report.view','finance.dashboard','{}'::jsonb);
 exception when insufficient_privilege then
  v_failed:=true;
 end;
 if not v_failed then raise exception 'Unauthorized report view event was not denied'; end if;
 v_failed:=false;
 begin
  perform public.get_finance_advanced_report(null,null);
 exception when others then
  get stacked diagnostics v_state=returned_sqlstate;
  if v_state='P0001' then v_failed:=true; else raise; end if;
 end;
 if not v_failed then raise exception 'Unauthorized report RPC was not denied'; end if;
 select count(*) into v_count from public.audit_events;
 if v_count<>0 then raise exception 'Unauthorized role should not read audit events'; end if;

 -- super_admin retains wildcard access.
 perform set_config('request.jwt.claim.sub',v_super::text,true);
 perform set_config('request.jwt.claims',jsonb_build_object('sub',v_super::text,'role','authenticated')::text,true);
 if not public.has_admin_permission('finance.reports.view') or not public.has_admin_permission('finance.reports.export') then
  raise exception 'super_admin lost report permissions';
 end if;
end
$tests$;

rollback;
