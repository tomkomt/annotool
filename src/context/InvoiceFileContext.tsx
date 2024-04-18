import { createContext } from "react"

export type InvoiceFileInfo = {
    filename: string
    mimetype: string
}

export const InvoiceFileContext = createContext<InvoiceFileInfo>({} as InvoiceFileInfo)
