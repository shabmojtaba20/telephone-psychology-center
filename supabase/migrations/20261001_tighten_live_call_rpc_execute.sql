-- Tighten execution privileges for Live consultation RPCs.
revoke execute on function public.get_or_create_my_live_call_room(uuid) from anon;
revoke execute on function public.authorize_my_call_room(text) from anon;
revoke execute on function public.get_or_create_my_live_call_room(uuid) from public;
revoke execute on function public.authorize_my_call_room(text) from public;
grant execute on function public.get_or_create_my_live_call_room(uuid) to authenticated;
grant execute on function public.authorize_my_call_room(text) to authenticated;
