import { InvoiceView } from "./annotationsEditor/InvoiceView"
import { FieldsEditor } from "./annotationsEditor/FieldsEditor"
import { useContext, useEffect, useMemo, useRef, useState } from "react"
import { AnnotationMap, BoundingBoxCoordinates } from "../AnnotationTool"
import { v4 as uuidv4 } from "uuid"
import { InvoiceFileContext } from "@/context/InvoiceFileContext"
import { APIAnnotationsParams } from "@/app/api/annotations/route"
import { APIErrorResponse } from "@/types/api"
import { InvoicePdfView } from "./annotationsEditor/InvoicePdfView"

export const AnnotationsEditor = () => {
    const [annotations, setAnnotations] = useState<AnnotationMap>(new Map())
    const [selectedAnnotation, setSelectedAnnotation] = useState<string|null>(null)
    const [imageDimensions, setImageDimensions] = useState<[number, number]>([0, 0])
    const editorHeight = window.innerHeight

    const imageResizeRatio = useMemo(() => imageDimensions[1] > 0 && editorHeight > 0 ? imageDimensions[1] / editorHeight : 1, [editorHeight, imageDimensions])

    const invoiceFile = useContext(InvoiceFileContext)

    const editorRef = useRef(null)
    const [offsetWidth, setOffsetWidth] = useState(0);

    const updateOffsetWidth = () => {
        // There is a correction + 5 pixes coming from some padding or margin
        setOffsetWidth((editorRef.current as unknown as HTMLDivElement)?.offsetWidth / 2 + 5)
    }

    const handleWindowResize = () => {
        updateOffsetWidth()
        window.addEventListener('resize', updateOffsetWidth)
        return () => window.removeEventListener('resize', updateOffsetWidth)
    }
    useEffect(handleWindowResize, [])

    const handleEditorSubmit = () => {
        const recalculatedAnnotations = Array.from(annotations.values()).map((annotation) => ({
            ...annotation,
            boundingBox: annotation.boundingBox.map(bbValue => bbValue * imageResizeRatio)
        }))

        fetch('/api/annotations', {
            method: 'POST',
            body: JSON.stringify({
                invoiceFileName: invoiceFile.fileName,
                annotations: recalculatedAnnotations
            } as unknown as APIAnnotationsParams)
        })
        .then(response => {
            const filename =  response.headers.get('Content-Disposition')?.split('filename=')[1] || 'file.json'
            response.blob().then(blob => {
                let url = window.URL.createObjectURL(blob);
                let a = document.createElement('a');
                a.href = url;
                a.download = filename;
                a.click();
            });
        })
        .catch((error: APIErrorResponse) => console.error(error))
    }

    const handleBoundingBoxCreate = (boundingBoxToAdd: BoundingBoxCoordinates, page: number) => {
        setAnnotations((annotations) => {
            const updatedAnnotations = structuredClone(annotations)
            updatedAnnotations.set(uuidv4(), {
                title: '',
                type: 'free_text',
                boundingBox: boundingBoxToAdd,
                misc: {},
                page: page
            })
            return updatedAnnotations
        })
    }

    return(
        <div className="columns-2" ref={editorRef}>
            <div>
                <FieldsEditor 
                    annotations={annotations}
                    selectedAnnotation={selectedAnnotation}
                    onAnnotationsChange={setAnnotations}
                    onRowClick={setSelectedAnnotation}
                    onEditorSubmit={handleEditorSubmit}
                />
            </div>
            <div>
                {invoiceFile.fileType === 'application/pdf' && (
                    <InvoicePdfView 
                        widthOffset={offsetWidth}
                        annotations={annotations} 
                        selectedAnnotation={selectedAnnotation}
                        onBoundingBoxCreate={handleBoundingBoxCreate}
                        onBoundingBoxClick={setSelectedAnnotation}
                        onImageDimensionsLoad={setImageDimensions}
                    />
                )}
                {invoiceFile.fileType !== 'application/pdf' && (
                    <InvoiceView 
                        widthOffset={offsetWidth}
                        annotations={annotations} 
                        selectedAnnotation={selectedAnnotation}
                        onBoundingBoxCreate={handleBoundingBoxCreate}
                        onBoundingBoxClick={setSelectedAnnotation}
                        onImageDimensionsLoad={setImageDimensions}
                    />
                )}
            </div>
        </div>
    )
}