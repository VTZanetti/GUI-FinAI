export interface Category {
  id: string
  name: string
  subcategory: string | null
  isSystem: boolean
}

export interface CategoryPayload {
  name: string
  subcategory?: string | null
}
