'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function getAcademyPathsAction() {
  const { data, error } = await supabaseAdmin
    .from('academy_paths')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}

export async function upsertAcademyPathAction(pathData) {
  const { data, error } = await supabaseAdmin
    .from('academy_paths')
    .upsert(pathData, { onConflict: 'id' })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteAcademyPathAction(id) {
  const { error } = await supabaseAdmin
    .from('academy_paths')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
  return true;
}

export async function getAcademyNodesAction(pathId) {
  const { data, error } = await supabaseAdmin
    .from('academy_nodes')
    .select('*')
    .eq('path_id', pathId)
    .order('order_index', { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}

export async function upsertAcademyNodeAction(nodeData) {
  const { data, error } = await supabaseAdmin
    .from('academy_nodes')
    .upsert(nodeData, { onConflict: 'id' })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteAcademyNodeAction(id) {
  const { error } = await supabaseAdmin
    .from('academy_nodes')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
  return true;
}
