import fixtureJson from '../fixtures/example_3_.jpeg.json'

/**
 * All tests uploads example JPEG file
 * This will trigger upload and checks if page changed
 */
const openAnnotationsEditor = () => {
    cy.get('#upload_invoice').attachFile('example_3.jpeg')
    cy.get('#bounding-boxes-container').should('exist')
}

const drawBoundingBoxes = () => {
    const cyImage = cy.get('#cy-Image-component')
    cyImage.should('exist')

    cyImage.trigger('mousedown', 0, 0)
    cyImage.trigger('mouseup', 100, 100)

    cyImage.trigger('mousedown', 110, 110)
    cyImage.trigger('mouseup', 200, 200)

    cyImage.trigger('mousedown', 210, 210)
    cyImage.trigger('mouseup', 300, 300)

    cyImage.trigger('mousedown', 310, 310)
    cyImage.trigger('mouseup', 400, 400)
}

describe('Annotool Tests', () => {
    it('should open page with file upload component', () => {
        cy.visit('/')

        cy.get('#upload_invoice').should('exist')
    })

    it('should upload an image and open editor', () => {
        cy.visit('/')

        openAnnotationsEditor()
    })

    it('should draw a new bounding box', () => {
        cy.visit('/')

        openAnnotationsEditor()

        const cyImage = cy.get('#cy-Image-component')
        cyImage.should('exist')

        cyImage.trigger('mousedown', 'topLeft')
        cyImage.trigger('mousemove', 100, 100)
        cyImage.trigger('mouseup', 100, 100)
    })

    it('should create required annotations and enable submit button', () => {
        cy.visit('/')

        openAnnotationsEditor()

        drawBoundingBoxes()

        // Submit button needs to be disabled, because required fields are not present
        cy.get('#cy-submit-annotations').should('exist').and('be.disabled')

        // Now satisfy condition
        cy.get('input[id^="cy-field-name-0-0-1"]').should('exist').type('Supplier')
        cy.get('select[id^="cy-field-type-0-0-1"]').should('exist').select('supplier_name')

        cy.get('input[id^="cy-field-name-110-110-1"]').should('exist').type('Date of purchase')
        cy.get('select[id^="cy-field-type-110-110-1"]').should('exist').select('date_purchase')

        cy.get('input[id^="cy-field-name-210-210-1"]').should('exist').type('Total')
        cy.get('select[id^="cy-field-type-210-210-1"]').should('exist').select('total_amount')

        cy.get('input[id^="cy-field-name-310-310-1"]').should('exist').type('Supplier')
        cy.get('select[id^="cy-field-type-310-310-1"]').should('exist').select('currency')
        cy.get('select[id^="cy-field-currency-type-310-310-1"]').should('exist').select('dkk')

        // And submit button is enabled
        cy.get('#cy-submit-annotations').should('be.enabled')
    })

    it('should be able to highlight bounding boxes and fields', () => {
        cy.visit('/')

        openAnnotationsEditor()

        drawBoundingBoxes()

        const cyImage = cy.get('#cy-Image-component')

        // Verify that there are no bounding boxes or fields highlighted
        cy.get('#bounding-boxes-container div.highlighted').should('have.length', 0)
        cy.get('div[id^="cy-annotation=fields-"].highlighted').should('have.length', 0)

        // click on the first bounding box in top left corner...
        cyImage.trigger('click', 30, 30)
        // ... and verify, that clicked bounding box and corresponding field are highlighted
        cy.get('#bounding-boxes-container div.highlighted').should('have.length', 1)
        cy.get('div[id^="cy-annotation-fields-0-0-1"].highlighted').should('have.length', 1)

        // clear selected bounding boxes
        cyImage.trigger('click', 'bottom')
        cy.get('#bounding-boxes-container div.highlighted').should('have.length', 0)
        cy.get('div[id^="cy-annotation=fields-"].highlighted').should('have.length', 0)

        // now click on the 3rd row in fields editor
        cy.get('div[id^="cy-annotation-fields-210-210-1"]').click()
        cy.get('#bounding-boxes-container div:nth-of-type(3)').should('have.class', 'highlighted')
    })

    it('should submit annotations correctly', () => {
        cy.intercept('POST', '/api/annotations').as('uploadAnnotations')

        cy.visit('/')

        openAnnotationsEditor()

        // draw bounding boxes
        drawBoundingBoxes()

        // fill all new fields
        cy.get('#cy-submit-annotations').should('exist').and('be.disabled')

        cy.get('input[id^="cy-field-name-0-0-1"]').should('exist').type('Supplier')
        cy.get('select[id^="cy-field-type-0-0-1"]').should('exist').select('supplier_name')

        cy.get('input[id^="cy-field-name-110-110-1"]').should('exist').type('Date of purchase')
        cy.get('select[id^="cy-field-type-110-110-1"]').should('exist').select('date_purchase')

        cy.get('input[id^="cy-field-name-210-210-1"]').should('exist').type('Total')
        cy.get('select[id^="cy-field-type-210-210-1"]').should('exist').select('total_amount')

        cy.get('input[id^="cy-field-name-310-310-1"]').should('exist').type('Supplier')
        cy.get('select[id^="cy-field-type-310-310-1"]').should('exist').select('currency')
        cy.get('select[id^="cy-field-currency-type-310-310-1"]').should('exist').select('dkk')

        cy.get('#cy-submit-annotations').should('be.enabled').click()

        cy.wait('@uploadAnnotations').its('request.body').should('eq', JSON.stringify(fixtureJson))
    })

    it('should upload a PDF file and draw a new bounding box', () => {
        cy.intercept('POST', '/api/upload').as('uploadFileRequest')
        cy.intercept('GET', '/invoices/example_1.pdf').as('loadDocument')

        cy.visit('/')

        // upload pdf file
        cy.get('#upload_invoice').attachFile('example_1.pdf')

        cy.wait('@uploadFileRequest')

        cy.get('#bounding-boxes-container').should('exist')
    
        const cyDocument = cy.get('#cy-Document-component div.react-pdf__Document')
        cyDocument.should('exist')

        // wait for it...
        cy.wait('@loadDocument')

        // page canvas should be rendered
        cy.get('#cy-Document-component canvas.react-pdf__Page__canvas').should('exist')

        // wait 1 second for pdf page to settle
        cy.wait(1000)

        // now no field and no bounding boxes should exist
        cy.get('input[id^="cy-field-name-0-0-1"]').should('not.exist')
        cy.get('#bounding-boxes-container div').should('have.length', 0)

        // draw new bounding box
        cyDocument.trigger('mousedown', 'topLeft')
        cyDocument.trigger('mouseup', 100, 100)
        cyDocument.trigger('click', 100, 100)

        // check if new field and new bounding box exist
        cy.get('input[id^="cy-field-name-0-0-1"]').should('exist')
        cy.get('#bounding-boxes-container div').should('have.length', 1)
    })

    it('should upload a multi-page PDF file and draw bounding box on each page', () => {
        cy.intercept('POST', '/api/upload').as('uploadFileRequest')
        cy.intercept('GET', '/invoices/example_1.pdf').as('loadDocument')

        cy.visit('/')

        cy.get('#upload_invoice').attachFile('example_1.pdf')

        cy.wait('@uploadFileRequest')

        cy.get('#bounding-boxes-container').should('exist')
    
        const cyDocument = cy.get('#cy-Document-component div.react-pdf__Document')
        cyDocument.should('exist')

        cy.wait('@loadDocument')

        cy.get('#cy-Document-component canvas.react-pdf__Page__canvas').should('exist')

        cy.wait(1000)

        cy.get('input[id^="cy-field-name-0-0-1"]').should('not.exist')
        cy.get('#bounding-boxes-container div').should('have.length', 0)

        cyDocument.trigger('mousedown', 'topLeft')
        cyDocument.trigger('mouseup', 100, 100)
        cyDocument.trigger('click', 100, 100)

        cy.get('input[id^="cy-field-name-0-0-1"]').should('exist')
        cy.get('#bounding-boxes-container div').should('have.length', 1)

        // click on button to next page
        cy.get('#cy-next-page').click()

        // check that bounding box created on previous page is not visible
        cy.get('input[id^="cy-field-name-0-0-1"]').should('exist')
        cy.get('#bounding-boxes-container div:nth-of-type(1)').should('have.css', 'display', 'none')

        // create new bounding box on page 2
        cyDocument.trigger('mousedown', 150, 150)
        cyDocument.trigger('mouseup', 200, 200)
        cyDocument.trigger('click', 200, 200)

        // both fields should exist, for both bounding boxes
        cy.get('input[id^="cy-field-name-0-0-1"]').should('exist')
        cy.get('input[id^="cy-field-name-150-150-2"]').should('exist')
        cy.get('#bounding-boxes-container div').should('have.length', 2)
        // but only that one from page 2 should be visible now
        cy.get('#bounding-boxes-container div:nth-of-type(1)').should('have.css', 'display', 'none')
        cy.get('#bounding-boxes-container div:nth-of-type(2)').should('have.css', 'display', 'block')

        // click on button to go to the previous page
        cy.get('#cy-previous-page').click()
        // and see the first bounding box again
        cy.get('#bounding-boxes-container div:nth-of-type(1)').should('have.css', 'display', 'block')
        cy.get('#bounding-boxes-container div:nth-of-type(2)').should('have.css', 'display', 'none')

    })

    it('should display error message component if file is not supported', () => {
        cy.visit('/')

        cy.get('#upload_invoice').attachFile('example_3_.jpeg.json')

        cy.get('#cy-error-message').should('exist')
    })
})