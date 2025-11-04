import ActionBar from "../ActionBar";
import { useState } from "react";

export default function ActionBarExample() {
  const [isConverting, setIsConverting] = useState(false);

  const handleConvert = () => {
    setIsConverting(true);
    setTimeout(() => setIsConverting(false), 2000);
    console.log("Convert clicked");
  };

  return (
    <ActionBar
      onConvert={handleConvert}
      onClear={() => console.log("Clear clicked")}
      onDownloadSample={() => console.log("Download sample clicked")}
      isConverting={isConverting}
      hasContent={true}
    />
  );
}
