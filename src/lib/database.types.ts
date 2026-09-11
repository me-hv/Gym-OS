export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'owner' | 'admin' | 'trainer' | 'front_desk';
export type MemberStatusType = 'active' | 'expiring' | 'expired' | 'frozen';
export type PaymentStatusType = 'paid' | 'pending' | 'overdue' | 'refunded';
export type PaymentMethodType = 'UPI' | 'Credit Card' | 'Debit Card' | 'Cash' | 'Net Banking';
export type GenderType = 'Male' | 'Female' | 'Other';
export type ActionType =
  | 'member_created'
  | 'membership_created'
  | 'payment_recorded'
  | 'attendance_logged'
  | 'membership_frozen'
  | 'membership_renewed'
  | 'whatsapp_reminder_sent'
  | 'trainer_assigned';

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          currency: string;
          phone: string | null;
          email: string | null;
          address: string | null;
          city: string;
          state: string;
          postal_code: string;
          gstin: string | null;
          peak_capacity: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          currency?: string;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          city?: string;
          state?: string;
          postal_code?: string;
          gstin?: string | null;
          peak_capacity?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          currency?: string;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          city?: string;
          state?: string;
          postal_code?: string;
          gstin?: string | null;
          peak_capacity?: number;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          organization_id: string;
          full_name: string;
          email: string;
          role: UserRole;
          avatar_url: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          organization_id: string;
          full_name: string;
          email: string;
          role?: UserRole;
          avatar_url?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          full_name?: string;
          email?: string;
          role?: UserRole;
          avatar_url?: string | null;
          phone?: string | null;
          updated_at?: string;
        };
      };
      trainers: {
        Row: {
          id: string;
          organization_id: string;
          full_name: string;
          specialty: string;
          phone: string | null;
          email: string | null;
          avatar_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          full_name: string;
          specialty?: string;
          phone?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          full_name?: string;
          specialty?: string;
          phone?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      membership_plans: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          code: string;
          tag: string | null;
          duration_months: number;
          price_inr: number;
          description: string | null;
          features: Json;
          is_popular: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          code: string;
          tag?: string | null;
          duration_months: number;
          price_inr: number;
          description?: string | null;
          features?: Json;
          is_popular?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          name?: string;
          code?: string;
          tag?: string | null;
          duration_months?: number;
          price_inr?: number;
          description?: string | null;
          features?: Json;
          is_popular?: boolean;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      members: {
        Row: {
          id: string;
          organization_id: string;
          member_code: string;
          full_name: string;
          email: string | null;
          phone: string;
          gender: GenderType;
          date_of_birth: string | null;
          age: number | null;
          join_date: string;
          goal: string | null;
          locker_number: string | null;
          assigned_trainer_id: string | null;
          status: MemberStatusType;
          notes: string | null;
          emergency_contact: Json;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          member_code: string;
          full_name: string;
          email?: string | null;
          phone: string;
          gender?: GenderType;
          date_of_birth?: string | null;
          age?: number | null;
          join_date?: string;
          goal?: string | null;
          locker_number?: string | null;
          assigned_trainer_id?: string | null;
          status?: MemberStatusType;
          notes?: string | null;
          emergency_contact?: Json;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          member_code?: string;
          full_name?: string;
          email?: string | null;
          phone?: string;
          gender?: GenderType;
          date_of_birth?: string | null;
          age?: number | null;
          join_date?: string;
          goal?: string | null;
          locker_number?: string | null;
          assigned_trainer_id?: string | null;
          status?: MemberStatusType;
          notes?: string | null;
          emergency_contact?: Json;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      memberships: {
        Row: {
          id: string;
          organization_id: string;
          member_id: string;
          plan_id: string;
          start_date: string;
          expiry_date: string;
          amount_inr: number;
          status: MemberStatusType;
          freeze_start_date: string | null;
          freeze_end_date: string | null;
          freeze_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          member_id: string;
          plan_id: string;
          start_date?: string;
          expiry_date: string;
          amount_inr: number;
          status?: MemberStatusType;
          freeze_start_date?: string | null;
          freeze_end_date?: string | null;
          freeze_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          member_id?: string;
          plan_id?: string;
          start_date?: string;
          expiry_date?: string;
          amount_inr?: number;
          status?: MemberStatusType;
          freeze_start_date?: string | null;
          freeze_end_date?: string | null;
          freeze_reason?: string | null;
          updated_at?: string;
        };
      };
      attendance: {
        Row: {
          id: string;
          organization_id: string;
          member_id: string;
          check_in_time: string;
          check_out_time: string | null;
          workout_type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          member_id: string;
          check_in_time?: string;
          check_out_time?: string | null;
          workout_type?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          member_id?: string;
          check_in_time?: string;
          check_out_time?: string | null;
          workout_type?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          organization_id: string;
          member_id: string;
          membership_id: string | null;
          invoice_number: string;
          amount_inr: number;
          tax_inr: number;
          total_inr: number;
          payment_date: string;
          due_date: string;
          status: PaymentStatusType;
          payment_method: PaymentMethodType;
          reference_id: string | null;
          collected_by: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          member_id: string;
          membership_id?: string | null;
          invoice_number: string;
          amount_inr: number;
          tax_inr?: number;
          total_inr: number;
          payment_date?: string;
          due_date?: string;
          status?: PaymentStatusType;
          payment_method?: PaymentMethodType;
          reference_id?: string | null;
          collected_by?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          member_id?: string;
          membership_id?: string | null;
          invoice_number?: string;
          amount_inr?: number;
          tax_inr?: number;
          total_inr?: number;
          payment_date?: string;
          due_date?: string;
          status?: PaymentStatusType;
          payment_method?: PaymentMethodType;
          reference_id?: string | null;
          collected_by?: string;
          notes?: string | null;
          updated_at?: string;
        };
      };
      activity_logs: {
        Row: {
          id: string;
          organization_id: string;
          actor_id: string | null;
          member_id: string | null;
          action: ActionType;
          title: string;
          description: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          actor_id?: string | null;
          member_id?: string | null;
          action: ActionType;
          title: string;
          description?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          actor_id?: string | null;
          member_id?: string | null;
          action?: ActionType;
          title?: string;
          description?: string | null;
          metadata?: Json;
        };
      };
    };
  };
}
