export interface Mapper<Domain, ResponseDTO, CreateDTO = any> {
  toDomain(raw: any): Domain;
  toDTO(t: Domain): ResponseDTO;
  // Optional method for converting creation DTO to Domain (handling ID generation etc if needed, or just mapping)
  fromCreateDTO?(dto: CreateDTO): Domain;
}
