import Image from "next/image";
import { Alert } from "flowbite-react";
import { AnnotationTool } from "@/components/AnnotationTool";

export default function Home() {

  return (
    <div className="container xl" style={{height: '100vh'}}>
      <AnnotationTool/>
    </div>
  );
}
