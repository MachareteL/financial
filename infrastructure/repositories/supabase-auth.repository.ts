import type { IAuthRepository } from "@/domain/interfaces/auth.repository.interface";
import type { UserSession, TeamMembership } from "@/domain/dto/user.types.d.ts";
import { User } from "@/domain/entities/user";
import { Team } from "@/domain/entities/team";
import { Subscription } from "@/domain/entities/subscription";
import type { SupabaseClient } from "@supabase/supabase-js";

export class AuthSupabaseRepository implements IAuthRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  private async getProfileAndTeams(
    userId: string
  ): Promise<UserSession | null> {
    const { data, error } = await this.supabase
      .from("profiles")
      .select(
        `
        id, email, name, created_at,
        team_members (
          team_id,
          role_id,
          teams (
            id,
            name,
            created_at,
            created_by,
            trial_ends_at,
            subscriptions (
              id,
              team_id,
              external_id,
              external_customer_id,
              gateway_id,
              status,
              plan_id,
              current_period_end,
              created_at,
              updated_at
            )
          ),
          team_roles (
            name,
            permissions
          )
        )
        `
      )
      .eq("id", userId)
      .single();

    if (error) throw error;
    if (!data) return null;

    // Cast the result to our DTO
    const profile =
      data as unknown as import("@/domain/dto/supabase-joins.types").UserProfileWithTeams;

    const user = new User({
      id: profile.id,
      email: profile.email,
      name: profile.name,
      createdAt: new Date(profile.created_at),
    });

    const teams: TeamMembership[] = profile.team_members.map((membership) => {
      const teamData = membership.teams;
      // Subscriptions is an array in the join result
      const subData = teamData.subscriptions?.[0];

      const subscription = subData
        ? new Subscription({
            id: subData.id,
            teamId: subData.team_id,
            externalId: subData.external_id,
            externalCustomerId: subData.external_customer_id,
            gatewayId: subData.gateway_id,
            status: subData.status as any, // Status enum cast
            planId: subData.plan_id,
            currentPeriodEnd: subData.current_period_end
              ? new Date(subData.current_period_end)
              : null,
            createdAt: subData.created_at
              ? new Date(subData.created_at)
              : new Date(),
            updatedAt: subData.updated_at
              ? new Date(subData.updated_at)
              : new Date(),
          })
        : null;

      return {
        team: new Team({
          id: teamData.id,
          name: teamData.name,
          createdAt: new Date(teamData.created_at),
          createdBy: teamData.created_by!,
          trialEndsAt: teamData.trial_ends_at
            ? new Date(teamData.trial_ends_at)
            : null,
        }),
        role: membership.team_roles?.name || "",
        permissions: membership.team_roles?.permissions || [],
        subscription,
      };
    });

    return {
      user: user,
      teams: teams,
    };
  }

  async getCurrentAuthUser(): Promise<UserSession | null> {
    const { data } = await this.supabase.auth.getSession();
    if (!data.session?.user) return null;

    return await this.getProfileAndTeams(data.session.user.id);
  }

  async signIn(email: string, password: string): Promise<UserSession> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error || !data.user) throw error;

    const session = await this.getProfileAndTeams(data.user.id);
    if (!session)
      throw new Error("Usuário autenticado mas perfil não encontrado.");

    return session;
  }

  async signUp(email: string, password: string, name: string): Promise<User> {
    const { data: authData, error: authError } =
      await this.supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
    if (authError || !authData.user)
      throw authError || new Error("Falha no cadastro");

    const { error: profileError } = await this.supabase
      .from("profiles")
      .insert({
        id: authData.user.id,
        email: authData.user.email!,
        name: name,
      });

    if (profileError) {
      throw new Error(`Falha ao criar perfil: ${profileError.message}`);
    }

    return new User({
      id: authData.user.id,
      email: authData.user.email!,
      name: name,
      createdAt: new Date(),
    });
  }

  async signOut(): Promise<void> {
    await this.supabase.auth.signOut();
  }

  async resetPassword(email: string): Promise<void> {
    const baseUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${baseUrl}/auth/callback?next=/account/update-password`,
    });

    if (error) throw new Error(error.message);
  }

  async updatePassword(password: string): Promise<void> {
    const { error } = await this.supabase.auth.updateUser({
      password: password,
    });

    if (error) throw new Error(error.message);
  }

  async sendRecoveryCode(email: string): Promise<void> {
    const { error } = await this.supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
      },
    });

    if (error) throw new Error(error.message);
  }

  async verifyRecoveryCode(email: string, code: string): Promise<UserSession> {
    const { data, error } = await this.supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });

    if (error || !data.user)
      throw error || new Error("Código inválido ou expirado.");

    const session = await this.getProfileAndTeams(data.user.id);
    if (!session)
      throw new Error("Usuário autenticado mas perfil não encontrado.");

    return session;
  }

  async updateProfile(
    userId: string,
    data: { name: string }
  ): Promise<UserSession> {
    const { error } = await this.supabase
      .from("profiles")
      .update({ name: data.name })
      .eq("id", userId);

    if (error) throw new Error(error.message);

    const session = await this.getProfileAndTeams(userId);
    if (!session) throw new Error("Erro ao recuperar perfil atualizado.");

    return session;
  }
}
