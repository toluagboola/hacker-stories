import React from "react";
import { Search } from "react-feather";

type SearchFormProps = {
	searchTerm: string;
	onSearchInput: (event: React.ChangeEvent<HTMLInputElement>) => void;
	onSearchSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

const SearchForm = ({
	searchTerm,
	onSearchInput,
	onSearchSubmit,
}: SearchFormProps) => (
	<form onSubmit={onSearchSubmit}>
		<InputWithLabel
			id="search"
			value={searchTerm}
			isFocused
			onInputChange={onSearchInput}
		>
			Search
		</InputWithLabel>
		<button
			className="button mt-2 is-primary search-story"
			type="submit"
			disabled={!searchTerm}
		>
			Search
		</button>
	</form>
);

type InputWithLabelProps = {
	id: string;
	value: string;
	type?: string;
	onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	isFocused?: boolean;
	children?: React.ReactNode;
};

const InputWithLabel = ({
	id,
	value,
	type = "text",
	onInputChange,
	isFocused,
	children,
}: InputWithLabelProps) => {
	const inputRef = React.useRef<HTMLInputElement>(null!);

	React.useEffect(() => {
		if (isFocused && inputRef.current) {
			inputRef.current.focus();
		}
	}, [isFocused]);

	return (
		<div className="control has-icons-left">
			<span className="icon is-left px-2">
				<Search />
			</span>
			<input
				ref={inputRef}
				className="input mb-4"
				type={type}
				id={id}
				value={value}
				onChange={onInputChange}
				autoFocus={isFocused}
				placeholder="Search for a story"
			/>
		</div>
	);
};

export default SearchForm;
