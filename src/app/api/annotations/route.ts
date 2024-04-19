import { firebaseConfig } from "@/lib/db/firebaseConfig"
import { Annotation } from "@/types/annotation"
import { APIBaseResponse, APIErrorResponse } from "@/types/api"
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getDownloadURL, getStorage, ref, uploadBytes, uploadString } from "firebase/storage"
import { writeFile } from "fs/promises"
import { NextRequest, NextResponse } from "next/server"
import path from "path"
import { v4 as uuidv4 } from 'uuid'

export interface APIAnnotationsParams {
    originalFilename: string,
    invoiceFilename: string,
    annotations: Array<Annotation>
}

export interface APIAnnotationsResponse extends APIBaseResponse {
    annotationsFileName: string
}

export const POST = async (req: NextRequest, res: NextResponse) => {
    const body: APIAnnotationsParams = await req.json()

    if(process.env.NODE_ENV === 'development') {
        const app = initializeApp(firebaseConfig)
        const auth = getAuth(app);
        const storage = getStorage(app)

        try {
            const fileId = uuidv4()
            const storageRef = ref(storage, `annotations/${fileId}/${body.originalFilename}.json`)
            const { metadata } = await uploadString(storageRef, JSON.stringify(body.annotations))
            const { fullPath } = metadata
            if (!fullPath) {
                return NextResponse.json({
                    message: 'There was some error while uploading the file.',
                    status: 403
                })
            }

            return new NextResponse(JSON.stringify(body.annotations), {
                headers: {
                    ...res.headers,
                    "content-disposition": `attachment; filename=${body.originalFilename}.json`
                }
            })
        } catch(error) {
            return NextResponse.json({
                message: 'Something failed',
                status: 500
            } as APIErrorResponse)
        }
    } else {
        try {
            const pathToFile = path.join(process.cwd(), "public/annotations/" + body.originalFilename + ".json")
            await writeFile(
                pathToFile, JSON.stringify(body.annotations)
            )    
    
            return new NextResponse(JSON.stringify(body.annotations), {
                headers: {
                    ...res.headers,
                    "content-disposition": `attachment; filename=${body.originalFilename}.json`
                }
            })
        } catch(error) {
            return NextResponse.json({
                message: 'Something failed',
                status: 500
            } as APIErrorResponse)
        }
    }
}