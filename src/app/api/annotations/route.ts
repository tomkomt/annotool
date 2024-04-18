import { Annotation } from "@/types/annotation"
import { APIBaseResponse, APIErrorResponse } from "@/types/api"
import { writeFile } from "fs/promises"
import { NextRequest, NextResponse } from "next/server"
import path from "path"

export interface APIAnnotationsParams {
    invoiceFileName: string,
    annotations: Array<Annotation>
}

export interface APIAnnotationsResponse extends APIBaseResponse {
    annotationsFileName: string
}

export const POST = async (req: NextRequest, res: NextResponse) => {
    const body: APIAnnotationsParams = await req.json()

    try {
        const pathToFile = path.join(process.cwd(), "public/annotations/" + body.invoiceFileName + ".json")
        await writeFile(
            pathToFile, JSON.stringify(body.annotations)
        )    

        return new NextResponse(JSON.stringify(body.annotations), {
            headers: {
                ...res.headers,
                "content-disposition": `attachment; filename=${body.invoiceFileName}.json`
            }
        })
    } catch(error) {
        return NextResponse.json({
            message: 'Something failed',
            status: 500
        } as APIErrorResponse)
    }
}