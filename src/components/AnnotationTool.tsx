'use client'

import { useState } from "react"
import { UploadInvoice } from "./annotationTool/UploadInvoice"
import { AnnotationsEditor } from "./annotationTool/AnnotationsEditor"
import { InvoiceFileContext } from "@/context/InvoiceFileContext"

export type BoundingBoxCoordinates = [number, number, number, number]

export type Annotation = {
    title: string,
    type: string,
    boundingBox: BoundingBoxCoordinates,
    misc: {
        currencyType?: string
    },
    page: number
}

export type AnnotationMap = Map<string, Annotation>

export const AnnotationTool = () => {
    const [invoiceFile, setInvoiceFile] = useState<string|null>(null)

    return(
        <div>
            <InvoiceFileContext.Provider value={{
                fileName: invoiceFile
            }}>
                {!!!invoiceFile && <UploadInvoice handleInvoiceUpload={setInvoiceFile} />}
                {!!invoiceFile && <AnnotationsEditor />}
            </InvoiceFileContext.Provider>
        </div>
    )
}