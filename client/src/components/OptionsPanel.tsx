import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OptionsPanelProps {
  options: {
    pageSize: string;
    orientation: string;
    margins: string;
    theme: string;
  };
  onOptionsChange: (options: any) => void;
}

export default function OptionsPanel({ options, onOptionsChange }: OptionsPanelProps) {
  const updateOption = (key: string, value: string) => {
    onOptionsChange({ ...options, [key]: value });
  };

  return (
    <div className="flex flex-wrap items-center gap-4 md:gap-6">
      <div className="flex items-center gap-2">
        <Label htmlFor="page-size" className="text-xs text-muted-foreground whitespace-nowrap">
          Page Size:
        </Label>
        <Select value={options.pageSize} onValueChange={(value) => updateOption("pageSize", value)}>
          <SelectTrigger id="page-size" className="h-8 w-24 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="A4">A4</SelectItem>
            <SelectItem value="Letter">Letter</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Label htmlFor="orientation" className="text-xs text-muted-foreground whitespace-nowrap">
          Orientation:
        </Label>
        <Select value={options.orientation} onValueChange={(value) => updateOption("orientation", value)}>
          <SelectTrigger id="orientation" className="h-8 w-28 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="portrait">Portrait</SelectItem>
            <SelectItem value="landscape">Landscape</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Label htmlFor="margins" className="text-xs text-muted-foreground whitespace-nowrap">
          Margins:
        </Label>
        <Select value={options.margins} onValueChange={(value) => updateOption("margins", value)}>
          <SelectTrigger id="margins" className="h-8 w-28 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="small">Small</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="large">Large</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Label htmlFor="theme" className="text-xs text-muted-foreground whitespace-nowrap">
          Theme:
        </Label>
        <Select value={options.theme} onValueChange={(value) => updateOption("theme", value)}>
          <SelectTrigger id="theme" className="h-8 w-32 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="print-friendly">Print-friendly</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
