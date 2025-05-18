import React, { useState, useRef, useEffect } from 'react'
import { FaCheck, FaChevronDown, FaChevronUp } from 'react-icons/fa'

const MultiSelect = ({ selectedTypes, setSelectedTypes, typeOptions  }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // 切換下拉選單顯示
  const toggleDropdown = () => setIsOpen((prev) => !prev)

  // 點選選項更新已選項目
  const handleOptionClick = (option) => {
    if (selectedTypes.includes(option)) {
      setSelectedTypes(selectedTypes.filter((type) => type !== option))
    } else {
      setSelectedTypes([...selectedTypes, option])
    }
  }

  // 點擊外部關閉下拉選單
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="relative w-full max-w-xs" ref={dropdownRef}>
      <div
        className="flex items-center justify-between rounded border border-gray-400 bg-white p-2 cursor-pointer dark:text-gray-500 dark:bg-gray-800 dark:border-gray-900"
        onClick={toggleDropdown}
      >
        <span className="truncate" style={{ maxWidth: '80%' }}>
          {selectedTypes.length > 0 ? selectedTypes.join(', ') : 'Select Types'}
        </span>
        {isOpen ? <FaChevronUp /> : <FaChevronDown />}
      </div>
      {isOpen && (
        <div className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded border border-gray-300 bg-white shadow-md dark:bg-gray-800 dark:text-gray-500 dark:border-gray-900">
          {typeOptions.map((option) => (
            <div
              key={option}
              onClick={() => handleOptionClick(option)}
              className="flex items-center justify-between p-2 hover:bg-gray-200 cursor-pointer"
            >
              <span>{option}</span>
              {selectedTypes.includes(option) && <FaCheck className="text-green-500" />}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MultiSelect
