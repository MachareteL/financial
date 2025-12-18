import { DateUtils } from "@/domain/utils/date.utils";
import { User } from "../entities/user";
import type { UserDTO } from "../dto/user.types.d.ts";
import type { Database } from "../dto/database.types.d.ts";
import { Mapper } from "../interfaces/mapper.interface";

// Use 'profiles' table type which mirrors Auth users
type UserRow = Database["public"]["Tables"]["profiles"]["Row"];

export class UserMapperImplementation implements Mapper<User, UserDTO> {
  toDomain(raw: UserRow): User {
    return new User({
      id: raw.id,
      name: raw.name,
      email: raw.email,
      createdAt: DateUtils.parse(raw.created_at) || DateUtils.now(),
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
