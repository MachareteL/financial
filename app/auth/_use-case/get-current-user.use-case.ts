import { IAuthRepository } from "@/domain/IRepositories/IAuth.repository"; 

// A Camada de Domínio já define o que é um usuário autêntico para o Use Case.
type AuthUser = { userId: string; email: string } | null;

export class GetCurrentUser {
  // A injeção de dependência acontece aqui (recebemos o contrato)
  constructor(private authRepo: IAuthRepository) {} 

  async execute(): Promise<AuthUser> {
    return this.authRepo.getCurrentAuthUser();
  }
}
