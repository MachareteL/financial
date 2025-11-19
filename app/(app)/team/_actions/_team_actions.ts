'use server'

import { 
  getTeamDataUseCase, 
  manageRolesUseCase, 
  manageMembersUseCase,
  createTeamUseCase 
} from "@/infrastructure/dependency-injection"
import { revalidatePath } from "next/cache"
import type { 
  CreateTeamRoleDTO, 
  UpdateTeamRoleDTO, 
  InviteMemberDTO, 
  UpdateMemberRoleDTO,
  CreateTeamDTO
} from "@/domain/dto/team.types.d.ts"


export async function getTeamDataAction(teamId: string) {
  const data = await getTeamDataUseCase.execute(teamId)
  return JSON.parse(JSON.stringify(data))
}

// --- MEMBROS ---
export async function inviteMemberAction(dto: InviteMemberDTO) {
  await manageMembersUseCase.inviteMember(dto)
  revalidatePath('/team')
}

export async function updateMemberRoleAction(dto: UpdateMemberRoleDTO) {
  await manageMembersUseCase.updateMemberRole(dto)
  revalidatePath('/team')
}

export async function removeMemberAction(teamId: string, memberId: string) {
  await manageMembersUseCase.removeMember(teamId, memberId)
  revalidatePath('/team')
}

export async function cancelInviteAction(inviteId: string, teamId: string) {
  await manageMembersUseCase.cancelInvite(inviteId, teamId)
  revalidatePath('/team')
}


export async function createRoleAction(dto: CreateTeamRoleDTO) {
  await manageRolesUseCase.createRole(dto)
  revalidatePath('/team')
}

export async function updateRoleAction(dto: UpdateTeamRoleDTO) {
  await manageRolesUseCase.updateRole(dto)
  revalidatePath('/team')
}

export async function deleteRoleAction(roleId: string, teamId: string) {
  await manageRolesUseCase.deleteRole(roleId, teamId)
  revalidatePath('/team')
}

export async function createTeamAction(dto: CreateTeamDTO) {
  const team = await createTeamUseCase.execute(dto)
  return JSON.parse(JSON.stringify(team))
}