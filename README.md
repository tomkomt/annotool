# Annotool

A small tool to annotate images and PDF files.

Annotool is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) and enhanced by [`FlowBite`](https://flowbite.com/) and [`React-PDF`](https://www.npmjs.com/package/react-pdf).

## How this works

At first, the user needs to upload an image or PDF file by file uploader.

After a short moment, the file is uploaded and the annotations editor is displayed.
Documents are uploaded to `./public/invoices/`.

On the left half of the screen user can find `fields editor` and on the opposite half `document view`.

At first, there are no annotations or fields on the right side. Those can be created by dragging and dropping with the mouse on `document view`.

Once drag and drop is finished, a new field is added in the `fields editor`, where the user can 
- type a title of annotation
- select a type - either free text or one of the following required types
    - supplier name
    - date of the purchase
    - total amount
    - currency
- select currency, if the type of annotation was chosen to be `currency`

Finally, the user can export created annotations by the `Submit annotations` button.
For that, all of the required fields need to be annotated.

Exported annotations file will be downloaded, but can be also found on `./public/annotations/`.

## Supported files

Annotool supports JPG/JPEG images, PNG images and PDF files.

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the Annotool.

## Deployment

To deploy on docker, please use `Dockerfile`.

## Tests

This repo contains tests to verify, that API works and that user can create new annotations.

### Tests in browser
To see tests, run:

```bash
npm run test
```

That will start the development server of Next.js and Cypress E2E tests with the help of the `start-server-and-test` module.

### Tests for CI

To run test during CI, add following comand to pipeline's stage/task:

```bash
npm run test:ci
```