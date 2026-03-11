'use client'

import { useMemo, useState } from 'react'
import { usePlayground } from './playground-provider'

type ComboboxOption = {
  value: string
  label?: string
}

type PlaygroundComboboxElementProps = {
  name: string
  label?: string
  options: ComboboxOption[]
  placeholder?: string
}

export function PlaygroundComboboxElement({
  name,
  label,
  options,
  placeholder,
}: PlaygroundComboboxElementProps) {
  const { values, setValue } = usePlayground()
  const value = values[name] || ''
  const [isOpen, setIsOpen] = useState(false)

  const filteredOptions = useMemo(() => {
    const query = value.trim().toLowerCase()
    if (!query) return options

    return options.filter((option) => {
      const optionLabel = (option.label ?? option.value).toLowerCase()
      return option.value.toLowerCase().includes(query) || optionLabel.includes(query)
    })
  }, [options, value])

  return (
    <div className="form-control relative">
      <label htmlFor={name}>{label ?? name}</label>
      <input
        id={name}
        value={value}
        placeholder={placeholder}
        onChange={(event) => {
          const nextValue = event.target.value
          const query = nextValue.trim().toLowerCase()
          const nextMatches = options.filter((option) => {
            const optionLabel = (option.label ?? option.value).toLowerCase()
            return option.value.toLowerCase().includes(query) || optionLabel.includes(query)
          })

          setValue(name as never, nextValue)

          // Open while typing only when there are matching options.
          setIsOpen(query.length > 0 && nextMatches.length > 0)
        }}
        onBlur={() => {
          // Delay close so option click can run first.
          setTimeout(() => setIsOpen(false), 0)
        }}
      />

      {isOpen && filteredOptions.length > 0 ? (
        <ul className="bg-tone-50-surface border-tone-300-surface absolute top-full z-10 mt-1 max-h-48 w-full overflow-auto rounded-md border p-1">
          {filteredOptions.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                className="list-item w-full text-left"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  setValue(name as never, option.value)
                  setIsOpen(false)
                }}
              >
                {option.label ?? option.value}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
