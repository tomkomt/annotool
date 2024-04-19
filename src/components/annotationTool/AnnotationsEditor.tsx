import { InvoiceImageView } from "./annotationsEditor/InvoiceImageView"
import { FieldsEditor } from "./annotationsEditor/FieldsEditor"
import { useContext, useEffect, useMemo, useRef, useState } from "react"
import { v4 as uuidv4 } from "uuid"
import { InvoiceFileContext } from "@/context/InvoiceFileContext"
import { APIAnnotationsParams } from "@/app/api/annotations/route"
import { InvoicePdfView } from "./annotationsEditor/InvoicePdfView"
import { AnnotationMap, BoundingBoxCoordinates } from "@/types/annotation"
import { Spinner } from "./common/Spinner"

export const AnnotationsEditor = () => {
    const invoiceFile = useContext(InvoiceFileContext)

    const editorRef = useRef(null)

    const [offsetWidth, setOffsetWidth] = useState(0);
    const [annotations, setAnnotations] = useState<AnnotationMap>(new Map())
    const [selectedAnnotation, setSelectedAnnotation] = useState<string|null>(null)
    const [imageDimensions, setImageDimensions] = useState<[number, number]>([0, 0])

    const [loading, setLoading] = useState<boolean>(false)
    const [submitting, setSubmitted] = useState<boolean>(false)

    const editorHeight = window.innerHeight
    const imageResizeRatio = useMemo(() => imageDimensions[1] > 0 && editorHeight > 0 ? imageDimensions[1] / editorHeight : 1, [editorHeight, imageDimensions])

    /** 
     * Start spinner if loading content is image
     * PDF reader has it's own loading indicator
    */
    useEffect(() => {
        if(invoiceFile.mimetype !== 'application/pdf')
            setLoading(true)
    }, [invoiceFile])

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
        setSubmitted(true)

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
                    originalFilename: invoiceFile.originalFilename,
                    invoiceFilename: invoiceFile.filename,
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
            setSubmitted(false)
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
        <>
           {!!loading && <Spinner />}
            <div className="columns-2" ref={editorRef}>
                <div>
                    <FieldsEditor 
                        annotations={annotations}
                        selectedAnnotation={selectedAnnotation}
                        onAnnotationsChange={setAnnotations}
                        onRowClick={setSelectedAnnotation}
                        onEditorSubmit={handleEditorSubmit}
                        isLoading={loading}
                        isSubmitting={submitting}
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
                            onImageDimensionsLoad={(payload) => {
                                setLoading(false)
                                setImageDimensions(payload)}
                            }
                        />
                    )}
                </div>
            </div>
        </>
    )
}