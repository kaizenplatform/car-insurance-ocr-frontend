import page1Data from "../data/page1.json"
import page2Data from "../data/page2.json"
import page3Data from "../data/page3.json"
import mainData from "../data/main.json"

export interface FormField {
  question: string
  radio?: {
    type: string
    name: string
    options: string[]
  }
  checkbox?: {
    type: string
    name: string
    options: string[]
  }
  select?: {
    type: string
    selects: Array<{
      id: string
      name: string
      options: string[]
    }>
  }
}

// Create a set of enabled field names from main.json for quick lookup
const enabledFields = new Set<string>()
mainData.forEach((field: FormField) => {
  if (field.radio) enabledFields.add(field.radio.name)
  if (field.checkbox) enabledFields.add(field.checkbox.name)
  if (field.select) {
    field.select.selects.forEach((select) => enabledFields.add(select.name))
  }
})

export function isFieldEnabled(fieldName: string): boolean {
  return enabledFields.has(fieldName)
}

export function getPageFields(pageNumber: number): FormField[] {
  switch (pageNumber) {
    case 1:
      return page1Data as FormField[]
    case 2:
      return page2Data as FormField[]
    case 3:
      return page3Data as FormField[]
    default:
      return []
  }
}

export { page1Data, page2Data, page3Data, mainData }
