import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Download, Trash2 } from "lucide-react";
import { Country, LanguageSkill, Specialization } from "@/types/expert";

interface ExpertProfessionalCardProps {
  isCgpEmployee: boolean;
  professionalData: {
    native_language: string;
    max_inprogress_cases: string;
    min_inprogress_cases: string;
  };
  countries: Country[];
  languageSkills: LanguageSkill[];
  specializations: Specialization[];
  selectedCountries: string[];
  selectedCrisisCountries: string[];
  selectedLanguageSkills: string[];
  selectedSpecializations: string[];
  tempContracts: File[];
  tempCertificates: File[];
  existingContracts: { id: string; filename: string }[];
  existingCertificates: { id: string; filename: string }[];
  onProfessionalChange: (data: Partial<ExpertProfessionalCardProps["professionalData"]>) => void;
  onCountriesChange: (ids: string[]) => void;
  onCrisisCountriesChange: (ids: string[]) => void;
  onLanguageSkillsChange: (ids: string[]) => void;
  onSpecializationsChange: (ids: string[]) => void;
  onContractsChange: (files: File[]) => void;
  onCertificatesChange: (files: File[]) => void;
}

export const ExpertProfessionalCard = ({
  isCgpEmployee,
  professionalData,
  countries,
  languageSkills,
  specializations,
  selectedCountries,
  selectedCrisisCountries,
  selectedLanguageSkills,
  selectedSpecializations,
  tempContracts,
  tempCertificates,
  existingContracts,
  existingCertificates,
  onProfessionalChange,
  onCountriesChange,
  onCrisisCountriesChange,
  onLanguageSkillsChange,
  onSpecializationsChange,
  onContractsChange,
  onCertificatesChange,
}: ExpertProfessionalCardProps) => {
  const contractInputRef = useRef<HTMLInputElement>(null);
  const certificateInputRef = useRef<HTMLInputElement>(null);

  const handleMultiSelectToggle = (
    value: string,
    selectedValues: string[],
    setSelectedValues: (ids: string[]) => void
  ) => {
    if (selectedValues.includes(value)) {
      setSelectedValues(selectedValues.filter((id) => id !== value));
    } else {
      setSelectedValues([...selectedValues, value]);
    }
  };

  const handleContractUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    onContractsChange([...tempContracts, ...files]);
  };

  const handleCertificateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    onCertificatesChange([...tempCertificates, ...files]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-cgp-teal">Szakmai információk:</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Contract upload (only for non-CGP employees) */}
        {!isCgpEmployee && (
          <>
            <div className="flex items-center gap-4">
              <Input disabled value="Szerződés szkennelt verziója" className="flex-1 bg-muted" />
              <Button
                type="button"
                variant="outline"
                className="border-cgp-teal text-cgp-teal"
                onClick={() => contractInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Feltöltés
              </Button>
              <input
                ref={contractInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleContractUpload}
              />
            </div>

            {/* Display contracts */}
            {(existingContracts.length > 0 || tempContracts.length > 0) && (
              <div className="space-y-2">
                {existingContracts.map((file) => (
                  <div key={file.id} className="flex items-center gap-2 text-sm">
                    <span>{file.filename}</span>
                    <Button type="button" variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                {tempContracts.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{file.name} (új)</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onContractsChange(tempContracts.filter((_, i) => i !== index))}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Certificate upload */}
        <div className="flex items-center gap-4">
          <Input disabled value="Bizonyítványok" className="flex-1 bg-muted" />
          <Button
            type="button"
            variant="outline"
            className="border-cgp-teal text-cgp-teal"
            onClick={() => certificateInputRef.current?.click()}
          >
            <Upload className="w-4 h-4 mr-2" />
            Feltöltés
          </Button>
          <input
            ref={certificateInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleCertificateUpload}
          />
        </div>

        {/* Display certificates */}
        {(existingCertificates.length > 0 || tempCertificates.length > 0) && (
          <div className="space-y-2">
            {existingCertificates.map((file) => (
              <div key={file.id} className="flex items-center gap-2 text-sm">
                <span>{file.filename}</span>
                <Button type="button" variant="ghost" size="sm">
                  <Download className="w-4 h-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
            {tempCertificates.map((file, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{file.name} (új)</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onCertificatesChange(tempCertificates.filter((_, i) => i !== index))}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Target countries */}
        <div className="space-y-2">
          <Label className="text-lg">Cél országok:</Label>
          <div className="grid grid-cols-3 gap-2">
            {countries.map((country) => (
              <div
                key={country.id}
                className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-muted"
                onClick={() => handleMultiSelectToggle(country.id, selectedCountries, onCountriesChange)}
              >
                <Checkbox checked={selectedCountries.includes(country.id)} />
                <span>{country.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Crisis countries */}
        <div className="space-y-2">
          <Label className="text-lg">Krízis országok:</Label>
          <div className="grid grid-cols-3 gap-2">
            {countries.map((country) => (
              <div
                key={country.id}
                className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-muted"
                onClick={() => handleMultiSelectToggle(country.id, selectedCrisisCountries, onCrisisCountriesChange)}
              >
                <Checkbox checked={selectedCrisisCountries.includes(country.id)} />
                <span>{country.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Language skills */}
        <div className="space-y-2">
          <Label className="text-lg">Nyelvtudás:</Label>
          <div className="grid grid-cols-3 gap-2">
            {languageSkills.map((lang) => (
              <div
                key={lang.id}
                className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-muted"
                onClick={() => handleMultiSelectToggle(lang.id, selectedLanguageSkills, onLanguageSkillsChange)}
              >
                <Checkbox checked={selectedLanguageSkills.includes(lang.id)} />
                <span>{lang.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Native language */}
        <div className="space-y-2">
          <Label>Anyanyelv:</Label>
          <Select
            value={professionalData.native_language}
            onValueChange={(value) => onProfessionalChange({ native_language: value })}
          >
            <SelectTrigger className="border-cgp-teal">
              <SelectValue placeholder="Válassz" />
            </SelectTrigger>
            <SelectContent>
              {languageSkills.map((lang) => (
                <SelectItem key={lang.id} value={lang.id}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Specializations */}
        <div className="space-y-2">
          <Label className="text-lg">Szakterületek:</Label>
          <div className="grid grid-cols-3 gap-2">
            {specializations.map((spec) => (
              <div
                key={spec.id}
                className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-muted"
                onClick={() => handleMultiSelectToggle(spec.id, selectedSpecializations, onSpecializationsChange)}
              >
                <Checkbox checked={selectedSpecializations.includes(spec.id)} />
                <span>{spec.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Case limits */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Minimum folyamatban lévő ügyek:</Label>
            <Input
              type="number"
              min="0"
              value={professionalData.min_inprogress_cases}
              onChange={(e) => onProfessionalChange({ min_inprogress_cases: e.target.value })}
              className="border-cgp-teal"
            />
          </div>
          <div className="space-y-2">
            <Label>Maximum folyamatban lévő ügyek:</Label>
            <Input
              type="number"
              min="0"
              value={professionalData.max_inprogress_cases}
              onChange={(e) => onProfessionalChange({ max_inprogress_cases: e.target.value })}
              className="border-cgp-teal"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
