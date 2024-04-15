import { ChangeEvent } from "react"
import { APIErrorResponse } from "@/types/api"
import { APIUploadResponse } from "@/app/api/upload/route"

interface UploadInvoiceProps {
    handleInvoiceUpload: (fileName: string) => void
}

export const UploadInvoice = (props: UploadInvoiceProps) => {
    const { handleInvoiceUpload } = props

    const onInvoiceUploadChnage = async(e: ChangeEvent<HTMLInputElement>) => {
        const fileInput = e.target

        if(fileInput.files?.length) {
            const formData = new FormData()
            formData.append('file', fileInput.files[0])
            
            fetch('/api/upload', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then((data: APIUploadResponse) => handleInvoiceUpload(data.uploadedFileName))
            .catch((error: APIErrorResponse) => console.error(error))
        }
    }

    return(
        <form className="max-w-lg mx-auto">
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="upload_invoice">Upload your invoice</label>
            <input className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" aria-describedby="upload_invoice_help" id="upload_invoice" type="file" name="invoice" onChange={onInvoiceUploadChnage}/>
            <div className="mt-1 text-sm text-gray-500 dark:text-gray-300" id="upload_invoice_help">Upload image of your scanned invoice as JPG, JPEG or PNG file.</div>
        </form>
    )
}