"use client"



type InputProps = {
    type?: string;
    placeholder?: string;
    value?: string;
    className?: string;
    onChange?: (value: string) => void;
}


export default function Input({type, placeholder, value, className , onChange} : InputProps){
    return(
        <>
        <input className={className} type={type} placeholder={placeholder} value={value} onChange={(e) => onChange?.(e.target.value)} />
        </>
    )
}