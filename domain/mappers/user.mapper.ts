import { DateUtils } from "@/domain/utils/date.utils";
import { User } from "../entities/user";
import type { UserDTO } from "../dto/user.types.d.ts";
import { Mapper } from "../interfaces/mapper.interface";

export class UserMapperImplementation implements Mapper<User, UserDTO> {
  toDomain(raw: any): User {
    return new User({
      id: raw.id,
      name: raw.name,
      email: raw.email,
      createdAt: DateUtils.parse(raw.createdAt) || DateUtils.now(),
    });
  }

  toDTO(user: User): UserDTO {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}

export const UserMapper = new UserMapperImplementation();
