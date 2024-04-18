import { ChangeEvent, useState } from "react"
import { APIErrorResponse } from "@/types/api"
import { APIUploadResponse } from "@/app/api/upload/route"
import { ErrorMessage } from "./common/ErrorMessage"

interface UploadInvoiceProps {
    onInvoiceUpload: (filename: string, mimetype: string) => void
}

export const UploadInvoice = (props: UploadInvoiceProps) => {
    const { onInvoiceUpload: handleInvoiceUpload } = props

    const [error, setError] = useState<{ message: string, code: number} | null>(null)

    /**
     * Handle change of selected file to upload.
     * Use /api/upload route to upload it to public folder and get filename and mimetype for other components.
     */
    const handleInvoiceFileChange = async(e: ChangeEvent<HTMLInputElement>) => {
        const fileInput = e.target

        if(fileInput.files?.length) {
            const formData = new FormData()
            formData.append('file', fileInput.files[0])
            
            try {
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                })
                const data: Partial<APIUploadResponse> = await response.json()
                if(data.status === 200) {
                    handleInvoiceUpload(data.uploadedFileName!, data.uploadedFileType!)
                } else {
                    setError({
                        message: data.message! ,
                        code: data.status!
                    })
                }
            } catch(error: any) {
                console.error(error)
                setError({
                    message: error.message,
                    code: error.status
                })
            }
        }
    }

    return(
        <>
            <form className="max-w-lg mx-auto">
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="upload_invoice">Upload your invoice</label>
                <input 
                    className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" 
                    aria-describedby="upload_invoice_help" 
                    id="upload_invoice" 
                    type="file" 
                    name="invoice" 
                    onChange={handleInvoiceFileChange}
                />
                <div className="max-w-lg mx-auto text-sm text-gray-500 dark:text-gray-300" id="upload_invoice_help">Upload image of your scanned invoice as JPG, JPEG or PNG file.</div>
            </form>
            {!!error?.message && <ErrorMessage title={error.message} message={error.code === 415 ? 'Please, upload only PDF documents or JPEG/JPG/PNG images.' : '' } />}
        </>
    )
}