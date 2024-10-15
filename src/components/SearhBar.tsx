// src/components/SearchBar.tsx

'use client'

import { useRouter } from "next/navigation";
import queryString from "query-string";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";

const SearchBar = () => {
    const router = useRouter()

    const {
        register,
        handleSubmit,
        reset,
        formState: {errors}
    } = useForm<FieldValues>({
        defaultValues: {
            search: '' // Changed from 'searchTerm' to 'search'
        }
    })

    const onSubmit: SubmitHandler<FieldValues> = async (data) =>{
        if(!data.search) return router.push('/')

        const url = queryString.stringifyUrl({
            url: '/',
            query:{
                search: data.search // Changed key from 'searchTerm' to 'search'
            }
        },{skipNull: true})

        router.push(url)
        reset()
    }

    return ( 
        <div className="flex items-center text-black gap-2 ">
            <input 
                {...register('search')} // Changed from 'searchTerm' to 'search'
                autoComplete="off"
                type="text"
                placeholder="Search Products"
                className="p-2 border border-gray-300 rounded-l-md focus:outline-none focus:border-[0.5px] focus:border-slate-500 w-48 md:w-80"
                aria-label="Search products" // Added accessibility label
            />
            <button 
                onClick={handleSubmit(onSubmit)} 
                className="bg-slate-700 hover:opacity-80 text-black p-2 rounded-r-md"
            >
                Search
            </button>
        </div> 
    );
}

export default SearchBar;
