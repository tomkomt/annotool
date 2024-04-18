import { BoundingBoxCoordinates } from "@/types/annotation"

interface ProvisionalBoundingBoxProps {
    boundingBox: BoundingBoxCoordinates,
    widthOffset: number,
}

export const ProvisionalBoundingBox = (props: ProvisionalBoundingBoxProps) => {
    const {boundingBox, widthOffset} = props

    const top = boundingBox[1]
    const left = boundingBox[0] + widthOffset
    const height = boundingBox[3] - boundingBox[1]
    const width = (boundingBox[2] + widthOffset) - (boundingBox[0] + widthOffset)

    return(
        <>
            <div    
                style={{
                    position: 'absolute',
                    top: height < 0 ? top + height : top,
                    left: width < 0 ? left + width : left,
                    border: '2px solid darkgrey',
                    backgroundColor: 'whitesmoke',
                    height: height < 0 ? height * -1 : height,
                    width: width < 0 ? width * -1 : width,
                    opacity: '0.5',
                    pointerEvents: 'none'
                }}>
            </div>
        </>
    )
}