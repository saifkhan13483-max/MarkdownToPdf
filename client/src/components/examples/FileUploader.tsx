import FileUploader from "../FileUploader";

export default function FileUploaderExample() {
  const handleFileSelect = (content: string, filename: string) => {
    console.log("File selected:", filename, "Content length:", content.length);
  };

  return (
    <div className="p-6">
      <FileUploader onFileSelect={handleFileSelect} />
    </div>
  );
}
