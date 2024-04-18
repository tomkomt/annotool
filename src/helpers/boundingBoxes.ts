import { BoundingBoxCoordinates } from "@/types/annotation"

/** 
 * If drawing stopped, raise provisional bounding box to an actual bounding box and put it to new annotation.
*/
export const raiseProvisionalBoundingBox = (
    provisionalBoundingBox: BoundingBoxCoordinates, 
    isDrawing: boolean, 
    actualPage: number, 
    onBoundingBoxCreate: (boundingBox: BoundingBoxCoordinates, pageNumber: number) => void,
    onProvisionalBoundingBoxUpdate: (boundingBox: BoundingBoxCoordinates) => void
) => {
    if(isDrawing) return
    
    // Avoid accidental creating of zero-sized bounding boxes
    if(provisionalBoundingBox[0] !== provisionalBoundingBox[2] && provisionalBoundingBox[1] !== provisionalBoundingBox[3]) {
        onBoundingBoxCreate(provisionalBoundingBox, actualPage)
    }
    
    onProvisionalBoundingBoxUpdate([0,0,0,0])
}
