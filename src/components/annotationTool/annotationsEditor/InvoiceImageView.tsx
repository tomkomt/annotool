import Image from "next/image"
import { SyntheticEvent, useContext, useEffect, useState } from "react"
import { InvoiceFileContext } from "@/context/InvoiceFileContext"
import { AnnotationMap, BoundingBoxCoordinates } from "@/types/annotation"
import { handleDrawingEnd, handleDrawingStart, handleDrawingUpdate, handleImageClick } from "@/helpers/mouse"
import { BoundingBox } from "./boundingBox/BoundingBox"
import { ProvisionalBoundingBox } from "./boundingBox/ProvisionalBoundingBox"
import { raiseProvisionalBoundingBox } from "@/helpers/boundingBoxes"

interface InvoiceImageViewProps {
    widthOffset: number
    annotations: AnnotationMap
    selectedAnnotation: string | null
    onBoundingBoxCreate: (boundingBox: BoundingBoxCoordinates, page: number) => void
    onBoundingBoxClick: (annoKey: string | null) => void
    onImageDimensionsLoad: (dimensions: [number, number]) => void
}

export const InvoiceImageView = (props: InvoiceImageViewProps) => {
    const { widthOffset, annotations, selectedAnnotation, onBoundingBoxCreate, onBoundingBoxClick, onImageDimensionsLoad} = props

    const invoiceFile = useContext(InvoiceFileContext)

    const [drawing, setDrawing] = useState<boolean>(false)
    const [provisionalBoundingBox, setProvisionalBoundingBox] = useState<BoundingBoxCoordinates>([0,0,0,0])

    /** 
     * After image is loaded, get width and height of source image.
     * Used to calculate size ratio.
     */
    const handleImageOnLoad = (event: SyntheticEvent<HTMLImageElement>) => {
        onImageDimensionsLoad([event.currentTarget.naturalWidth, event.currentTarget.naturalHeight])
    }

    /** 
     * If drawing stopped, raise provisional bounding box to an actual bounding box and put it to new annotation.
    */
    useEffect(() => raiseProvisionalBoundingBox(provisionalBoundingBox, drawing, 1, onBoundingBoxCreate, setProvisionalBoundingBox), [drawing])

    return(
        <div>
            <Image
                id="cy-Image-component"
                src={`/invoices/${invoiceFile.filename}`}
                draggable={false}
                alt={invoiceFile.filename || 'Invoice file was not found'}
                sizes='100vh'
                style={{
                    width: 'auto',
                    height: '100vh'
                }}
                width={0}
                height={0}
                onClick={(e) => handleImageClick(e, annotations, onBoundingBoxClick)}
                onMouseDown={(e) => handleDrawingStart(e, setDrawing, setProvisionalBoundingBox)}
                onMouseUp={(e) => handleDrawingEnd(e, setDrawing, setProvisionalBoundingBox)}
                onMouseMove={(e) => handleDrawingUpdate(e, drawing, setProvisionalBoundingBox)}
                onMouseOut={(e) => handleDrawingEnd(e, setDrawing, setProvisionalBoundingBox)}
                onLoad={handleImageOnLoad}
            />
            <div id="bounding-boxes-container">
                {!!drawing && (
                    <ProvisionalBoundingBox boundingBox={provisionalBoundingBox} widthOffset={widthOffset} />
                )}
                {Array.from(annotations, ([annoKey, annotation]) => (
                    <BoundingBox annotation={annotation} annoKey={annoKey} widthOffset={widthOffset} page={1} isVisible={true} isSelected={selectedAnnotation === annoKey}/>
                ))}
            </div>
        </div>
    )
}