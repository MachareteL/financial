import type { CategoryProps } from '../entities/category'

export type CategoryDetailsDTO = Pick<
  CategoryProps,
  'id' | 'name' | 'classification'
>

export type CreateCategoryDTO = {
  name: string
  classification: 'necessidades' | 'desejos' | 'poupanca'
  teamId: string
}

export type UpdateCategoryDTO = {
  categoryId: string
  teamId: string
  name?: string
  classification?: 'necessidades' | 'desejos' | 'poupanca'
}

export type DeleteCategoryDTO = {
  categoryId: string
  teamId: string
}