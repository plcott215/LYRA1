import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMarkdown(text: string) {
  if (!text) return '';
  
  // Apply heading formatting
  let formatted = text
    .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold my-4">$1</h1>')
    .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold my-3">$1</h2>')
    .replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold my-2">$1</h3>')
    .replace(/^#### (.*$)/gm, '<h4 class="text-base font-bold my-2">$1</h4>')
    .replace(/^##### (.*$)/gm, '<h5 class="text-sm font-bold my-1">$1</h5>')
    .replace(/^###### (.*$)/gm, '<h6 class="text-xs font-bold my-1">$1</h6>')
    
    // Apply bold formatting
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g, '<strong>$1</strong>')
    
    // Apply italic formatting
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    
    // Apply list formatting
    .replace(/^\s*\- (.*$)/gm, '<li class="ml-4">$1</li>')
    .replace(/^\s*\* (.*$)/gm, '<li class="ml-4">$1</li>')
    .replace(/^\s*\+ (.*$)/gm, '<li class="ml-4">$1</li>')
    
    // Apply numbered list formatting
    .replace(/^\s*\d+\. (.*$)/gm, '<li class="ml-4 list-decimal">$1</li>')
    
    // Apply paragraph formatting
    .replace(/^(?!<[h|l])(.*$)/gm, function(match) {
      if(match.trim() === '') return '<br />';
      return '<p class="mb-2">' + match + '</p>';
    })
    
    // Fix any double paragraph tags
    .replace(/<p class="mb-2"><p class="mb-2">/g, '<p class="mb-2">')
    .replace(/<\/p><\/p>/g, '</p>');
    
  return formatted;
}
