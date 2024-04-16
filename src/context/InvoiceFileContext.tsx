import { createContext } from "react"

type InvoiceFile = {
    fileName: string | null
    fileType: string | null
}

export const InvoiceFileContext = createContext<InvoiceFile>({} as InvoiceFile)
