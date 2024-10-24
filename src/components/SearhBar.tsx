// src/components/SearchBar.tsx

'use client'

import { useRouter } from "next/navigation";
import queryString from "query-string";
import { useForm, SubmitHandler } from "react-hook-form";

interface FormValues {
  search: string;
}

const SearchBar = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      search: '',
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const trimmedSearch = data.search.trim();
    if (!trimmedSearch) {
      // If search is empty, redirect to homepage without query params
      router.push('/');
      return;
    }

    const url = queryString.stringifyUrl(
      {
        url: '/',
        query: {
          search: trimmedSearch,
        },
      },
      { skipNull: true }
    );

    router.push(url);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex items-center text-black gap-2">
      <input
        {...register('search')}
        autoComplete="off"
        type="text"
        placeholder="Search Products"
        className="p-2 border border-gray-300 rounded-l-md focus:outline-none focus:border-slate-500 w-48 md:w-80"
        aria-label="Search products" 
      />
      <button
        type="submit" 
        className="bg-slate-700 hover:opacity-80 text-white p-2 rounded-r-md"
      >
        Search
      </button>
    </form>
  );
};

export default SearchBar;