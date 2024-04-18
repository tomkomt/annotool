import { MouseEvent } from "react"
import { MousePositionCoordinates } from "@/types/mouse";
import { Annotation, AnnotationMap, BoundingBoxCoordinates } from "@/types/annotation";

export const getMousePosition = (event: MouseEvent<HTMLImageElement | HTMLDivElement>): MousePositionCoordinates => {
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

/**
 * Catch start of bounding box drawing.
 * Create provisional bounding box of 0 height and width.
 */
export const handleDrawingStart = (
    event: MouseEvent<HTMLImageElement | HTMLDivElement>, 
    onDrawingChange: (drawing: boolean) => void, 
    onBoundingBoxUpdate: (boundingBox: BoundingBoxCoordinates | ((prevState: BoundingBoxCoordinates) => BoundingBoxCoordinates)) => void
) => {
    onDrawingChange(true)

    const { relative: coordinates } = getMousePosition(event)
    onBoundingBoxUpdate([coordinates[0],coordinates[1],coordinates[0],coordinates[1]])
}

/**
 * Catch end of bounding box drawing.
 * Updates dimensions of provisional bounding box
 */
export const handleDrawingEnd = (
    event: MouseEvent<HTMLImageElement | HTMLDivElement>, 
    onDrawingChange: (drawing: boolean) => void, 
    onBoundingBoxUpdate: (boundingBox: BoundingBoxCoordinates | ((prevState: BoundingBoxCoordinates) => BoundingBoxCoordinates)) => void
) => {
    onDrawingChange(false)

    const { relative: coordinates } = getMousePosition(event)
    onBoundingBoxUpdate((previous) => [previous[0],previous[1],coordinates[0],coordinates[1]])
}

/**
 * Updates coordinates of provisional bounding box as mouse moves.
 * It allows to display provisional bounding box.
 */
export const handleDrawingUpdate = (
    event: MouseEvent<HTMLImageElement | HTMLDivElement>, 
    isDrawing: boolean,
    onBoundingBoxUpdate: (boundingBox: BoundingBoxCoordinates | ((prevState: BoundingBoxCoordinates) => BoundingBoxCoordinates)) => void
) => {
    if(isDrawing) {
        const { relative: coordinates } = getMousePosition(event)
        onBoundingBoxUpdate((previous) => [previous[0],previous[1],coordinates[0],coordinates[1]])
    }
}

/**
 * Finds bounding box that should be selected according to mouse poisition
 */
export const handleImageClick = (
    event: MouseEvent<HTMLImageElement | HTMLDivElement>, 
    annotations: AnnotationMap, 
    onBoundingBoxClick: (annoKey: string | null) => void
) => {
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