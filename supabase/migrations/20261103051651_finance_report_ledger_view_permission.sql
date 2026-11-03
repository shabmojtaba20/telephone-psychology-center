-- The ledger RPC used by report pages is protected by the independent report-view permission.
CREATE OR REPLACE FUNCTION public.get_finance_ledger(p_from timestamp with time zone DEFAULT NULL::timestamp with time zone, p_to timestamp with time zone DEFAULT NULL::timestamp with time zone, p_consultant_id uuid DEFAULT NULL::uuid, p_service_id uuid DEFAULT NULL::uuid, p_gateway text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare result jsonb;
begin
 if not public.has_admin_permission('finance.reports.view') then raise exception 'forbidden'; end if;
 with income as (
  select ft.id,ft.occurred_at,ft.amount,ft.currency,ft.payment_method,ft.gateway,ft.reference_id,ft.tracking_code,ft.description,ft.status,'income'::text entry_type,c.name consultant_name,s.name service_name
  from public.finance_transactions ft
  left join public.appointments a on a.id=ft.appointment_id
  left join public.consultants c on c.id=a.consultant_id
  left join public.services s on s.id=a.service_id
  where ft.transaction_type='income' and ft.status in ('paid','approved','success','completed')
    and (p_from is null or ft.occurred_at>=p_from) and (p_to is null or ft.occurred_at<=p_to)
    and (p_consultant_id is null or a.consultant_id=p_consultant_id)
    and (p_service_id is null or a.service_id=p_service_id)
    and (p_gateway is null or p_gateway='' or coalesce(ft.gateway,a.payment_gateway)=p_gateway)
 ),
 expenses_tx as (
  select ft.id,ft.occurred_at,ft.amount,ft.currency,ft.payment_method,ft.gateway,ft.reference_id,ft.tracking_code,ft.description,ft.status,'expense'::text entry_type,c.name consultant_name,null::text service_name
  from public.finance_transactions ft
  left join public.consultant_settlements cs on cs.id::text=ft.reference_id
  left join public.consultants c on c.id=cs.consultant_id
  where ft.transaction_type='expense' and ft.status in ('paid','approved','success','completed') and ft.category='consultant_settlement'
    and (p_from is null or ft.occurred_at>=p_from) and (p_to is null or ft.occurred_at<=p_to)
    and (p_consultant_id is null or cs.consultant_id=p_consultant_id)
    and p_service_id is null
    and (p_gateway is null or p_gateway='' or ft.gateway=p_gateway)
 ),
 op_expenses as (
  select e.id,e.expense_date::timestamptz,e.amount,'IRR'::text currency,e.payment_method,null::text gateway,e.reference_id,e.reference_number,e.description,'completed'::text status,'expense'::text entry_type,null::text consultant_name,null::text service_name
  from public.expenses e
  where (p_from is null or e.expense_date>=p_from::date) and (p_to is null or e.expense_date<=p_to::date)
    and p_consultant_id is null and p_service_id is null
    and (p_gateway is null or p_gateway='')
 ),
 ledger as (select * from income union all select * from expenses_tx union all select * from op_expenses),
 totals as (select coalesce(sum(amount) filter(where entry_type='income'),0)::numeric income,coalesce(sum(amount) filter(where entry_type='expense'),0)::numeric expenses,count(*)::integer transaction_count from ledger),
 rows_json as (select coalesce(jsonb_agg(to_jsonb(ledger) order by occurred_at desc),'[]'::jsonb) rows from ledger)
 select jsonb_build_object('income',t.income,'expenses',t.expenses,'net_profit',t.income-t.expenses,'transaction_count',t.transaction_count,'rows',r.rows) into result from totals t cross join rows_json r;
 return result;
end;$function$;
