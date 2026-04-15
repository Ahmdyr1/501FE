import React, { useState, useRef, useEffect } from 'react';
import { MapPin, X, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { searchPostcodes, getPostcodeChildren, isValidParentPostcode, PostcodeGroup } from '../postcodeData';

interface PostcodeSelectorProps {
    value: PostcodeGroup[];
    onChange: (groups: PostcodeGroup[]) => void;
    placeholder?: string;
}

export const PostcodeSelector: React.FC<PostcodeSelectorProps> = ({
    value = [],
    onChange,
    placeholder = 'Enter postcode (e.g. BS1)...'
}) => {
    const [inputValue, setInputValue] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const searchResults = searchPostcodes(inputValue);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputValue(val);
        setShowDropdown(val.length > 0);
    };

    const handleInputFocus = () => {
        if (inputValue.length > 0) {
            setShowDropdown(true);
        }
    };

    const isPostcodeSelected = (parent: string, child: string): boolean => {
        const group = value.find(g => g.parent === parent);
        return group ? group.children.includes(child) : false;
    };

    const isParentFullySelected = (parent: string): boolean => {
        const group = value.find(g => g.parent === parent);
        if (!group) return false;
        const allChildren = getPostcodeChildren(parent);
        return allChildren.length > 0 && allChildren.every(child => group.children.includes(child));
    };

    const handleSelectAll = (parent: string) => {
        const allChildren = getPostcodeChildren(parent);
        const existingGroup = value.find(g => g.parent === parent);

        if (existingGroup) {
            // Already has some selections, check if all are selected
            if (isParentFullySelected(parent)) {
                // Deselect all - remove the group
                onChange(value.filter(g => g.parent !== parent));
            } else {
                // Select all children
                onChange(value.map(g =>
                    g.parent === parent
                        ? { parent, children: allChildren }
                        : g
                ));
            }
        } else {
            // No selections yet, select all
            onChange([...value, { parent, children: allChildren }]);
        }

        setInputValue('');
        setShowDropdown(false);
    };

    const handleToggleChild = (parent: string, child: string) => {
        const existingGroup = value.find(g => g.parent === parent);

        if (existingGroup) {
            if (existingGroup.children.includes(child)) {
                // Remove this child
                const newChildren = existingGroup.children.filter(c => c !== child);
                if (newChildren.length === 0) {
                    // Remove entire group if no children left
                    onChange(value.filter(g => g.parent !== parent));
                } else {
                    onChange(value.map(g =>
                        g.parent === parent
                            ? { parent, children: newChildren }
                            : g
                    ));
                }
            } else {
                // Add this child
                onChange(value.map(g =>
                    g.parent === parent
                        ? { parent, children: [...g.children, child] }
                        : g
                ));
            }
        } else {
            // Create new group with this child
            onChange([...value, { parent, children: [child] }]);
        }
    };

    const handleRemoveChild = (parent: string, child: string, e: React.MouseEvent) => {
        e.stopPropagation();
        handleToggleChild(parent, child);
    };

    const handleRemoveGroup = (parent: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(value.filter(g => g.parent !== parent));
    };

    const toggleGroupExpansion = (parent: string) => {
        const newExpanded = new Set(expandedGroups);
        if (newExpanded.has(parent)) {
            newExpanded.delete(parent);
        } else {
            newExpanded.add(parent);
        }
        setExpandedGroups(newExpanded);
    };

    return (
        <div ref={wrapperRef} className="relative">
            {/* Input Field */}
            <div className="relative">
                <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    placeholder={placeholder}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none bg-slate-50 focus:bg-white"
                />
            </div>

            {/* Dropdown */}
            {showDropdown && searchResults.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-80 overflow-y-auto">
                    {searchResults.map((parent) => {
                        const children = getPostcodeChildren(parent);
                        const allSelected = isParentFullySelected(parent);
                        const someSelected = value.find(g => g.parent === parent);

                        return (
                            <div key={parent} className="border-b border-slate-100 last:border-0">
                                {/* Parent Header with Select All */}
                                <div className="p-3 bg-slate-50 flex items-center justify-between">
                                    <span className="font-bold text-slate-900">{parent}</span>
                                    <button
                                        onClick={() => handleSelectAll(parent)}
                                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${allSelected
                                                ? 'bg-brand-600 text-white'
                                                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                                            }`}
                                    >
                                        {allSelected ? (
                                            <span className="flex items-center gap-1">
                                                <Check className="w-3 h-3" /> Selected All
                                            </span>
                                        ) : (
                                            'Select All'
                                        )}
                                    </button>
                                </div>

                                {/* Children List */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3">
                                    {children.map((child) => {
                                        const selected = isPostcodeSelected(parent, child);
                                        return (
                                            <button
                                                key={child}
                                                onClick={() => handleToggleChild(parent, child)}
                                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border ${selected
                                                        ? 'bg-brand-50 border-brand-300 text-brand-700'
                                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                                    }`}
                                            >
                                                <span className="flex items-center gap-1.5">
                                                    {selected && <Check className="w-3 h-3" />}
                                                    {child}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Selected Postcodes Display */}
            {value.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                    {value.map((group) => {
                        const isExpanded = expandedGroups.has(group.parent);
                        return (
                            <div key={group.parent} className="inline-block">
                                {/* Parent Tag */}
                                <button
                                    onClick={() => toggleGroupExpansion(group.parent)}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-100 text-brand-700 rounded-lg font-medium text-sm hover:bg-brand-200 transition-colors"
                                >
                                    <MapPin className="w-3 h-3" />
                                    <span>
                                        {group.parent} ({group.children.length} postcode{group.children.length !== 1 ? 's' : ''})
                                    </span>
                                    {isExpanded ? (
                                        <ChevronUp className="w-3 h-3" />
                                    ) : (
                                        <ChevronDown className="w-3 h-3" />
                                    )}
                                    <button
                                        onClick={(e) => handleRemoveGroup(group.parent, e)}
                                        className="ml-1 hover:bg-brand-300 rounded-full p-0.5"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </button>

                                {/* Expanded Children */}
                                {isExpanded && (
                                    <div className="mt-2 ml-4 flex flex-wrap gap-1.5">
                                        {group.children.map((child) => (
                                            <span
                                                key={child}
                                                className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-brand-200 text-brand-600 rounded text-xs font-medium"
                                            >
                                                {child}
                                                <button
                                                    onClick={(e) => handleRemoveChild(group.parent, child, e)}
                                                    className="hover:bg-brand-50 rounded-full p-0.5"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
