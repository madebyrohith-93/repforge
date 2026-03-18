import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useProgramStore = create((set, get) => ({
  programs: [],
  activeProgram: null,
  loading: false,

  fetchPrograms: async (userId) => {
    set({ loading: true })
    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (!error) {
      const active = data.find(p => p.is_active) || data[0] || null
      set({ programs: data || [], activeProgram: active })
    }
    set({ loading: false })
  },

  setActiveProgram: async (programId, userId) => {
    // Deactivate all, activate selected
    await supabase.from('programs').update({ is_active: false }).eq('user_id', userId)
    await supabase.from('programs').update({ is_active: true }).eq('id', programId)
    get().fetchPrograms(userId)
  },

  deleteProgram: async (programId, userId) => {
    await supabase.from('programs').delete().eq('id', programId)
    get().fetchPrograms(userId)
  },

  saveProgram: async (programData, userId) => {
    const { name, total_weeks, days, source_type } = programData

    // Deactivate others first
    await supabase.from('programs').update({ is_active: false }).eq('user_id', userId)

    // Insert program
    const { data: prog, error: progErr } = await supabase
      .from('programs')
      .insert({ user_id: userId, name, total_weeks, source_type, is_active: true })
      .select()
      .single()

    if (progErr) throw progErr

    // Insert days + exercises
    for (const day of days) {
      const { data: dayRow, error: dayErr } = await supabase
        .from('days')
        .insert({
          program_id: prog.id,
          week_number: day.week_number,
          day_number: day.day_number,
          day_label: day.day_label
        })
        .select()
        .single()

      if (dayErr) throw dayErr

      if (day.exercises?.length) {
        const exerciseRows = day.exercises.map((ex, idx) => ({
          day_id: dayRow.id,
          name: ex.name,
          order_index: idx,
          planned_sets: ex.planned_sets || null,
          planned_reps_per_set: ex.planned_reps_per_set || null
        }))
        const { error: exErr } = await supabase.from('exercises').insert(exerciseRows)
        if (exErr) throw exErr
      }
    }

    return prog
  }
}))
