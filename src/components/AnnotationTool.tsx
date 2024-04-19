'use client'

import { useState } from "react"
import { UploadInvoice } from "./annotationTool/UploadInvoice"
import { AnnotationsEditor } from "./annotationTool/AnnotationsEditor"
import { InvoiceFileContext, InvoiceFileInfo } from "@/context/InvoiceFileContext"

export const AnnotationTool = () => {
    const [invoiceFile, setInvoiceFile] = useState<InvoiceFileInfo>({} as InvoiceFileInfo)

    return(
        <div>
            <InvoiceFileContext.Provider value={{
                originalFilename: invoiceFile?.originalFilename,
                filename: invoiceFile?.filename,
                mimetype: invoiceFile?.mimetype
            }}>
                {!!!invoiceFile.filename && <UploadInvoice onInvoiceUpload={(originalFilename, filename, mimetype) => {
                    setInvoiceFile({
                        originalFilename,
                        filename,
                        mimetype
                    })
                }} />}
                {!!invoiceFile.filename && <AnnotationsEditor />}
            </InvoiceFileContext.Provider>
        </div>
    )
}