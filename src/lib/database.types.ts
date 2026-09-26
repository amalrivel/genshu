export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

type Table<Row, Insert, Update> = { Row: Row; Insert: Insert; Update: Update; Relationships: [] }

export type Database = {
  __InternalSupabase: { PostgrestVersion: "14.5" }
  public: {
    Tables: {
      learning_materials: Table<
        { slug: string; title_ja: string; title_id: string; summary_ja: string; summary_id: string; level: string; topic: string; sections: Json; is_published: boolean; published_at: string | null; sort_order: number; created_at: string; updated_at: string },
        { slug: string; title_ja: string; title_id: string; summary_ja?: string; summary_id: string; level: string; topic: string; sections?: Json; is_published?: boolean; published_at?: string | null; sort_order?: number; created_at?: string; updated_at?: string },
        { slug?: string; title_ja?: string; title_id?: string; summary_ja?: string; summary_id?: string; level?: string; topic?: string; sections?: Json; is_published?: boolean; published_at?: string | null; sort_order?: number; created_at?: string; updated_at?: string }
      >
      practice_sets: Table<
        { id: string; title: string; title_id: string; description: string; description_id: string; target_level: string; topic: string; is_published: boolean; published_at: string | null; created_at: string; updated_at: string },
        { id: string; title: string; title_id?: string; description?: string; description_id?: string; target_level: string; topic: string; is_published?: boolean; published_at?: string | null; created_at?: string; updated_at?: string },
        { id?: string; title?: string; title_id?: string; description?: string; description_id?: string; target_level?: string; topic?: string; is_published?: boolean; published_at?: string | null; created_at?: string; updated_at?: string }
      >
      practice_questions: Table<
        { id: string; practice_set_id: string; position: number; question_type: string; prompt: string; prompt_plain: string; translation_id: string; options: Json; correct_answer_index: number; explanation_ja: string; explanation_id: string },
        { id: string; practice_set_id: string; position: number; question_type: string; prompt: string; prompt_plain: string; translation_id?: string; options: Json; correct_answer_index: number; explanation_ja: string; explanation_id?: string },
        { id?: string; practice_set_id?: string; position?: number; question_type?: string; prompt?: string; prompt_plain?: string; translation_id?: string; options?: Json; correct_answer_index?: number; explanation_ja?: string; explanation_id?: string }
      >
      staff_members: Table<
        { user_id: string; role: string; display_name: string; is_active: boolean; created_at: string },
        { user_id: string; role: string; display_name: string; is_active?: boolean; created_at?: string },
        { user_id?: string; role?: string; display_name?: string; is_active?: boolean; created_at?: string }
      >
    }
    Views: Record<never, never>
    Functions: {
      save_practice_set: { Args: { p_set: Json; p_questions: Json; p_update: boolean }; Returns: undefined }
    }
    Enums: Record<never, never>
    CompositeTypes: Record<never, never>
  }
}
