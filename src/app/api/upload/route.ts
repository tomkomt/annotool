import { firebaseConfig } from "@/lib/db/firebaseConfig"
import { APIErrorResponse } from "@/types/api"
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage"
import { writeFile } from "fs/promises"
import { NextApiResponse } from "next"
import { NextRequest, NextResponse } from "next/server"
import path from "path"
import { v4 as uuidv4 } from 'uuid'

const allowedMimetypes = ['application/pdf', 'image/jpeg', 'image/png']

export interface APIUploadResponse extends APIErrorResponse {
    originalFileName: string
    uploadedFileName: string
    uploadedFileType: string
}

export const POST = async (req: NextRequest, res: NextApiResponse) => {
    // Do some preparation work, like
    // getting files from form data; creating buffer; and getting filename and mimetyp
    const formData = await req.formData()
    const invoiceFile = formData.get('file') as File

    if(!invoiceFile) {
        return NextResponse.json({
            error: 'No invoice file attached.',
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
    
    // If in production, use Firebase
    // otherwise use local filesystem
    if(process.env.NODE_ENV === 'development') {
        const app = initializeApp(firebaseConfig)
        const auth = getAuth(app);
        const storage = getStorage(app)

        try {
            const fileId = uuidv4()
            const storageRef = ref(storage, `uploads/${fileId}/${filename}`)
            const { metadata } = await uploadBytes(storageRef, buffer)
            const { fullPath } = metadata
            if (!fullPath) {
                return NextResponse.json({
                    message: 'There was some error while uploading the file.',
                    status: 403
                })
            }
            const fileURL = `https://storage.googleapis.com/${storageRef.bucket}/${storageRef.fullPath}`

            const fileRef = ref(storage, fileURL)
            const filePublicURL = await getDownloadURL(fileRef)
            return NextResponse.json({ 
                originalFileName: filename,
                uploadedFileName: filePublicURL,
                uploadedFileType: filetype ,
                status: 200
            } as APIUploadResponse)
        } catch(error) {
            return NextResponse.json({
                message: `Something failed: ${JSON.stringify(error)}`,
                status: 500
            } as APIErrorResponse)   
        }
    } else {    
        try {
            const pathToFile = path.join(process.cwd(), "public/invoices/" + filename)
            await writeFile(
                pathToFile, buffer
            )    
    
            return NextResponse.json({
                originalFileName: filename,
                uploadedFileName: `/invoices/${filename}`, 
                uploadedFileType: filetype,
                status: 200
            } as APIUploadResponse)
        } catch(error) {
            return NextResponse.json({
                message: `Something failed: ${JSON.stringify(error)}`,
                status: 500
            } as APIErrorResponse)
        }
    
    }
}