import { MouseEvent, useContext, useEffect, useRef, useState } from "react"
import { InvoiceFileContext } from "@/context/InvoiceFileContext"
import { AnnotationMap, BoundingBoxCoordinates } from "@/components/AnnotationTool"
import { Document, Page } from 'react-pdf'

import { pdfjs } from 'react-pdf';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();

interface InvoicePdfViewProps {
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

export const InvoicePdfView = (props: InvoicePdfViewProps) => {
    const { widthOffset, annotations, selectedAnnotation, onBoundingBoxCreate, onBoundingBoxClick, onImageDimensionsLoad} = props

    const invoiceFile = useContext(InvoiceFileContext)

    const [drawing, setDrawing] = useState<boolean>(false)
    const [provisionalBoundingBox, setProvisionalBoundingBox] = useState<BoundingBoxCoordinates>([0,0,0,0])

    const [numPages, setNumPages] = useState<number>(0)
    const [actualPage, setActualPage] = useState<number>(0)

    const getMousePosition = (event: MouseEvent<any>): MousePositionCoordinates => {
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

    const handleMouseDown = (event: MouseEvent<HTMLDivElement>) => {
        setDrawing(true)

        const { relative: coordinates } = getMousePosition(event)
        setProvisionalBoundingBox([coordinates[0],coordinates[1],coordinates[0],coordinates[1]])
    }

    const handleMouseUp = (event: MouseEvent<HTMLImageElement | HTMLDivElement>) => {
        setDrawing(false)

        const { relative: coordinates } = getMousePosition(event)
        setProvisionalBoundingBox((previous) => [previous[0],previous[1],coordinates[0],coordinates[1]])
    }

    const handleMouseMove = (event: MouseEvent<HTMLImageElement | HTMLDivElement>) => {
        if(drawing) {
            const { relative: coordinates } = getMousePosition(event)
            setProvisionalBoundingBox((previous) => [previous[0],previous[1],coordinates[0],coordinates[1]])
        }
    }

    const handleMouseOut = (event: MouseEvent<HTMLImageElement | HTMLDivElement>) => {
        setDrawing(false)

        const { relative: coordinates } = getMousePosition(event)
        setProvisionalBoundingBox((previous) => [previous[0],previous[1],coordinates[0],coordinates[1]])
    }

    const handleImageClick = (event: MouseEvent<HTMLImageElement | HTMLDivElement>) => {
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
            onBoundingBoxCreate(provisionalBoundingBox, actualPage)
        }
        
        setProvisionalBoundingBox([0,0,0,0])
    }, [drawing])

    const canvasRef = useRef<HTMLDivElement | null>(null)

    const [isRendered, setIsRendered] = useState<boolean>(false)

    const onRenderSuccess = () => {
        setIsRendered(true);
    }

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number}) => {
        setNumPages(numPages)
        setActualPage(1)
    }

    const handleChangePage = (offset: number) => {
        setActualPage((previous) => previous + offset)
    }

    const goNextPage = () => handleChangePage(1)

    const goPreviousPage = () => handleChangePage(-1)

    useEffect(() => {
        if(isRendered && canvasRef && canvasRef.current) {
            canvasRef.current.addEventListener('mousedown', (event: MouseEventInit) => handleMouseDown(event as unknown as MouseEvent<HTMLDivElement>))
            canvasRef.current.addEventListener('mouseup', (event: MouseEventInit) => handleMouseUp(event as unknown as MouseEvent<HTMLDivElement>))
            canvasRef.current.addEventListener('mousemove', (event: MouseEventInit) => handleMouseMove(event as unknown as MouseEvent<HTMLDivElement>))
            canvasRef.current.addEventListener('mouseout', (event: MouseEventInit) => handleMouseOut(event as unknown as MouseEvent<HTMLDivElement>))
            canvasRef.current.addEventListener('click', (event: MouseEventInit) => handleImageClick(event as unknown as MouseEvent<HTMLDivElement>))
        }

        return () => {
            if(canvasRef && canvasRef.current) {
                canvasRef.current.removeEventListener('mousedown', (event: MouseEventInit) => handleMouseDown(event as unknown as MouseEvent<HTMLDivElement>))
                canvasRef.current.removeEventListener('mouseup', (event: MouseEventInit) => handleMouseUp(event as unknown as MouseEvent<HTMLDivElement>))
                canvasRef.current.removeEventListener('mousemove', (event: MouseEventInit) => handleMouseMove(event as unknown as MouseEvent<HTMLDivElement>))
                canvasRef.current.removeEventListener('mouseout', (event: MouseEventInit) => handleMouseOut(event as unknown as MouseEvent<HTMLDivElement>))
                canvasRef.current.removeEventListener('click', (event: MouseEventInit) => handleImageClick(event as unknown as MouseEvent<HTMLDivElement>))
            }
        }
    }, [isRendered])

    return(
        <div>
            <div>
                <Document 
                    file={`/invoices/${invoiceFile.fileName}`}
                    onLoadSuccess={onDocumentLoadSuccess}
                    inputRef={canvasRef}
                >
                    <Page 
                        pageNumber={actualPage} 
                        onRenderSuccess={onRenderSuccess}
                        renderAnnotationLayer={false}
                        renderTextLayer={false}
                        height={window.innerHeight - 50}
                    />
                </Document>
                <div className="container px-10 mx-0 min-w-full flex flex-row items-center">
                    <button
                        className="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                        type="button"
                        disabled={actualPage === 1}
                        onClick={goPreviousPage}
                    >Previous page</button>
                    <p className="text-xs text-gray-900 dark:text-white"> Page {actualPage} of {numPages} pages</p>
                    <button
                        className="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                        type="button"
                        disabled={actualPage === numPages}
                        onClick={goNextPage}
                    >Next page</button>
                </div>
            </div>
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
                    <div key={`bounding-box-${annotation.boundingBox[0]}-${annotation.boundingBox[1]}-page-${annotation.page}-${annoKey}`}
                    style={{
                        position: 'absolute',
                        top: annotation.boundingBox[1],
                        left: annotation.boundingBox[0] + widthOffset,
                        border: selectedAnnotation === annoKey ? '2px solid blue' : '2px solid black',
                        backgroundColor: selectedAnnotation === annoKey ? 'lightblue' : 'whitesmoke',
                        height: annotation.boundingBox[3] - annotation.boundingBox[1],
                        width: (annotation.boundingBox[2] + widthOffset) - (annotation.boundingBox[0] + widthOffset),
                        opacity: '0.5',
                        pointerEvents: 'none',
                        display: annotation.page === actualPage ? 'inherit' : 'none'
                    }}></div>
                ))}
            </div>
        </div>
    )
}