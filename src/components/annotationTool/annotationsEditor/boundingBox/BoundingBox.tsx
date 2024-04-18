import { Annotation } from "@/types/annotation"

interface BoundingBoxProps {
    annotation: Annotation,
    widthOffset: number,
    isVisible: boolean
    isSelected: boolean
}

export const BoundingBox = (props: BoundingBoxProps) => {
    const {annotation, widthOffset, isVisible, isSelected} = props

    const top = annotation.boundingBox[1]
    const left = annotation.boundingBox[0] + widthOffset
    const height = annotation.boundingBox[3] - annotation.boundingBox[1]
    const width = (annotation.boundingBox[2] + widthOffset) - (annotation.boundingBox[0] + widthOffset)

    return(
        <>
            <div    
                className={isSelected ? 'highlighted' : ''}
                style={{
                    position: 'absolute',
                    top: height < 0 ? top + height : top,
                    left: width < 0 ? left + width : left,
                    border: isSelected ? '2px solid blue' : '2px solid black',
                    backgroundColor: isSelected ? 'lightblue' : 'whitesmoke',
                    height: height < 0 ? height * -1 : height,
                    width: width < 0 ? width * -1 : width,
                    opacity: '0.5',
                    pointerEvents: 'none',
                    display: isVisible ? 'inherit' : 'none'
                }}>
            </div>
        </>
    )
}