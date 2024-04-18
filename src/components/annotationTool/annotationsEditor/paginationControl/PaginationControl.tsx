interface PaginationControlProps {
    numPages: number
    actualPage: number
    handlePreviousPageClick: () => void
    handleNextPageClick: () => void
}

export const PaginationControl = (props: PaginationControlProps) => {
    const { numPages, actualPage, handlePreviousPageClick, handleNextPageClick } = props

    return(
        <>
            <div className="container px-10 mx-0 min-w-full flex flex-row items-center">
                <button
                    id="cy-previous-page"
                    className="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                    type="button"
                    disabled={actualPage === 1}
                    onClick={handlePreviousPageClick}
                >Previous page</button>
                <p id="cy-page-indicator" className="text-xs text-gray-900 dark:text-white"> Page {actualPage} of {numPages} pages</p>
                <button
                    id="cy-next-page"
                    className="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                    type="button"
                    disabled={actualPage === numPages}
                    onClick={handleNextPageClick}
                >Next page</button>
           </div>
        </>
    )
}