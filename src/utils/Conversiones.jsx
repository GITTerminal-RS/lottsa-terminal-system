export function ConvertirCapitalize(input){
    if (!input || typeof input !== 'string') return input;
    
    return input.split(' ').map(word => {
        if (word.length === 0) return word;
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');
}