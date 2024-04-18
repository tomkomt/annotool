import { BoundingBoxCoordinates } from "@/types/annotation"

interface ProvisionalBoundingBoxProps {
    boundingBox: BoundingBoxCoordinates,
    widthOffset: number,
}

export const ProvisionalBoundingBox = (props: ProvisionalBoundingBoxProps) => {
    const {boundingBox, widthOffset} = props
    return(
        <>
            <div    
                style={{
                    position: 'absolute',
                    top: boundingBox[1],
                    left: boundingBox[0] + widthOffset,
                    border: '2px solid darkgrey',
                    backgroundColor: 'whitesmoke',
                    height: boundingBox[3] - boundingBox[1],
                    width: (boundingBox[2] + widthOffset) - (boundingBox[0] + widthOffset),
                    opacity: '0.5',
                    pointerEvents: 'none'
                }}>
            </div>
        </>
    )
}