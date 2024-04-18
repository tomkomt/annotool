import { APIBaseResponse, APIErrorResponse } from "@/types/api"
import { writeFile } from "fs/promises"
import { NextRequest, NextResponse } from "next/server"
import path from "path"

const allowedMimetypes = ['application/pdf', 'image/jpeg', 'image/png']

export interface APIUploadResponse extends APIErrorResponse {
    uploadedFileName: string
    uploadedFileType: string
}

export const POST = async (req: NextRequest) => {
    const formData = await req.formData()

    const invoiceFile = formData.get('file') as File

    if(!invoiceFile) {
        return NextResponse.json({
            error: 'No invoice file attached',
            status: 400
        })
    }

    const buffer = Buffer.from(await invoiceFile.arrayBuffer())
    const filename = invoiceFile.name.replaceAll(' ', '_')
    const filetype = invoiceFile.type

    if(allowedMimetypes.indexOf(filetype) === -1) {
        return NextResponse.json({
            message: `File with mimetype "${filetype}" is not supported.`,
            status: 415
        } as APIErrorResponse)
    }

    try {
        const pathToFile = path.join(process.cwd(), "public/invoices/" + filename)
        await writeFile(
            pathToFile, buffer
        )    

        return NextResponse.json({
            uploadedFileName: filename, 
            uploadedFileType: filetype,
            status: 200
        } as APIUploadResponse)
    } catch(error) {
        return NextResponse.json({
            message: 'Something failed',
            status: 500
        } as APIErrorResponse)
    }
}