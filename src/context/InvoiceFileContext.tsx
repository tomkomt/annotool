import { createContext } from "react"

export type InvoiceFileInfo = {
    originalFilename: string
    filename: string
    mimetype: string
}

export const InvoiceFileContext = createContext<InvoiceFileInfo>({} as InvoiceFileInfo)
