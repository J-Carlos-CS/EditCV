import { createContext, useContext, useState } from 'react'
import { DEFAULT_TEMPLATE } from '../templates/index'

const TemplateContext = createContext(null)

export function TemplateProvider({ children, value }) {
  const [template, setTemplate] = useState(value ?? DEFAULT_TEMPLATE)
  return (
    <TemplateContext.Provider value={{ template, setTemplate }}>
      {children}
    </TemplateContext.Provider>
  )
}

export function TemplateStaticProvider({ children, templateId }) {
  return (
    <TemplateContext.Provider value={{ template: templateId, setTemplate: () => {} }}>
      {children}
    </TemplateContext.Provider>
  )
}

export function useTemplate() {
  return useContext(TemplateContext)
}
