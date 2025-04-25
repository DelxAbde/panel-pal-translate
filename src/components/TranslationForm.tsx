import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { useTranslation } from "@/contexts/TranslationContext";
import { useAuth } from "@/contexts/AuthContext";
import { FONTS, FONT_SIZES, LANGUAGES, TRANSLATION_STYLES } from "@/lib/constants";
import { Info, Upload, ArrowRight } from "lucide-react";

export function TranslationForm() {
  const { user } = useAuth();
  const { startTranslation } = useTranslation();
  const [isUploading, setIsUploading] = useState(false);
  
  // Use user preferences or defaults
  const [sourceLanguage, setSourceLanguage] = useState(
    user?.preferences?.defaultSourceLanguage || "ja"
  );
  const [targetLanguage, setTargetLanguage] = useState(
    user?.preferences?.defaultTargetLanguage || "en"
  );
  const [font, setFont] = useState(
    user?.preferences?.defaultFont || FONTS[0].value
  );
  const [fontSize, setFontSize] = useState(
    user?.preferences?.defaultFontSize || 14
  );
  const [translationStyle, setTranslationStyle] = useState(
    user?.preferences?.defaultTranslationStyle || TRANSLATION_STYLES[0].value
  );
  const [imageData, setImageData] = useState<string | undefined>();
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    
    const reader = new FileReader();
    reader.onload = () => {
      setImageData(reader.result as string);
      setImageFile(file);
      setIsUploading(false);
    };
    
    reader.onerror = () => {
      console.error("Failed to read file");
      setIsUploading(false);
    };
    
    reader.readAsDataURL(file);
  };
  
  const handleTranslate = async () => {
    if (!imageData) return;
    
    await startTranslation(
      sourceLanguage,
      targetLanguage,
      font,
      fontSize,
      translationStyle,
      imageData
    );
  };
  
  const handleFontSizeChange = (value: number[]) => {
    setFontSize(value[0]);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Translation Settings</CardTitle>
        <CardDescription>Configure your manga translation preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Language Selection */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4">
          <div className="flex-1 space-y-2">
            <Label htmlFor="sourceLanguage">Source Language</Label>
            <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
              <SelectTrigger id="sourceLanguage">
                <SelectValue placeholder="Select source language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((language) => (
                  <SelectItem key={language.code} value={language.code}>
                    {language.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-center">
            <ArrowRight className="h-5 w-5 text-gray-500" />
          </div>
          
          <div className="flex-1 space-y-2">
            <Label htmlFor="targetLanguage">Target Language</Label>
            <Select value={targetLanguage} onValueChange={setTargetLanguage}>
              <SelectTrigger id="targetLanguage">
                <SelectValue placeholder="Select target language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((language) => (
                  <SelectItem key={language.code} value={language.code}>
                    {language.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Font & Style Settings */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="font">Font Style</Label>
            <Select value={font} onValueChange={setFont}>
              <SelectTrigger id="font">
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent>
                {FONTS.map((fontOption) => (
                  <SelectItem 
                    key={fontOption.value} 
                    value={fontOption.value}
                    style={{ fontFamily: fontOption.value }}
                  >
                    {fontOption.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="fontSize">Font Size: {fontSize}px</Label>
            </div>
            <Slider
              id="fontSize"
              min={FONT_SIZES[0]}
              max={FONT_SIZES[FONT_SIZES.length - 1]}
              step={2}
              defaultValue={[fontSize]}
              onValueChange={handleFontSizeChange}
              className="py-4"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="translationStyle">Translation Style</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-gray-500" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[300px]">
                    <p>How the translation will be displayed on your manga</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select value={translationStyle} onValueChange={setTranslationStyle}>
              <SelectTrigger id="translationStyle">
                <SelectValue placeholder="Select translation style" />
              </SelectTrigger>
              <SelectContent>
                {TRANSLATION_STYLES.map((style) => (
                  <SelectItem 
                    key={style.value} 
                    value={style.value}
                  >
                    <div className="flex flex-col">
                      <span>{style.name}</span>
                      <span className="text-xs text-gray-500">{style.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Image Upload */}
        <div className="space-y-2">
          <Label>Upload Manga Page</Label>
          <div 
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
              transition-colors hover:border-manga-primary
              ${imageData ? 'border-manga-primary' : 'border-gray-300'}
            `}
            onClick={() => document.getElementById('imageUpload')?.click()}
          >
            {imageData ? (
              <div className="relative">
                <img 
                  src={imageData} 
                  alt="Manga preview" 
                  className="max-h-[300px] mx-auto rounded-md"
                />
                <Button 
                  variant="secondary" 
                  className="mt-4 bg-white/80 hover:bg-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImageData(undefined);
                    setImageFile(null);
                  }}
                >
                  Change Image
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2 py-4">
                <Upload className="h-10 w-10 text-gray-400" />
                <p className="text-sm text-gray-600">
                  {isUploading 
                    ? "Uploading..." 
                    : "Click to upload or drag and drop"}
                </p>
                <p className="text-xs text-gray-500">
                  PNG or JPEG (max. 5MB)
                </p>
              </div>
            )}
            <input
              id="imageUpload"
              type="file"
              accept="image/png, image/jpeg"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleTranslate} 
          disabled={!imageData || isUploading}
          className="w-full bg-manga-primary hover:bg-manga-secondary"
        >
          <ArrowRight className="mr-2 h-4 w-4" />
          Translate Now
        </Button>
      </CardFooter>
    </Card>
  );
}
