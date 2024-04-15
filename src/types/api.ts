export interface APIBaseResponse {
    status: number
}

export interface APIErrorResponse extends APIBaseResponse {
    message: string
}