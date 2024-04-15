import { ChangeEvent, useContext, useEffect, useState } from "react"
import { InvoiceFileContext } from "@/context/InvoiceFileContext"
import { AnnotationMap } from "@/components/AnnotationTool"
import { APIAnnotationsParams } from "@/app/api/annotations/route"
import { APIErrorResponse } from "@/types/api"

interface FieldsEditorProps {
    annotations: AnnotationMap,
    onAnnotationsChange: (annotations: AnnotationMap) => void
}

enum RequiredFields {
    SupplierName = 'supplier_name',
    DatePurchase = 'date_purchase',
    TotalAmount = 'total_amount',
    Currency = 'currency'
}

const currencies = ['eur', 'nok', 'sek', 'dkk']

export const FieldsEditor = (props: FieldsEditorProps) => {
    const { annotations, onAnnotationsChange } = props

    const invoiceFile = useContext(InvoiceFileContext)

    const onChangeTitle = (event: ChangeEvent<HTMLInputElement>, annoKey: string) => {
        const updatedAnnotations = structuredClone(annotations)
        updatedAnnotations.set(annoKey, {
            ...updatedAnnotations.get(annoKey)!,
            title: event.currentTarget.value
        })
        onAnnotationsChange(updatedAnnotations)
    }

    const onChangeType = (event: ChangeEvent<HTMLSelectElement>, annoKey: string) => {
        const updatedAnnotations = structuredClone(annotations)
        updatedAnnotations.set(annoKey, {
            ...updatedAnnotations.get(annoKey)!,
            type: event.currentTarget.value
        })
        onAnnotationsChange(updatedAnnotations)
    }

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

    const onDeleteAnnotationClick = (annoKey: string) => {
        const updatedAnnotations = structuredClone(annotations)
        updatedAnnotations.delete(annoKey)
        onAnnotationsChange(updatedAnnotations)
    }

    const isSubmitEnabled = () => {
        const annotationsToInspect = Array.from(annotations.values())
        if(annotationsToInspect.every((anno) => anno.type !== RequiredFields.SupplierName)) return false
        if(annotationsToInspect.every((anno) => anno.type !== RequiredFields.DatePurchase)) return false
        if(annotationsToInspect.every((anno) => anno.type !== RequiredFields.TotalAmount)) return false 
        if(annotationsToInspect.every((anno) => anno.type !== RequiredFields.Currency)) return false
        
        return true
    }

    const onSubmitClick = () => {
        fetch('/api/annotations', {
            method: 'POST',
            body: JSON.stringify({
                invoiceFileName: invoiceFile.fileName,
                annotations: Array.from(annotations.values())
            } as unknown as APIAnnotationsParams)
        })
        .then(response => {
            const filename =  response.headers.get('Content-Disposition')?.split('filename=')[1] || 'file.json'
            response.blob().then(blob => {
                let url = window.URL.createObjectURL(blob);
                let a = document.createElement('a');
                a.href = url;
                a.download = filename;
                a.click();
            });
        })
        .catch((error: APIErrorResponse) => console.error(error))
    }

    return(
        <div className="pm-8">
            <form>
                <div className="container py-5 px-5 mx-0 min-w-full" style={{
                    height: 'calc(100vh - 100px)',
                    overflowY: 'auto'
                }}>
                    {!annotations.size && (<div>To start annotating, draw the first bounding box on the invoice image.</div>)}
                    {Array.from(annotations, ([annoKey, annotation]) => (
                        <div className="grid mb-2 md:grid-cols-3" key={`annotation-field-${annotation.boundingBox[0]}-${annotation.boundingBox[1]}-${annoKey}`}>
                            <div>
                                <label htmlFor="field_name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Title</label>
                                <input onChange={(event) => onChangeTitle(event, annoKey)} type="text" id="field_name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="" required />
                            </div>
                            <div>
                                <label htmlFor="field_type" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Type</label>
                                <select onChange={(event) => onChangeType(event, annoKey)} id="field_type" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
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
                                        <label htmlFor="currency_type" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Currency</label>
                                        <select onChange={(event) => onChangeCurrency(event, annoKey)} id="currency_type" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                            <option value="">Choose a currency</option>
                                            {currencies.map((currency, index) => (
                                                <option key={`currency-option-${currency}-${index}`} value={currency}>{currency.toUpperCase()}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <svg style={{
                                            marginTop: '37px',
                                            marginLeft:'10px'
                                        }}
                                        onClick={() => onDeleteAnnotationClick(annoKey)} className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18 17.94 6M18 18 6.06 6"/>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="container py-10 px-10 mx-0 min-w-full flex flex-col items-center">
                    <button 
                        type="button" 
                        onClick={onSubmitClick}
                        className={isSubmitEnabled() ? 
                            "text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800" : 
                            "text-white bg-blue-400 dark:bg-blue-500 cursor-not-allowed font-medium rounded-lg text-sm px-5 py-2.5 text-center"} disabled={!isSubmitEnabled()}>Export JSON</button>
                </div>
            </form>
        </div>
    )
}