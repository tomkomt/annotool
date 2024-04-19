import { ChangeEvent, useMemo } from "react"
import { AnnotationMap, Annotation } from "@/types/annotation"

interface FieldsEditorProps {
    annotations: AnnotationMap,
    selectedAnnotation: string|null,
    isLoading: boolean
    isSubmitting: boolean
    onAnnotationsChange: (annotations: AnnotationMap) => void
    onRowClick: (annoKey: string) => void
    onEditorSubmit: () => void
}

enum RequiredFields {
    SupplierName = 'supplier_name',
    DatePurchase = 'date_purchase',
    TotalAmount = 'total_amount',
    Currency = 'currency'
}

const currencies = ['eur', 'nok', 'sek', 'dkk']

export const FieldsEditor = (props: FieldsEditorProps) => {
    const { annotations, selectedAnnotation, isLoading, isSubmitting, onAnnotationsChange, onRowClick, onEditorSubmit } = props

    /**
     * Handle change of annotation's title
     */
    const onChangeTitle = (event: ChangeEvent<HTMLInputElement>, annoKey: string) => {
        const updatedAnnotations = structuredClone(annotations)
        updatedAnnotations.set(annoKey, {
            ...updatedAnnotations.get(annoKey)!,
            title: event.currentTarget.value
        })
        onAnnotationsChange(updatedAnnotations)
    }

    /**
     * Handle change of annotation's type
     */
    const onChangeType = (event: ChangeEvent<HTMLSelectElement>, annoKey: string) => {
        const updatedAnnotations = structuredClone(annotations)
        updatedAnnotations.set(annoKey, {
            ...updatedAnnotations.get(annoKey)!,
            type: event.currentTarget.value
        })
        onAnnotationsChange(updatedAnnotations)
    }

    /**
     * Handle change of annotation's currency type
     */
    const onChangeCurrency = (event: ChangeEvent<HTMLSelectElement>, annoKey: string) => {
        const updatedAnnotations = structuredClone(annotations)
        updatedAnnotations.set(annoKey, {
            ...updatedAnnotations.get(annoKey)!,
            misc: {
                currencyType: event.currentTarget.value
            }
        })
        onAnnotationsChange(updatedAnnotations)
    }

    /**
     * Handle click on delete icon
     */
    const onDeleteAnnotationClick = (annoKey: string) => {
        const updatedAnnotations = structuredClone(annotations)
        updatedAnnotations.delete(annoKey)
        onAnnotationsChange(updatedAnnotations)
    }

    /** 
     * At first, submit button is disabled
     * Some conditions needs to be fulfilled to enable it
    */
    const isSubmitEnabled = useMemo(() => {
        const annotationsToInspect = Array.from(annotations.values())
        if(annotationsToInspect.every((anno) => anno.type !== RequiredFields.SupplierName)) return false
        if(annotationsToInspect.every((anno) => anno.type !== RequiredFields.DatePurchase)) return false
        if(annotationsToInspect.every((anno) => anno.type !== RequiredFields.TotalAmount)) return false 
        if(annotationsToInspect.every((anno) => anno.type !== RequiredFields.Currency)) return false
        
        return true
    }, [annotations])

    const htmlElementIdFactory = (elementName: string, annotation: Annotation, annoKey: string) => 
        `${elementName}-${annotation.boundingBox[0]}-${annotation.boundingBox[1]}-${annotation.page}-${annoKey}`

    return(
        <div className="pm-8">
            <form>
                <div className="container py-5 px-5 mx-0 min-w-full" style={{
                    height: 'calc(100vh - 50px)',
                    overflowY: 'auto'
                }}>
                    {(!annotations.size && !isLoading) && (<div>To start annotating, draw the first bounding box on the invoice image.</div>)}
                    {Array.from(annotations, ([annoKey, annotation]) => (
                        <div 
                            onClick={() => onRowClick(annoKey)} 
                            className={selectedAnnotation === annoKey ? 'highlighted grid mb-2 py-1 px-1 md:grid-cols-3' : 'grid mb-2 py-1 px-1 md:grid-cols-3'}
                            key={htmlElementIdFactory('cy-annotation-fields', annotation, annoKey)} 
                            id={htmlElementIdFactory('cy-annotation-fields', annotation, annoKey)} 
                            style={{
                                backgroundColor: selectedAnnotation === annoKey ? 'lightblue' : 'initial'
                            }}
                        >
                            <div>
                                <label htmlFor={htmlElementIdFactory('cy-field-name', annotation, annoKey)} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Title</label>
                                <input 
                                    onChange={(event) => onChangeTitle(event, annoKey)} 
                                    type="text" 
                                    id={htmlElementIdFactory('cy-field-name', annotation, annoKey)} 
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                                    placeholder="" 
                                />
                            </div>
                            <div>
                                <label htmlFor={htmlElementIdFactory('cy-field-type', annotation, annoKey)} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Type</label>
                                <select onChange={(event) => onChangeType(event, annoKey)} id={htmlElementIdFactory('cy-field-type', annotation, annoKey)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                    <option value="">Choose a field type</option>
                                    <option value={RequiredFields.SupplierName}>Supplier Name *</option>
                                    <option value={RequiredFields.DatePurchase}>Date of the Purchase *</option>
                                    <option value={RequiredFields.TotalAmount}>Total Amount *</option>
                                    <option value={RequiredFields.Currency}>Currency *</option>
                                    <option value="free_text">Free Text</option>
                                </select>
                            </div>
                            <div>
                                <div className="grid md:grid-cols-10">
                                    <div className="col-span-9">
                                        <div style={{
                                            visibility: annotations.get(annoKey)?.type === RequiredFields.Currency ? 'visible' : 'hidden'
                                        }}>
                                            <label htmlFor={htmlElementIdFactory('cy-field-currency-type', annotation, annoKey)} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Currency</label>
                                            <select onChange={(event) => onChangeCurrency(event, annoKey)} id={htmlElementIdFactory('cy-field-currency-type', annotation, annoKey)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                                {currencies.map((currency, index) => (
                                                    <option key={`currency-option-${currency}-${index}`} value={currency}>{currency.toUpperCase()}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <svg 
                                            style={{
                                                marginTop: '37px'
                                            }}
                                            id={htmlElementIdFactory('cy-delete-annotation', annotation, annoKey)}
                                            onClick={() => onDeleteAnnotationClick(annoKey)} 
                                            className="w-6 h-6 text-gray-800 dark:text-white" 
                                            aria-hidden="true" 
                                            xmlns="http://www.w3.org/2000/svg" 
                                            width="24" 
                                            height="24" 
                                            fill="none" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18 17.94 6M18 18 6.06 6"/>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="container px-10 mx-0 min-w-full flex flex-col items-center">
                    <button 
                        id="cy-submit-annotations"
                        type="button" 
                        onClick={onEditorSubmit}
                        className={isSubmitEnabled ? 
                            "text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800" : 
                            "text-white bg-blue-400 dark:bg-blue-500 cursor-not-allowed font-medium rounded-lg text-sm px-5 py-2.5 text-center"} 
                        disabled={!isSubmitEnabled || isSubmitting}
                        >{isSubmitting ? 'Exporting...' : 'Export JSON'}</button>
                </div>
            </form>
        </div>
    )
}