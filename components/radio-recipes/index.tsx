"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@radix-ui/react-label"

interface RadioRecipeProps {
    value: string;
    onChange: (value: string) => void;
}

export function RadioRecipe({ value, onChange }: RadioRecipeProps) {
  return (
    <div className="space-y-6 max-w-md">
      <h2 className="text-xl font-bold mb-4">Выберите опцию</h2>
      
      <RadioGroup
        value={value}
        onValueChange={(val) => onChange(val as "option1" | "option2")}
        className="space-y-3"
      >
        <div className="flex items-center space-x-3">
          <RadioGroupItem value="option1" id="option1" />
          <Label 
            htmlFor="option1" 
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            Все рецепты
          </Label>
        </div>
        
        <div className="flex items-center space-x-3">
          <RadioGroupItem value="option2" id="option2" />
          <Label 
            htmlFor="option2" 
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            Запросы на добавление
          </Label>
        </div>
      </RadioGroup>
    </div>
  )
}