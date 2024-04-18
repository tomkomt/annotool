export type BoundingBoxCoordinates = [number, number, number, number]

export interface Annotation {
    title: string,
    type: string,
    boundingBox: BoundingBoxCoordinates,
    misc: {
        currencyType?: string
    },
    page: number
}

export type AnnotationMap = Map<string, Annotation>
