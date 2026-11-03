-- Independent financial report view/export permissions and append-only report audit events.
insert into public.admin_role_permissions (role_id, permission)
select r.id, p.permission
from public.admin_roles r
cross join (values ('finance.reports.view'), ('finance.reports.export')) as p(permission)
where r.name in ('finance_manager', 'super_admin')
on conflict (role_id, permission) do nothing;

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references auth.users(id) on delete restrict,
  event_type text not null check (event_type in ('report.view', 'report.export.csv', 'report.export.xlsx', 'report.export.print')),
  resource_type text not null check (resource_type in ('finance.dashboard', 'finance.formal_reports', 'finance.journal_ledger')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint audit_events_metadata_is_object check (jsonb_typeof(metadata) = 'object'),
  constraint audit_events_metadata_keys check ((metadata - array['from', 'to', 'format']) = '{}'::jsonb),
  constraint audit_events_metadata_size check (pg_column_size(metadata) <= 2048)
);
create index audit_events_actor_created_at_idx on public.audit_events (actor_id, created_at desc);
create index audit_events_type_created_at_idx on public.audit_events (event_type, created_at desc);
alter table public.audit_events enable row level security;
revoke all on table public.audit_events from public, anon, authenticated;
grant select on table public.audit_events to authenticated;
create policy audit_events_report_view_select on public.audit_events
  for select to authenticated using (public.has_admin_permission('finance.reports.view'));

create or replace function public.record_report_audit_event(
  p_event_type text, p_resource text, p_metadata jsonb default '{}'::jsonb
)
returns uuid language plpgsql security definer set search_path = ''
as $function$
declare
  v_actor uuid := auth.uid();
  v_metadata jsonb := coalesce(p_metadata, '{}'::jsonb);
  v_expected_format text;
  v_id uuid;
begin
  if v_actor is null then
    raise exception using errcode = '42501', message = 'authentication required';
  end if;
  if p_resource not in ('finance.dashboard', 'finance.formal_reports', 'finance.journal_ledger') then
    raise exception using errcode = '22023', message = 'invalid audit resource';
  end if;
  if jsonb_typeof(v_metadata) <> 'object'
     or (v_metadata - array['from', 'to', 'format']) <> '{}'::jsonb
     or pg_column_size(v_metadata) > 2048 then
    raise exception using errcode = '22023', message = 'invalid audit metadata';
  end if;
  if p_event_type = 'report.view' then
    if not public.has_admin_permission('finance.reports.view') then
      raise exception using errcode = '42501', message = 'finance.reports.view permission required';
    end if;
  elsif p_event_type in ('report.export.csv', 'report.export.xlsx', 'report.export.print') then
    if not public.has_admin_permission('finance.reports.view')
       or not public.has_admin_permission('finance.reports.export') then
      raise exception using errcode = '42501', message = 'finance.reports.export permission required';
    end if;
    v_expected_format := case p_event_type
      when 'report.export.csv' then 'csv'
      when 'report.export.xlsx' then 'xlsx'
      else 'print'
    end;
    if v_metadata->>'format' is distinct from v_expected_format then
      raise exception using errcode = '22023', message = 'audit format does not match event type';
    end if;
  else
    raise exception using errcode = '22023', message = 'invalid report audit event type';
  end if;
  insert into public.audit_events (actor_id, event_type, resource_type, metadata)
  values (v_actor, p_event_type, p_resource, v_metadata)
  returning id into v_id;
  return v_id;
end;
$function$;

revoke all on function public.record_report_audit_event(text, text, jsonb) from public, anon, authenticated;
grant execute on function public.record_report_audit_event(text, text, jsonb) to authenticated;

CREATE OR REPLACE FUNCTION public.get_finance_advanced_report(p_from date DEFAULT NULL::date, p_to date DEFAULT NULL::date)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_from timestamptz := coalesce(p_from::timestamptz, date_trunc('month', now()));
  v_to timestamptz := coalesce((p_to + 1)::timestamptz, now() + interval '1 second');
  v_result jsonb;
  v_expense numeric;
begin
  if not has_admin_permission('finance.reports.view') then raise exception 'اجازه دسترسی مالی ندارید'; end if;
  if p_from is not null and p_to is not null and p_from > p_to then raise exception 'بازه تاریخ نامعتبر است'; end if;

  select
    coalesce((select sum(e.amount) from expenses e where e.expense_date >= v_from::date and e.expense_date < v_to::date),0)
    + coalesce((select sum(ft.amount) from finance_transactions ft where ft.transaction_type='expense' and ft.category='consultant_settlement' and ft.status in ('paid','approved','completed','verified') and ft.occurred_at >= v_from and ft.occurred_at < v_to),0)
  into v_expense;

  select jsonb_build_object(
    'from',v_from,'to',v_to,
    'profit_loss',jsonb_build_object(
      'total_income',coalesce((select sum(fvi.amount) from finance_verified_income fvi where fvi.occurred_at>=v_from and fvi.occurred_at<v_to),0),
      'total_expense',v_expense,
      'net_profit',coalesce((select sum(fvi.amount) from finance_verified_income fvi where fvi.occurred_at>=v_from and fvi.occurred_at<v_to),0)-v_expense,
      'consultant_center_share',coalesce((select sum(cs.commission_amount) from consultant_settlements cs where cs.status in ('pending','approved','paid') and cs.period_from<v_to and cs.period_to>=v_from),0),
      'consultant_payable',coalesce((select sum(cs.net_amount) from consultant_settlements cs where cs.status in ('pending','approved','paid') and cs.period_from<v_to and cs.period_to>=v_from),0),
      'pending_settlement_gross',coalesce((select sum(cs.gross_amount) from consultant_settlements cs where cs.status='pending' and cs.period_from<v_to and cs.period_to>=v_from),0)
    ),
    'consultants',coalesce((select jsonb_agg(x order by x.consultant_name) from (
      select c.id consultant_id,c.name consultant_name,
        coalesce((select sum(fvi.amount) from finance_verified_income fvi join appointments a on a.id=fvi.appointment_id where a.consultant_id=c.id and fvi.occurred_at>=v_from and fvi.occurred_at<v_to),0) gross_income,
        coalesce((select sum(cs.commission_amount) from consultant_settlements cs where cs.consultant_id=c.id and cs.status in ('pending','approved','paid') and cs.period_from<v_to and cs.period_to>=v_from),0) center_share,
        coalesce((select sum(cs.net_amount) from consultant_settlements cs where cs.consultant_id=c.id and cs.status in ('pending','approved','paid') and cs.period_from<v_to and cs.period_to>=v_from),0) consultant_payable,
        coalesce((select sum(cs.net_amount) from consultant_settlements cs where cs.consultant_id=c.id and cs.status='paid' and cs.period_from<v_to and cs.period_to>=v_from),0) consultant_paid,
        coalesce((select count(*) from finance_verified_income fvi join appointments a on a.id=fvi.appointment_id where a.consultant_id=c.id and fvi.occurred_at>=v_from and fvi.occurred_at<v_to),0) settled_appointments
      from consultants c
      where c.is_active=true or exists(select 1 from finance_verified_income fvi join appointments a on a.id=fvi.appointment_id where a.consultant_id=c.id and fvi.occurred_at>=v_from and fvi.occurred_at<v_to)
    ) x),'[]'::jsonb)
  ) into v_result;
  return v_result;
end;
$function$;

CREATE OR REPLACE FUNCTION public.get_finance_income_breakdown(p_from date DEFAULT NULL::date, p_to date DEFAULT NULL::date)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_from timestamptz := coalesce(p_from::timestamptz, '1900-01-01'::timestamptz); v_to timestamptz := coalesce((p_to + 1)::timestamptz, '2100-01-01'::timestamptz);
begin
 if not has_admin_permission('finance.reports.view') then raise exception 'forbidden'; end if;
 return jsonb_build_object(
  'by_service', coalesce((select jsonb_agg(x order by x.income desc) from (select a.service_id, coalesce(s.name,'بدون خدمت') service_name, count(*) paid_appointments, sum(f.amount) income from finance_verified_income f join appointments a on a.id=f.appointment_id left join services s on s.id=a.service_id where f.occurred_at >= v_from and f.occurred_at < v_to group by a.service_id,s.name) x),'[]'::jsonb),
  'by_gateway', coalesce((select jsonb_agg(x order by x.income desc) from (select coalesce(nullif(f.gateway,''),'نامشخص') gateway, count(*) paid_appointments, sum(f.amount) income from finance_verified_income f where f.occurred_at >= v_from and f.occurred_at < v_to group by coalesce(nullif(f.gateway,''),'نامشخص')) x),'[]'::jsonb),
  'by_payment_method', coalesce((select jsonb_agg(x order by x.income desc) from (select coalesce(nullif(f.payment_method,''),'نامشخص') payment_method, count(*) paid_appointments, sum(f.amount) income from finance_verified_income f where f.occurred_at >= v_from and f.occurred_at < v_to group by coalesce(nullif(f.payment_method,''),'نامشخص')) x),'[]'::jsonb)
 );
end; $function$;

CREATE OR REPLACE FUNCTION public.get_finance_expense_breakdown(p_from date DEFAULT NULL::date, p_to date DEFAULT NULL::date)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_from timestamptz := coalesce(p_from::timestamptz, '1900-01-01'::timestamptz);
  v_to timestamptz := coalesce((p_to + 1)::timestamptz, '2100-01-01'::timestamptz);
begin
  if not has_admin_permission('finance.reports.view') then
    raise exception 'forbidden';
  end if;
  return jsonb_build_object(
    'by_category', coalesce((select jsonb_agg(x order by x.total_expense desc) from (
      select coalesce(ec.name,'تسویه مشاوران') category_name,
             case when ec.id is null then 'consultant_settlement' else 'manual' end source,
             sum(x.amount) total_expense,
             count(*) expense_count
      from (
        select e.category_id,e.amount,e.expense_date::timestamptz occurred_at
        from expenses e
        where e.expense_date >= v_from::date and e.expense_date < v_to::date
        union all
        select null::uuid,ft.amount,ft.occurred_at
        from finance_transactions ft
        where ft.transaction_type='expense'
          and ft.category='consultant_settlement'
          and ft.status in ('paid','approved','completed','verified')
          and ft.occurred_at >= v_from and ft.occurred_at < v_to
      ) x left join expense_categories ec on ec.id=x.category_id
      group by ec.id,ec.name
    ) x),'[]'::jsonb),
    'by_source', coalesce((select jsonb_agg(x order by x.total_expense desc) from (
      select source, sum(amount) total_expense, count(*) expense_count
      from (
        select 'manual' source,e.amount
        from expenses e where e.expense_date >= v_from::date and e.expense_date < v_to::date
        union all
        select 'consultant_settlement' source,ft.amount
        from finance_transactions ft
        where ft.transaction_type='expense' and ft.category='consultant_settlement'
          and ft.status in ('paid','approved','completed','verified')
          and ft.occurred_at >= v_from and ft.occurred_at < v_to
      ) s group by source
    ) x),'[]'::jsonb)
  );
end;
$function$;

CREATE OR REPLACE FUNCTION public.get_finance_formal_reports(p_from date DEFAULT NULL::date, p_to date DEFAULT NULL::date, p_level smallint DEFAULT 1)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_result jsonb;
begin
 if not public.has_admin_permission('finance.reports.view') then raise exception 'FINANCE_PERMISSION_DENIED'; end if;
 if p_from is not null and p_to is not null and p_from>p_to then raise exception 'INVALID_DATE_RANGE'; end if;
 if p_level not between 1 and 3 then raise exception 'INVALID_ACCOUNT_LEVEL'; end if;
 with recursive tree as (
   select id,account_code,account_name,account_type,parent_id,account_level,id root_id
   from finance_accounts
   union all
   select c.id,c.account_code,c.account_name,c.account_type,c.parent_id,c.account_level,t.root_id
   from finance_accounts c join tree t on c.parent_id=t.id
 ), lines as (
   select l.account_id,l.debit,l.credit,d.document_date
   from finance_document_lines l join finance_documents d on d.id=l.document_id
   where d.status='posted'
 ), agg as (
   select a.id,a.account_code,a.account_name,a.account_type,a.account_level,
          coalesce(sum(case when x.document_date < coalesce(p_from,'0001-01-01') then x.debit else 0 end),0) opening_debit,
          coalesce(sum(case when x.document_date < coalesce(p_from,'0001-01-01') then x.credit else 0 end),0) opening_credit,
          coalesce(sum(case when (p_from is null or x.document_date>=p_from) and (p_to is null or x.document_date<=p_to) then x.debit else 0 end),0) period_debit,
          coalesce(sum(case when (p_from is null or x.document_date>=p_from) and (p_to is null or x.document_date<=p_to) then x.credit else 0 end),0) period_credit
   from finance_accounts a left join tree t on t.root_id=a.id left join lines x on x.account_id=t.id
   where a.account_level=p_level
   group by a.id,a.account_code,a.account_name,a.account_type,a.account_level
 ), trial as (
   select *, (opening_debit-opening_credit) opening_balance,
          (period_debit-period_credit) period_balance,
          (opening_debit+period_debit-opening_credit-period_credit) closing_balance
   from agg
 ), pl as (
   select account_type,coalesce(sum(period_credit-period_debit),0) amount
   from trial where account_type in ('income','expense') group by account_type
 ), bs as (
   select account_type,coalesce(sum(closing_balance),0) balance
   from trial where account_type in ('asset','liability','equity') group by account_type
 ), net as (
   select coalesce((select amount from pl where account_type='income'),0)-coalesce((select amount from pl where account_type='expense'),0) net_profit
 )
 select jsonb_build_object(
   'meta',jsonb_build_object('from',p_from,'to',p_to,'level',p_level,'basis','posted accounting documents'),
   'trial_balance',coalesce((select jsonb_agg(to_jsonb(t) order by account_code) from trial t where period_debit<>0 or period_credit<>0 or closing_balance<>0),'[]'::jsonb),
   'profit_loss',jsonb_build_object(
      'income',coalesce((select jsonb_agg(to_jsonb(t) order by account_code) from trial t where account_type='income' and (period_debit<>0 or period_credit<>0)),'[]'::jsonb),
      'expense',coalesce((select jsonb_agg(to_jsonb(t) order by account_code) from trial t where account_type='expense' and (period_debit<>0 or period_credit<>0)),'[]'::jsonb),
      'total_income',coalesce((select amount from pl where account_type='income'),0),
      'total_expense',coalesce((select amount from pl where account_type='expense'),0),
      'net_profit',(select net_profit from net)
   ),
   'balance_sheet',jsonb_build_object(
      'assets',coalesce((select jsonb_agg(to_jsonb(t) order by account_code) from trial t where account_type='asset' and closing_balance<>0),'[]'::jsonb),
      'liabilities',coalesce((select jsonb_agg(to_jsonb(t) order by account_code) from trial t where account_type='liability' and closing_balance<>0),'[]'::jsonb),
      'equity',coalesce((select jsonb_agg(to_jsonb(t) order by account_code) from trial t where account_type='equity' and closing_balance<>0),'[]'::jsonb),
      'current_profit',(select net_profit from net),
      'total_assets',coalesce((select sum(balance) from bs where account_type='asset'),0),
      'total_liabilities',coalesce((select sum(balance) from bs where account_type='liability'),0),
      'total_equity',coalesce((select sum(balance) from bs where account_type='equity'),0)+(select net_profit from net)
   )
 ) into v_result;
 return v_result;
end $function$;

CREATE OR REPLACE FUNCTION public.get_finance_journal_ledger_report(p_from date DEFAULT NULL::date, p_to date DEFAULT NULL::date, p_account_id uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v jsonb;
begin
 if not public.has_admin_permission('finance.reports.view') then raise exception 'FINANCE_PERMISSION_DENIED'; end if;
 if p_from is not null and p_to is not null and p_from>p_to then raise exception 'INVALID_DATE_RANGE'; end if;
 select jsonb_build_object(
 'journal',coalesce((select jsonb_agg(to_jsonb(x) order by x.document_date,x.document_no,x.line_no) from (
   select d.id document_id,d.document_no,d.document_date,d.document_type,d.description document_description,
          d.reference_type,d.reference_id,l.line_no,a.account_code,a.account_name,a.account_level,
          l.description line_description,l.debit,l.credit,l.reference
   from finance_documents d join finance_document_lines l on l.document_id=d.id
   join finance_accounts a on a.id=l.account_id
   where d.status='posted' and (p_from is null or d.document_date>=p_from) and (p_to is null or d.document_date<=p_to)
     and (p_account_id is null or l.account_id=p_account_id)
 ) x),'[]'::jsonb),
 'ledger',coalesce((select jsonb_agg(to_jsonb(x) order by x.account_code,x.document_date,x.document_no,x.line_no) from (
   select a.id account_id,a.account_code,a.account_name,a.account_level,
          d.document_no,d.document_date,d.description document_description,l.line_no,l.description line_description,
          l.debit,l.credit,
          sum(l.debit-l.credit) over(partition by a.id order by d.document_date,d.document_no,l.line_no rows between unbounded preceding and current row) running_balance
   from finance_accounts a join finance_document_lines l on l.account_id=a.id
   join finance_documents d on d.id=l.document_id
   where d.status='posted' and (p_from is null or d.document_date>=p_from) and (p_to is null or d.document_date<=p_to)
     and (p_account_id is null or a.id=p_account_id)
 ) x),'[]'::jsonb)
 ) into v;
 return v;
end $function$;
