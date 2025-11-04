import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Settings } from "lucide-react";

interface OptionsPanelProps {
  options: {
    pageSize: string;
    orientation: string;
    margins: string;
    theme: string;
    template: string;
  };
  onOptionsChange: (options: any) => void;
}

export default function OptionsPanel({ options, onOptionsChange }: OptionsPanelProps) {
  const updateOption = (key: string, value: string) => {
    onOptionsChange({ ...options, [key]: value });
  };

  const renderOptionsContent = (idPrefix: string = "") => (
    <div className="flex flex-wrap items-center gap-4 md:gap-6">
      <div className="flex items-center gap-2">
        <Label htmlFor={`${idPrefix}page-size`} className="text-xs text-muted-foreground whitespace-nowrap">
          Page Size:
        </Label>
        <Select value={options.pageSize} onValueChange={(value) => updateOption("pageSize", value)}>
          <SelectTrigger id={`${idPrefix}page-size`} className="h-8 w-24 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="A4">A4</SelectItem>
            <SelectItem value="Letter">Letter</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Label htmlFor={`${idPrefix}orientation`} className="text-xs text-muted-foreground whitespace-nowrap">
          Orientation:
        </Label>
        <Select value={options.orientation} onValueChange={(value) => updateOption("orientation", value)}>
          <SelectTrigger id={`${idPrefix}orientation`} className="h-8 w-28 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="portrait">Portrait</SelectItem>
            <SelectItem value="landscape">Landscape</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Label htmlFor={`${idPrefix}margins`} className="text-xs text-muted-foreground whitespace-nowrap">
          Margins:
        </Label>
        <Select value={options.margins} onValueChange={(value) => updateOption("margins", value)}>
          <SelectTrigger id={`${idPrefix}margins`} className="h-8 w-28 text-xs">
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
        <Label htmlFor={`${idPrefix}theme`} className="text-xs text-muted-foreground whitespace-nowrap">
          Theme:
        </Label>
        <Select value={options.theme} onValueChange={(value) => updateOption("theme", value)}>
          <SelectTrigger id={`${idPrefix}theme`} className="h-8 w-32 text-xs" data-testid="select-theme">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="print-friendly">Print-friendly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Label htmlFor={`${idPrefix}template`} className="text-xs text-muted-foreground whitespace-nowrap">
          Template:
        </Label>
        <Select value={options.template} onValueChange={(value) => updateOption("template", value)}>
          <SelectTrigger id={`${idPrefix}template`} className="h-8 w-36 text-xs" data-testid="select-template">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="minimal">Minimal</SelectItem>
            <SelectItem value="professional">Professional</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop: Show options directly */}
      <div className="hidden md:block" role="region" aria-label="PDF export options">
        {renderOptionsContent("desktop-")}
      </div>
      
      {/* Mobile: Show options in accordion */}
      <div className="md:hidden w-full">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="options" className="border-0">
            <AccordionTrigger className="py-2 hover:no-underline" data-testid="button-toggle-options">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <span className="text-sm font-medium">PDF Export Options</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div role="region" aria-label="PDF export options">
                {renderOptionsContent("mobile-")}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </>
  );
}
