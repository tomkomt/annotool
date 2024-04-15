import Image from "next/image"
import { MouseEvent, SyntheticEvent, useContext, useEffect, useState } from "react"
import { InvoiceFileContext } from "@/context/InvoiceFileContext"
import { Annotation, AnnotationMap, BoundingBoxCoordinates } from "@/components/AnnotationTool"

interface InvoiceViewProps {
    annotations: AnnotationMap
    onBoundingBoxCreate: (boundingBox: BoundingBoxCoordinates) => void
}

interface MousePositionCoordinates {
    relative: [number, number],
    absolute: [number, number]
}

export const InvoiceView = (props: InvoiceViewProps) => {
    const { annotations, onBoundingBoxCreate} = props

    const invoiceFile = useContext(InvoiceFileContext)

    const [imageDimensions, setImageDimensions] = useState<[number, number]>([0, 0])

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

        const { absolute: coordinates } = getMousePosition(event)
        setProvisionalBoundingBox([coordinates[0],coordinates[1],coordinates[0],coordinates[1]])
    }

    const handleMouseUp = (event: MouseEvent<HTMLImageElement>) => {
        setDrawing(false)

        const { absolute: coordinates } = getMousePosition(event)
        setProvisionalBoundingBox((previous) => [previous[0],previous[1],coordinates[0],coordinates[1]])
    }

    const handleMouseMove = (event: MouseEvent<HTMLImageElement>) => {
        if(drawing) {
            const { absolute: coordinates } = getMousePosition(event)
            setProvisionalBoundingBox((previous) => [previous[0],previous[1],coordinates[0],coordinates[1]])
        }
    }

    const handleMouseOut = (event: MouseEvent<HTMLImageElement>) => {
        setDrawing(false)

        const { absolute: coordinates } = getMousePosition(event)
        setProvisionalBoundingBox((previous) => [previous[0],previous[1],coordinates[0],coordinates[1]])
    }

    const handleImageOnLoad = (event: SyntheticEvent<HTMLImageElement>) => {
        setImageDimensions([event.currentTarget.naturalWidth, event.currentTarget.naturalHeight])
    }

    useEffect(() => {
        if(drawing) return
        
        if(JSON.stringify(provisionalBoundingBox) !== JSON.stringify([0,0,0,0])) {
            onBoundingBoxCreate(provisionalBoundingBox)
        }
        setProvisionalBoundingBox([0,0,0,0])
    }, [drawing])

    return(
        <div>
            <Image
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
                            left: provisionalBoundingBox[0],
                            border: '1px solid red',
                            backgroundColor: 'whitesmoke',
                            height: provisionalBoundingBox[3] - provisionalBoundingBox[1],
                            width: provisionalBoundingBox[2] - provisionalBoundingBox[0],
                            opacity: '0.5',
                            pointerEvents: 'none'
                    }}></div>
                )}
                {Array.from(annotations.values()).map((annotation, annoIndex) => 
                    <div key={`bounding-box-${annotation.boundingBox[0]}-${annotation.boundingBox[1]}-${annoIndex}`}
                    style={{
                        position: 'absolute',
                        top: annotation.boundingBox[1],
                        left: annotation.boundingBox[0],
                        border: '1px solid black',
                        backgroundColor: 'whitesmoke',
                        height: annotation.boundingBox[3] - annotation.boundingBox[1],
                        width: annotation.boundingBox[2] - annotation.boundingBox[0],
                        opacity: '0.5',
                        pointerEvents: 'none'
                    }}></div>
                )}
            </div>
        </div>
    )
}