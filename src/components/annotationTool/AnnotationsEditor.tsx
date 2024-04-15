import { InvoiceView } from "./annotationsEditor/InvoiceView"
import { FieldsEditor } from "./annotationsEditor/FieldsEditor"
import { useState } from "react"
import { Annotation, AnnotationMap, BoundingBoxCoordinates } from "../AnnotationTool"
import { v4 as uuidv4 } from "uuid"

export const AnnotationsEditor = () => {
    const [annotations, setAnnotations] = useState<AnnotationMap>(new Map())
    const [selectedAnnotation, setSelectedAnnotation] = useState<string|null>(null)
    
    return(
        <div className="columns-2">
            <div>
                <FieldsEditor 
                    annotations={annotations}
                    selectedAnnotation={selectedAnnotation}
                    onAnnotationsChange={setAnnotations}
                    onRowClick={setSelectedAnnotation}
                />
            </div>
            <div>
                <InvoiceView 
                    annotations={annotations} 
                    selectedAnnotation={selectedAnnotation}
                    onBoundingBoxCreate={(boundingBoxToAdd) => setAnnotations((annotations) => {
                        const updatedAnnotations = structuredClone(annotations)
                        updatedAnnotations.set(uuidv4(), {
                            title: '',
                            type: 'free_text',
                            boundingBox: boundingBoxToAdd,
                            misc: {},
                            page: 1
                        })
                        return updatedAnnotations
                    })}
                    onBoundingBoxClick={setSelectedAnnotation}
                />
            </div>
        </div>
    )
}