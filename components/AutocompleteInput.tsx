import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"

interface AutocompleteInputProps {
  options: string[]
  value: string
  onChange: (value: string) => void
  placeholder: string
  label: string
}

export function AutocompleteInput({ options, value, onChange, placeholder, label }: AutocompleteInputProps) {
  const [filteredOptions, setFilteredOptions] = useState<string[]>([])
  const [showOptions, setShowOptions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const filtered = options.filter((option) => option.toLowerCase().includes(value.toLowerCase()))
    setFilteredOptions(filtered)
  }, [value, options])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
    setShowOptions(true)
  }

  const handleOptionClick = (option: string) => {
    onChange(option)
    setShowOptions(false)
  }

  const handleClickOutside = (e: MouseEvent) => {
    if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
      setShowOptions(false)
    }
  }

  useEffect(() => {
    document.addEventListener("click", handleClickOutside)
    return () => {
      document.removeEventListener("click", handleClickOutside)
    }
  }, []) // Removed handleClickOutside from dependencies

  return (
    <div className="relative" ref={inputRef}>
      <label htmlFor={label} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <Input
        type="text"
        id={label}
        value={value}
        onChange={handleInputChange}
        onFocus={() => setShowOptions(true)}
        placeholder={placeholder}
        className="w-full"
      />
      {showOptions && filteredOptions.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border border-gray-300 mt-1 max-h-60 overflow-auto rounded-md shadow-lg">
          {filteredOptions.map((option, index) => (
            <li
              key={index}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleOptionClick(option)}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

