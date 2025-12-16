"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, Trash2, Loader2, Shield, Crown } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { useTeam } from "@/app/(app)/team/team-provider";
import { usePermission } from "@/hooks/use-permission";
import { notify } from "@/lib/notify-helper";
import { manageMembersUseCase } from "@/infrastructure/dependency-injection";
import type {
  TeamMemberProfileDTO,
  TeamRoleDTO,
} from "@/domain/dto/team.types.d.ts";

interface TeamMembersTabProps {
  members: TeamMemberProfileDTO[];
  roles: TeamRoleDTO[];
  onUpdate: () => Promise<void>;
}

export function TeamMembersTab({
  members,
  roles,
  onUpdate,
}: TeamMembersTabProps) {
  const { session } = useAuth();
  const { currentTeam } = useTeam();
  const { can } = usePermission();

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRoleId, setInviteRoleId] = useState<string>("");

  const isProtectedRole = (roleName?: string) => {
    return roleName === "Proprietário" || roleName === "Owner";
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTeam || !session?.user) return;

    setIsActionLoading(true);
    try {
      await manageMembersUseCase.inviteMember({
        teamId: currentTeam.team.id,
        email: inviteEmail,
        roleId: inviteRoleId === "default" ? null : inviteRoleId,
        invitedBy: session.user.id,
      });

      notify.success("Convite enviado!", {
        description: `Um email foi enviado para ${inviteEmail}.`,
      });

      setInviteEmail("");
      setInviteRoleId("");
      setIsInviteOpen(false);
      await onUpdate();
    } catch (error: unknown) {
      notify.error(error, "enviar o convite");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleUpdateMemberRole = async (memberId: string, roleId: string) => {
    if (!currentTeam || !session?.user) return;
    try {
      await manageMembersUseCase.updateMemberRole({
        teamId: currentTeam.team.id,
        memberId,
        userId: session.user.id,
        roleId: roleId === "default" ? null : roleId,
      });
      notify.success("Cargo atualizado com sucesso!");
      await onUpdate();
    } catch (error: unknown) {
      notify.error(error, "atualizar o cargo");
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!currentTeam || !session?.user) return;
    if (!confirm("Remover este membro da equipe? Ele perderá acesso a equipe."))
      return;

    setIsActionLoading(true);
    try {
      await manageMembersUseCase.removeMember(
        currentTeam.team.id,
        memberId,
        session.user.id
      );
      notify.success("Membro removido", {
        description: "A lista de acesso foi atualizada.",
      });
      await onUpdate();
    } catch (error: unknown) {
      notify.error(error, "remover o membro");
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Membros Ativos
          </h3>
          <p className="text-sm text-muted-foreground">
            Gerencie quem tem acesso à sua equipe.
          </p>
        </div>
        {can("MANAGE_TEAM") && (
          <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto shadow-sm">
                <UserPlus className="w-4 h-4 mr-2" /> Convidar Membro
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Convidar Membro</DialogTitle>
                <DialogDescription>
                  Envie um convite por email para adicionar um novo membro.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleInviteMember} className="space-y-4 mt-2">
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                    placeholder="exemplo@email.com"
                  />
                </div>
                <div>
                  <Label>Cargo Inicial</Label>
                  <Select value={inviteRoleId} onValueChange={setInviteRoleId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cargo..." />
                    </SelectTrigger>
                    <SelectContent>
                      {roles
                        .filter((r) => !isProtectedRole(r.name))
                        .map((r) => (
                          <SelectItem key={r.id} value={r.id}>
                            {r.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isActionLoading || !inviteRoleId}
                >
                  {isActionLoading ? (
                    <Loader2 className="animate-spin mr-2" />
                  ) : (
                    "Enviar Convite"
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member) => {
          const memberIsOwner = isProtectedRole(member.teamRole?.name);
          const isMe = member.id === session?.user?.id;

          return (
            <Card
              key={member.id}
              className={`overflow-hidden transition-all hover:shadow-md border-muted ${
                memberIsOwner
                  ? "bg-gradient-to-br from-secondary/20 to-secondary/5 border-secondary/20"
                  : "bg-card hover:border-primary/20"
              }`}
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div
                      className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm shadow-sm ${
                        memberIsOwner
                          ? "bg-secondary text-secondary-foreground"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {member.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-medium truncate text-sm text-foreground">
                          {member.name}
                        </p>
                        {memberIsOwner && (
                          <Crown className="w-3.5 h-3.5 text-secondary-foreground fill-secondary-foreground flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {member.email}
                      </p>
                    </div>
                  </div>
                  {isMe && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] flex-shrink-0"
                    >
                      Você
                    </Badge>
                  )}
                </div>

                <div className="space-y-3 pt-3 border-t">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs text-muted-foreground font-normal">
                      Cargo
                    </Label>

                    {memberIsOwner ? (
                      <div className="flex items-center gap-2 text-xs font-medium text-secondary-foreground bg-secondary/50 px-2.5 py-1.5 rounded-md border border-secondary/50 w-full">
                        <Shield className="w-3 h-3" />
                        {member.teamRole?.name}
                      </div>
                    ) : can("MANAGE_TEAM") && !isMe ? (
                      <Select
                        value={member.roleId || ""}
                        onValueChange={(val) =>
                          handleUpdateMemberRole(member.id, val)
                        }
                      >
                        <SelectTrigger className="h-8 text-xs w-full">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {roles
                            .filter((r) => !isProtectedRole(r.name))
                            .map((r) => (
                              <SelectItem key={r.id} value={r.id}>
                                {r.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="text-xs font-medium bg-muted/50 px-2.5 py-1.5 rounded-md border w-full">
                        {member.teamRole ? member.teamRole.name : "Sem cargo"}
                      </div>
                    )}
                  </div>

                  {can("MANAGE_TEAM") && !isMe && !memberIsOwner && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 h-8 text-xs"
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      <Trash2 className="w-3 h-3 mr-2" /> Remover
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
