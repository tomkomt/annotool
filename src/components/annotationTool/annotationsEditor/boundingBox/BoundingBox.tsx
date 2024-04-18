import { Annotation } from "@/types/annotation"

interface BoundingBoxProps {
    annotation: Annotation,
    annoKey: string,
    widthOffset: number,
    page: number,
    isVisible: boolean
    isSelected: boolean
}

export const BoundingBox = (props: BoundingBoxProps) => {
    const {annotation, annoKey, widthOffset, page, isVisible, isSelected} = props
    return(
        <>
            <div    
                key={`bounding-box-${annotation.boundingBox[0]}-${annotation.boundingBox[1]}-page-${page}-${annoKey}`}
                className={isSelected ? 'highlighted' : ''}
                style={{
                    position: 'absolute',
                    top: annotation.boundingBox[1],
                    left: annotation.boundingBox[0] + widthOffset,
                    border: isSelected ? '2px solid blue' : '2px solid black',
                    backgroundColor: isSelected ? 'lightblue' : 'whitesmoke',
                    height: annotation.boundingBox[3] - annotation.boundingBox[1],
                    width: (annotation.boundingBox[2] + widthOffset) - (annotation.boundingBox[0] + widthOffset),
                    opacity: '0.5',
                    pointerEvents: 'none',
                    display: isVisible ? 'inherit' : 'none'
                }}>
            </div>
        </>
    )
}