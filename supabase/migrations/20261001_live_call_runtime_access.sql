-- Live consultation runtime access without exposing Service Role to the Worker call flow.

create or replace function public.get_or_create_my_live_call_room(p_appointment_id uuid)
returns table(
  room_id uuid,
  room_key text,
  room_type text,
  room_status text,
  starts_at timestamptz,
  ends_at timestamptz,
  participant_role text
)
language plpgsql
security definer
set search_path = public, extensions
as $function$
declare
  v_uid uuid := auth.uid();
  v_role text;
  v_appointment public.appointments%rowtype;
  v_duration integer;
  v_ends timestamptz;
  v_room public.call_rooms%rowtype;
begin
  if v_uid is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select a.*
  into v_appointment
  from public.appointments a
  where a.id = p_appointment_id
  for update;

  if not found then
    raise exception 'APPOINTMENT_NOT_FOUND';
  end if;

  if v_appointment.status in ('cancelled','canceled','rejected','expired','completed')
     or v_appointment.payment_status <> 'paid' then
    raise exception 'APPOINTMENT_NOT_AVAILABLE';
  end if;

  if v_appointment.user_id = v_uid then
    v_role := 'client';
  elsif exists (
    select 1
    from public.consultant_user_links cul
    where cul.user_id = v_uid
      and cul.consultant_id = v_appointment.consultant_id
  ) then
    v_role := 'consultant';
  elsif public.has_admin_permission('content.manage')
     or public.has_admin_permission('calls.manage') then
    v_role := 'admin';
  else
    raise exception 'CALL_ACCESS_DENIED';
  end if;

  select coalesce(s.duration_minutes,60)
  into v_duration
  from public.services s
  where s.id = v_appointment.service_id;

  v_duration := greatest(coalesce(v_duration,60),1);
  v_ends := v_appointment.scheduled_at + make_interval(mins => v_duration);

  if now() < v_appointment.scheduled_at - interval '15 minutes'
     or now() > v_ends + interval '30 minutes' then
    raise exception 'CALL_TIME_WINDOW_CLOSED';
  end if;

  select r.*
  into v_room
  from public.call_rooms r
  where r.appointment_id = p_appointment_id
    and r.room_type = 'private_consultation'
  order by r.created_at
  limit 1;

  if not found then
    insert into public.call_rooms(
      room_type, appointment_id, room_key, status, starts_at, ends_at
    )
    values(
      'private_consultation',
      p_appointment_id,
      replace(gen_random_uuid()::text,'-',''),
      case when now() < v_appointment.scheduled_at then 'waiting' else 'active' end,
      v_appointment.scheduled_at,
      v_ends
    )
    returning * into v_room;
  end if;

  if v_role = 'client' then
    if not exists (
      select 1
      from public.call_room_participants p
      where p.room_id = v_room.id and p.user_id = v_uid
    ) then
      insert into public.call_room_participants(
        room_id,user_id,participant_role,connection_status
      )
      values(v_room.id,v_uid,'client','invited');
    end if;
  elsif v_role = 'consultant' then
    if not exists (
      select 1
      from public.call_room_participants p
      where p.room_id = v_room.id and p.consultant_id = v_appointment.consultant_id
    ) then
      insert into public.call_room_participants(
        room_id,consultant_id,participant_role,connection_status
      )
      values(v_room.id,v_appointment.consultant_id,'consultant','invited');
    end if;
  end if;

  return query
  select
    v_room.id,
    v_room.room_key,
    v_room.room_type,
    v_room.status,
    v_room.starts_at,
    v_room.ends_at,
    v_role;
end;
$function$;

create or replace function public.authorize_my_call_room(p_room_key text)
returns table(
  room_id uuid,
  room_key text,
  room_type text,
  appointment_id uuid,
  workshop_id uuid,
  room_status text,
  starts_at timestamptz,
  ends_at timestamptz,
  participant_role text
)
language plpgsql
security definer
set search_path = public, extensions
as $function$
declare
  v_uid uuid := auth.uid();
  v_room public.call_rooms%rowtype;
  v_role text;
  v_duration integer;
  v_ends timestamptz;
  v_appt public.appointments%rowtype;
  v_workshop public.workshops%rowtype;
begin
  if v_uid is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select r.*
  into v_room
  from public.call_rooms r
  where r.room_key = p_room_key
  limit 1;

  if not found then
    raise exception 'CALL_ROOM_NOT_FOUND';
  end if;

  if v_room.status in ('expired','cancelled','canceled') then
    raise exception 'CALL_ROOM_INACTIVE';
  end if;

  if v_room.room_type = 'private_consultation' then
    if v_room.appointment_id is null then
      raise exception 'CALL_ROOM_INVALID';
    end if;

    select a.*
    into v_appt
    from public.appointments a
    where a.id = v_room.appointment_id;

    if not found then
      raise exception 'APPOINTMENT_NOT_FOUND';
    end if;

    if v_appt.user_id = v_uid then
      v_role := 'client';
    elsif exists (
      select 1
      from public.consultant_user_links cul
      where cul.user_id = v_uid
        and cul.consultant_id = v_appt.consultant_id
    ) then
      v_role := 'consultant';
    elsif public.has_admin_permission('content.manage')
       or public.has_admin_permission('calls.manage') then
      v_role := 'admin';
    else
      raise exception 'CALL_ACCESS_DENIED';
    end if;

    if v_appt.status in ('cancelled','canceled','rejected','expired','completed')
       or v_appt.payment_status <> 'paid' then
      raise exception 'APPOINTMENT_NOT_AVAILABLE';
    end if;

    select coalesce(s.duration_minutes,60)
    into v_duration
    from public.services s
    where s.id = v_appt.service_id;

    v_duration := greatest(coalesce(v_duration,60),1);
    v_ends := v_appt.scheduled_at + make_interval(mins => v_duration);

  elsif v_room.room_type = 'workshop' then
    if v_room.workshop_id is null then
      raise exception 'CALL_ROOM_INVALID';
    end if;

    select w.*
    into v_workshop
    from public.workshops w
    where w.id = v_room.workshop_id;

    if not found then
      raise exception 'WORKSHOP_NOT_FOUND';
    end if;

    if v_workshop.created_by = v_uid then
      v_role := 'instructor';
    elsif exists (
      select 1
      from public.workshop_registrations wr
      where wr.workshop_id = v_room.workshop_id
        and wr.user_id = v_uid
        and wr.payment_status in ('free','paid')
    ) then
      v_role := 'attendee';
    elsif public.has_admin_permission('content.manage')
       or public.has_admin_permission('calls.manage') then
      v_role := 'admin';
    else
      raise exception 'CALL_ACCESS_DENIED';
    end if;

    v_ends := coalesce(
      v_workshop.ends_at,
      v_workshop.end_at,
      v_workshop.starts_at + make_interval(mins => greatest(coalesce(v_workshop.duration_minutes,60),1))
    );
  else
    raise exception 'CALL_ROOM_INVALID';
  end if;

  if now() < v_room.starts_at - interval '15 minutes'
     or now() > v_ends + interval '30 minutes' then
    raise exception 'CALL_TIME_WINDOW_CLOSED';
  end if;

  return query
  select
    v_room.id,
    v_room.room_key,
    v_room.room_type,
    v_room.appointment_id,
    v_room.workshop_id,
    v_room.status,
    v_room.starts_at,
    v_room.ends_at,
    v_role;
end;
$function$;

revoke all on function public.get_or_create_my_live_call_room(uuid) from public;
revoke all on function public.authorize_my_call_room(text) from public;
grant execute on function public.get_or_create_my_live_call_room(uuid) to authenticated;
grant execute on function public.authorize_my_call_room(text) to authenticated;
