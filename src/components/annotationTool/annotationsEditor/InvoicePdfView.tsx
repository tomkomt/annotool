import { MouseEvent, useContext, useEffect, useRef, useState } from "react"
import { InvoiceFileContext } from "@/context/InvoiceFileContext"
import { Document, Page } from 'react-pdf'
import { pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { AnnotationMap, BoundingBoxCoordinates } from "@/types/annotation";
import { handleDrawingEnd, handleDrawingStart, handleDrawingUpdate, handleImageClick } from "@/helpers/mouse";
import { ProvisionalBoundingBox } from "./boundingBox/ProvisionalBoundingBox";
import { BoundingBox } from "./boundingBox/BoundingBox";
import { PaginationControl } from "./paginationControl/PaginationControl";
import { raiseProvisionalBoundingBox } from "@/helpers/boundingBoxes";

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
}

export const InvoicePdfView = (props: InvoicePdfViewProps) => {
    const { widthOffset, annotations, selectedAnnotation, onBoundingBoxCreate, onBoundingBoxClick} = props

    const canvasRef = useRef<HTMLDivElement | null>(null)

    const invoiceFile = useContext(InvoiceFileContext)

    const [drawing, setDrawing] = useState<boolean>(false)
    const [provisionalBoundingBox, setProvisionalBoundingBox] = useState<BoundingBoxCoordinates>([0,0,0,0])

    const [rendered, setRendered] = useState<boolean>(false)

    const [numPages, setNumPages] = useState<number>(0)
    const [actualPage, setActualPage] = useState<number>(0)

    /** 
    *   Handle click on next button or previous button to change pages
    */
    const changePage = (offset: number) => {
        setActualPage((previous) => previous + offset)
    }

    /**
     * Propagate fact, that PDF page was rendered successfully and is ready to be annotated
     */
    const onRenderSuccess = () => {
        setRendered(true);
    }

    /** 
     * Propagate fact, that PDF document was loaded succesfully and UI can fetch number of pages of document
    */
    const onDocumentLoadSuccess = ({ numPages }: { numPages: number}) => {
        setNumPages(numPages)
        setActualPage(1)
    }

    /** 
     * If drawing stopped, raise provisional bounding box to an actual bounding box and put it to new annotation.
    */
    useEffect(() => raiseProvisionalBoundingBox(provisionalBoundingBox, drawing, actualPage, onBoundingBoxCreate, setProvisionalBoundingBox), [drawing])

    useEffect(() => {
        if(rendered && canvasRef && canvasRef.current) {
            canvasRef.current.addEventListener('mousedown', (event: MouseEventInit) => handleDrawingStart(event as unknown as MouseEvent<HTMLDivElement>, setDrawing, setProvisionalBoundingBox))
            canvasRef.current.addEventListener('mouseup', (event: MouseEventInit) => handleDrawingEnd(event as unknown as MouseEvent<HTMLDivElement>, setDrawing, setProvisionalBoundingBox))
            canvasRef.current.addEventListener('mousemove', (event: MouseEventInit) => handleDrawingUpdate(event as unknown as MouseEvent<HTMLDivElement>, drawing, setProvisionalBoundingBox))
            canvasRef.current.addEventListener('mouseout', (event: MouseEventInit) => handleDrawingEnd(event as unknown as MouseEvent<HTMLDivElement>, setDrawing, setProvisionalBoundingBox))
            canvasRef.current.addEventListener('click', (event: MouseEventInit) => handleImageClick(event as unknown as MouseEvent<HTMLDivElement>, annotations, onBoundingBoxClick))
        }

        return () => {
            if(canvasRef && canvasRef.current) {
                canvasRef.current.removeEventListener('mousedown', (event: MouseEventInit) => handleDrawingStart(event as unknown as MouseEvent<HTMLDivElement>, setDrawing, setProvisionalBoundingBox))
                canvasRef.current.removeEventListener('mouseup', (event: MouseEventInit) => handleDrawingEnd(event as unknown as MouseEvent<HTMLDivElement>, setDrawing, setProvisionalBoundingBox))
                canvasRef.current.removeEventListener('mousemove', (event: MouseEventInit) => handleDrawingUpdate(event as unknown as MouseEvent<HTMLDivElement>, drawing, setProvisionalBoundingBox))
                canvasRef.current.removeEventListener('mouseout', (event: MouseEventInit) => handleDrawingEnd(event as unknown as MouseEvent<HTMLDivElement>, setDrawing, setProvisionalBoundingBox))
                canvasRef.current.removeEventListener('click', (event: MouseEventInit) => handleImageClick(event as unknown as MouseEvent<HTMLDivElement>, annotations, onBoundingBoxClick))
            }
        }
    }, [rendered])

    return(
        <div>
            <div id="cy-Document-component">
                <Document 
                    file={`/invoices/${invoiceFile.filename}`}
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
                <PaginationControl numPages={numPages} actualPage={actualPage} handleNextPageClick={() => changePage(1)} handlePreviousPageClick={() => changePage(-1)}/>
            </div>
            <div id="bounding-boxes-container">
                {!!drawing && (
                    <ProvisionalBoundingBox boundingBox={provisionalBoundingBox} widthOffset={widthOffset} />
                )}
                {Array.from(annotations, ([annoKey, annotation]) => (
                    <BoundingBox annotation={annotation} annoKey={annoKey} widthOffset={widthOffset} page={1} isVisible={actualPage === annotation.page} isSelected={selectedAnnotation === annoKey}/>
                ))}
            </div>
        </div>
    )
}