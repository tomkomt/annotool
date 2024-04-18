import { InvoiceImageView } from "./annotationsEditor/InvoiceImageView"
import { FieldsEditor } from "./annotationsEditor/FieldsEditor"
import { useContext, useEffect, useMemo, useRef, useState } from "react"
import { v4 as uuidv4 } from "uuid"
import { InvoiceFileContext } from "@/context/InvoiceFileContext"
import { APIAnnotationsParams } from "@/app/api/annotations/route"
import { APIErrorResponse } from "@/types/api"
import { InvoicePdfView } from "./annotationsEditor/InvoicePdfView"
import { AnnotationMap, BoundingBoxCoordinates } from "@/types/annotation"

export const AnnotationsEditor = () => {
    const invoiceFile = useContext(InvoiceFileContext)

    const editorRef = useRef(null)

    const [offsetWidth, setOffsetWidth] = useState(0);
    const [annotations, setAnnotations] = useState<AnnotationMap>(new Map())
    const [selectedAnnotation, setSelectedAnnotation] = useState<string|null>(null)
    const [imageDimensions, setImageDimensions] = useState<[number, number]>([0, 0])

    const editorHeight = window.innerHeight
    const imageResizeRatio = useMemo(() => imageDimensions[1] > 0 && editorHeight > 0 ? imageDimensions[1] / editorHeight : 1, [editorHeight, imageDimensions])

    /**
     * To get better precision of bounding box placement,
     * width of FieldsEditor needs to be taken into account.
     */
    const updateOffsetWidth = () => {
        // There is a correction + 5 pixes coming from some padding or margin
        setOffsetWidth((editorRef.current as unknown as HTMLDivElement)?.offsetWidth / 2 + 5)
    }

    /**
     * If window is resized, that can be caught and offsetWidth recalculated
     */
    const handleWindowResize = () => {
        updateOffsetWidth()
        window.addEventListener('resize', updateOffsetWidth)
        return () => window.removeEventListener('resize', updateOffsetWidth)
    }
    useEffect(handleWindowResize, [])

    /**
     * If editor is submitted, send annotations to /api/annotations to generate json file.
     * Dimensions of bounding boxes are recalculated beforewards with ratio of image height and window height
     */
    const handleEditorSubmit = async () => {
        const abortController = new AbortController();
        const signal = abortController.signal;

        const recalculatedAnnotations = Array.from(annotations.values()).map((annotation) => ({
            ...annotation,
            boundingBox: annotation.boundingBox.map(bbValue => bbValue * imageResizeRatio)
        }))

        if(invoiceFile) {
            const response = await fetch('/api/annotations', {
                method: 'POST',
                body: JSON.stringify({
                    invoiceFileName: invoiceFile.filename,
                    annotations: recalculatedAnnotations
                } as unknown as APIAnnotationsParams),
                signal
            })
            const filename =  response.headers.get('Content-Disposition')?.split('filename=')[1] || 'file.json'
            const blob = await response.blob()
            let url = window.URL.createObjectURL(blob);
            let a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();

            abortController.abort()
        }
    }

    /**
     * Catch creating of bounding box in InvoiceView/InvoicePdfView and add it to new annotation.
     */
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
                {!!invoiceFile && invoiceFile.mimetype === 'application/pdf' && (
                    <InvoicePdfView 
                        widthOffset={offsetWidth}
                        annotations={annotations} 
                        selectedAnnotation={selectedAnnotation}
                        onBoundingBoxCreate={handleBoundingBoxCreate}
                        onBoundingBoxClick={setSelectedAnnotation}
                    />
                )}
                {!!invoiceFile && invoiceFile.mimetype !== 'application/pdf' && (
                    <InvoiceImageView 
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