import Image from "next/image"
import { MouseEvent, SyntheticEvent, useContext, useEffect, useState } from "react"
import { InvoiceFileContext } from "@/context/InvoiceFileContext"
import { AnnotationMap, BoundingBoxCoordinates } from "@/components/AnnotationTool"

interface InvoiceViewProps {
    widthOffset: number
    annotations: AnnotationMap
    selectedAnnotation: string | null
    onBoundingBoxCreate: (boundingBox: BoundingBoxCoordinates, page: number) => void
    onBoundingBoxClick: (annoKey: string | null) => void
    onImageDimensionsLoad: (dimensions: [number, number]) => void
}

interface MousePositionCoordinates {
    relative: [number, number],
    absolute: [number, number]
}

export const InvoiceView = (props: InvoiceViewProps) => {
    const { widthOffset, annotations, selectedAnnotation, onBoundingBoxCreate, onBoundingBoxClick, onImageDimensionsLoad} = props

    const invoiceFile = useContext(InvoiceFileContext)

    const [drawing, setDrawing] = useState<boolean>(false)
    const [provisionalBoundingBox, setProvisionalBoundingBox] = useState<BoundingBoxCoordinates>([0,0,0,0])

    const getMousePosition = (event: MouseEvent<HTMLImageElement>): MousePositionCoordinates => {
        let rect = event.currentTarget.getBoundingClientRect();
        let relativeX = event.clientX - rect.left;
        let relativeY = event.clientY - rect.top;
        let absoluteX = event.pageX
        let absoluteY = event.pageY

        return {
            relative: [relativeX,relativeY],
            absolute: [absoluteX,absoluteY]
        }
    }

    const handleMouseDown = (event: MouseEvent<HTMLImageElement>) => {
        setDrawing(true)

        const { relative: coordinates } = getMousePosition(event)
        setProvisionalBoundingBox([coordinates[0],coordinates[1],coordinates[0],coordinates[1]])
    }

    const handleMouseUp = (event: MouseEvent<HTMLImageElement>) => {
        setDrawing(false)

        const { relative: coordinates } = getMousePosition(event)
        setProvisionalBoundingBox((previous) => [previous[0],previous[1],coordinates[0],coordinates[1]])
    }

    const handleMouseMove = (event: MouseEvent<HTMLImageElement>) => {
        if(drawing) {
            const { relative: coordinates } = getMousePosition(event)
            setProvisionalBoundingBox((previous) => [previous[0],previous[1],coordinates[0],coordinates[1]])
        }
    }

    const handleMouseOut = (event: MouseEvent<HTMLImageElement>) => {
        setDrawing(false)

        const { relative: coordinates } = getMousePosition(event)
        setProvisionalBoundingBox((previous) => [previous[0],previous[1],coordinates[0],coordinates[1]])
    }

    const handleImageOnLoad = (event: SyntheticEvent<HTMLImageElement>) => {
        onImageDimensionsLoad([event.currentTarget.naturalWidth, event.currentTarget.naturalHeight])
    }

    const handleImageClick = (event: MouseEvent<HTMLImageElement>) => {
        const { relative: coordinates } = getMousePosition(event)

        const selectedAnnotation = Array.from(annotations.keys()).find((annoKey) => {
            const annotation = annotations.get(annoKey)
            if(annotation) {
                if(coordinates[0] <= annotation.boundingBox[2] && coordinates[0] >= annotation.boundingBox[0]) {
                    if(coordinates[1] >= annotation.boundingBox[1] && coordinates[1] <= annotation.boundingBox[3]) {
                        return true
                    }
                }    
            }
            return false
        })

        onBoundingBoxClick(selectedAnnotation || null)
    }

    useEffect(() => {
        if(drawing) return
        
        if(provisionalBoundingBox[0] !== provisionalBoundingBox[2] && provisionalBoundingBox[1] !== provisionalBoundingBox[3]) {
            onBoundingBoxCreate(provisionalBoundingBox, 1)
        }
        
        setProvisionalBoundingBox([0,0,0,0])
    }, [drawing])

    return(
        <div>
            <Image
                id="cy-Image-component"
                src={`/invoices/${invoiceFile.fileName}`}
                draggable={false}
                alt={invoiceFile.fileName || 'Invoice file was not found'}
                sizes='100vh'
                style={{
                    width: 'auto',
                    height: '100vh'
                }}
                width={0}
                height={0}
                onClick={handleImageClick}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                onMouseOut={handleMouseOut}
                onLoad={handleImageOnLoad}
            />
            <div id="bounding-boxes-container">
                {!!drawing && (
                    <div key={`provisional-bounding-box-${provisionalBoundingBox[0]}-${provisionalBoundingBox[1]}`}
                        style={{
                            position: 'absolute',
                            top: provisionalBoundingBox[1],
                            left: provisionalBoundingBox[0] + widthOffset,
                            border: '2px solid darkgrey',
                            backgroundColor: 'whitesmoke',
                            height: provisionalBoundingBox[3] - provisionalBoundingBox[1],
                            width: (provisionalBoundingBox[2] + widthOffset) - (provisionalBoundingBox[0] + widthOffset),
                            opacity: '0.5',
                            pointerEvents: 'none'
                    }}></div>
                )}
                {Array.from(annotations, ([annoKey, annotation]) => (
                    <div 
                    key={`bounding-box-${annotation.boundingBox[0]}-${annotation.boundingBox[1]}-${annoKey}`}
                    className={selectedAnnotation === annoKey ? 'highlighted' : ''}
                    style={{
                        position: 'absolute',
                        top: annotation.boundingBox[1],
                        left: annotation.boundingBox[0] + widthOffset,
                        border: selectedAnnotation === annoKey ? '2px solid blue' : '2px solid black',
                        backgroundColor: selectedAnnotation === annoKey ? 'lightblue' : 'whitesmoke',
                        height: annotation.boundingBox[3] - annotation.boundingBox[1],
                        width: (annotation.boundingBox[2] + widthOffset) - (annotation.boundingBox[0] + widthOffset),
                        opacity: '0.5',
                        pointerEvents: 'none'
                    }}></div>
                ))}
            </div>
        </div>
    )
}