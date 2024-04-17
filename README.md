# Annotool

A small tool to annotate images and PDF files.

Annotool is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) and enhanced by [`FlowBite`](https://flowbite.com/) and [`React-PDF`](https://www.npmjs.com/package/react-pdf).

## How this works

At first, user needs to upload image or PDF file by file uploader.

After short moment, file is uploaded and annotations editor is displayed.
Documents are uploaded to `./public/invoices/`.

On the left half of the screen user can find `fields editor` and on opposite half `document view`.

At first, there are no annotations or fields on the right side. Those can be created by drag and drop with mouse on `document view`.

Once drag and drop is finished, new field is added in `fields editor`, where user can 
- type a title of annotation
- select a type - either free text or one of following required types
    - supplier name
    - date of the purchase
    - total amount
    - currency
- select currency, if type of annotation was chosen to be `currency`

Finally, user can export created annotations by `Submit annotations` button.
For that, all of required fields need to be annotated.

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

To see tests, run:

```bash
npm run test
```